document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("slider");
  if (!slider) return;

  const vestidos = [
    "Vestido Negro XL Escote Espalda",
    "Vestido Azul Satén L Corte Princesa",
    "Vestido Plateado M Lentejuelas Manga Larga",
    "Vestido Rojo XS Corto Espalda Abierta"
  ];

  vestidos.forEach(nombre => {
    const archivo = nombre.replace(/\s+/g, "_").toLowerCase() + ".jpg";
    const img = document.createElement("img");
    img.src = `img/${archivo}`;
    img.alt = nombre;
    img.className = "vestido-slide";
    img.addEventListener("click", () => {
      window.open("https://wa.me/59898256239?text=Hola!%20Quiero%20consultar%20por%20el%20" + encodeURIComponent(nombre), "_blank");
    });
    slider.appendChild(img);
  });

  let idx = 0;
  setInterval(() => {
    const slides = document.querySelectorAll(".vestido-slide");
    slides.forEach((s, i) => {
      s.style.display = i === idx ? "block" : "none";
    });
    idx = (idx + 1) % vestidos.length;
  }, 3000);
});
