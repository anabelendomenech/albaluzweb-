const apiKey = 'pat4Z3hm5lJaeSBxQ.568935dff179a1efd1d93ec53da2a523f432a391c248fbfc7da27e124da92f19';
const baseId = 'appraIuHWdh5tA4FU';

async function cargarNuevaColeccion() {
  const url = `https://api.airtable.com/v0/${baseId}/VESTIDOS?filterByFormula=({Estado}='Nueva Colección')`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  const data = await res.json();
  const contenedor = document.getElementById("slider-nueva");

  if (!data.records || data.records.length === 0) {
    contenedor.innerHTML = "<p>No hay vestidos nuevos por el momento.</p>";
    return;
  }

  data.records.forEach(v => {
    const imgUrl = v.fields.Foto && v.fields.Foto[0] && v.fields.Foto[0].url;
    const alt = v.fields.Nombre || "Vestido";

    if (imgUrl) {
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = alt;
      contenedor.appendChild(img);
    }
  });
}

cargarNuevaColeccion();
