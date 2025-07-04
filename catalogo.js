document.addEventListener("DOMContentLoaded", () => {
  const vestidos = [
    "vestido-azul-brillos-unhombro",
    "vestido-azul-corto-unamanga",
    "vestido-azul-cruzado",
    "vestido-azul-largo-brillos",
    "vestido-bordo-corto-brillos",
    "vestido-corset-celeste",
    "vestido-terracota-corto",
    "vestido-verde-brillos-unhombro",
    "vestido-verde-cruzado",
    "vestido-verde-unatira"
  ];

  const lista = document.getElementById("catalogo-lista");
  const detalle = document.getElementById("detalle-vestido");

  vestidos.forEach(nombre => {
    const card = document.createElement("div");
    card.className = "vestido-card";

    const img = document.createElement("img");
    img.src = `img/${nombre}.jpg`;
    img.alt = nombre.replaceAll("-", " ");
    img.className = "vestido-img";

    const titulo = document.createElement("h3");
    titulo.textContent = img.alt;

    const btn = document.createElement("button");
    btn.textContent = "Ver más";
    btn.className = "button";
    btn.onclick = () => mostrarDetalle(nombre);

    card.appendChild(img);
    card.appendChild(titulo);
    card.appendChild(btn);
    lista.appendChild(card);
  });

  function mostrarDetalle(nombre) {
    lista.style.display = "none";
    detalle.style.display = "block";
    detalle.innerHTML = "";

    const img = document.createElement("img");
    img.src = `img/${nombre}.jpg`;
    img.alt = nombre;
    img.className = "detalle-img";

    const nombreVestido = nombre.replaceAll("-", " ");

    const titulo = document.createElement("h2");
    titulo.textContent = nombreVestido;

    const desc = document.createElement("p");
    desc.textContent = `Este vestido es ideal para tu próximo evento. Consultá disponibilidad y talle por WhatsApp.`;

    const btnWhatsapp = document.createElement("a");
    btnWhatsapp.href = `https://wa.me/59898256239?text=Hola!%20Quiero%20consultar%20por%20el%20vestido%20${encodeURIComponent(nombreVestido)}`;
    btnWhatsapp.textContent = "Consultar por WhatsApp";
    btnWhatsapp.className = "btn-whatsapp";
    btnWhatsapp.target = "_blank";

    const volver = document.createElement("button");
    volver.textContent = "Volver al catálogo";
    volver.className = "button";
    volver.onclick = () => {
      detalle.style.display = "none";
      lista.style.display = "grid";
    };

    detalle.appendChild(titulo);
    detalle.appendChild(img);
    detalle.appendChild(desc);
    detalle.appendChild(btnWhatsapp);
    detalle.appendChild(volver);
  }

  // Si viene con ?vestido=...
  const params = new URLSearchParams(window.location.search);
  const vestidoParam = params.get("vestido");
  if (vestidoParam && vestidos.includes(vestidoParam)) {
    mostrarDetalle(vestidoParam);
  }
});
