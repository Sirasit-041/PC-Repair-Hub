(() => {
    "use strict";

    const SHOWN_KEY = "pcrhSatisfactionPopupShown";
    const FIRST_SEEN_KEY = "pcrhSatisfactionPopupFirstSeenAt";
    const DELAY_MS = 15000;
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScK0OEod40-ZBGnijt1XZCXcbEVC6bdzGabACnt2iI-7ILx7Q/viewform?usp=publish-editor";
    const pageName = window.location.pathname.split("/").pop().toLowerCase();

    if (/^admin-(dashboard|panel|login)\.html$/.test(pageName)
        || document.body.hasAttribute("data-admin-dashboard")
        || document.body.hasAttribute("data-admin-panel")) return;

    const wasShown = () => {
        try { return localStorage.getItem(SHOWN_KEY) === "true"; }
        catch (_) { return false; }
    };
    if (wasShown()) return;

    let firstSeenAt = Date.now();
    try {
        const stored = Number(sessionStorage.getItem(FIRST_SEEN_KEY));
        if (Number.isFinite(stored) && stored > 0) firstSeenAt = stored;
        else sessionStorage.setItem(FIRST_SEEN_KEY, String(firstSeenAt));
    } catch (_) { /* Continue with this page's timer if session storage is unavailable. */ }

    let timerId = null;
    let dialog = null;
    let previousFocus = null;

    function closeDialog() {
        if (dialog?.open) dialog.close();
    }

    function showDialog() {
        timerId = null;
        if (wasShown()) return;

        dialog = document.createElement("dialog");
        dialog.className = "satisfaction-popup-dialog";
        dialog.setAttribute("aria-labelledby", "pcrh-survey-title");
        dialog.setAttribute("aria-describedby", "pcrh-survey-description");
        dialog.innerHTML = `
            <div class="satisfaction-popup-card">
                <button class="satisfaction-popup-close" type="button" aria-label="ปิดหน้าต่างแบบประเมิน">×</button>
                <div class="satisfaction-popup-mark" aria-hidden="true">★</div>
                <h2 id="pcrh-survey-title">แบบประเมินความพึงพอใจ</h2>
                <p id="pcrh-survey-description">ขอบคุณที่เข้าใช้งาน PC Repair Hub กรุณาสละเวลาสักครู่เพื่อประเมินความพึงพอใจในการใช้งานเว็บไซต์ เพื่อนำความคิดเห็นไปปรับปรุงระบบให้ดียิ่งขึ้น</p>
                <div class="satisfaction-popup-actions">
                    <a href="${FORM_URL}" target="_blank" rel="noopener noreferrer">ทำแบบประเมิน</a>
                    <button type="button" class="satisfaction-popup-later">ไว้ภายหลัง</button>
                </div>
            </div>`;

        dialog.querySelector(".satisfaction-popup-close").addEventListener("click", closeDialog);
        dialog.querySelector(".satisfaction-popup-later").addEventListener("click", closeDialog);
        dialog.querySelector("a").addEventListener("click", event => {
            event.preventDefault();
            window.open(FORM_URL, "_blank", "noopener,noreferrer");
            closeDialog();
        });
        dialog.addEventListener("cancel", event => {
            event.preventDefault();
            closeDialog();
        });
        dialog.addEventListener("click", event => {
            if (event.target === dialog) closeDialog();
        });
        dialog.addEventListener("close", () => {
            previousFocus?.focus?.();
            dialog?.remove();
            dialog = null;
        });

        previousFocus = document.activeElement;
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.querySelector(".satisfaction-popup-close").focus();
        try { localStorage.setItem(SHOWN_KEY, "true"); }
        catch (_) { /* The popup remains usable; persistence is unavailable in this browser context. */ }
    }

    const elapsed = Math.max(0, Date.now() - firstSeenAt);
    timerId = window.setTimeout(showDialog, Math.max(0, DELAY_MS - elapsed));

    window.addEventListener("storage", event => {
        if (event.key === SHOWN_KEY && event.newValue === "true") {
            if (timerId !== null) window.clearTimeout(timerId);
            closeDialog();
        }
    });
})();