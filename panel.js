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

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString();
}

async function renderReservas() {
  const reservas = await fetchAirtable("RESERVAS");
  if (!reservas) {
    contentArea.innerHTML = "<p>Error cargando reservas.</p>";
    return;
  }

  let html = `<h1>Reservas</h1>
  <table>
    <thead>
      <tr>
        <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Fecha Evento</th><th>Comentarios</th>
      </tr>
    </thead><tbody>`;

  reservas.forEach(r => {
    const f = r.fields;
    html += `<tr>
      <td>${f.Nombre || ''}</td>
      <td>${formatDate(f["Fecha de la reserva"])}</td>
      <td>${f.Hora || ''}</td>
      <td>${f["Cantidad de personas"] || ''}</td>
      <td>${formatDate(f["Fecha del evento"])}</td>
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
  <table>
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
      <td>${formatDate(f["Última reserva"])}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  contentArea.innerHTML = html;
}

async function renderVestidos() {
  const vestidos = await fetchAirtable("VESTIDOS");
  if (!vestidos) {
    contentArea.innerHTML = "<p>Error cargando vestidos.</p>";
    return;
  }

  let html = `<h1>Vestidos</h1>
  <table>
    <thead>
      <tr><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th><th>Veces alquilado</th></tr>
    </thead><tbody>`;

  vestidos.forEach(v => {
    const f = v.fields;
    html += `<tr>
      <td>${f.Nombre || ''}</td>
      <td>${f.Talle || ''}</td>
      <td>${f.Color || ''}</td>
      <td>${f.Estado || ''}</td>
      <td>${f["Veces alquilado"] || 0}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  contentArea.innerHTML = html;
}

async function renderChecklist() {
  const checklist = await fetchAirtable("CHECKLIST");
  if (!checklist) {
    contentArea.innerHTML = "<p>Error cargando checklist.</p>";
    return;
  }

  let html = `<h1>Checklist (Fin de Semana)</h1>
  <table>
    <thead>
      <tr><th>Día</th><th>Vestido - Clienta</th><th>Pagó</th><th>Devuelto</th></tr>
    </thead><tbody>`;

  checklist.forEach(c => {
    const f = c.fields;
    html += `<tr>
      <td>${formatDate(f.Día)}</td>
      <td>${f["Vestidos a preparar"] || ''}</td>
      <td>${f.Pagó || ''}</td>
      <td>${f.Devuelto || ''}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  contentArea.innerHTML = html;
}

async function renderFinanzas() {
  const finanzas = await fetchAirtable("FINANZAS");
  if (!finanzas) {
    contentArea.innerHTML = "<p>Error cargando finanzas.</p>";
    return;
  }

  let html = `<h1>Finanzas</h1>
  <table>
    <thead>
      <tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Observaciones</th><th>Saldo</th></tr>
    </thead><tbody>`;

  finanzas.forEach(f => {
    const d = f.fields;
    html += `<tr>
      <td>${formatDate(d.Fecha)}</td>
      <td>${d.Tipo || ''}</td>
      <td>${d.Monto || ''}</td>
      <td>${d.Motivo || ''}</td>
      <td>${d.Observaciones || ''}</td>
      <td>${d["Saldo acumulado"] || ''}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  contentArea.innerHTML = html;
}

async function renderHorarios() {
  const horarios = await fetchAirtable("HORARIOS DISPONIBLES");
  if (!horarios) {
    contentArea.innerHTML = "<p>Error cargando horarios disponibles.</p>";
    return;
  }

  let html = `<h1>Horarios Disponibles</h1>`;
  horarios.forEach(h => {
    const f = h.fields;
    html += `<h3>${formatDate(f.Fecha)}</h3>`;
    html += `<ul>`;
    for (const key in f) {
      if (key !== "Fecha" && f.hasOwnProperty(key)) {
        const estado = f[key] === true || f[key] === "✅" ? "Disponible" : "No disponible";
        html += `<li>${key}: ${estado}</li>`;
      }
    }
    html += `</ul>`;
  });

  contentArea.innerHTML = html;
}

const modules = {
  reservas: renderReservas,
  clientas: renderClientas,
  vestidos: renderVestidos,
  checklist: renderChecklist,
  finanzas: renderFinanzas,
  horarios: renderHorarios,
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
    loadTab(link.dataset.tab);
  });
});
