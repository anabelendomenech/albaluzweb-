document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".main-nav ul");
  hamburger.addEventListener("click", () => nav.classList.toggle("active"));
});
