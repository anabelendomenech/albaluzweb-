function cerrarBanner() {
  document.getElementById("aniversario-banner").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  // Animación de estrellas de comentarios
  document.querySelectorAll(".rating span").forEach((star, index, stars) => {
    star.addEventListener("click", () => {
      stars.forEach((s, i) => {
        s.style.color = i <= index ? "#ffcc00" : "#ddd";
      });
    });
  });

  // Deslizador desaparece cuando se baja
  const indicator = document.getElementById("indicator");
  window.addEventListener("scroll", () => {
    indicator.style.opacity = window.scrollY > 100 ? "0" : "1";
  });
});
