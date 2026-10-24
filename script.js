
/* ========================================
   PC REPAIR HUB - MAIN SCRIPT
   Login / Logout
======================================== */


/* ========================================
   1. ตรวจสอบ Login ก่อนเข้าแต่ละหมวด
======================================== */

function requireLogin(event, categoryId) {
    if (event) {
        event.stopPropagation();
    }

    const categoryPages = {
        CAT001: "hardware.html",
        CAT002: "software.html",
        CAT003: "os.html",
        CAT004: "network.html"
    };

    if (localStorage.getItem("isLoggedIn") !== "true") { window.location.href = "login.html"; return; }
    if (categoryPages[categoryId]) window.location.href = categoryPages[categoryId];
}


/* ========================================
   2. ตรวจสอบสถานะ Login
======================================== */

function updateLoginMenu() {
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");
    const registerLink = document.getElementById("registerLink");

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (loginLink) loginLink.style.display = isLoggedIn ? "none" : "";
    if (registerLink) registerLink.style.display = isLoggedIn ? "none" : "";
    if (logoutLink) logoutLink.style.display = isLoggedIn ? "" : "none";
}


/* ========================================
   3. ออกจากระบบ
======================================== */

function logout() {
    const confirmLogout = confirm(
        "ต้องการออกจากระบบหรือไม่?"
    );

    if (!confirmLogout) {
        return;
    }

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    alert("ออกจากระบบเรียบร้อยแล้ว");
    window.location.href = "index.html";
}


/* ========================================
   4. เริ่มทำงานเมื่อหน้าเว็บโหลดเสร็จ
======================================== */

document.addEventListener("DOMContentLoaded", function () {
    updateLoginMenu();
});
