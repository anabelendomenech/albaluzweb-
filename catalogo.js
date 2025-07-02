document.addEventListener("DOMContentLoaded", async () => {
  const galeria = document.getElementById("galeria-vestidos");
  const galeriaNueva = document.getElementById("galeria-nueva");
  const filtroTipo = document.getElementById("filtro-tipo");
  const filtroTalle = document.getElementById("filtro-talle");
  const filtroColor = document.getElementById("filtro-color");

  let vestidos = [];

  try {
    const response = await fetch("vestidos.json");
    vestidos = await response.json();
  } catch (error) {
    galeria.innerHTML = "<p>Error al cargar los vestidos.</p>";
    return;
  }

  // Llenar filtros únicos
  const tipos = [...new Set(vestidos.map(v => v.tipo))];
  const talles = [...new Set(vestidos.map(v => v.talle))];
  const colores = [...new Set(vestidos.map(v => v.color))];

  tipos.forEach(tipo => filtroTipo.innerHTML += `<option value="${tipo}">${tipo}</option>`);
  talles.forEach(talle => filtroTalle.innerHTML += `<option value="${talle}">${talle}</option>`);
  colores.forEach(color => filtroColor.innerHTML += `<option value="${color}">${color}</option>`);

  function mostrarVestidos() {
    galeria.innerHTML = "";
    galeriaNueva.innerHTML = "";

    const tipo = filtroTipo.value;
    const talle = filtroTalle.value;
    const color = filtroColor.value;

    const filtrados = vestidos.filter(v => {
      return (!tipo || v.tipo === tipo) &&
             (!talle || v.talle === talle) &&
             (!color || v.color === color);
    });

    filtrados.forEach(v => {
      const card = document.createElement("div");
      card.className = "vestido";
      card.innerHTML = `
        <img src="img/vestidos/${v.imagen}" alt="${v.nombre}" />
        <h4>${v.nombre}</h4>
        <p>Talle: ${v.talle}</p>
        <p>Color: ${v.color}</p>
        <p>$${v.precio}</p>
      `;
      galeria.appendChild(card);

      if (v.nuevaColeccion) {
        const nueva = card.cloneNode(true);
        galeriaNueva.appendChild(nueva);
      }
    });

    if (filtrados.length === 0) {
      galeria.innerHTML = "<p>No hay vestidos que coincidan con los filtros.</p>";
    }
  }

  filtroTipo.addEventListener("change", mostrarVestidos);
  filtroTalle.addEventListener("change", mostrarVestidos);
  filtroColor.addEventListener("change", mostrarVestidos);

  mostrarVestidos();
});
