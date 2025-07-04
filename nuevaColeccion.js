const { apiKey, baseId } = airtableConfig;


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
