const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});
const er=[];p.on('pageerror',e=>er.push(e.message));await p.route(/^https?:/,r=>r.abort());
await p.goto('file://'+__dirname+'/../solar-calc/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#tabs [data-t=t2]');
const cards=()=>p.$$eval('#layPick .opt',bs=>bs.map(b=>b.dataset.v+':'+b.querySelector('span').textContent+'['+b.querySelector('small').textContent+']'+(b.getAttribute('aria-pressed')==='true'?'*':'')));
const show=async t=>console.log(t,(await cards()).join(' '),'|',await p.textContent('#s2Verdict'),'|',(await p.textContent('#s2Need')).split('·').pop());
for(const [w,l] of [['12','6'],['6','6'],['4','8']]){await p.fill('#s_w',w);await p.fill('#s_l',l);
 await p.click('#layPick .opt[data-v=r1]');await show(`shed ${w}x${l} r1`);await p.click('#layPick .opt[data-v=r2]');await show(`shed ${w}x${l} r2`);await p.click('#layPick .opt[data-v=r2]');}
await p.evaluate(()=>document.querySelector('[data-v="gable"]').click());
for(const [w,l] of [['12','6'],['8','6'],['5','8']]){await p.fill('#s_w',w);await p.fill('#s_l',l);
 await p.click('#layPick .opt[data-v=r1]');await show(`gable ${w}x${l} r1`);await p.click('#layPick .opt[data-v=s2]');await show(`gable ${w}x${l} s2`);await p.click('#layPick .opt[data-v=s2]');}
await p.fill('#s_w','5');await p.fill('#s_l','8');await p.click('#layPick .opt[data-v=r1]');await p.evaluate(()=>document.querySelector('#s2Svg').scrollIntoView());await p.screenshot({path:'lytest/t66.png'});
console.log(er);await b.close();})();
