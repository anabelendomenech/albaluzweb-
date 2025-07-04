import { API_KEY, BASE_ID } from "./airtableConfig.js";

const contentArea = document.getElementById("content-area");
const sidebarLinks = document.querySelectorAll(".sidebar a");

function setActiveTab(tab) {
  sidebarLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.tab === tab);
  });
}

async function fetchAirtable(table) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.records;
  } catch (error) {
    console.error("Fetch Airtable error:", error);
    return null;
  }
}

async function renderReservas() {
  const reservas = await fetchAirtable("RESERVAS");
  if (!reservas) {
    contentArea.innerHTML = "<p>Error cargando reservas.</p>";
    return;
  }

  let html = `<h1>Reservas</h1>
  <table border="1" style="width:100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Fecha Evento</th><th>Comentarios</th>
      </tr>
    </thead><tbody>`;

  reservas.forEach(r => {
    const f = r.fields;
    html += `<tr>
      <td>${f.Nombre || ''}</td>
      <td>${f["Fecha de la reserva"] || ''}</td>
      <td>${f.Hora || ''}</td>
      <td>${f["Cantidad de personas"] || ''}</td>
      <td>${f["Fecha del evento"] || ''}</td>
      <td>${f.Comentarios || ''}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  contentArea.innerHTML = html;
}

async function renderClientas() {
  const clientas = await fetchAirtable("CLIENTAS");
  if (!clientas) {
    contentArea.innerHTML = "<p>Error cargando clientas.</p>";
    return;
  }

  let html = `<h1>Clientas</h1>
  <table border="1" style="width:100%; border-collapse: collapse;">
    <thead>
      <tr><th>Nombre</th><th>Celular</th><th>Mail</th><th>Reservas</th><th>Última Reserva</th></tr>
    </thead><tbody>`;

  clientas.forEach(c => {
    const f = c.fields;
    html += `<tr>
      <td>${f.Nombre || ''}</td>
      <td>${f.Celular || ''}</td>
      <td>${f.Mail || ''}</td>
      <td>${f["Historial de reservas"] || ''}</td>
      <td>${f["Última reserva"] || ''}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  contentArea.innerHTML = html;
}

const modules = {
  reservas: renderReservas,
  clientas: renderClientas,
  // TODO: agregar las funciones para los otros módulos acá
};

async function loadTab(tab) {
  setActiveTab(tab);
  if (modules[tab]) {
    contentArea.innerHTML = "<p>Cargando...</p>";
    await modules[tab]();
  } else {
    contentArea.innerHTML = "<p>Módulo no encontrado.</p>";
  }
}

loadTab("reservas");

sidebarLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const tab = link.dataset.tab;
    loadTab(tab);
  });
});
