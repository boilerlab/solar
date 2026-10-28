const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const srv=http.createServer((q,r)=>{if(q.url.includes('config.js'))return r.end("window.SOLAR_CONFIG={}");let u=q.url.split('?')[0].replace(/^\/solar/,'');if(u==='/'||u==='')u='/index.html';fs.readFile(path.join(process.cwd(),'host',u),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.end(d);});}).listen(8773);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});const er=[];p.on('pageerror',e=>er.push(e.message));
await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());await p.goto('http://localhost:8773/solar/');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#tabs [data-t=t3]');await p.selectOption('#rfqProv','ปราจีนบุรี');await p.waitForTimeout(600);
console.log((await p.innerText('#rfqVendors')).slice(0,900));
await p.click('#rfqMore');await p.waitForTimeout(200);console.log('after more items:',await p.$$eval('.vlist li',l=>l.length));
await p.selectOption('#rfqProv','กรุงเทพมหานคร');await p.waitForTimeout(200);console.log('bkk:',(await p.innerText('#rfqVendors')).slice(0,200));
await p.evaluate(()=>document.querySelector('#rfqVendors').scrollIntoView());await p.screenshot({path:'lytest/t73.png'});console.log(er);await b.close();srv.close();})();
