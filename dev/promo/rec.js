// records the real app at 1080x1920 in slow motion (K x slower, CSS animations slowed too), timestamps divided by K = smooth ~25 fps
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http');
const K=4,ROOT=path.resolve(__dirname,'../host');
const srv=http.createServer((q,r)=>{let u=q.url.split('?')[0].replace(/^\/solar/,'');if(u==='/'||u==='')u='/index.html';if(u.includes('config.js'))return r.end('window.SOLAR_CONFIG={}');fs.readFile(path.join(ROOT,u),(e,d)=>{if(e){r.statusCode=404;return r.end();}if(u.endsWith('.html'))r.setHeader('content-type','text/html; charset=utf-8');r.end(d);});}).listen(8791);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,isMobile:true,hasTouch:true});
const p=await ctx.newPage();p.setDefaultTimeout(15000);await ctx.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
await p.goto('http://localhost:8791/solar/');await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(800);
await p.addStyleTag({content:'.tapdot{position:fixed;z-index:99999;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(242,140,24,.35);border:3px solid #f28c18;pointer-events:none;animation:tp .7s ease-out forwards}@keyframes tp{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.6);opacity:0}}'});
const cdp=await ctx.newCDPSession(p);await cdp.send('Animation.enable');await cdp.send('Animation.setPlaybackRate',{playbackRate:1/K});
const dir=path.join(__dirname,'frames');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
const frames=[];const t0=Date.now();const T=()=>(Date.now()-t0)/1000/K;
let rec=true;const loop=(async()=>{while(rec){const t=T();const buf=await p.screenshot({type:'jpeg',quality:86,scale:'device',animations:'allow',caret:'initial'}).catch(()=>null);if(!buf)continue;const i=frames.length;frames.push(t);fs.writeFile(path.join(dir,`f${String(i).padStart(5,'0')}.jpg`),buf,()=>{});}})();
const marks={};const mark=k=>marks[k]=T();const W=ms=>p.waitForTimeout(ms*K);
const tap=async sel=>{const el=p.locator(sel).first();const bb=await el.boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;
  await p.evaluate(([x,y,K])=>{const d=document.createElement('div');d.className='tapdot';d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),800*K);},[x,y,K]);await W(220);await el.click({force:true,timeout:5000});};
// eased scroll, time-based so it is K times slower in real time
const scrollToY=async(y,ms=700)=>{await p.evaluate(([y,D])=>new Promise(res=>{const s=scrollY,e=Math.max(0,Math.min(y,document.documentElement.scrollHeight-innerHeight)),t0=Date.now();const f=()=>{const k=Math.min(1,(Date.now()-t0)/D),q=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo(0,s+(e-s)*q);k<1?requestAnimationFrame(f):res();};requestAnimationFrame(f);}),[y,ms*K]);};
const yOf=(sel,off=0)=>p.evaluate(([s,o])=>document.querySelector(s).getBoundingClientRect().top+scrollY+o,[sel,off]);
const typeSlow=async(sel,txt)=>{await tap(sel);for(const c of txt){await p.keyboard.type(c);await W(170);}};
// A: hook - idle screen at top
mark('A');
// hook: the screen cycles คุ้ม / --/-- / ไม่คุ้ม like the promo GIF, then goes back to the real idle state
const setV=async(t,c)=>p.evaluate(([t,c])=>{const e=document.querySelector('#t1 .crt .verdict-big');e.textContent=t;e.className='verdict-big '+c;const n=t.replace(/[ัิ-ฺ็-๎\s]/g,'').length||1;e.style.fontSize=Math.min(30,140/n)+'cqw';},[t,c]);
for(const [t,c,ms] of [['คุ้ม','v-good',1300],['--/--','v-idle',550],['ไม่คุ้ม','v-bad',1300],['--/--','v-idle',550],['คุ้ม','v-good',1300],['--/--','v-idle',700]]){await setV(t,c);await W(ms);}
// B: menu 1
console.log('B');mark('B');await scrollToY(await yOf('#t1 .answer .crt',-60));await W(300);await tap('#t1 .billq button[data-v="2500"]');await W(2000);
await scrollToY(await yOf('#sSys',-250),900);await W(3200);
// C: menu 2
console.log('C');mark('C');await scrollToY(0,600);await tap('#tabs [data-t=t2]');await W(500);await scrollToY(await yOf('#t2 .answer .crt',-40),700);await W(300);
await typeSlow('#s_w','8');await W(200);await typeSlow('#s_l','6');await p.evaluate(()=>document.activeElement.blur());await W(600);
await scrollToY(await yOf('#roofPick',-200),600);await W(300);await tap('#roofPick .opt[data-v=gable]');await W(900);
await scrollToY(await yOf('#s2Svg',-300),900);await W(2600);
// E: menu 3
console.log('E');mark('E');await scrollToY(0,600);await tap('#tabs [data-t=t3]');await W(500);await scrollToY(await yOf('#t3',-20),700);await W(2200);
await scrollToY(await yOf('#t3 .checks',-80),1200);await W(2000);await scrollToY(await yOf('#t3 .checks li.alert',-60).catch(()=>0)+700,1400);await W(1500);
mark('END');rec=false;await loop;await W(100);
fs.writeFileSync(path.join(__dirname,'rec.json'),JSON.stringify({frames,marks}));console.log(frames.length,'frames',(frames.length/frames[frames.length-1]).toFixed(1),'fps',marks);
await b.close();srv.close();})();
