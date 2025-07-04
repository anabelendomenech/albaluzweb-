document.addEventListener("DOMContentLoaded", () => {
  const galeria = document.getElementById("galeria");

  if (!galeria) return;

  fetch("vestidos.json")
    .then((response) => response.json())
    .then((data) => {
      mostrarCatalogo(data);
    })
    .catch((error) => {
      console.error("Error al cargar los vestidos:", error);
    });
});

function mostrarCatalogo(data) {
  const galeria = document.getElementById("galeria");
  galeria.innerHTML = "";

  data.forEach((vestido) => {
    const contenedor = document.createElement("div");
    contenedor.className = "item";

    const img = document.createElement("img");
    img.src = `img/${vestido.imagen}`;
    img.alt = vestido.nombre;

    const nombre = document.createElement("h3");
    nombre.textContent = vestido.nombre;

    const boton = document.createElement("a");
    boton.href = `https://wa.me/59898256239?text=Hola!%20Quiero%20consultar%20por%20el%20${encodeURIComponent(vestido.nombre)}`;
    boton.textContent = "Consultar por WhatsApp";
    boton.className = "boton";

    contenedor.appendChild(img);
    contenedor.appendChild(nombre);
    contenedor.appendChild(boton);
    galeria.appendChild(contenedor);
  });
}

function filtrarCategoria(prefijo) {
  const galeria = document.getElementById("galeria");
  galeria.innerHTML = "";

  fetch("vestidos.json")
    .then((response) => response.json())
    .then((data) => {
      const filtrados = data.filter((vestido) =>
        vestido.imagen.startsWith(prefijo)
      );
      mostrarCatalogo(filtrados);
    });
}
