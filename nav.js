document.querySelectorAll(".nav-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    const menu = document.querySelector(".mobile-menu");
    if (menu) menu.classList.toggle("open");
  });
});
