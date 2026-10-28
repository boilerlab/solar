# python3 dev/outreach/render.py N  -> prints JSON list of the next N queued shops with subject/body/html ready to send
import json,re,sys,os
D=os.path.dirname(os.path.abspath(__file__));n=int(sys.argv[1]) if len(sys.argv)>1 else 10
t=open(f'{D}/email.md',encoding='utf-8').read();html=open(f'{D}/email.html',encoding='utf-8').read()
sub=re.search(r'^Subject: (.*)$',t,re.M).group(1);body=t.split(sub,1)[1].split('\n---')[0].strip()
q=json.load(open(f'{D}/queue.json',encoding='utf-8'))['q'];log=json.load(open(f'{D}/log.json',encoding='utf-8'))
out=[]
for i,r in enumerate(q):
    if r.get('status','queued')!='queued' or str(i) in log['sent']:continue
    s={x[0] for x in r['ids']};auth='MEA และ PEA' if len(s)>1 else ('การไฟฟ้านครหลวง (MEA)' if 'M' in s else 'การไฟฟ้าส่วนภูมิภาค (PEA)')
    f=lambda x:x.replace('{NAME}',r['name']).replace('{AUTH}',auth)
    out.append({'i':i,'name':r['name'],'to':r['to'],'subject':f(sub),'body':f(body),'html':f(html)})
    if len(out)>=n:break
print(json.dumps(out,ensure_ascii=False))
