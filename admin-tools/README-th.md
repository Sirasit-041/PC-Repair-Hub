# เครื่องมือจัดการ Firebase Admin Claim สำหรับ PC Repair Hub

สคริปต์นี้เป็นเครื่องมือผู้ดูแลที่รันด้วยตนเองบนเครื่องที่เชื่อถือได้ ไม่ใช่โค้ด frontend และไม่ถูกนำขึ้น Firebase Hosting โดย `firebase.json` ละเว้นโฟลเดอร์ `admin-tools/` ไว้

## ก่อนเริ่ม

1. ตรวจใน Firebase Console ว่าเปิดโปรเจกต์ `pc-repair-hub-cd6d9` และบัญชีผู้ดูแลที่ใช้อยู่มี IAM permission ตามหัวข้อด้านล่าง
2. ติดตั้ง Google Cloud CLI และตั้งค่า Application Default Credentials (ADC) ด้วยบัญชี Google ผู้ดูแลบนเครื่องนี้ หากยังไม่มีเครื่องมือ/ADC
3. สำหรับ Firebase Authentication กับ user ADC ให้ทำตามข้อกำหนด OAuth Desktop client ในเอกสาร Firebase Admin SDK; ระบุ Project ID ไว้ในสคริปต์แล้ว และตั้ง `PCRH_ADMIN_OWNER_EMAIL` ใน PowerShell ก่อนใช้งาน
4. หลังติดตั้ง Google Cloud CLI และสร้าง OAuth Desktop client ในโปรเจกต์เดียวกันแล้ว เปิด PowerShell และทำขั้นตอนเข้าสู่ระบบ โดยเลือกบัญชี Google ผู้ดูแลที่มี IAM permission สำหรับโปรเจกต์นี้:

   ```powershell
   gcloud auth application-default login --client-id-file="C:\path\to\desktop-oauth-client.json"
   gcloud config set project pc-repair-hub-cd6d9
   gcloud auth list
   ```

   คำสั่งแรกเปิด browser ให้เลือกบัญชีและบันทึก ADC ในโปรไฟล์ผู้ใช้ Windows นอกเว็บไซต์ คำสั่งที่สองตั้งค่าโปรเจกต์เริ่มต้นของ gcloud; สคริปต์กำหนด project ID เดียวกันไว้อย่างชัดเจนอยู่แล้ว คำสั่งสุดท้ายแสดงบัญชีของ gcloud CLI โดยไม่แสดง token (ให้ตรวจบัญชี ADC จากข้อความยืนยันในขั้น login ด้วย)
5. เปิด PowerShell ที่โฟลเดอร์ `admin-tools` แล้วติดตั้ง dependency ในโฟลเดอร์เครื่องมือเท่านั้น:

   ```powershell
   npm install
   ```

6. ห้ามสร้าง Service Account JSON key ในโฟลเดอร์เว็บไซต์ หรือ commit credential เข้า Git หากองค์กรกำหนดให้ใช้ key ให้เก็บนอก workspace/Hosting ด้วย ACL เฉพาะบัญชี Windows ผู้ดูแล และใช้ `GOOGLE_APPLICATION_CREDENTIALS` เฉพาะ PowerShell session ปัจจุบัน

## ตรวจและกำหนดสิทธิ์

สคริปต์อ่านอีเมลเป้าหมายจากตัวแปรแวดล้อม `PCRH_ADMIN_OWNER_EMAIL` แล้วตรวจอีเมลจริงผ่าน Firebase Authentication ก่อนแสดง UID ที่ Firebase ส่งกลับมา คำสั่ง grant ตรวจ provider `google.com` เพิ่มเติม ส่วน revoke ตรวจอีเมลเป้าหมาย ไม่มี UID ที่เดาหรือกำหนดล่วงหน้า ต้องคัดลอก UID นั้นกลับมายืนยัน และพิมพ์คำยืนยันการกระทำทุกครั้ง

กำหนดสิทธิ์:

```powershell
npm run grant-admin
```

ถอนสิทธิ์:

```powershell
npm run revoke-admin
```

Grant จะคง Custom Claims เดิมทั้งหมดและตั้ง `admin: true`; revoke จะลบเฉพาะ claim `admin` และเก็บ claim อื่นไว้ สคริปต์ตรวจผลจาก Firebase Authentication อีกครั้งหลังเปลี่ยนแล้ว การรันคำสั่งเหล่านี้เปลี่ยนสิทธิ์จริง จึงควรตรวจ action, อีเมล และ UID บนหน้าจอก่อนยืนยัน

## IAM ที่ต้องใช้

- อ่านบัญชีและตรวจ Custom Claims: `firebaseauth.users.get`
- Grant/revoke Custom Claims: `firebaseauth.users.update`
- ใช้บทบาท Firebase Authentication Admin (`roles/firebaseauth.admin`) ได้ แต่มีสิทธิ์ Authentication กว้างกว่าการแก้ claim
- แนวทาง least privilege คือให้ผู้ดูแลโครงการสร้าง Custom IAM role ที่มี `firebaseauth.users.get` และ `firebaseauth.users.update` แล้วผูกเฉพาะบัญชีผู้ดูแล หากทำไม่ได้ บทบาท Firebase Authentication Admin เป็นตัวเลือกที่มีสิทธิ์ครบตามงาน แต่ไม่ควรให้แก่บัญชีทั่วไป

อย่าให้ผู้ใช้สมัครสมาชิกกำหนด claim ให้ตนเอง และอย่านำ Admin SDK ไปไว้ในหน้าเว็บ

## ยืนยันผลในเว็บไซต์

หลัง grant ให้ผู้ดูแลเข้าสู่หน้า Admin Portal ด้วย Google Sign-In แล้วหน้าเว็บเรียก `getIdTokenResult(user, true)` เพื่อรีเฟรช token และตรวจ `claims.admin === true` ก่อนเปิด Dashboard หากบัญชีล็อกอินค้างอยู่ ให้ sign out/in ใหม่หรือ refresh ID token

## ข้อจำกัดของหน้ารายชื่อผู้ใช้เดิม

แผง “ผู้ใช้งานในเครื่องนี้” เดิมอ่าน/เขียน localStorage ไม่ใช่ Firebase Authentication user directory การเพิ่ม/แก้ไข/ลบในหน้านี้ไม่มีผลกับบัญชี Firebase และไม่แสดงสมาชิกใหม่ข้ามอุปกรณ์ การอ่านรายชื่อบัญชี Auth ทั้งหมดอย่างปลอดภัยต้องมี backend ที่ใช้ Admin SDK และตรวจ ID token claim ฝั่ง server ก่อนส่งข้อมูลออกมา; สคริปต์นี้เป็นงานจัดการ claim เท่านั้น ไม่ได้เพิ่ม endpoint ดังกล่าว

## Realtime Database

`firebase-database.rules.json` ใน workspace กำหนดให้ข้อมูลผู้ดูแลต้องมี `auth.token.admin === true`; ไฟล์นี้ยังไม่ได้ deploy และการแก้ครั้งนี้ไม่เปลี่ยน production Rules ปัจจุบัน `firebase-config.js` ระบุ URL ของ Realtime Database และ `firebase-auth.js` ใช้ URL ที่ระบุไว้อย่างชัดเจน แต่การมี URL ในไฟล์เพียงอย่างเดียวยังไม่ยืนยันจาก Firebase Console ว่า instance นี้มีอยู่หรือ Rules ชุดใดถูก deploy อยู่ ห้ามเปิด Rules สาธารณะ ไฟล์ทดสอบใช้เฉพาะ path `publicArticles` ที่ Rules ใน workspace อนุญาตให้อ่านสาธารณะ

ก่อนทดสอบกับ Firebase จริง ให้ยืนยัน project, database instance และ Rules ที่ใช้งานจริงใน Firebase Console แล้วทดสอบด้วยบัญชีที่เหมาะสม การตั้งค่า URL เป็นเพียงการชี้ endpoint; การ deploy Rules เป็นอีกขั้นตอนที่เปลี่ยนความปลอดภัยของฐานข้อมูลจริง

Firestore Rules คงการอ่าน/เขียนโปรไฟล์ที่ `users/{uid}` เฉพาะเจ้าของ UID ไว้ ไม่มีการเปิดให้แอดมินหรือสาธารณะอ่านโปรไฟล์ทุกคน
