/* Scroll-reveal + count-up + light hero parallax. Shared mechanism
   across the trade demo sites, own timing/easing per site so it never
   feels copy-pasted from hyperlinkai.online's particle-field version. */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("in"), i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = el.dataset.count;
        const numMatch = target.match(/[\d,.]+/);
        if (!numMatch) return;
        const end = parseFloat(numMatch[0].replace(/,/g, ""));
        const suffix = target.slice(numMatch[0].length);
        const prefix = target.slice(0, target.indexOf(numMatch[0]));
        const dur = 900;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(end * eased * 10) / 10;
          el.textContent = prefix + (Number.isInteger(end) ? Math.round(val) : val) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        countIo.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIo.observe(el));
  }

  const heroPhoto = document.querySelector(".hero-photo");
  if (heroPhoto) {
    window.addEventListener("scroll", () => {
      const y = Math.min(window.scrollY, 400);
      heroPhoto.style.transform = `translateY(${y * 0.06}px)`;
    }, { passive: true });
  }
})();
