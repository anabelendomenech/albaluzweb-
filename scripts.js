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
// FAQ toggle
document.querySelectorAll(".faq-item h3").forEach(item => {
  item.addEventListener("click", () => {
    const content = item.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
});
