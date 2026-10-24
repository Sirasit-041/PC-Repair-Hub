(function () {
    "use strict";

    const CATEGORY_SEED = [
        { id: "CAT001", nameTh: "ฮาร์ดแวร์", nameEn: "Hardware", description: "การซ่อมและดูแลอุปกรณ์คอมพิวเตอร์", builtIn: true },
        { id: "CAT002", nameTh: "ซอฟต์แวร์", nameEn: "Software", description: "โปรแกรมและแอปพลิเคชัน", builtIn: true },
        { id: "CAT003", nameTh: "ระบบปฏิบัติการ", nameEn: "Operating System", description: "Windows และระบบปฏิบัติการอื่น", builtIn: true },
        { id: "CAT004", nameTh: "เครือข่าย", nameEn: "Network", description: "อินเทอร์เน็ตและระบบเครือข่าย", builtIn: true }
    ];
    // Read-only catalog for articles whose source and detail content are static HTML files.
    const STATIC_ARTICLES = [
        ["CAT001", "power", "เครื่องคอมพิวเตอร์เปิดไม่ติด", "repair.html"], ["CAT001", "display", "เครื่องเปิดติดแต่หน้าจอไม่แสดงผล", "repair.html"],
        ["CAT001", "ram", "คอมพิวเตอร์รีสตาร์ตก่อนเข้า Windows", "repair.html"], ["CAT001", "overheat", "คอมพิวเตอร์ร้อนและทำงานช้า", "repair.html"],
        ["CAT001", "audio", "ไม่มีเสียงจากคอมพิวเตอร์", "repair.html"], ["CAT001", "keyboard", "คีย์บอร์ดใช้งานไม่ได้", "repair.html"],
        ["CAT001", "mouse", "เมาส์ใช้งานไม่ได้", "repair.html"], ["CAT001", "storage", "ฮาร์ดดิสก์ / SSD ไม่ถูกตรวจพบ", "repair.html"],
        ["CAT001", "ram2", "คอมพิวเตอร์มองเห็น RAM ไม่ครบ", "repair.html"], ["CAT001", "usb", "USB ใช้งานไม่ได้", "repair.html"],
        ["CAT001", "network", "การ์ด Wi-Fi / LAN ใช้งานไม่ได้", "repair.html"], ["CAT001", "monitor", "จอภาพมีเส้น / กระพริบ / สีผิดปกติ", "repair.html"],
        ["CAT002", "software01", "โปรแกรมเปิดไม่ขึ้น", "software-repair.html"], ["CAT002", "software02", "โปรแกรมค้าง", "software-repair.html"],
        ["CAT002", "software03", "โปรแกรมทำงานช้า", "software-repair.html"], ["CAT002", "software04", "ติดตั้งโปรแกรมไม่ได้", "software-repair.html"],
        ["CAT002", "software05", "โปรแกรมอัปเดตไม่ได้", "software-repair.html"], ["CAT002", "software06", "โปรแกรมเด้งออกเอง", "software-repair.html"],
        ["CAT002", "software07", "ลืมรหัสผ่านโปรแกรม", "software-repair.html"], ["CAT002", "software08", "ถอนการติดตั้งไม่ได้", "software-repair.html"],
        ["CAT002", "software09", "ไฟล์เปิดไม่ได้", "software-repair.html"], ["CAT002", "software10", "โปรแกรมถูก Antivirus บล็อก", "software-repair.html"],
        ["CAT002", "software11", "โปรแกรมแจ้ง DLL Error", "software-repair.html"], ["CAT002", "software12", "โปรแกรมใช้พื้นที่มากเกินไป", "software-repair.html"],
        ["CAT003", "os01", "Windows เปิดไม่ขึ้น", "os-repair.html"], ["CAT003", "os02", "Windows บูตช้า", "os-repair.html"],
        ["CAT003", "os03", "Windows ค้าง", "os-repair.html"], ["CAT003", "os04", "Blue Screen (จอฟ้า)", "os-repair.html"],
        ["CAT003", "os05", "Windows Update ไม่ได้", "os-repair.html"], ["CAT003", "os06", "ไม่พบ Boot Device", "os-repair.html"],
        ["CAT003", "os07", "เข้า Windows ไม่ได้", "os-repair.html"], ["CAT003", "os08", "ลืมรหัสผ่าน Windows", "os-repair.html"],
        ["CAT003", "os09", "ไฟล์ระบบ Windows เสียหาย", "os-repair.html"], ["CAT003", "os10", "Windows ใช้ CPU สูง", "os-repair.html"],
        ["CAT003", "os11", "Windows ใช้ RAM สูง", "os-repair.html"], ["CAT003", "os12", "Windows พื้นที่เก็บข้อมูลเต็ม", "os-repair.html"],
        ["CAT004", "network01", "เชื่อมต่ออินเทอร์เน็ตไม่ได้", "network-repair.html"], ["CAT004", "network02", "Wi-Fi ไม่พบเครือข่าย", "network-repair.html"],
        ["CAT004", "network03", "Wi-Fi หลุดบ่อย", "network-repair.html"], ["CAT004", "network04", "อินเทอร์เน็ตช้า", "network-repair.html"],
        ["CAT004", "network05", "LAN ใช้งานไม่ได้", "network-repair.html"], ["CAT004", "network06", "Network Adapter ไม่ทำงาน", "network-repair.html"],
        ["CAT004", "network07", "DNS ทำงานผิดปกติ", "network-repair.html"], ["CAT004", "network08", "IP Address ผิดปกติ", "network-repair.html"],
        ["CAT004", "network09", "Firewall บล็อกอินเทอร์เน็ต", "network-repair.html"], ["CAT004", "network10", "แชร์ไฟล์ใน Network ไม่ได้", "network-repair.html"],
        ["CAT004", "network11", "มองไม่เห็นคอมพิวเตอร์ใน Network", "network-repair.html"], ["CAT004", "network12", "Network เชื่อมต่อแล้วแต่ใช้งานไม่ได้", "network-repair.html"]
    ].map(function (item) {
        return { categoryId: item[0], id: item[1], title: item[2], status: "published", source: item[3] + "?id=" + encodeURIComponent(item[1]), static: true };
    });
    const CATEGORY_NAMES = {
        hardware: "CAT001", "ฮาร์ดแวร์": "CAT001",
        software: "CAT002", "ซอฟต์แวร์": "CAT002",
        "operating system": "CAT003", "ระบบปฏิบัติการ": "CAT003",
        network: "CAT004", "เครือข่าย": "CAT004"
    };
    const STATUSES = ["draft", "pending", "published"];
    const STATUS_LABELS = { draft: "ร่าง", pending: "รอตรวจสอบ", published: "เผยแพร่" };

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("Could not read local data:", key, error);
            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            if (key === "adminArticles" && window.PCRHSharedData) {
                window.PCRHSharedData.saveArticles(value).then(function (saved) {
                    if (saved) notify("บันทึกบทความส่วนกลางแล้ว");
                    else if (window.PCRHSharedData.isCloudAdmin) notify("ยืนยันสิทธิ์ Admin แล้ว แต่ยังเชื่อมต่อ Realtime Database ไม่ได้ ตรวจสอบว่ามี Database instance และ Rules ที่ตรงกับ Custom Claim", true);
                    else notify("บันทึกในเครื่องแล้ว แต่บัญชีนี้ไม่มี Firebase Admin claim", true);
                }).catch(function (error) {
                    console.error("Could not sync articles:", error);
                    notify("บันทึกในเครื่องแล้ว แต่ซิงก์บทความไม่สำเร็จ ตรวจ Firebase Database Rules", true);
                });
            }
            if (key === "adminArticleOverrides" && window.PCRHSharedData) {
                window.PCRHSharedData.saveOverrides(value).then(function (saved) {
                    if (saved) notify("บันทึกการแก้ไขบทความส่วนกลางแล้ว");
                    else if (window.PCRHSharedData.isCloudAdmin) notify("ยืนยันสิทธิ์ Admin แล้ว แต่ยังเชื่อมต่อ Realtime Database ไม่ได้ ตรวจสอบว่ามี Database instance และ Rules ที่ตรงกับ Custom Claim", true);
                    else notify("บันทึกในเครื่องแล้ว แต่บัญชีนี้ไม่มี Firebase Admin claim", true);
                }).catch(function (error) {
                    console.error("Could not sync article overrides:", error);
                    notify("บันทึกในเครื่องแล้ว แต่ซิงก์บทความไม่สำเร็จ ตรวจ Firebase Database Rules", true);
                });
            }
            return true;
        } catch (error) {
            console.error("Could not save local data:", key, error);
            notify("บันทึกไม่สำเร็จ พื้นที่จัดเก็บในเบราว์เซอร์อาจเต็ม", true);
            return false;
        }
    }

    function notify(message, isError) {
        const notice = document.getElementById("adminNotice");
        if (!notice) return;
        notice.textContent = message;
        notice.className = "admin-notice" + (isError ? " is-error" : " is-success");
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
    }

    function isAdmin() {
        return Boolean(window.PCRHSharedData && window.PCRHSharedData.isCloudAdmin);
    }

    function requireAdmin() {
        if (isAdmin()) return true;
        alert("กรุณาเข้าสู่ระบบด้วยบัญชี Firebase ที่ได้รับสิทธิ์ผู้ดูแล");
        window.location.replace("admin-login.html");
        return false;
    }

    function getCategories() {
        const stored = readJSON("adminCategories", null);
        if (!Array.isArray(stored)) {
            writeJSON("adminCategories", CATEGORY_SEED);
            return CATEGORY_SEED.map(item => Object.assign({}, item));
        }
        const byId = new Map(stored.filter(item => item && item.id).map(item => [item.id, item]));
        CATEGORY_SEED.forEach(function (seed) {
            if (!byId.has(seed.id)) byId.set(seed.id, Object.assign({}, seed));
        });
        return Array.from(byId.values()).map(function (item) {
            const seed = CATEGORY_SEED.find(category => category.id === item.id);
            return Object.assign({}, seed || {}, item, { builtIn: Boolean(seed) });
        });
    }

    function categoryIdFor(article) {
        if (article.categoryId) return article.categoryId;
        const category = String(article.category || "").trim().toLowerCase();
        return CATEGORY_NAMES[category] || "CAT001";
    }

    function getArticles() {
        let articles = readJSON("adminArticles", []);
        if (!Array.isArray(articles)) articles = [];
        const deletedIds = new Set(readJSON("adminDeletedArticleIds", []));
        articles = articles.filter(article => !deletedIds.has(article.id));
        const legacy = readJSON("technicianArticles", []);
        let migrated = false;
        if (Array.isArray(legacy)) {
            legacy.forEach(function (article) {
                if (!article || !article.id || deletedIds.has(article.id) || articles.some(item => item.id === article.id)) return;
                articles.push(Object.assign({}, article, {
                    categoryId: categoryIdFor(article),
                    status: article.status && STATUSES.includes(article.status) ? article.status : "pending"
                }));
                migrated = true;
            });
        }
        if (migrated || localStorage.getItem("adminArticles") === null) writeJSON("adminArticles", articles);
        return articles.map(function (article) {
            return Object.assign({}, article, {
                categoryId: categoryIdFor(article),
                status: STATUSES.includes(article.status) ? article.status : "pending"
            });
        });
    }

    function getStaticArticles() {
        const overrides = readJSON("adminArticleOverrides", []);
        const overrideMap = new Map(Array.isArray(overrides) ? overrides.map(item => [item.id, item]) : []);
        return STATIC_ARTICLES.map(function (article) {
            const override = overrideMap.get(article.id);
            return Object.assign({}, article, override || {}, {
                baseCategoryId: article.categoryId,
                categoryId: override && override.categoryId || article.categoryId,
                status: override && STATUSES.includes(override.status) ? override.status : "published",
                hidden: Boolean(override && override.hidden),
                overridden: Boolean(override)
            });
        }).filter(article => !article.hidden);
    }

    function getAllArticles() {
        return getStaticArticles().concat(getArticles());
    }

    function saveStaticOverride(articleId, updates) {
        const overrides = readJSON("adminArticleOverrides", []);
        const list = Array.isArray(overrides) ? overrides : [];
        const index = list.findIndex(item => item.id === articleId);
        const existing = index >= 0 ? list[index] : { id: articleId };
        Object.assign(existing, updates, { id: articleId, updatedAt: new Date().toISOString() });
        if (index >= 0) list[index] = existing;
        else list.push(existing);
        return writeJSON("adminArticleOverrides", list);
    }

    function staticCountsByCategory() {
        return getStaticArticles().reduce(function (counts, article) {
            counts[article.categoryId] = (counts[article.categoryId] || 0) + 1;
            return counts;
        }, {});
    }

    function pageShell(view, title, description, content) {
        document.getElementById("adminPanelTitle").textContent = title;
        document.getElementById("adminPanelDescription").textContent = description;
        document.getElementById("adminPanelContent").innerHTML = content;
        document.querySelectorAll(".admin-panel-nav a").forEach(function (link) {
            if (new URL(link.href).searchParams.get("view") === view) link.classList.add("active");
        });
    }

    async function renderUsers() {
        pageShell("users", "จัดการผู้ใช้งาน", "รายชื่อโปรไฟล์ที่บันทึกไว้ใน Cloud Firestore (อาจไม่รวมบัญชี Auth ที่ยังไม่เคยเข้าสู่ระบบหลังเปิดระบบนี้)", `
            <section class="admin-user-summary-grid">
                <article class="admin-user-summary-card"><span>โปรไฟล์ใน Firestore</span><strong id="firestoreUserCount">กำลังโหลด…</strong></article>
                <article class="admin-user-summary-card"><span>บัญชี Admin</span><strong>—</strong><small>Claims ของผู้ใช้อื่นอ่านจาก Client ไม่ได้; ต้องใช้ระบบฝั่ง Server เพื่อรวมจำนวน</small></article>
            </section>
            <section class="admin-manager-card">
                <div class="admin-toolbar admin-user-toolbar"><label>ค้นหาด้วยชื่อหรืออีเมล<input id="userSearch" type="search" placeholder="ชื่อ หรือ email"></label></div>
                <p id="userLoadState" class="admin-empty" role="status">กำลังโหลดรายชื่อผู้ใช้…</p>
                <div id="userTableContainer" class="admin-table-wrap" hidden><table class="admin-table admin-user-table"><thead><tr><th>ผู้ใช้</th><th>อีเมล</th><th>สร้างโปรไฟล์เมื่อ</th><th>เข้าสู่ระบบล่าสุด</th></tr></thead><tbody id="userRows"></tbody></table></div>
                <p id="userEmpty" class="admin-empty" hidden>ไม่พบผู้ใช้ที่ตรงกับคำค้นหา</p>
            </section>`);

        const rows = document.getElementById("userRows");
        const search = document.getElementById("userSearch");
        const loadState = document.getElementById("userLoadState");
        const tableContainer = document.getElementById("userTableContainer");
        const empty = document.getElementById("userEmpty");
        const count = document.getElementById("firestoreUserCount");
        let currentUsers = [];

        function formatTimestamp(value) {
            const date = value && typeof value.toDate === "function" ? value.toDate() : value ? new Date(value) : null;
            return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("th-TH") : "—";
        }
        function paintRows() {
            const term = search.value.trim().toLocaleLowerCase("th");
            const filtered = currentUsers.filter(user => `${user.displayName || ""} ${user.fullname || ""} ${user.username || ""} ${user.email || ""}`.toLocaleLowerCase("th").includes(term));
            rows.innerHTML = filtered.map(user => `<tr>
                <td><div class="admin-user-identity">${user.photoURL ? `<img src="${escapeHTML(user.photoURL)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="admin-user-avatar" aria-hidden="true">${escapeHTML((user.displayName || user.fullname || user.email || "?").slice(0, 1))}</span>`}<span>${escapeHTML(user.displayName || user.fullname || user.username || "ไม่มีชื่อ")}</span></div></td>
                <td>${escapeHTML(user.email || "—")}</td><td>${escapeHTML(formatTimestamp(user.createdAt))}</td><td>${escapeHTML(formatTimestamp(user.lastLoginAt))}</td>
            </tr>`).join("");
            empty.hidden = filtered.length > 0 || currentUsers.length === 0;
        }
        search.addEventListener("input", paintRows);
        try {
            if (!requireAdmin()) return;
            currentUsers = await window.PCRHSharedData.listUserProfiles();
            currentUsers.sort((a, b) => {
                const toTime = value => value && typeof value.toMillis === "function" ? value.toMillis() : 0;
                return toTime(b.lastLoginAt) - toTime(a.lastLoginAt);
            });
            count.textContent = String(currentUsers.length);
            loadState.hidden = currentUsers.length > 0;
            loadState.textContent = currentUsers.length ? "" : "ยังไม่มีโปรไฟล์ผู้ใช้ใน Firestore";
            tableContainer.hidden = currentUsers.length === 0;
            paintRows();
        } catch (error) {
            console.error("Could not load Firestore user profiles:", error);
            count.textContent = "—";
            loadState.textContent = "โหลดรายชื่อผู้ใช้ไม่สำเร็จ โปรดตรวจสิทธิ์ Admin, Firestore Rules และการเชื่อมต่อ แล้วลองเปิดหน้านี้ใหม่";
            loadState.classList.add("is-error");
            tableContainer.hidden = true;
            notify("โหลดรายชื่อผู้ใช้ไม่สำเร็จ", true);
        }
    }

    async function renderArticleRequests() {
        pageShell("article-requests", "คำขอเพิ่ม / แก้ไขบทความ", "คำขอที่ผู้ใช้ส่งผ่าน Firebase; การอนุมัติจะไม่เผยแพร่หรือแก้บทความโดยอัตโนมัติ", `
            <section class="admin-manager-card">
                <div class="admin-request-toolbar">
                    <label>ค้นหา<input id="articleRequestSearch" type="search" placeholder="ชื่อบทความ ผู้ส่ง หรือรายละเอียด"></label>
                    <label>ประเภท<select id="articleRequestType"><option value="all">ทุกประเภท</option><option value="add">เพิ่มบทความ</option><option value="edit">แก้ไขบทความ</option></select></label>
                    <label>สถานะ<select id="articleRequestStatus"><option value="all">ทุกสถานะ</option><option value="pending">รอตรวจสอบ</option><option value="approved">อนุมัติ</option><option value="rejected">ปฏิเสธ</option><option value="completed">เสร็จสิ้น</option></select></label>
                    <button id="refreshArticleRequests" class="admin-secondary-button" type="button">รีเฟรช</button>
                </div>
                <p id="articleRequestLoadState" class="admin-empty" role="status">กำลังโหลดคำขอ…</p>
                <div id="articleRequestList" class="admin-request-list"></div>
                <p id="articleRequestEmpty" class="admin-empty" hidden>ไม่พบคำขอตามตัวกรอง</p>
            </section>`);

        const list = document.getElementById("articleRequestList");
        const loadState = document.getElementById("articleRequestLoadState");
        const empty = document.getElementById("articleRequestEmpty");
        const search = document.getElementById("articleRequestSearch");
        const typeFilter = document.getElementById("articleRequestType");
        const statusFilter = document.getElementById("articleRequestStatus");
        const refreshButton = document.getElementById("refreshArticleRequests");
        let requests = [];
        const statusLabels = { pending: "รอตรวจสอบ", approved: "อนุมัติ", rejected: "ปฏิเสธ", completed: "เสร็จสิ้น" };
        const typeLabels = { add: "เพิ่มบทความ", edit: "แก้ไขบทความ" };
        const formatDate = value => {
            const date = value && typeof value.toDate === "function" ? value.toDate() : value ? new Date(value) : null;
            return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("th-TH") : "—";
        };
        const safeRequestUrl = value => {
            try {
                const url = new URL(value, window.location.href);
                return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
            } catch (_) { return ""; }
        };
        function paint() {
            const term = search.value.trim().toLocaleLowerCase("th");
            const filtered = requests.filter(item => {
                const searchable = `${item.title || ""} ${item.email || ""} ${item.displayName || ""} ${item.summary || ""} ${item.content || ""}`.toLocaleLowerCase("th");
                return (!term || searchable.includes(term))
                    && (typeFilter.value === "all" || item.requestType === typeFilter.value)
                    && (statusFilter.value === "all" || item.status === statusFilter.value);
            });
            list.innerHTML = filtered.map(item => `<article class="admin-request-card">
                <div class="admin-request-card-heading"><div><span class="admin-request-type">${escapeHTML(typeLabels[item.requestType] || "ไม่ทราบประเภท")}</span><h2>${escapeHTML(item.title || "ไม่มีชื่อบทความ")}</h2></div><span class="admin-request-status status-${escapeHTML(item.status || "pending")}">${escapeHTML(statusLabels[item.status] || item.status || "ไม่ทราบสถานะ")}</span></div>
                <p class="admin-request-meta">หมวดหมู่: ${escapeHTML(item.categoryId || "—")} · ผู้ส่ง: ${escapeHTML(item.displayName || "ไม่มีชื่อ")} (${escapeHTML(item.email || "—")}) · UID: ${escapeHTML(item.uid || "—")}</p>
                ${item.existingArticleUrl ? `<p class="admin-request-meta">บทความเดิม: ${safeRequestUrl(item.existingArticleUrl) ? `<a href="${escapeHTML(safeRequestUrl(item.existingArticleUrl))}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.existingArticleUrl)}</a>` : escapeHTML(item.existingArticleUrl)}</p>` : ""}
                ${item.imageName ? `<p class="admin-request-meta">ชื่อไฟล์ภาพที่เลือก: ${escapeHTML(item.imageName)} (ไม่ได้อัปโหลดไฟล์)</p>` : ""}
                <p><strong>สรุป</strong><br>${escapeHTML(item.summary || "—")}</p>
                <details class="admin-request-details"><summary>ดูรายละเอียดคำขอ</summary><div>${escapeHTML(item.content || "—")}</div></details>
                <div class="admin-request-dates"><span>ส่งเมื่อ ${escapeHTML(formatDate(item.createdAt))}</span><span>อัปเดต ${escapeHTML(formatDate(item.updatedAt))}</span></div>
                <form class="admin-request-review" data-review-request="${escapeHTML(item.id)}">
                    <label>สถานะ<select name="status"><option value="pending" ${item.status === "pending" ? "selected" : ""}>รอตรวจสอบ</option><option value="approved" ${item.status === "approved" ? "selected" : ""}>อนุมัติ</option><option value="rejected" ${item.status === "rejected" ? "selected" : ""}>ปฏิเสธ</option><option value="completed" ${item.status === "completed" ? "selected" : ""}>เสร็จสิ้น</option></select></label>
                    <label>หมายเหตุสำหรับ Admin<textarea name="adminNote" maxlength="2000" rows="2">${escapeHTML(item.adminNote || "")}</textarea></label>
                    <button class="admin-primary-button" type="submit">บันทึกสถานะ</button>
                </form>
            </article>`).join("");
            empty.hidden = filtered.length > 0 || requests.length === 0;
        }
        async function load() {
            list.innerHTML = "";
            empty.hidden = true;
            loadState.hidden = false;
            loadState.classList.remove("is-error");
            loadState.textContent = "กำลังโหลดคำขอ…";
            try {
                if (!requireAdmin()) return;
                requests = await window.PCRHSharedData.listArticleRequests();
                requests.sort((a, b) => {
                    const toMillis = value => value && typeof value.toMillis === "function" ? value.toMillis() : 0;
                    return toMillis(b.createdAt) - toMillis(a.createdAt);
                });
                loadState.hidden = requests.length > 0;
                loadState.textContent = requests.length ? "" : "ยังไม่มีคำขอเพิ่มหรือแก้ไขบทความ";
                paint();
            } catch (error) {
                console.error("Could not load article requests:", error);
                loadState.hidden = false;
                loadState.classList.add("is-error");
                loadState.textContent = `โหลดคำขอไม่สำเร็จ${error.code ? ` (${error.code})` : ""} ตรวจสิทธิ์ Admin, Firestore Rules และการเชื่อมต่อ`;
                notify("โหลดคำขอบทความไม่สำเร็จ", true);
            }
        }
        [search, typeFilter, statusFilter].forEach(control => control.addEventListener("input", paint));
        refreshButton.addEventListener("click", load);
        list.addEventListener("submit", async event => {
            const form = event.target.closest("[data-review-request]");
            if (!form) return;
            event.preventDefault();
            if (!requireAdmin()) return;
            const button = form.querySelector('[type="submit"]');
            const values = new FormData(form);
            button.disabled = true;
            try {
                await window.PCRHSharedData.updateArticleRequest(form.dataset.reviewRequest, values.get("status"), values.get("adminNote"));
                notify("บันทึกสถานะคำขอใน Firebase แล้ว");
                await load();
            } catch (error) {
                console.error("Could not update article request:", error);
                notify(`บันทึกสถานะไม่สำเร็จ${error.code ? ` (${error.code})` : `: ${error.message}`}`, true);
                button.disabled = false;
            }
        });
        await load();
    }

    function renderCategories() {
        let categories = getCategories();
        pageShell("categories", "จัดการหมวดหมู่", "แก้ไขหมวดหมู่ที่ใช้อยู่ และจัดการหมวดหมู่เพิ่มเติม", `
            <section class="admin-manager-card">
                <form id="categoryForm" class="admin-form-grid">
                    <input type="hidden" id="categoryEditId">
                    <label>รหัสหมวดหมู่<input id="categoryId" maxlength="24" required placeholder="เช่น CAT005"></label>
                    <label>ชื่อหมวดหมู่ (ไทย)<input id="categoryNameTh" maxlength="80" required></label>
                    <label>ชื่อหมวดหมู่ (English)<input id="categoryNameEn" maxlength="80" required></label>
                    <label class="admin-field-wide">รายละเอียด<textarea id="categoryDescription" rows="3"></textarea></label>
                    <div class="admin-form-actions"><button class="admin-primary-button" id="categorySubmit" type="submit">เพิ่มหมวดหมู่</button><button class="admin-secondary-button" id="categoryCancel" type="button" hidden>ยกเลิกแก้ไข</button></div>
                </form>
            </section>
            <section class="admin-manager-card"><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>รหัส</th><th>หมวดหมู่</th><th>รายละเอียด</th><th>บทความที่เชื่อมโยง</th><th>จัดการ</th></tr></thead><tbody id="categoryRows"></tbody></table></div><p id="categoryEmpty" class="admin-empty" hidden>ยังไม่มีหมวดหมู่</p></section>`);
        const form = document.getElementById("categoryForm");
        const rows = document.getElementById("categoryRows");

        function paintRows() {
            const articles = getArticles();
            rows.innerHTML = categories.map(category => {
                const linked = articles.filter(article => article.categoryId === category.id).length + (staticCountsByCategory()[category.id] || 0);
                return `<tr><td>${escapeHTML(category.id)}</td><td><strong>${escapeHTML(category.nameTh)}</strong><br><small>${escapeHTML(category.nameEn)}</small></td><td>${escapeHTML(category.description || "—")}</td><td>${linked}</td><td><button type="button" class="admin-small-button" data-edit-category="${escapeHTML(category.id)}">แก้ไข</button> <button type="button" class="admin-small-button is-danger" data-delete-category="${escapeHTML(category.id)}">ลบ</button></td></tr>`;
            }).join("");
            document.getElementById("categoryEmpty").hidden = categories.length > 0;
        }
        paintRows();
        document.getElementById("categoryCancel").addEventListener("click", function () { form.reset(); resetCategoryForm(); });
        rows.addEventListener("click", function (event) {
            if (!requireAdmin()) return;
            const edit = event.target.closest("[data-edit-category]");
            const remove = event.target.closest("[data-delete-category]");
            if (edit) {
                const category = categories.find(item => item.id === edit.dataset.editCategory);
                document.getElementById("categoryEditId").value = category.id;
                document.getElementById("categoryId").value = category.id;
                document.getElementById("categoryId").readOnly = true;
                document.getElementById("categoryNameTh").value = category.nameTh;
                document.getElementById("categoryNameEn").value = category.nameEn;
                document.getElementById("categoryDescription").value = category.description || "";
                document.getElementById("categorySubmit").textContent = "บันทึกการแก้ไข";
                document.getElementById("categoryCancel").hidden = false;
            }
            if (remove) {
                const category = categories.find(item => item.id === remove.dataset.deleteCategory);
                const linked = getAllArticles().some(article => article.categoryId === category.id);
                if (category.builtIn || linked) {
                    notify(`ลบไม่ได้: ${category.nameTh} มีบทความหรือรายการเดิมเชื่อมโยงอยู่`, true);
                    return;
                }
                if (!confirm(`ยืนยันลบหมวดหมู่ ${category.nameTh} (${category.id}) หรือไม่?`)) return;
                categories = categories.filter(item => item.id !== category.id);
                if (writeJSON("adminCategories", categories)) {
                    notify("ลบหมวดหมู่แล้ว");
                    paintRows();
                }
            }
        });
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!requireAdmin()) return;
            const editing = document.getElementById("categoryEditId").value;
            const id = document.getElementById("categoryId").value.trim().toUpperCase();
            const nameTh = document.getElementById("categoryNameTh").value.trim();
            const nameEn = document.getElementById("categoryNameEn").value.trim();
            const description = document.getElementById("categoryDescription").value.trim();
            if (!/^[A-Z0-9_-]{2,24}$/.test(id) || !nameTh || !nameEn) {
                notify("กรุณาตรวจรหัสหมวดหมู่และกรอกชื่อทั้งสองภาษา", true);
                return;
            }
            if (!editing && categories.some(item => item.id.toLowerCase() === id.toLowerCase())) {
                notify("รหัสหมวดหมู่นี้มีอยู่แล้ว", true);
                return;
            }
            if (editing) {
                const category = categories.find(item => item.id === editing);
                Object.assign(category, { nameTh, nameEn, description });
            } else {
                categories.push({ id, nameTh, nameEn, description, builtIn: false });
            }
            if (writeJSON("adminCategories", categories)) {
                notify(editing ? "แก้ไขหมวดหมู่แล้ว" : "เพิ่มหมวดหมู่แล้ว");
                form.reset();
                resetCategoryForm();
                paintRows();
            }
        });

        function resetCategoryForm() {
            document.getElementById("categoryEditId").value = "";
            document.getElementById("categoryId").readOnly = false;
            document.getElementById("categorySubmit").textContent = "เพิ่มหมวดหมู่";
            document.getElementById("categoryCancel").hidden = true;
        }
    }

    function renderArticles() {
        let articles = getArticles();
        let staticArticles = getStaticArticles();
        const categories = getCategories();
        pageShell("articles", "จัดการและตรวจสอบบทความ", "ตรวจเนื้อหา ร่างบทความ และเลือกเผยแพร่ไปยังหน้าหมวดหมู่", `
            <section class="admin-manager-card">
                <form id="articleForm" class="admin-form-grid">
                    <input type="hidden" id="articleEditId">
                    <label>ชื่อบทความ<input id="articleTitle" maxlength="160" required></label>
                    <label>หมวดหมู่<select id="articleCategory" required></select></label>
                    <label>สถานะ<select id="articleStatus"><option value="draft">ร่าง</option><option value="pending">รอตรวจสอบ</option><option value="published">เผยแพร่</option></select></label>
                    <label class="admin-field-wide">สรุป<textarea id="articleSummary" rows="2" maxlength="500" required></textarea></label>
                    <label class="admin-field-wide">เนื้อหา<textarea id="articleContent" rows="7" required></textarea></label>
                    <div class="admin-form-actions"><button id="articleSubmit" class="admin-primary-button" type="submit">เพิ่มบทความ</button><button id="articleCancel" class="admin-secondary-button" type="button" hidden>ยกเลิกแก้ไข</button></div>
                </form>
            </section>
            <section class="admin-manager-card">
                <div class="admin-toolbar"><label>ค้นหา<input id="articleSearch" type="search" placeholder="ชื่อหรือรหัสบทความ"></label><label>หมวดหมู่<select id="articleCategoryFilter"><option value="all">ทุกหมวดหมู่</option></select></label><label>สถานะ<select id="articleStatusFilter"><option value="all">ทุกสถานะ</option>${STATUSES.map(status => `<option value="${status}">${STATUS_LABELS[status]}</option>`).join("")}</select></label></div>
                <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>รหัส</th><th>บทความ</th><th>หมวดหมู่</th><th>สถานะ</th><th>ดู/จัดการ</th></tr></thead><tbody id="articleRows"></tbody></table></div><p id="articleEmpty" class="admin-empty" hidden>ไม่พบบทความตามเงื่อนไข</p><p class="admin-helper">บทความใหม่จัดเก็บใน LocalStorage ส่วนบทความเดิม 48 รายการยังอยู่ในไฟล์ HTML; การแก้ไขและลบจะบันทึกเป็น override ในเบราว์เซอร์นี้</p>
            </section>`);
        const categoryOptions = categories.map(category => `<option value="${escapeHTML(category.id)}">${escapeHTML(category.nameTh)} (${escapeHTML(category.id)})</option>`).join("");
        document.getElementById("articleCategory").innerHTML = categoryOptions;
        document.getElementById("articleCategoryFilter").insertAdjacentHTML("beforeend", categoryOptions);
        const form = document.getElementById("articleForm");
        const rows = document.getElementById("articleRows");

        function paintRows() {
            const term = document.getElementById("articleSearch").value.trim().toLowerCase();
            const category = document.getElementById("articleCategoryFilter").value;
            const status = document.getElementById("articleStatusFilter").value;
            const allArticles = staticArticles.concat(articles);
            const filtered = allArticles.filter(article =>
                (!term || `${article.id} ${article.title}`.toLowerCase().includes(term)) &&
                (category === "all" || article.categoryId === category) &&
                (status === "all" || article.status === status)
            );
            rows.innerHTML = filtered.map(article => {
                const categoryInfo = categories.find(item => item.id === article.categoryId);
                const details = article.static
                    ? `<details class="admin-article-details"><summary>รายละเอียดบทความ</summary>${article.content ? `<div>${escapeHTML(article.content)}</div>` : `<a href="${escapeHTML(article.source)}" target="_blank" rel="noopener">เปิดบทความเดิม</a>`}</details>`
                    : `<details class="admin-article-details"><summary>อ่านรายละเอียด</summary><p>${escapeHTML(article.summary || "")}</p><div>${escapeHTML(article.content || "")}</div></details>`;
                const actions = `<button type="button" class="admin-small-button" data-edit-article="${escapeHTML(article.id)}">แก้ไข</button> <button type="button" class="admin-small-button is-danger" data-delete-article="${escapeHTML(article.id)}">ลบ</button>${article.static ? ` <a class="admin-small-button" href="${escapeHTML(article.source)}" target="_blank" rel="noopener">เปิด</a>` : ""}`;
                const statusControl = `<select class="admin-status-select" data-status-article="${escapeHTML(article.id)}" aria-label="สถานะบทความ">${STATUSES.map(value => `<option value="${value}" ${article.status === value ? "selected" : ""}>${STATUS_LABELS[value]}</option>`).join("")}</select>`;
                return `<tr><td>${escapeHTML(article.id)}</td><td><strong>${escapeHTML(article.title || "ไม่มีชื่อ")}</strong>${details}</td><td>${escapeHTML(categoryInfo ? categoryInfo.nameTh : article.categoryId)}</td><td>${statusControl}</td><td>${actions}</td></tr>`;
            }).join("");
            document.getElementById("articleEmpty").hidden = filtered.length > 0;
        }
        paintRows();
        ["articleSearch", "articleCategoryFilter", "articleStatusFilter"].forEach(id => {
            document.getElementById(id).addEventListener(id === "articleSearch" ? "input" : "change", paintRows);
        });
        document.getElementById("articleCancel").addEventListener("click", function () { form.reset(); resetArticleForm(); });
        rows.addEventListener("change", function (event) {
            const select = event.target.closest("[data-status-article]");
            if (!select || !requireAdmin()) return;
            if (STATIC_ARTICLES.some(item => item.id === select.dataset.statusArticle)) {
                if (saveStaticOverride(select.dataset.statusArticle, { status: select.value, hidden: false })) {
                    staticArticles = getStaticArticles();
                    notify("อัปเดตสถานะบทความแล้ว");
                    paintRows();
                }
                return;
            }
            const article = articles.find(item => item.id === select.dataset.statusArticle);
            if (!article) return;
            article.status = select.value;
            article.updatedAt = new Date().toISOString();
            if (writeJSON("adminArticles", articles)) notify("อัปเดตสถานะบทความแล้ว");
        });
        rows.addEventListener("click", function (event) {
            if (!requireAdmin()) return;
            const edit = event.target.closest("[data-edit-article]");
            const remove = event.target.closest("[data-delete-article]");
            if (edit) {
                const article = staticArticles.find(item => item.id === edit.dataset.editArticle) || articles.find(item => item.id === edit.dataset.editArticle);
                if (!article) return;
                document.getElementById("articleEditId").value = article.id;
                document.getElementById("articleTitle").value = article.title || "";
                document.getElementById("articleCategory").value = article.categoryId;
                document.getElementById("articleSummary").value = article.summary || "";
                document.getElementById("articleContent").value = article.content || "";
                document.getElementById("articleStatus").value = article.status;
                document.getElementById("articleSummary").required = !article.static;
                document.getElementById("articleContent").required = !article.static;
                document.getElementById("articleSubmit").textContent = "บันทึกการแก้ไข";
                document.getElementById("articleCancel").hidden = false;
            }
            if (remove) {
                const id = remove.dataset.deleteArticle;
                if (!confirm("ยืนยันลบบทความนี้หรือไม่?")) return;
                if (STATIC_ARTICLES.some(item => item.id === id)) {
                    if (saveStaticOverride(id, { hidden: true })) {
                        staticArticles = getStaticArticles();
                        notify("ซ่อนบทความเดิมจากรายการหน้าเว็บไซต์แล้ว");
                        paintRows();
                    }
                    return;
                }
                articles = articles.filter(article => article.id !== id);
                const deletedIds = readJSON("adminDeletedArticleIds", []);
                if (Array.isArray(deletedIds) && !deletedIds.includes(id)) {
                    deletedIds.push(id);
                    writeJSON("adminDeletedArticleIds", deletedIds);
                }
                if (writeJSON("adminArticles", articles)) {
                    const technicianArticles = readJSON("technicianArticles", []);
                    if (Array.isArray(technicianArticles)) writeJSON("technicianArticles", technicianArticles.filter(article => article.id !== id));
                    notify("ลบบทความแล้ว");
                    paintRows();
                }
            }
        });
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!requireAdmin()) return;
            const id = document.getElementById("articleEditId").value;
            const title = document.getElementById("articleTitle").value.trim();
            const categoryId = document.getElementById("articleCategory").value;
            const summary = document.getElementById("articleSummary").value.trim();
            const content = document.getElementById("articleContent").value.trim();
            const status = document.getElementById("articleStatus").value;
            const staticArticle = id && STATIC_ARTICLES.some(item => item.id === id);
            if (!title || (!staticArticle && (!summary || !content)) || !categories.some(item => item.id === categoryId) || !STATUSES.includes(status)) {
                notify("กรุณากรอกชื่อ เนื้อหา สรุป และหมวดหมู่ให้ครบถ้วน", true);
                return;
            }
            const timestamp = new Date().toISOString();
            if (id) {
                if (staticArticle) {
                    const updates = { title, categoryId, summary, content, status, hidden: false, updatedAt: timestamp };
                    if (!saveStaticOverride(id, updates)) return;
                    staticArticles = getStaticArticles();
                } else {
                    const article = articles.find(item => item.id === id);
                    if (!article) return;
                    Object.assign(article, { title, categoryId, summary, content, status, updatedAt: timestamp });
                }
            } else {
                const articleId = "ADM-" + (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36));
                articles.push({ id: articleId, title, categoryId, summary, content, status, createdBy: localStorage.getItem("currentUser"), createdAt: timestamp, updatedAt: timestamp });
            }
            if (staticArticle || writeJSON("adminArticles", articles)) {
                notify(id ? "แก้ไขบทความแล้ว" : "เพิ่มบทความแล้ว");
                form.reset();
                resetArticleForm();
                articles = getArticles();
                staticArticles = getStaticArticles();
                paintRows();
            }
        });

        function resetArticleForm() {
            document.getElementById("articleEditId").value = "";
            document.getElementById("articleSummary").required = true;
            document.getElementById("articleContent").required = true;
            document.getElementById("articleSubmit").textContent = "เพิ่มบทความ";
            document.getElementById("articleCancel").hidden = true;
        }
    }

    function renderQuestions() {
        let questions = readJSON("questions", []);
        if (!Array.isArray(questions)) questions = [];
        pageShell("questions", "จัดการคำถาม", "ดูคำถามของผู้ใช้ ตอบกลับ และปรับสถานะในเบราว์เซอร์นี้", `
            <section class="admin-manager-card">
                <div class="admin-toolbar"><label>ค้นหา<input id="questionSearch" type="search" placeholder="หัวข้อ รายละเอียด หรือผู้ถาม"></label><label>สถานะ<select id="questionStatusFilter"><option value="all">ทุกสถานะ</option><option value="open">รอตอบกลับ</option><option value="in_progress">กำลังดำเนินการ</option><option value="answered">ตอบแล้ว</option></select></label></div>
                <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>คำถาม</th><th>ผู้ถาม</th><th>หมวดหมู่</th><th>วันที่ส่ง</th><th>สถานะ</th><th>คำตอบ Admin</th><th>บันทึก</th></tr></thead><tbody id="questionRows"></tbody></table></div><p id="questionEmpty" class="admin-empty" hidden>ไม่มีคำถามในระบบ</p>
            </section>`);
        function paint() {
            const term = document.getElementById("questionSearch").value.trim().toLowerCase();
            const status = document.getElementById("questionStatusFilter").value;
            const filtered = questions.filter(question => {
                const normalized = question.status === "รอคำตอบ" || question.status === "รอตอบกลับ" ? "open" : question.status;
                return (!term || `${question.title || ""} ${question.detail || ""} ${question.username || ""}`.toLowerCase().includes(term)) && (status === "all" || normalized === status);
            });
            const rows = document.getElementById("questionRows");
            rows.innerHTML = filtered.map(question => {
                const status = question.status === "รอคำตอบ" || question.status === "รอตอบกลับ" ? "open" : (question.status || "open");
                const replies = Array.isArray(question.replies) ? question.replies : (question.reply ? [{ content: question.reply, author: "Admin", updatedAt: question.updatedAt }] : []);
                const latest = replies[replies.length - 1];
                const date = question.createdAt ? new Date(question.createdAt).toLocaleString("th-TH") : (question.createdDate || "—");
                const category = categoriesForQuestion(question.categoryId);
                return `<tr><td><details><summary>${escapeHTML(question.title || "ไม่มีหัวข้อ")}</summary><p>${escapeHTML(question.detail || "")}</p></details></td><td>${escapeHTML(question.username || "ไม่ระบุ")}</td><td>${escapeHTML(category)}</td><td>${escapeHTML(date)}</td><td><select data-question-status="${escapeHTML(question.id)}"><option value="open" ${status === "open" ? "selected" : ""}>รอตอบกลับ</option><option value="in_progress" ${status === "in_progress" ? "selected" : ""}>กำลังดำเนินการ</option><option value="answered" ${status === "answered" ? "selected" : ""}>ตอบแล้ว</option></select></td><td><textarea data-question-reply="${escapeHTML(question.id)}" rows="3" maxlength="5000" placeholder="เขียนหรือแก้ไขคำตอบ">${escapeHTML(latest ? latest.content : "")}</textarea>${replies.length > 1 ? `<details><summary>ประวัติคำตอบ (${replies.length})</summary>${replies.map(reply => `<p>${escapeHTML(reply.author || "Admin")} · ${escapeHTML(reply.updatedAt ? new Date(reply.updatedAt).toLocaleString("th-TH") : "")}<br>${escapeHTML(reply.content)}</p>`).join("")}</details>` : ""}</td><td><button type="button" class="admin-small-button" data-save-question="${escapeHTML(question.id)}">บันทึกคำตอบ</button></td></tr>`;
            }).join("");
            document.getElementById("questionEmpty").hidden = filtered.length > 0;
        }
        function categoriesForQuestion(id) {
            const category = getCategories().find(item => item.id === id);
            return category ? category.nameTh : (id || "ไม่ระบุ");
        }
        document.getElementById("questionSearch").addEventListener("input", paint);
        document.getElementById("questionStatusFilter").addEventListener("change", paint);
        document.getElementById("questionRows").addEventListener("change", function (event) {
            const select = event.target.closest("[data-question-status]");
            if (!select || !requireAdmin()) return;
            const question = questions.find(item => item.id === select.dataset.questionStatus);
            if (!question) return;
            question.status = select.value;
            question.updatedAt = new Date().toISOString();
            if (writeJSON("questions", questions)) {
                if (question.ownerUid && window.PCRHSharedData && localStorage.getItem("googleUid")) {
                    window.PCRHSharedData.saveQuestion(question).then(() => notify("อัปเดตสถานะและซิงก์แล้ว")).catch(error => notify(error.message || "ซิงก์คำถามไม่สำเร็จ", true));
                } else if (!question.ownerUid) notify("อัปเดตเฉพาะข้อมูลเดิมในเครื่อง คำถามนี้ไม่มี Firebase UID เจ้าของจึงไม่ซิงก์ขึ้นฐานข้อมูล", true);
                else notify("อัปเดตสถานะในเครื่องนี้แล้ว");
            }
        });
        document.getElementById("questionRows").addEventListener("click", function (event) {
            const button = event.target.closest("[data-save-question]");
            if (!button || !requireAdmin()) return;
            const question = questions.find(item => item.id === button.dataset.saveQuestion);
            if (!question) return;
            const replyInput = Array.from(document.querySelectorAll("[data-question-reply]")).find(input => input.dataset.questionReply === question.id);
            const content = replyInput ? replyInput.value.trim() : "";
            if (!content) { notify("กรุณากรอกคำตอบก่อนบันทึก", true); return; }
            const replies = Array.isArray(question.replies) ? question.replies : (question.reply ? [{ content: question.reply, author: "Admin", updatedAt: question.updatedAt }] : []);
            const now = new Date().toISOString();
            if (replies.length) Object.assign(replies[replies.length - 1], { content, author: localStorage.getItem("currentUser") || "Admin", updatedAt: now });
            else replies.push({ content, author: localStorage.getItem("currentUser") || "Admin", createdAt: now, updatedAt: now });
            question.replies = replies;
            question.status = "answered";
            question.updatedAt = now;
            if (writeJSON("questions", questions)) {
                if (question.ownerUid && window.PCRHSharedData && localStorage.getItem("googleUid")) {
                    window.PCRHSharedData.saveQuestion(question).then(() => notify("บันทึกคำตอบและซิงก์แล้ว")).catch(error => notify(error.message || "ซิงก์คำตอบไม่สำเร็จ", true));
                } else if (!question.ownerUid) notify("บันทึกเฉพาะข้อมูลเดิมในเครื่อง คำถามนี้ไม่มี Firebase UID เจ้าของจึงไม่ซิงก์ขึ้นฐานข้อมูล", true);
                else notify("บันทึกคำตอบในเครื่องนี้แล้ว");
                paint();
            }
        });
        paint();
    }

    async function renderReports() {
        const categories = getCategories();
        const articles = getArticles();
        const staticArticles = getStaticArticles();
        const articleCount = staticArticles.length + articles.length;
        const questionData = readJSON("questions", []);
        const questionCount = Array.isArray(questionData) ? questionData.length : 0;
        const statusCounts = { draft: 0, pending: 0, published: 0 };
        staticArticles.forEach(article => { statusCounts[STATUSES.includes(article.status) ? article.status : "published"] += 1; });
        articles.forEach(article => { statusCounts[STATUSES.includes(article.status) ? article.status : "pending"] += 1; });
        const categoryRows = categories.map(category => {
            const staticCategoryArticles = staticArticles.filter(article => article.categoryId === category.id);
            const dynamic = articles.filter(article => article.categoryId === category.id);
            return `<tr><td>${escapeHTML(category.id)}</td><td>${escapeHTML(category.nameTh)} (${escapeHTML(category.nameEn)})</td><td>${staticCategoryArticles.length + dynamic.length}</td><td>${staticCategoryArticles.filter(article => article.status === "published").length + dynamic.filter(article => article.status === "published").length}</td><td>${staticCategoryArticles.filter(article => article.status === "pending").length + dynamic.filter(article => article.status === "pending").length}</td></tr>`;
        }).join("");
        pageShell("reports", "รายงานระบบ", "สรุปจากบัญชี หมวดหมู่ บทความ และคำถามที่จัดเก็บในเบราว์เซอร์", `
            <div class="admin-report-actions"><button id="refreshReport" class="admin-secondary-button" type="button">รีเฟรชข้อมูล</button><button id="printReport" class="admin-primary-button" type="button">พิมพ์ / บันทึก PDF</button></div>
            <section class="admin-report-cards">
                <article><span>โปรไฟล์ผู้ใช้ใน Firestore</span><strong id="reportProfileCount">กำลังโหลด…</strong></article><article><span>บัญชี Admin</span><strong>—</strong></article><article><span>หมายเหตุ</span><strong class="admin-report-note">นับโปรไฟล์</strong></article><article><span>หมวดหมู่</span><strong>${categories.length}</strong></article><article><span>บทความทั้งหมด</span><strong>${articleCount}</strong></article><article><span>คำถาม</span><strong>${questionCount}</strong></article>
            </section>
            <section class="admin-manager-card"><h2>บทความแยกตามหมวดหมู่</h2><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>รหัส</th><th>หมวดหมู่</th><th>ทั้งหมด</th><th>เผยแพร่</th><th>รอตรวจสอบ</th></tr></thead><tbody>${categoryRows || `<tr><td colspan="5">ไม่มีข้อมูลหมวดหมู่</td></tr>`}</tbody></table></div></section>
            <section class="admin-manager-card"><h2>บทความแยกตามสถานะ</h2><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>สถานะ</th><th>จำนวน</th></tr></thead><tbody>${STATUSES.map(status => `<tr><td>${STATUS_LABELS[status]}${status === "published" ? " (รวมบทความเดิม)" : ""}</td><td>${statusCounts[status]}</td></tr>`).join("")}</tbody></table></div><p class="admin-helper">นับบทความเดิมจากการ์ดในหน้า Hardware, Software, Operating System และ Network รวมถึงการแก้ไข/ซ่อนในเบราว์เซอร์นี้</p></section>`);
        document.getElementById("refreshReport").addEventListener("click", function () {
            if (requireAdmin()) renderReports();
        });
        try {
            const profiles = await window.PCRHSharedData.listUserProfiles();
            document.getElementById("reportProfileCount").textContent = String(profiles.length);
        } catch (error) {
            console.error("Could not load report profile count:", error);
            document.getElementById("reportProfileCount").textContent = "—";
        }
        document.getElementById("printReport").addEventListener("click", function () {
            if (requireAdmin()) window.print();
        });
    }

    async function renderDashboardMetrics() {
        if (!isAdmin()) return;
        const articles = getArticles();
        const staticArticles = getStaticArticles();
        const questions = readJSON("questions", []);
        const metrics = {
            users: "กำลังโหลด…",
            articles: staticArticles.length + articles.length,
            questions: Array.isArray(questions) ? questions.length : 0,
            pending: articles.filter(article => article.status === "pending").length,
            articleRequests: "กำลังโหลด…"
        };
        document.querySelectorAll("[data-dashboard-metric]").forEach(function (element) {
            element.textContent = metrics[element.dataset.dashboardMetric] || 0;
        });
        try {
            const profiles = await window.PCRHSharedData.listUserProfiles();
            document.querySelectorAll('[data-dashboard-metric="users"]').forEach(element => { element.textContent = String(profiles.length); });
        } catch (error) {
            console.error("Could not load dashboard user profile count:", error);
            document.querySelectorAll('[data-dashboard-metric="users"]').forEach(element => { element.textContent = "—"; });
        }
        try {
            const requests = await window.PCRHSharedData.listArticleRequests();
            const pendingRequestCount = requests.filter(request => request.status === "pending").length;
            document.querySelectorAll('[data-dashboard-metric="articleRequests"]').forEach(element => { element.textContent = String(pendingRequestCount); });
        } catch (error) {
            console.error("Could not load pending article request count:", error);
            document.querySelectorAll('[data-dashboard-metric="articleRequests"]').forEach(element => { element.textContent = "—"; });
        }
    }

    function renderPublicArticles() {
        const body = document.body;
        const categoryId = body.dataset.publicCategory || "";
        const isHome = body.hasAttribute("data-public-home");
        const categories = getCategories();
        const overrides = readJSON("adminArticleOverrides", []);
        const overrideMap = new Map(Array.isArray(overrides) ? overrides.map(item => [item.id, item]) : []);

        if (categoryId) {
            document.querySelectorAll(".hardware-grid article, .software-grid article").forEach(function (card) {
                const button = card.querySelector("button[onclick*='?id=']");
                const match = button && button.getAttribute("onclick").match(/[?&]id=([^'&]+)/);
                if (!match) return;
                const id = decodeURIComponent(match[1]);
                const base = STATIC_ARTICLES.find(item => item.id === id);
                const override = overrideMap.get(id);
                if (!base || !override) return;
                if (override.hidden || (override.status && override.status !== "published") || (override.categoryId && override.categoryId !== categoryId)) {
                    card.remove();
                    return;
                }
                const title = card.querySelector("h3");
                const summary = card.querySelector("p");
                if (title && override.title) title.textContent = override.title;
                if (summary && override.summary) summary.textContent = override.summary;
            });
        }

        if (isHome) {
            document.querySelectorAll("[data-category-id]").forEach(function (tile) {
                const category = categories.find(item => item.id === tile.dataset.categoryId);
                const title = tile.querySelector("h3");
                if (category && title) title.textContent = category.nameTh;
            });
            const grid = document.querySelector(".home-category-grid");
            if (grid) {
                categories.filter(category => !category.builtIn).forEach(function (category) {
                    const card = document.createElement("article");
                    card.className = "home-category-card admin-custom-category";
                    const title = document.createElement("h3");
                    title.textContent = category.nameTh;
                    const description = document.createElement("p");
                    description.textContent = category.description || category.nameEn;
                    card.append(title, description);
                    grid.appendChild(card);
                });
            }
        } else if (categoryId) {
            const category = categories.find(item => item.id === categoryId);
            const heading = document.querySelector("main h1, .hardware-title h1");
            if (category && heading) heading.textContent = category.nameTh;
        }

        const movedStatic = getStaticArticles().filter(article => article.overridden && article.status === "published" && (isHome || (article.categoryId === categoryId && article.categoryId !== article.baseCategoryId)));
        const published = getArticles().filter(article => article.status === "published" && (isHome || article.categoryId === categoryId)).concat(movedStatic);
        if (!published.length) return;
        const section = document.createElement("section");
        section.className = "admin-published-section";
        const heading = document.createElement("h2");
        heading.textContent = isHome ? "บทความที่เผยแพร่เพิ่มเติม" : "บทความที่เผยแพร่โดยผู้ดูแลระบบ";
        section.appendChild(heading);
        const grid = document.createElement("div");
        grid.className = "admin-published-grid";
        published.forEach(function (article) {
            const card = document.createElement("article");
            card.className = "admin-published-card";
            const title = document.createElement("h3");
            title.textContent = article.title || "บทความไม่มีชื่อ";
            const category = document.createElement("p");
            const categoryInfo = categories.find(item => item.id === article.categoryId);
            category.textContent = `${categoryInfo ? categoryInfo.nameTh : article.categoryId} · ${article.id}`;
            const summary = document.createElement("p");
            summary.textContent = article.summary || "";
            const details = document.createElement("details");
            const summaryLabel = document.createElement("summary");
            summaryLabel.textContent = "อ่านบทความ";
            if (article.static && !article.content) {
                const link = document.createElement("a");
                link.href = article.source;
                link.textContent = "เปิดหน้าบทความ";
                details.append(summaryLabel, link);
            } else {
                const content = document.createElement("div");
                content.textContent = article.content || "";
                details.append(summaryLabel, content);
            }
            card.append(title, category, summary, details);
            grid.appendChild(card);
        });
        section.appendChild(grid);
        const footer = document.querySelector("footer");
        if (footer) footer.before(section);
        else document.body.appendChild(section);
    }

    function applyStaticDetailOverride() {
        if (!document.body.hasAttribute("data-article-detail")) return;
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) return;
        const base = STATIC_ARTICLES.find(article => article.id === id);
        if (!base) return;
        const overrides = readJSON("adminArticleOverrides", []);
        const override = Array.isArray(overrides) && overrides.find(article => article.id === id);
        if (!override) return;
        if (override.hidden || (override.status && override.status !== "published")) {
            alert("บทความนี้ถูกซ่อนหรือยังไม่ได้เผยแพร่");
            window.location.replace("index.html");
            return;
        }
        const title = document.getElementById("articleTitle") || document.getElementById("repairTitle");
        const summary = document.getElementById("articleSummary") || document.getElementById("repairDescription");
        if (title && override.title) title.textContent = override.title;
        if (summary && override.summary) summary.textContent = override.summary;
        if (override.content) {
            const originalDetails = document.querySelector(".repair-layout");
            if (originalDetails) originalDetails.hidden = true;
            const section = document.createElement("section");
            section.className = "admin-published-card admin-article-content-override";
            const heading = document.createElement("h2");
            heading.textContent = "เนื้อหาที่ผู้ดูแลระบบแก้ไข";
            const content = document.createElement("div");
            content.textContent = override.content;
            section.append(heading, content);
            const main = document.querySelector("main") || document.body;
            main.appendChild(section);
        }
    }

    function fillTechnicianCategorySelect() {
        const select = document.getElementById("articleCategory");
        if (!select) return;
        const current = select.value;
        select.innerHTML = getCategories().map(category => `<option value="${escapeHTML(category.id)}">${escapeHTML(category.nameTh)} (${escapeHTML(category.nameEn)})</option>`).join("");
        if (current && Array.from(select.options).some(option => option.value === current)) select.value = current;
    }

    document.addEventListener("DOMContentLoaded", async function () {
        if (document.body.hasAttribute("data-admin-panel")) {
            if (window.PCRHSharedData && window.PCRHSharedData.authReady) {
                await window.PCRHSharedData.authReady;
                await window.PCRHSharedData.ready;
            }
            if (!requireAdmin()) return;
            const views = {
                users: renderUsers,
                categories: renderCategories,
                articles: renderArticles,
                "article-requests": renderArticleRequests,
                questions: renderQuestions,
                reports: renderReports
            };
            const view = new URLSearchParams(window.location.search).get("view") || "users";
            (views[view] || renderUsers)();
            return;
        }
        if (document.body.hasAttribute("data-admin-dashboard")) {
            if (window.PCRHSharedData && window.PCRHSharedData.authReady) {
                await window.PCRHSharedData.authReady;
                await window.PCRHSharedData.ready;
            }
            renderDashboardMetrics();
        }
        document.addEventListener("pcrh-shared-data-changed", function (event) {
            if (event.detail && event.detail.key === "questions" && document.body.hasAttribute("data-admin-panel") && new URLSearchParams(window.location.search).get("view") === "questions") renderQuestions();
            if (event.detail && (event.detail.key === "adminArticles" || event.detail.key === "articleOverrides")) {
                if (document.body.hasAttribute("data-admin-panel") && new URLSearchParams(window.location.search).get("view") === "articles") renderArticles();
                if (document.body.hasAttribute("data-admin-dashboard")) renderDashboardMetrics();
                if (document.body.hasAttribute("data-public-home") || document.body.dataset.publicCategory) renderPublicArticles();
            }
        });
        if (document.body.hasAttribute("data-public-home") || document.body.dataset.publicCategory) renderPublicArticles();
        applyStaticDetailOverride();
        if (document.getElementById("articleCategory")) fillTechnicianCategorySelect();
    });
})();
