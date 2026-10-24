import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, getIdTokenResult } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const form = document.getElementById("adminPortalForm");
const errorMessage = document.getElementById("adminPortalError");
const signInButton = document.getElementById("adminGoogleSignIn");

function showMessage(message, isError = true) {
    errorMessage.textContent = message;
    errorMessage.hidden = !message;
    errorMessage.classList.toggle("is-success", !isError);
}

if (form && signInButton) {
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!isFirebaseConfigured) {
            showMessage("ยังไม่ได้ตั้งค่า Firebase Web App");
            return;
        }

        signInButton.disabled = true;
        showMessage("กำลังตรวจสอบบัญชี Google…", false);
        try {
            const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            const credential = await signInWithPopup(auth, provider);
            const token = await getIdTokenResult(credential.user, true);
            if (token.claims.admin !== true) {
                showMessage("บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแล กรุณาใช้บัญชีที่เจ้าของโปรเจกต์อนุมัติ");
                return;
            }

            showMessage("ยืนยันสิทธิ์ผู้ดูแลแล้ว กำลังเปิดแผงควบคุม…", false);
            window.location.assign("admin-dashboard.html");
        } catch (error) {
            console.error("Admin sign-in failed", error);
            const messages = {
                "auth/popup-closed-by-user": "ยกเลิกการเข้าสู่ระบบก่อนดำเนินการเสร็จ",
                "auth/popup-blocked": "เบราว์เซอร์บล็อกหน้าต่าง Google กรุณาอนุญาตป๊อปอัปแล้วลองใหม่",
                "auth/unauthorized-domain": "โดเมนนี้ยังไม่ได้เพิ่มใน Firebase Authentication → Authorized domains",
                "auth/operation-not-allowed": "ยังไม่ได้เปิด Google Sign-In ใน Firebase Authentication"
            };
            showMessage(messages[error.code] || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้งหรือตรวจสอบ Firebase Console");
        } finally {
            signInButton.disabled = false;
        }
    });
}
