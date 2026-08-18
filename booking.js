/*
Shared booking-flow logic (mechanics only -- styling comes entirely from
each site's own styles.css via the .booking-* class names). Fully
interactive, client-side only, no backend: this is a real working
prototype flow for a fictional demo business, not a live scheduler.

Each page provides:
  window.BOOKING_SERVICES = [{ name, price, unit, desc }, ...]
  window.BOOKING_BUSINESS = "Ironline Plumbing Co."
before including this script.
*/
(function () {
  const services = window.BOOKING_SERVICES || [];
  const business = window.BOOKING_BUSINESS || "this business";
  const state = { step: 1, service: null, date: null, dateLabel: null, time: null, name: "", phone: "", email: "", notes: "" };

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const TIME_SLOTS = ["8:00 AM", "9:30 AM", "11:00 AM", "1:00 PM", "2:30 PM", "4:00 PM"];

  function el(sel) { return document.querySelector(sel); }
  function all(sel) { return Array.from(document.querySelectorAll(sel)); }

  function renderServices() {
    const box = el("#svc-list");
    if (!box) return;
    box.innerHTML = services.map((s, i) => `
      <div class="service-option" data-i="${i}">
        <div>
          <div class="so-name">${s.name}</div>
          <div style="color:var(--muted);font-size:13px;margin-top:2px;">${s.desc || ""}</div>
        </div>
        <div class="so-price">${s.price}</div>
      </div>
    `).join("");
    all(".service-option").forEach(opt => {
      opt.addEventListener("click", () => {
        all(".service-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        state.service = services[+opt.dataset.i];
        updateNav();
      });
    });
  }

  function renderCalendar() {
    const grid = el("#cal-grid");
    if (!grid) return;
    const today = new Date(window.BOOKING_TODAY || "2026-08-18");
    let html = "";
    let count = 0, offset = 1;
    while (count < 12) {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      offset++;
      const isSunday = d.getDay() === 0;
      const label = `${DAY_NAMES[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
      html += `<div class="cal-day ${isSunday ? "disabled" : ""}" data-label="${label}" data-key="${d.toISOString().slice(0,10)}">${DAY_NAMES[d.getDay()]}<br>${d.getMonth() + 1}/${d.getDate()}</div>`;
      if (!isSunday) count++;
    }
    grid.innerHTML = html;
    all(".cal-day:not(.disabled)").forEach(day => {
      day.addEventListener("click", () => {
        all(".cal-day").forEach(d => d.classList.remove("selected"));
        day.classList.add("selected");
        state.date = day.dataset.key;
        state.dateLabel = day.dataset.label;
        updateNav();
      });
    });
  }

  function renderTimes() {
    const grid = el("#time-grid");
    if (!grid) return;
    grid.innerHTML = TIME_SLOTS.map(t => `<div class="time-slot" data-t="${t}">${t}</div>`).join("");
    all(".time-slot").forEach(slot => {
      slot.addEventListener("click", () => {
        all(".time-slot").forEach(s => s.classList.remove("selected"));
        slot.classList.add("selected");
        state.time = slot.dataset.t;
        updateNav();
      });
    });
  }

  function validStep(step) {
    if (step === 1) return !!state.service;
    if (step === 2) return !!state.date && !!state.time;
    if (step === 3) {
      const nameOk = state.name.trim().length > 1;
      const phoneOk = state.phone.replace(/\D/g, "").length >= 10;
      const emailOk = /\S+@\S+\.\S+/.test(state.email);
      return nameOk && phoneOk && emailOk;
    }
    return true;
  }

  function updateNav() {
    const nextBtn = el("#b-next");
    if (nextBtn) nextBtn.disabled = !validStep(state.step);
  }

  function goToStep(n) {
    state.step = n;
    all(".b-panel").forEach(p => p.classList.remove("active"));
    const panel = el(`#b-step-${n}`);
    if (panel) panel.classList.add("active");
    all(".booking-step-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i + 1 === n);
      dot.classList.toggle("done", i + 1 < n);
    });
    const backBtn = el("#b-back");
    const nextBtn = el("#b-next");
    if (backBtn) backBtn.style.visibility = n === 1 ? "hidden" : "visible";
    if (n === 4) {
      if (nextBtn) nextBtn.style.display = "none";
      if (backBtn) backBtn.style.display = "none";
      renderConfirmation();
    } else {
      if (nextBtn) { nextBtn.style.display = ""; nextBtn.textContent = n === 3 ? "Confirm booking" : "Continue"; }
    }
    updateNav();
  }

  function renderConfirmation() {
    const box = el("#confirm-summary");
    if (!box) return;
    const confNum = "IL-" + Math.abs(hashCode(state.name + state.date + state.time)).toString().slice(0, 6);
    box.innerHTML = `
      <div class="b-confirm">
        <div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></div>
        <h3 style="margin-bottom:8px;">You're booked, ${escapeHtml(state.name.split(" ")[0] || "there")}.</h3>
        <p style="color:var(--muted);margin-bottom:22px;">Confirmation #${confNum} &middot; ${business} will call ${escapeHtml(state.phone)} to confirm before the visit.</p>
        <div class="b-summary" style="text-align:left;max-width:380px;margin:0 auto;">
          <div><strong>${state.service ? state.service.name : ""}</strong> &mdash; ${state.service ? state.service.price : ""}</div>
          <div style="margin-top:6px;">${state.dateLabel || ""} at ${state.time || ""}</div>
          <div style="margin-top:6px;">${escapeHtml(state.email)}</div>
          ${state.notes ? `<div style="margin-top:6px;color:var(--muted);">"${escapeHtml(state.notes)}"</div>` : ""}
        </div>
      </div>
    `;
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return h;
  }
  function escapeHtml(s) { return (s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function initFields() {
    ["name", "phone", "email", "notes"].forEach(f => {
      const input = el(`#b-${f}`);
      if (!input) return;
      input.addEventListener("input", () => { state[f] = input.value; updateNav(); });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!el(".booking-shell")) return;
    renderServices();
    renderCalendar();
    renderTimes();
    initFields();
    goToStep(1);

    const nextBtn = el("#b-next");
    const backBtn = el("#b-back");
    if (nextBtn) nextBtn.addEventListener("click", () => {
      if (!validStep(state.step)) return;
      if (state.step === 3) { goToStep(4); return; }
      goToStep(state.step + 1);
    });
    if (backBtn) backBtn.addEventListener("click", () => { if (state.step > 1) goToStep(state.step - 1); });
  });
})();
