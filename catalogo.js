const apiKey = 'pat4Z3hm5lJaeSBxQ.568935dff179a1efd1d93ec53da2a523f432a391c248fbfc7da27e124da92f19';
const baseId = 'appraIuHWdh5tA4FU';

async function cargarCatalogo() {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/VESTIDOS`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  const data = await res.json();
  const contenedor = document.getElementById("catalogo");

  data.records.forEach(vestido => {
    const nombre = vestido.fields.Nombre || "Vestido";
    const talle = vestido.fields.Talle || "-";
    const color = vestido.fields.Color || "-";
    const estado = vestido.fields.Estado || "-";
    const foto = vestido.fields.Foto && vestido.fields.Foto[0] && vestido.fields.Foto[0].url;

    if (foto) {
      const card = document.createElement("div");
      card.className = "card-vestido";
      card.innerHTML = `
        <img src="${foto}" alt="${nombre}" />
        <h3>${nombre}</h3>
        <p><strong>Talle:</strong> ${talle}</p>
        <p><strong>Color:</strong> ${color}</p>
        <p><strong>Estado:</strong> ${estado}</p>
      `;
      contenedor.appendChild(card);
    }
  });
}

cargarCatalogo();
