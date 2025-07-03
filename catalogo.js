const vestidos = [
  {
    nombre: "Vestido azul largo con brillos",
    imagen: "IMG_3526.jpeg",
    color: "azul",
    descripcion: "Elegante vestido largo azul con detalles brillantes, ideal para ocasiones especiales.",
  },
  {
    nombre: "Vestido corto rojo",
    imagen: "IMG_3527.jpeg",
    color: "rojo",
    descripcion: "Vestido corto rojo vibrante, perfecto para fiestas y eventos casuales.",
  },
  {
    nombre: "Vestido largo negro",
    imagen: "IMG_3528.jpeg",
    color: "negro",
    descripcion: "Clásico vestido largo negro, elegante y atemporal.",
  },
  // Agregá más vestidos según tu colección
];

const contenedor = document.getElementById("catalogo-vestidos");
const filtroColor = document.getElementById("filtro-color");

function mostrarVestidos(filtro = "all") {
  contenedor.innerHTML = "";

  const filtrados = filtro === "all" ? vestidos : vestidos.filter(v => v.color === filtro);

  filtrados.forEach(v => {
    const card = document.createElement("div");
    card.classList.add("vestido-card");

    card.innerHTML = `
      <img src="vestidos/${v.imagen}" alt="${v.nombre}" />
      <h3>${v.nombre}</h3>
      <p>${v.descripcion}</p>
    `;

    contenedor.appendChild(card);
  });
}

filtroColor.addEventListener("change", e => {
  mostrarVestidos(e.target.value);
});

mostrarVestidos();
