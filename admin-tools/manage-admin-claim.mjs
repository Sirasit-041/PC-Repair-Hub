import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const PROJECT_ID = "pc-repair-hub-cd6d9";
const OWNER_EMAIL = (process.env.PCRH_ADMIN_OWNER_EMAIL || "").trim().toLowerCase();
if (!OWNER_EMAIL) {
    console.error('ตั้งค่า PCRH_ADMIN_OWNER_EMAIL ก่อนรันเครื่องมือ');
    process.exit(2);
}
const action = process.argv[2];

if (!new Set(["grant", "revoke"]).has(action)) {
    console.error("วิธีใช้: npm run grant-admin หรือ npm run revoke-admin");
    process.exit(2);
}

const app = initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID
});
const auth = getAuth(app);
const prompt = createInterface({ input, output });

try {
    const user = await auth.getUserByEmail(OWNER_EMAIL);
    const verifiedEmail = (user.email || "").trim().toLowerCase();
    const hasGoogleProvider = user.providerData.some(provider => provider.providerId === "google.com");

    if (verifiedEmail !== OWNER_EMAIL) throw new Error("บัญชีที่พบไม่ตรงกับอีเมลเป้าหมาย; ยกเลิกเพื่อป้องกันการแก้บัญชีผิด");
    if (action === "grant" && !hasGoogleProvider) throw new Error("บัญชีเป้าหมายไม่ได้เชื่อมกับ Google Sign-In; ยกเลิกการ grant");

    console.log(`Project: ${PROJECT_ID}`);
    console.log(`Email ที่ตรวจจาก Firebase Authentication: ${verifiedEmail}`);
    console.log(`UID ที่ตรวจจาก Firebase Authentication: ${user.uid}`);
    console.log(`Provider: Google (${hasGoogleProvider ? "ยืนยันแล้ว" : "ไม่พบ"})`);
    console.log(`การดำเนินการ: ${action === "grant" ? "กำหนด admin: true" : "ถอน admin claim"}`);

    const enteredUid = (await prompt.question("คัดลอก UID จากผลตรวจด้านบนแล้ววางเพื่อยืนยัน: ")).trim();
    if (enteredUid !== user.uid) throw new Error("UID ยืนยันไม่ตรงกับ Firebase Authentication; ไม่มีการเปลี่ยนแปลง");

    const confirmation = action === "grant" ? "GRANT ADMIN" : "REVOKE ADMIN";
    const enteredConfirmation = (await prompt.question(`พิมพ์ ${confirmation} เพื่อยืนยัน: `)).trim();
    if (enteredConfirmation !== confirmation) throw new Error("ยกเลิกตามคำยืนยัน; ไม่มีการเปลี่ยนแปลง");

    const claims = { ...(user.customClaims || {}) };
    if (action === "grant") claims.admin = true;
    else delete claims.admin;

    await auth.setCustomUserClaims(user.uid, claims);
    const verifiedUser = await auth.getUser(user.uid);
    const claimIsCorrect = action === "grant"
        ? verifiedUser.customClaims?.admin === true
        : verifiedUser.customClaims?.admin !== true;

    if (!claimIsCorrect) throw new Error("เรียกเปลี่ยน Claim แล้ว แต่ตรวจยืนยันผลไม่ผ่าน กรุณาตรวจบัญชีใน Firebase Console");
    console.log(action === "grant"
        ? "ยืนยันแล้ว: admin: true อยู่บน UID ที่ตรวจสอบข้างต้น"
        : "ยืนยันแล้ว: UID ที่ตรวจสอบไม่มี admin claim แล้ว");
    console.log("ผู้ใช้ต้องออกจากระบบ/เข้าสู่ระบบใหม่ หรือรีเฟรช Firebase ID token ก่อนที่หน้าเว็บจะเห็น Claim ใหม่");
} catch (error) {
    console.error(`ดำเนินการไม่สำเร็จ: ${error.message}`);
    process.exitCode = 1;
} finally {
    prompt.close();
}
