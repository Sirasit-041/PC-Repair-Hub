import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, getIdTokenResult } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const authMessage = message => {
    const target = document.getElementById("googleAuthMessage");
    if (target) target.textContent = message;
};
let auth = null;
let database = null;
let firestore = null;
if (isFirebaseConfigured) {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Connect only to the explicit RTDB URL in the project configuration.
    database = firebaseConfig.databaseURL ? getDatabase(app, firebaseConfig.databaseURL) : null;
    firestore = getFirestore(app);
}

// Older versions kept plaintext passwords in browser storage. Remove only those
// fields while retaining the legacy profile metadata for a later UID migration.
function removeLegacyPasswords() {
    for (const key of ["users", "user"]) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || (key === "users" ? "[]" : "null"));
            const clean = item => {
                if (!item || typeof item !== "object") return item;
                const { password, confirmPassword, ...safe } = item;
                return safe;
            };
            if (Array.isArray(value)) localStorage.setItem(key, JSON.stringify(value.map(clean)));
            else if (value) localStorage.setItem(key, JSON.stringify(clean(value)));
        } catch (_) { /* Keep malformed legacy data untouched rather than deleting it. */ }
    }
    localStorage.removeItem("password");
    localStorage.removeItem("confirmPassword");
}
removeLegacyPasswords();

function legacyProfile(email) {
    if (!email) return {};
    const normalizedEmail = email.trim().toLowerCase();
    for (const key of ["users", "user"]) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || (key === "users" ? "[]" : "null"));
            const candidates = Array.isArray(parsed) ? parsed : [parsed];
            const found = candidates.find(item => item?.email?.trim().toLowerCase() === normalizedEmail);
            if (found) return { fullname: found.fullname || "", username: found.username || "" };
        } catch (_) { /* Ignore invalid legacy profile data. */ }
    }
    return {};
}

async function saveUserProfile(user, details = {}) {
    if (!firestore || !user) return;
    const profileRef = doc(firestore, "users", user.uid);
    const snapshot = await getDoc(profileRef);
    const oldProfile = snapshot.exists() ? snapshot.data() : {};
    const legacy = legacyProfile(user.email);
    const profile = {
        ...legacy,
        ...oldProfile,
        ...details,
        uid: user.uid,
        email: user.email || oldProfile.email || "",
        displayName: user.displayName || details.fullname || oldProfile.displayName || "",
        photoURL: user.photoURL || oldProfile.photoURL || "",
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
    // Preserve a valid existing Firestore timestamp; repair absent or malformed
    // legacy values with a server timestamp on this authenticated sign-in.
    if (!oldProfile.createdAt || typeof oldProfile.createdAt.toDate !== "function") {
        profile.createdAt = serverTimestamp();
    }
    // Explicit allow-list prevents password or token fields from reaching Firestore.
    const safeProfile = Object.fromEntries(["uid", "fullname", "username", "email", "displayName", "photoURL", "createdAt", "lastLoginAt", "updatedAt"]
        .filter(key => profile[key] !== undefined).map(key => [key, profile[key]]));
    await setDoc(profileRef, safeProfile, { merge: true });
    localStorage.setItem("currentUser", profile.username || profile.fullname || profile.displayName || profile.email);
    localStorage.setItem("currentRole", "user");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("googleUid", user.uid);
}

function readLocalArray(key) {
    try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
}

function debugQuestionWrite(stage, payload, details = {}) {
    if (new URLSearchParams(window.location.search).get("debugFirebase") !== "1") return;
    const fieldTypes = Object.fromEntries(Object.entries(payload || {}).map(([key, value]) => [
        key,
        value === null ? "null" : Array.isArray(value) ? "array" : typeof value
    ]));
    console.info("[PCRH Firebase question debug]", {
        stage,
        pathPattern: "/questions/{uid}/{questionId}",
        authUidPresent: Boolean(auth?.currentUser?.uid),
        ownerUidMatchesAuth: Boolean(auth?.currentUser?.uid && payload?.ownerUid === auth.currentUser.uid),
        idMatchesPath: Boolean(payload?.id && payload.id === details.questionId),
        fieldNames: Object.keys(payload || {}).sort(),
        fieldTypes,
        replyFieldPresent: Object.prototype.hasOwnProperty.call(payload || {}, "reply"),
        repliesFieldPresent: Object.prototype.hasOwnProperty.call(payload || {}, "replies"),
        createdDateFieldPresent: Object.prototype.hasOwnProperty.call(payload || {}, "createdDate"),
        errorCode: details.errorCode || undefined
    });
}

const api = window.PCRHSharedData = {
    ready: Promise.resolve(false),
    authReady: new Promise(resolve => { window.__pcrhResolveAuthReady = resolve; }),
    isCloudAdmin: false,
    auth,
    refreshAdminClaims: async (forceRefresh = false) => {
        const user = auth?.currentUser;
        if (!user) return false;
        const token = await getIdTokenResult(user, forceRefresh);
        api.isCloudAdmin = token.claims.admin === true;
        return api.isCloudAdmin;
    },
    saveUserProfile,
    listUserProfiles: async () => {
        if (!firestore) throw new Error("ยังไม่ได้ตั้งค่า Cloud Firestore");
        if (!auth?.currentUser) throw new Error("กรุณาเข้าสู่ระบบด้วยบัญชี Firebase");
        if (!await api.refreshAdminClaims(true)) throw new Error("บัญชีนี้ไม่มี Firebase Admin claim");
        const snapshot = await getDocs(collection(firestore, "users"));
        return snapshot.docs.map(profileDoc => ({ ...profileDoc.data(), uid: profileDoc.id }));
    },
    createArticleRequest: async request => {
        const user = auth?.currentUser;
        if (!firestore) throw new Error("ยังไม่ได้ตั้งค่า Cloud Firestore");
        if (!user) throw new Error("กรุณาเข้าสู่ระบบด้วย Firebase ก่อนส่งคำขอ");
        if (!request || !["add", "edit"].includes(request.requestType)) throw new Error("ประเภทคำขอไม่ถูกต้อง");
        const title = String(request.title || "").trim();
        const summary = String(request.summary || "").trim();
        const content = String(request.content || "").trim();
        const categoryId = String(request.categoryId || "").trim();
        const existingArticleUrl = String(request.existingArticleUrl || "").trim();
        const imageName = String(request.imageName || "").trim();
        if (!title || title.length > 160) throw new Error("ชื่อบทความต้องมี 1–160 ตัวอักษร");
        if (!categoryId || categoryId.length > 40) throw new Error("กรุณาเลือกหมวดหมู่ที่ถูกต้อง");
        if (!summary || summary.length > 1000) throw new Error("สรุปต้องมี 1–1,000 ตัวอักษร");
        if (!content || content.length > 12000) throw new Error("เนื้อหาต้องมี 1–12,000 ตัวอักษร");
        if (existingArticleUrl.length > 500 || imageName.length > 255) throw new Error("ลิงก์หรือชื่อไฟล์ยาวเกินกำหนด");
        const requestRef = doc(collection(firestore, "articleRequests"));
        await setDoc(requestRef, {
            requestType: request.requestType,
            title,
            categoryId,
            summary,
            content,
            existingArticleUrl,
            imageName,
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            status: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return requestRef.id;
    },
    listArticleRequests: async () => {
        if (!firestore) throw new Error("ยังไม่ได้ตั้งค่า Cloud Firestore");
        if (!auth?.currentUser || !await api.refreshAdminClaims(true)) throw new Error("ต้องเข้าสู่ระบบด้วยบัญชี Admin ที่มี Custom Claim");
        const snapshot = await getDocs(collection(firestore, "articleRequests"));
        return snapshot.docs.map(requestDoc => ({ ...requestDoc.data(), id: requestDoc.id }));
    },
    updateArticleRequest: async (id, status, adminNote) => {
        if (!firestore) throw new Error("ยังไม่ได้ตั้งค่า Cloud Firestore");
        if (!auth?.currentUser || !await api.refreshAdminClaims(true)) throw new Error("ต้องเข้าสู่ระบบด้วยบัญชี Admin ที่มี Custom Claim");
        if (!id || !["pending", "approved", "rejected", "completed"].includes(status)) throw new Error("สถานะคำขอไม่ถูกต้อง");
        const note = String(adminNote || "").trim();
        if (note.length > 2000) throw new Error("หมายเหตุ Admin ต้องไม่เกิน 2,000 ตัวอักษร");
        await updateDoc(doc(firestore, "articleRequests", id), {
            status,
            adminNote: note,
            updatedAt: serverTimestamp()
        });
    },
    saveQuestion: async (question, { create = false } = {}) => {
        if (!database) throw new Error("ยังไม่ได้ตั้งค่า Realtime Database ในโปรเจกต์นี้");
        const user = auth?.currentUser;
        if (!user) throw new Error("กรุณาเข้าสู่ระบบด้วยบัญชี Firebase ก่อนดำเนินการ");
        if (!question?.id || !question.title || !question.detail) throw new Error("ข้อมูลคำถามไม่ครบถ้วน");
        if (question.title.length > 120 || question.detail.length > 5000) throw new Error("หัวข้อจำกัด 120 ตัวอักษร และรายละเอียดจำกัด 5,000 ตัวอักษร");
        if (!['CAT001', 'CAT002', 'CAT003', 'CAT004'].includes(question.categoryId)) throw new Error("กรุณาเลือกหมวดหมู่คำถามที่ถูกต้อง");
        if (String(question.username || '').length > 254) throw new Error("ชื่อบัญชียาวเกินกำหนด");
        const uid = user.uid;
        if (create && question.ownerUid && question.ownerUid !== uid) throw new Error("ไม่อนุญาตให้ส่งคำถามแทนบัญชีอื่น");
        const ownerUid = create ? uid : question.ownerUid;
        if (!ownerUid) throw new Error("คำถามเดิมไม่มี UID เจ้าของ จึงยังซิงก์ขึ้นฐานข้อมูลไม่ได้");
        if (ownerUid !== uid) {
            if (!await api.refreshAdminClaims()) throw new Error("บัญชีนี้ไม่มีสิทธิ์จัดการคำถาม");
            const existing = await get(ref(database, `questions/${ownerUid}/${question.id}`));
            if (!existing.exists()) throw new Error("ไม่พบคำถามในฐานข้อมูล หรือไม่มีสิทธิ์เข้าถึง");
        }
        const payload = { ...question, ownerUid };
        const path = `questions/${ownerUid}/${question.id}`;
        debugQuestionWrite("before-set", payload, { questionId: question.id });
        try {
            await set(ref(database, path), payload);
            debugQuestionWrite("set-success", payload, { questionId: question.id });
        } catch (error) {
            debugQuestionWrite("set-failed", payload, { questionId: question.id, errorCode: error?.code || "unknown" });
            throw error;
        }
    },
    saveArticles: async articles => {
        const uid = auth?.currentUser?.uid;
        if (!database || !uid) return false;
        if (!await api.refreshAdminClaims()) return false;
        const validArticles = articles.filter(item => item && item.id);
        const data = Object.fromEntries(validArticles.map(item => [item.id, item]));
        const published = Object.fromEntries(validArticles.filter(item => item.status === "published").map(item => [item.id, item]));
        await set(ref(database, "articles"), data);
        await set(ref(database, "publicArticles"), published);
        return true;
    },
    saveOverrides: async overrides => {
        const uid = auth?.currentUser?.uid;
        if (!database || !uid) return false;
        if (!await api.refreshAdminClaims()) return false;
        const data = Object.fromEntries(overrides.filter(item => item && item.id).map(item => [item.id, item]));
        await set(ref(database, "articleOverrides"), data);
        await set(ref(database, "publicArticleOverrides"), data);
        return true;
    }
};

// Signal that Firebase and the shared API have been initialized. Pages that
// depend on this API can wait on an event instead of racing a module script.
window.dispatchEvent(new CustomEvent("pcrh-shared-api-ready"));

function startSharedData(user) {
    const api = window.PCRHSharedData;
    api.isCloudAdmin = false;
    if (!user) {
        api.ready = Promise.resolve(false);
        document.dispatchEvent(new CustomEvent("pcrh-auth-ready", { detail: { user: null, isCloudAdmin: false } }));
        return;
    }
    api.ready = (async () => {
        api.isCloudAdmin = await api.refreshAdminClaims();
        if (!database) {
            document.dispatchEvent(new CustomEvent("pcrh-auth-ready", { detail: { user, isCloudAdmin: api.isCloudAdmin } }));
            return false;
        }
        const [questionsSnapshot, articlesSnapshot, overridesSnapshot] = await Promise.all([
            get(ref(database, api.isCloudAdmin ? "questions" : `questions/${user.uid}`)),
            get(ref(database, api.isCloudAdmin ? "articles" : "publicArticles")),
            get(ref(database, api.isCloudAdmin ? "articleOverrides" : "publicArticleOverrides"))
        ]);
        const questionTree = questionsSnapshot.val() || {};
        const cloudQuestions = api.isCloudAdmin ? Object.values(questionTree).flatMap(value => Object.values(value || {})) : Object.values(questionTree);
        const localQuestions = readLocalArray("questions");
        const questionMap = new Map(localQuestions.map(item => [item.id, item]));
        cloudQuestions.forEach(item => questionMap.set(item.id, item));
        localStorage.setItem("questions", JSON.stringify([...questionMap.values()]));
        const cloudArticles = Object.values(articlesSnapshot.val() || {});
        const localArticles = readLocalArray("adminArticles");
        const articleMap = new Map(localArticles.map(item => [item.id, item]));
        cloudArticles.forEach(item => articleMap.set(item.id, item));
        localStorage.setItem("adminArticles", JSON.stringify([...articleMap.values()]));
        const cloudOverrides = Object.values(overridesSnapshot.val() || {});
        const overrideMap = new Map(readLocalArray("adminArticleOverrides").map(item => [item.id, item]));
        cloudOverrides.forEach(item => overrideMap.set(item.id, item));
        localStorage.setItem("adminArticleOverrides", JSON.stringify([...overrideMap.values()]));
        document.dispatchEvent(new CustomEvent("pcrh-auth-ready", { detail: { user, isCloudAdmin: api.isCloudAdmin } }));
        let firstQuestionSnapshot = true;
        onValue(ref(database, api.isCloudAdmin ? "questions" : `questions/${user.uid}`), snapshot => {
            const tree = snapshot.val() || {};
            const items = api.isCloudAdmin ? Object.values(tree).flatMap(value => Object.values(value || {})) : Object.values(tree);
            if (firstQuestionSnapshot) {
                firstQuestionSnapshot = false;
                const merged = new Map(readLocalArray("questions").map(item => [item.id, item]));
                items.forEach(item => merged.set(item.id, item));
                localStorage.setItem("questions", JSON.stringify([...merged.values()]));
            } else localStorage.setItem("questions", JSON.stringify(items));
            document.dispatchEvent(new CustomEvent("pcrh-shared-data-changed", { detail: { key: "questions" } }));
        }, error => {
            console.error("Question listener failed", error);
            document.dispatchEvent(new CustomEvent("pcrh-data-error", { detail: { error, key: "questions" } }));
        });
        let firstArticleSnapshot = true;
        onValue(ref(database, api.isCloudAdmin ? "articles" : "publicArticles"), snapshot => {
            const items = Object.values(snapshot.val() || {});
            if (firstArticleSnapshot) {
                firstArticleSnapshot = false;
                const merged = new Map(readLocalArray("adminArticles").map(item => [item.id, item]));
                items.forEach(item => merged.set(item.id, item));
                localStorage.setItem("adminArticles", JSON.stringify([...merged.values()]));
                if (api.isCloudAdmin) api.saveArticles([...merged.values()]).catch(error => console.error("Initial article sync failed", error));
            } else localStorage.setItem("adminArticles", JSON.stringify(items));
            document.dispatchEvent(new CustomEvent("pcrh-shared-data-changed", { detail: { key: "adminArticles" } }));
        }, error => {
            console.error("Article listener failed", error);
            document.dispatchEvent(new CustomEvent("pcrh-data-error", { detail: { error, key: "adminArticles" } }));
        });
        let firstOverrideSnapshot = true;
        onValue(ref(database, api.isCloudAdmin ? "articleOverrides" : "publicArticleOverrides"), snapshot => {
            const items = Object.values(snapshot.val() || {});
            if (firstOverrideSnapshot) {
                firstOverrideSnapshot = false;
                const merged = new Map(readLocalArray("adminArticleOverrides").map(item => [item.id, item]));
                items.forEach(item => merged.set(item.id, item));
                localStorage.setItem("adminArticleOverrides", JSON.stringify([...merged.values()]));
                if (api.isCloudAdmin) api.saveOverrides([...merged.values()]).catch(error => console.error("Initial override sync failed", error));
            } else localStorage.setItem("adminArticleOverrides", JSON.stringify(items));
            document.dispatchEvent(new CustomEvent("pcrh-shared-data-changed", { detail: { key: "articleOverrides" } }));
        }, error => {
            console.error("Article override listener failed", error);
            document.dispatchEvent(new CustomEvent("pcrh-data-error", { detail: { error, key: "articleOverrides" } }));
        });
        return true;
    })().catch(error => {
        console.error("Shared Firebase data load failed", error);
        document.dispatchEvent(new CustomEvent("pcrh-data-error", { detail: { error } }));
        return false;
    });
}

function updateAccountUI(user) {
    const loginLink = document.getElementById("loginLink");
    const registerLink = document.getElementById("registerLink");
    const logoutLink = document.getElementById("logoutLink");
    const accountStatus = document.getElementById("accountStatus");
    if (!accountStatus && logoutLink) {
        const status = document.createElement("span");
        status.id = "accountStatus";
        status.className = "account-status";
        logoutLink.parentElement.insertBefore(status, logoutLink);
    }
    const visibleStatus = document.getElementById("accountStatus");
    const legacyLoggedIn = localStorage.getItem("isLoggedIn") === "true" && !localStorage.getItem("googleUid");
    const loggedIn = Boolean(user) || legacyLoggedIn;
    if (loginLink) loginLink.hidden = loggedIn;
    if (registerLink) registerLink.hidden = loggedIn;
    if (logoutLink) logoutLink.hidden = !loggedIn;
    if (visibleStatus) visibleStatus.textContent = user ? `${user.displayName || "ผู้ใช้ Google"} (${user.email || ""})` : (legacyLoggedIn ? localStorage.getItem("currentUser") || "เข้าสู่ระบบแล้ว" : "");
    if (user) {
        localStorage.setItem("googleUid", user.uid);
        localStorage.setItem("currentUser", user.displayName || user.email || "Google User");
        localStorage.setItem("currentRole", "user");
        localStorage.setItem("isLoggedIn", "true");
    } else if (localStorage.getItem("googleUid")) {
        localStorage.removeItem("googleUid");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentRole");
    }
}

if (auth) onAuthStateChanged(auth, async user => {
    updateAccountUI(user);
    startSharedData(user);
    // Auth readiness is independent of Realtime Database synchronization.
    // Consumers can now safely inspect auth.currentUser or start a Firestore write.
    if (window.__pcrhResolveAuthReady) window.__pcrhResolveAuthReady(user);
    if (user) {
        try { await saveUserProfile(user); }
        catch (error) { console.error("User profile sync failed", error); }
    }
    await api.ready;
}, error => {
    console.error("Firebase auth state error", error);
    authMessage("ตรวจสอบสถานะบัญชีไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ");
    if (window.__pcrhResolveAuthReady) window.__pcrhResolveAuthReady(null);
});
else { updateAccountUI(null); if (window.__pcrhResolveAuthReady) window.__pcrhResolveAuthReady(null); }

const googleButton = document.getElementById("googleSignInButton");
if (googleButton) googleButton.addEventListener("click", async () => {
    if (!auth) {
        authMessage("ยังไม่ได้ตั้งค่า Firebase กรุณาใส่ Web App Configuration ใน firebase-config.js");
        return;
    }
    googleButton.disabled = true;
    authMessage("กำลังเชื่อมต่อ Google…");
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const credential = await signInWithPopup(auth, provider);
        localStorage.setItem("googleUid", credential.user.uid);
        localStorage.setItem("currentUser", credential.user.displayName || credential.user.email || "Google User");
        localStorage.setItem("currentRole", "user");
        localStorage.setItem("isLoggedIn", "true");
        authMessage("เข้าสู่ระบบสำเร็จ กำลังเปิดหน้าหลัก…");
        window.location.assign("hardware.html");
    } catch (error) {
        console.error("Google sign-in failed", error);
        const messages = {
            "auth/popup-closed-by-user": "คุณปิดหน้าต่างเข้าสู่ระบบก่อนดำเนินการเสร็จ",
            "auth/cancelled-popup-request": "คำขอเข้าสู่ระบบถูกยกเลิก",
            "auth/unauthorized-domain": "โดเมนนี้ยังไม่ได้เพิ่มใน Authorized domains ของ Firebase",
            "auth/popup-blocked": "เบราว์เซอร์บล็อกหน้าต่างเข้าสู่ระบบ กรุณาอนุญาตป๊อปอัปแล้วลองอีกครั้ง",
            "auth/operation-not-allowed": "โปรเจกต์ Firebase ยังไม่ได้เปิด Google เป็นผู้ให้บริการเข้าสู่ระบบ: ไปที่ Firebase Console → Authentication → Sign-in method → Google แล้วกด Enable",
            "auth/configuration-not-found": "ยังไม่ได้ตั้งค่า Google Sign-In ใน Firebase Authentication: เปิด Google ที่ Authentication → Sign-in method แล้วลองใหม่",
            "auth/invalid-api-key": "Firebase API key ไม่ถูกต้องหรือไม่ตรงกับ Web App ใน Firebase Console กรุณาตรวจ firebase-config.js",
            "auth/network-request-failed": "เชื่อมต่อ Firebase ไม่ได้ ตรวจสอบอินเทอร์เน็ต ส่วนขยายบล็อกโฆษณา หรือ VPN แล้วลองใหม่",
            "auth/invalid-oauth-client-id": "การตั้งค่า OAuth สำหรับ Google ไม่ถูกต้อง ตรวจสอบผู้ให้บริการ Google ใน Firebase Console",
            "auth/account-exists-with-different-credential": "อีเมลนี้มีบัญชีที่สร้างด้วยวิธีเข้าสู่ระบบอื่น ให้เข้าสู่ระบบด้วยวิธีเดิมก่อน",
            "auth/tenant-id-mismatch": "การตั้งค่า Firebase Authentication ไม่ตรงกับโปรเจกต์ของเว็บไซต์"
        };
        authMessage(messages[error.code] || `เข้าสู่ระบบไม่สำเร็จ (${error.code || "ไม่ทราบรหัสข้อผิดพลาด"}) กรุณาเปิด Console เพื่อตรวจรายละเอียด`);
    } finally { googleButton.disabled = false; }
});

function authErrorMessage(error) {
    const messages = {
        "auth/operation-not-allowed": "Firebase ยังไม่ได้เปิด Email/Password: Firebase Console → Authentication → Sign-in method → Email/Password → Enable",
        "auth/email-already-in-use": "อีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบ หรือใช้วิธีกู้คืนบัญชี",
        "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
        "auth/weak-password": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        "auth/user-not-found": "ไม่พบบัญชีนี้ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกก่อน",
        "auth/wrong-password": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        "auth/too-many-requests": "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่",
        "auth/unauthorized-domain": "โดเมนนี้ยังไม่ได้เพิ่มใน Authorized domains ของ Firebase",
        "permission-denied": "บันทึกโปรไฟล์ไม่ได้ ตรวจสอบ Firestore Security Rules"
    };
    return messages[error.code] || `ดำเนินการไม่สำเร็จ (${error.code || "ไม่ทราบข้อผิดพลาด"})`;
}

const loginForm = document.getElementById("loginForm");
if (loginForm) loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const button = loginForm.querySelector('[type="submit"]');
    button.disabled = true;
    authMessage("กำลังเข้าสู่ระบบ…");
    try {
        if (!auth) throw Object.assign(new Error("Firebase is not configured"), { code: "firebase/not-configured" });
        const credential = await signInWithEmailAndPassword(auth, email, password);
        await saveUserProfile(credential.user);
        authMessage("เข้าสู่ระบบสำเร็จ กำลังเปิดหน้าหลัก…");
        window.location.assign("hardware.html");
    } catch (error) {
        authMessage(error.code === "firebase/not-configured" ? "ยังไม่ได้ตั้งค่า Firebase Web App" : authErrorMessage(error));
    } finally { button.disabled = false; }
});

const registerForm = document.getElementById("registerForm");
if (registerForm) registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    const fullname = document.getElementById("fullname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password.length < 6) return authMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    if (password !== confirmPassword) return authMessage("รหัสผ่านไม่ตรงกัน");
    if (!fullname || !username || !email) return authMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
    const button = registerForm.querySelector('[type="submit"]');
    button.disabled = true;
    authMessage("กำลังสร้างบัญชี…");
    try {
        if (!auth) throw Object.assign(new Error("Firebase is not configured"), { code: "firebase/not-configured" });
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: fullname });
        await saveUserProfile(credential.user, { fullname, username, displayName: fullname });
        authMessage("สมัครสมาชิกสำเร็จ กำลังเปิดหน้าหลัก…");
        window.location.assign("hardware.html");
    } catch (error) {
        authMessage(error.code === "firebase/not-configured" ? "ยังไม่ได้ตั้งค่า Firebase Web App" : authErrorMessage(error));
    } finally { button.disabled = false; }
});

window.logout = async function () {
    if (!confirm("ต้องการออกจากระบบหรือไม่?")) return;
    if (auth) {
        try { await signOut(auth); }
        catch (error) { console.error("Firebase sign-out failed", error); alert("ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง"); return; }
    }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    localStorage.removeItem("googleUid");
    window.location.assign("index.html");
};
