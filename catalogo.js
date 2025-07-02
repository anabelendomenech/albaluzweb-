const galeria = document.getElementById("galeria-vestidos");
const filtro = document.getElementById("filtro-color");

// Ejemplo (más adelante conectamos con Drive o Sheets)
const vestidos = [
  {
    imagen: "https://drive.google.com/uc?id=ID1",
    nombre: "Vestido azul largo con brillos",
    color: "Azul",
    precio: "$1200",
    descripcion: "Vestido largo azul ideal para gala"
  },
  // Agregar más...
];

function mostrarVestidos(lista) {
  galeria.innerHTML = "";
  lista.forEach(v => {
    galeria.innerHTML += `
      <div class="vestido-card">
        <img src="${v.imagen}" alt="${v.nombre}">
        <div class="vestido-info">
          <h3>${v.nombre}</h3>
          <p>${v.descripcion}</p>
          <strong>${v.precio}</strong>
        </div>
      </div>`;
  });
}

mostrarVestidos(vestidos);
filtro.addEventListener("change", () => {
  mostrarVestidos(filtro.value === "todos" ? vestidos : vestidos.filter(v => v.color === filtro.value));
});
