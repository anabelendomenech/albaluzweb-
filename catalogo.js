document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor-catalogo");

  const tipoFiltro = document.getElementById("filtro-tipo");
  const talleFiltro = document.getElementById("filtro-talle");
  const colorFiltro = document.getElementById("filtro-color");

  let vestidos = [];

  async function cargarVestidos() {
    const res = await fetch("vestidos.json");
    vestidos = await res.json();
    renderizarVestidos(vestidos);
  }

  function renderizarVestidos(lista) {
    contenedor.innerHTML = "";
    lista.forEach((vestido) => {
      const div = document.createElement("div");
      div.className = "vestido";
      div.innerHTML = `
        <img src="img/${vestido.imagen}" alt="${vestido.nombre}" />
        <h3>${vestido.nombre}</h3>
        <p>💲${vestido.precio} - Talle: ${vestido.talle}</p>
        <p>Color: ${vestido.color}</p>
        <p><strong>${vestido.nuevaColeccion ? "🌟 NUEVA COLECCIÓN" : ""}</strong></p>
      `;
      contenedor.appendChild(div);
    });
  }

  function aplicarFiltros() {
    const tipo = tipoFiltro.value;
    const talle = talleFiltro.value;
    const color = colorFiltro.value;

    const filtrados = vestidos.filter((v) => {
      return (
        (!tipo || v.tipo === tipo) &&
        (!talle || v.talle === talle) &&
        (!color || v.color.toLowerCase() === color.toLowerCase())
      );
    });

    renderizarVestidos(filtrados);
  }

  tipoFiltro.addEventListener("change", aplicarFiltros);
  talleFiltro.addEventListener("change", aplicarFiltros);
  colorFiltro.addEventListener("change", aplicarFiltros);

  cargarVestidos();
});
