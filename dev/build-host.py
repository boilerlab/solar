# build: python3 dev/build-host.py  -> writes ../index.html (adds head, meta/og, manifest, config.js, Cloudflare beacon)
import sys
src=open(__import__('os').path.join(__import__('os').path.dirname(__file__),'index.src.html'),encoding='utf-8').read()
head='''<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="คำนวณค่าไฟที่ลด รายได้ขายไฟ 2.20 บาท และระยะคืนทุน โครงการโซลาร์ภาคประชาชน 2569 พร้อมวางผังแผงบนภาพดาวเทียมหลังคาบ้าน">
<!-- Facebook link preview -->
<meta property="og:type" content="website">
<meta property="og:title" content="คำนวณโซลาร์ภาคประชาชน 2569 | Boiler Lab">
<meta property="og:site_name" content="Boiler Lab">
<meta property="og:description" content="ใส่พิกัดบ้าน ดูภาพดาวเทียม วางแผงบนหลังคา แล้วดูค่าไฟที่ลด รายได้ขายไฟ และระยะคืนทุน เทียบ On-grid กับ Hybrid + แบตเตอรี่">
<meta property="og:url" content="https://boilerlab.github.io/solar/">
<meta property="og:image" content="https://boilerlab.github.io/solar/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="th_TH">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#28495a">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="โซลาร์คุ้มไหม">
<script src="config.js"></script>
</head>
<body>
'''
open(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'),'w',encoding='utf-8').write(head+src+'\n<!-- Cloudflare Web Analytics (visitor count, no cookies) --><script type=\'module\' src=\'https://static.cloudflareinsights.com/beacon.min.js\' data-cf-beacon=\'{"token": "4497103eb81a40cc93a7819a71cc3fd8"}\'></script><!-- End Cloudflare Web Analytics -->\n</body>\n</html>\n')
