# assemble how-to video: recorded scenes fitted to voice-over segment lengths, satellite clip (user video or screenshots), captions, end card
import json,subprocess,sys,os,glob
R=json.load(open('rec.json'));fr=R['frames'];m=R['marks']
dur=json.load(open(sys.argv[1]))          # {"A":..,"B":..,"C":..,"D":..,"E":..,"F":..} seconds
sat=sys.argv[2] if len(sys.argv)>2 else '' # user satellite video ('' = use screenshots)
vo=sys.argv[3] if len(sys.argv)>3 else ''
out=sys.argv[4] if len(sys.argv)>4 else 'howto.mp4'
os.makedirs('seg',exist_ok=True);FPS=30
def run(c):subprocess.run(c,shell=True,check=True)
def rec_scene(k,a,b,T):
    idx=[i for i,t in enumerate(fr) if a<=t<b];nat=fr[idx[-1]]-fr[idx[0]]
    with open(f'seg/{k}.txt','w') as o:
        for j,i in enumerate(idx):
            d=(fr[idx[j+1]]-fr[i]) if j+1<len(idx) else 0.04
            o.write(f"file '../frames/f{i:05d}.jpg'\nduration {d:.4f}\n")
        o.write(f"file '../frames/f{idx[-1]:05d}.jpg'\n")
    sp=min(1.4,T/nat) if nat>0 else 1  # fit to the voice: speed up, or slow down up to 1.4x then hold the last frame
    run(f"ffmpeg -v error -y -f concat -safe 0 -i seg/{k}.txt -vf \"setpts=PTS*{sp:.4f},fps={FPS},tpad=stop_mode=clone:stop_duration={T},trim=duration={T},format=yuv420p\" -an -c:v libx264 -crf 18 -preset fast seg/{k}_raw.mp4")
def sat_scene(T):
    if sat:
        run(f"ffmpeg -v error -y -i '{sat}' -vf \"scale=1080:-2,crop=1080:min(ih\\,1920),pad=1080:1920:0:(1920-ih)/2:color=0xebf0f2,fps={FPS},setpts=PTS*{1:.3f},tpad=stop_mode=clone:stop_duration={T},trim=duration={T},format=yuv420p\" -an -c:v libx264 -crf 18 -preset fast seg/D_raw.mp4")
    else:
        shots=sorted(glob.glob('/mnt/user-data/uploads/Solar_Design_System/promo/Screenshot*.jpg'));n=len(shots);each=T/n
        parts=[]
        for i,s in enumerate(shots):
            run(f"ffmpeg -v error -y -loop 1 -i '{s}' -vf \"crop=1080:1920:0:110,scale=1188:2112,zoompan=z='1+0.06*on/({each}*{FPS})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS},format=yuv420p\" -t {each:.3f} -an -c:v libx264 -crf 18 -preset fast seg/D{i}.mp4");parts.append(f"file 'D{i}.mp4'")
        open('seg/D.txt','w').write('\n'.join(parts));run("ffmpeg -v error -y -f concat -safe 0 -i seg/D.txt -c copy seg/D_raw.mp4")
def end_scene(T):
    run(f"ffmpeg -v error -y -loop 1 -i caps/END.png -vf \"fps={FPS},format=yuv420p\" -t {T} -an -c:v libx264 -crf 18 -preset fast seg/F_raw.mp4")
rec_scene('A',m['A'],m['B'],dur['A']);rec_scene('B',m['B'],m['C'],dur['B']);rec_scene('C',m['C'],m['E'],dur['C']);rec_scene('E',m['E'],m['END'],dur['E'])
sat_scene(dur['D']);end_scene(dur['F'])
# captions: first caption for the first part of the scene, second for the rest
capsplit={'A':[('A1',0,1)],'B':[('B1',0,.4),('B2',.4,1)],'C':[('C1',0,.5),('C2',.5,1)],'D':[('D1',0,.4),('D2',.4,1)],'E':[('E1',0,.5),('E2',.5,1)],'F':[]}
order=['A','B','C','D','E','F'];lst=[]
for k in order:
    T=dur[k];cs=capsplit[k]
    if cs:
        ins=' '.join(f"-i caps/{c}.png" for c,_,_ in cs);fc='[0:v]'+''.join(f"[{i+1}:v]overlay=0:0:enable='between(t,{a*T:.2f},{b*T:.2f})'"+('[v%d];[v%d]'%(i,i) if i<len(cs)-1 else '') for i,(c,a,b) in enumerate(cs))
        run(f"ffmpeg -v error -y -i seg/{k}_raw.mp4 {ins} -filter_complex \"{fc},format=yuv420p\" -c:v libx264 -crf 18 -preset fast seg/{k}.mp4")
    else: run(f"cp seg/{k}_raw.mp4 seg/{k}.mp4")
    lst.append(f"file '{k}.mp4'")
open('seg/all.txt','w').write('\n'.join(lst));run("ffmpeg -v error -y -f concat -safe 0 -i seg/all.txt -c copy seg/video.mp4")
total=sum(dur[k] for k in order)
music=os.environ.get('MUSIC','')
if vo and music:
    # music sits under the voice: ducked by the voice (sidechain), fades in/out
    fc=(f"[1:a]apad,asplit=2[v1][v2];[2:a]volume=0.32,afade=t=in:d=0.8,afade=t=out:st={total-2.5:.2f}:d=2.5,apad[m];"
        f"[m][v1]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=450[md];[md][v2]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")
    run(f"ffmpeg -v error -y -i seg/video.mp4 -i '{vo}' -i '{music}' -filter_complex \"{fc}\" -map 0:v -map '[a]' -c:v copy -c:a aac -b:a 192k -t {total:.2f} -movflags +faststart {out}")
elif vo: run(f"ffmpeg -v error -y -i seg/video.mp4 -i '{vo}' -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -af apad -t {total:.2f} -movflags +faststart {out}")
else: run(f"ffmpeg -v error -y -i seg/video.mp4 -f lavfi -i anullsrc=r=44100:cl=stereo -map 0:v -map 1:a -c:v copy -c:a aac -t {total:.2f} -movflags +faststart {out}")
print('done',out,total)
