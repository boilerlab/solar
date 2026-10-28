const {chromium}=require('playwright'),fs=require('fs');
const caps={
 A1:'ติดโซลาร์ภาคประชาชน <b>คุ้มไหม?</b><br>เช็คฟรี ไม่ต้องสมัคร',
 B1:'<span class="n">1</span>ใส่ค่าไฟต่อเดือน',
 B2:'จอบอกทันที <b>คุ้ม / พอไหว / ยังไม่คุ้ม</b><br>พร้อมเงินที่เหลือแต่ละเดือน',
 C1:'<span class="n">2</span>ใส่ขนาดหลังคา เลือกทรงหลังคา',
 C2:'แอปจัดแผงให้<br>บอกว่า <b>พื้นที่พอไหม</b>',
 D1:'ไม่รู้ขนาด? กด <b>ตำแหน่งปัจจุบัน</b>',
 D2:'ดึงภาพดาวเทียมบ้านคุณ<br><b>ลากแผงวางบนหลังคา</b>',
 E1:'<span class="n">3</span>ปุ่มลงทะเบียน <b>PEA / MEA</b>',
 E2:'เช็คลิสต์เลือกช่าง<br>ที่<b>ขึ้นทะเบียนกับการไฟฟ้า</b>'};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto('file://'+__dirname+'/caps.html');await p.evaluate(()=>document.fonts.ready);
fs.mkdirSync(__dirname+'/caps',{recursive:true});
for(const [k,v] of Object.entries(caps)){await p.evaluate(h=>{document.getElementById('root').innerHTML=`<div class="cap"><div class="box">${h}</div></div>`;},v);await p.waitForTimeout(80);await p.screenshot({path:`${__dirname}/caps/${k}.png`,omitBackground:true});}
await p.evaluate(()=>{document.getElementById('root').innerHTML=`<div class="end"><div><div class="t">ลองเช็คบ้านคุณเลย<br><span>ฟรี</span></div><div class="u">boilerlab.github.io/solar</div><div class="s">คุ้มไหม · พื้นที่พอไหม · ติดกับใคร</div><div class="m">ลิงก์อยู่ในโปรไฟล์ · Boiler Lab</div></div></div>`;});await p.waitForTimeout(150);await p.screenshot({path:__dirname+'/caps/END.png'});
await b.close();})();
