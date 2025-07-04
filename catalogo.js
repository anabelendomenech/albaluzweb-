const { apiKey, baseId } = airtableConfig;


let vestidos = [];

async function cargarCatalogo() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/VESTIDOS`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  const data = await res.json();
  vestidos = data.records;

  cargarColores();
  mostrarVestidos(vestidos);
}

function cargarColores() {
  const filtroColor = document.getElementById("filtro-color");
  const colores = new Set(vestidos.map(v => v.fields.Color).filter(Boolean));

  colores.forEach(color => {
    const op = document.createElement("option");
    op.value = color;
    op.textContent = color;
    filtroColor.appendChild(op);
  });
}

function mostrarVestidos(lista) {
  const contenedor = document.getElementById("catalogo");
  contenedor.innerHTML = "";

  lista.forEach(vestido => {
    const nombre = vestido.fields.Nombre || "Vestido";
    const talle = vestido.fields.Talle || "-";
    const color = vestido.fields.Color || "-";
    const tipo = vestido.fields.Tipo || "-";
    const foto = vestido.fields.Foto && vestido.fields.Foto[0] && vestido.fields.Foto[0].url;

    if (foto) {
      const card = document.createElement("div");
      card.className = "card-vestido";
      card.innerHTML = `
        <img src="${foto}" alt="${nombre}" />
        <h3>${nombre}</h3>
        <p><strong>Talle:</strong> ${talle}</p>
        <p><strong>Color:</strong> ${color}</p>
        <p><strong>Tipo:</strong> ${tipo}</p>
      `;
      contenedor.appendChild(card);
    }
  });
}

document.getElementById("filtro-color").addEventListener("change", aplicarFiltros);
document.getElementById("filtro-tipo").addEventListener("change", aplicarFiltros);

function aplicarFiltros() {
  const colorSel = document.getElementById("filtro-color").value;
  const tipoSel = document.getElementById("filtro-tipo").value;

  const filtrados = vestidos.filter(v => {
    const color = v.fields.Color || "";
    const tipo = v.fields.Tipo || "";
    return (!colorSel || color === colorSel) && (!tipoSel || tipo === tipoSel);
  });

  mostrarVestidos(filtrados);
}

cargarCatalogo();
