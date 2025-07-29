// 🔐 CONFIGURACIÓN
import { AIRTABLE_API_KEY, BASE_ID } from "./airtableConfig.js";

const contentArea = document.getElementById("content-area");
const sidebarLinks = document.querySelectorAll(".sidebar a");

function setActiveTab(tab) {
  sidebarLinks.forEach(link => link.classList.toggle("active", link.dataset.tab === tab));
}

async function fetchAirtable(table) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return (await res.json()).records;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString() : "";
}

function renderForm(fields, id, buttonText, onSubmit) {
  const inputs = fields.map(f => `<input name="${f.name}" type="${f.type || 'text'}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} />`).join("\n");
  return `<form id="${id}" style="background:#fff;padding:16px;margin-bottom:20px;border-radius:8px;box-shadow:0 0 8px rgba(0,0,0,0.1);display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
    ${inputs}
    <button type="submit" style="grid-column: span 2;">${buttonText}</button>
  </form>`;
}

// --- RESERVAS ---
async function renderReservas() {
  const reservas = await fetchAirtable("RESERVAS");
  if (!reservas) return contentArea.innerHTML = "<p>Error cargando reservas.</p>";

  let html = `<h1>Reservas</h1>`;
  html += renderForm([
    { name: "Nombre", placeholder: "Nombre", required: true },
    { name: "Evento", placeholder: "Evento", required: true },
    { name: "Cita", placeholder: "Fecha cita", type: "date", required: true },
    { name: "Horario", placeholder: "Horario", required: true },
    { name: "Personas", placeholder: "Personas", type: "number", required: true },
    { name: "Mensaje", placeholder: "Mensaje" }
  ], "form-reserva", "Agregar Reserva");

  html += `<table><thead><tr><th>Nombre</th><th>Evento</th><th>Cita</th><th>Horario</th><th>Personas</th><th>Mensaje</th></tr></thead><tbody>`;
  reservas.forEach(r => {
    const f = r.fields;
    html += `<tr><td>${f.Nombre || ''}</td><td>${f.Evento || ''}</td><td>${formatDate(f.Cita)}</td><td>${f.Horario || ''}</td><td>${f.Personas || ''}</td><td>${f.Mensaje || ''}</td></tr>`;
  });
  html += `</tbody></table>`;
  contentArea.innerHTML = html;

  document.getElementById("form-reserva").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const data = {
      fields: {
        Nombre: f.Nombre.value,
        Evento: f.Evento.value,
        Cita: f.Cita.value,
        Horario: f.Horario.value,
        Personas: parseInt(f.Personas.value),
        Mensaje: f.Mensaje.value
      }
    };
    try {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/RESERVAS`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      f.reset();
      renderReservas();
    } catch (err) {
      alert("Error al guardar reserva");
    }
  });
}

// --- CLIENTAS ---
async function renderClientas() {
  const clientas = await fetchAirtable("CLIENTAS");
  if (!clientas) return contentArea.innerHTML = "<p>Error cargando clientas.</p>";

  let html = `<h1>Clientas</h1>`;
  html += renderForm([
    { name: "Nombre", placeholder: "Nombre", required: true },
    { name: "Celular", placeholder: "Celular", required: true },
    { name: "Mail", placeholder: "Mail", type: "email", required: true }
  ], "form-clienta", "Agregar Clienta");

  html += `<table><thead><tr><th>Nombre</th><th>Celular</th><th>Mail</th><th>Última Reserva</th></tr></thead><tbody>`;
  clientas.forEach(c => {
    const f = c.fields;
    html += `<tr><td>${f.Nombre || ''}</td><td>${f.Celular || ''}</td><td>${f.Mail || ''}</td><td>${formatDate(f["Última reserva"])}</td></tr>`;
  });
  html += `</tbody></table>`;
  contentArea.innerHTML = html;

  document.getElementById("form-clienta").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const data = { fields: { Nombre: f.Nombre.value, Celular: f.Celular.value, Mail: f.Mail.value } };
    try {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      f.reset();
      renderClientas();
    } catch (err) {
      alert("Error al guardar clienta");
    }
  });
}

// --- VESTIDOS ---
async function renderVestidos() {
  const vestidos = await fetchAirtable("VESTIDOS");
  if (!vestidos) return contentArea.innerHTML = "<p>Error cargando vestidos.</p>";

  let html = `<h1>Vestidos</h1>`;
  html += renderForm([
    { name: "Nombre", placeholder: "Nombre", required: true },
    { name: "Talle", placeholder: "Talle", required: true },
    { name: "Color", placeholder: "Color", required: true },
    { name: "Estado", placeholder: "Estado (ej: Disponible)", required: true }
  ], "form-vestido", "Agregar Vestido");

  html += `<table><thead><tr><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th><th>Veces alquilado</th></tr></thead><tbody>`;
  vestidos.forEach(v => {
    const f = v.fields;
    html += `<tr><td>${f.Nombre || ''}</td><td>${f.Talle || ''}</td><td>${f.Color || ''}</td><td>${f.Estado || ''}</td><td>${f["Veces alquilado"] || 0}</td></tr>`;
  });
  html += `</tbody></table>`;
  contentArea.innerHTML = html;

  document.getElementById("form-vestido").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const data = { fields: { Nombre: f.Nombre.value, Talle: f.Talle.value, Color: f.Color.value, Estado: f.Estado.value } };
    try {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/VESTIDOS`, {
        method: "POST",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      f.reset();
      renderVestidos();
    } catch (err) {
      alert("Error al guardar vestido");
    }
  });
}

// --- CHECKLIST ---
async function renderChecklist() {
  const checklist = await fetchAirtable("CHECKLIST");
  if (!checklist) return contentArea.innerHTML = "<p>Error cargando checklist.</p>";

  let html = `<h1>Checklist</h1>`;
  html += renderForm([
    { name: "Día", placeholder: "Fecha", type: "date", required: true },
    { name: "Vestidos", placeholder: "Vestidos a preparar", required: true },
    { name: "Pagó", placeholder: "Pagó", required: true },
    { name: "Devuelto", placeholder: "Devuelto", required: true }
  ], "form-checklist", "Agregar Item");

  html += `<table><thead><tr><th>Día</th><th>Vestido - Clienta</th><th>Pagó</th><th>Devuelto</th></tr></thead><tbody>`;
  checklist.forEach(c => {
    const f = c.fields;
    html += `<tr><td>${formatDate(f.Día)}</td><td>${f["Vestidos a preparar"] || ''}</td><td>${f.Pagó || ''}</td><td>${f.Devuelto || ''}</td></tr>`;
  });
  html += `</tbody></table>`;
  contentArea.innerHTML = html;

  document.getElementById("form-checklist").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const data = { fields: { Día: f.Día.value, "Vestidos a preparar": f.Vestidos.value, Pagó: f.Pagó.value, Devuelto: f.Devuelto.value } };
    try {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/CHECKLIST`, {
        method: "POST",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      f.reset();
      renderChecklist();
    } catch (err) {
      alert("Error al guardar checklist");
    }
  });
}

// --- FINANZAS ---
async function renderFinanzas() {
  const finanzas = await fetchAirtable("FINANZAS");
  if (!finanzas) return contentArea.innerHTML = "<p>Error cargando finanzas.</p>";

  let html = `<h1>Finanzas</h1>`;
  html += renderForm([
    { name: "Fecha", placeholder: "Fecha", type: "date", required: true },
    { name: "Tipo", placeholder: "Ingreso/Egreso", required: true },
    { name: "Monto", placeholder: "Monto", type: "number", required: true },
    { name: "Motivo", placeholder: "Motivo", required: true },
    { name: "Observaciones", placeholder: "Observaciones" },
    { name: "Saldo", placeholder: "Saldo acumulado" }
  ], "form-finanzas", "Agregar Movimiento");

  html += `<table><thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Observaciones</th><th>Saldo</th></tr></thead><tbody>`;
  finanzas.forEach(f => {
    const d = f.fields;
    html += `<tr><td>${formatDate(d.Fecha)}</td><td>${d.Tipo || ''}</td><td>${d.Monto || ''}</td><td>${d.Motivo || ''}</td><td>${d.Observaciones || ''}</td><td>${d["Saldo acumulado"] || ''}</td></tr>`;
  });
  html += `</tbody></table>`;
  contentArea.innerHTML = html;

  document.getElementById("form-finanzas").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const data = { fields: { Fecha: f.Fecha.value, Tipo: f.Tipo.value, Monto: parseFloat(f.Monto.value), Motivo: f.Motivo.value, Observaciones: f.Observaciones.value, "Saldo acumulado": f.Saldo.value } };
    try {
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/FINANZAS`, {
        method: "POST",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      f.reset();
      renderFinanzas();
    } catch (err) {
      alert("Error al guardar finanza");
    }
  });
}

// --- HORARIOS DISPONIBLES ---
async function renderHorarios() {
  const horarios = await fetchAirtable("HORARIOS DISPONIBLES");
  if (!horarios) return contentArea.innerHTML = "<p>Error cargando horarios disponibles.</p>";

  let html = `<h1>Horarios Disponibles</h1>`;
  horarios.forEach(h => {
    const f = h.fields;
    html += `<h3>${formatDate(f.Fecha)}</h3><ul>`;
    Object.entries(f).forEach(([k, v]) => {
      if (k !== "Fecha") {
        html += `<li>${k}: ${v === true || v === "✅" ? '✅' : '❌'}</li>`;
      }
    });
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
  horarios: renderHorarios
};

async function loadTab(tab) {
  setActiveTab(tab);
  contentArea.innerHTML = "<p>Cargando...</p>";
  await modules[tab]();
}

sidebarLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    loadTab(link.dataset.tab);
  });
});

loadTab("reservas");
// // import { AIRTABLE_API_KEY, BASE_ID } from "./airtableConfig.js";

// // const contentArea = document.getElementById("content-area");
// // const sidebarLinks = document.querySelectorAll(".sidebar a");

// // function setActiveTab(tab) {
// //   sidebarLinks.forEach(link => {
// //     link.classList.toggle("active", link.dataset.tab === tab);
// //   });
// // }

// // async function fetchAirtable(table) {
// //   const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
// //   try {
// //     const res = await fetch(url, {
// //       headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
// //     });
// //     if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
// //     const data = await res.json();
// //     return data.records;
// //   } catch (error) {
// //     console.error("Fetch Airtable error:", error);
// //     console.log("Base ID:", BASE_ID);
// //     console.log("API KEY:", AIRTABLE_API_KEY);
// //     return null;
// //   }
// // }

// // function formatDate(d) {
// //   if (!d) return "";
// //   const date = new Date(d);
// //   return date.toLocaleDateString();
// // }

// // async function renderReservas() {
// //   const reservas = await fetchAirtable("RESERVAS");
// //   if (!reservas) {
// //     contentArea.innerHTML = "<p>Error cargando reservas.</p>";
// //     return;
// //   }

// //   let html = `<h1>Reservas</h1>
// //   <table>
// //     <thead>
// //       <tr>
// //         <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Fecha Evento</th><th>Comentarios</th>
// //       </tr>
// //     </thead><tbody>`;

// //   reservas.forEach(r => {
// //     const f = r.fields;
// //     html += `<tr>
// //       <td>${f.Nombre || ''}</td>
// //       <td>${formatDate(f["Fecha de la reserva"])}</td>
// //       <td>${f.Hora || ''}</td>
// //       <td>${f["Cantidad de personas"] || ''}</td>
// //       <td>${formatDate(f["Fecha del evento"])}</td>
// //       <td>${f.Comentarios || ''}</td>
// //     </tr>`;
// //   });

// //   html += "</tbody></table>";
// //   contentArea.innerHTML = html;
// // }

// // async function renderClientas() {
// //   const clientas = await fetchAirtable("CLIENTAS");
// //   if (!clientas) {
// //     contentArea.innerHTML = "<p>Error cargando clientas.</p>";
// //     return;
// //   }

// //   let html = `<h1>Clientas</h1>
// //   <table>
// //     <thead>
// //       <tr><th>Nombre</th><th>Celular</th><th>Mail</th><th>Reservas</th><th>Última Reserva</th></tr>
// //     </thead><tbody>`;

// //   clientas.forEach(c => {
// //     const f = c.fields;
// //     html += `<tr>
// //       <td>${f.Nombre || ''}</td>
// //       <td>${f.Celular || ''}</td>
// //       <td>${f.Mail || ''}</td>
// //       <td>${f["Historial de reservas"] || ''}</td>
// //       <td>${formatDate(f["Última reserva"])}</td>
// //     </tr>`;
// //   });

// //   html += "</tbody></table>";
// //   contentArea.innerHTML = html;
// // }

// // async function renderVestidos() {
// //   const vestidos = await fetchAirtable("VESTIDOS");
// //   if (!vestidos) {
// //     contentArea.innerHTML = "<p>Error cargando vestidos.</p>";
// //     return;
// //   }

// //   let html = `<h1>Vestidos</h1>
// //   <table>
// //     <thead>
// //       <tr><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th><th>Veces alquilado</th></tr>
// //     </thead><tbody>`;

// //   vestidos.forEach(v => {
// //     const f = v.fields;
// //     html += `<tr>
// //       <td>${f.Nombre || ''}</td>
// //       <td>${f.Talle || ''}</td>
// //       <td>${f.Color || ''}</td>
// //       <td>${f.Estado || ''}</td>
// //       <td>${f["Veces alquilado"] || 0}</td>
// //     </tr>`;
// //   });

// //   html += "</tbody></table>";
// //   contentArea.innerHTML = html;
// // }

// // async function renderChecklist() {
// //   const checklist = await fetchAirtable("CHECKLIST");
// //   if (!checklist) {
// //     contentArea.innerHTML = "<p>Error cargando checklist.</p>";
// //     return;
// //   }

// //   let html = `<h1>Checklist (Fin de Semana)</h1>
// //   <table>
// //     <thead>
// //       <tr><th>Día</th><th>Vestido - Clienta</th><th>Pagó</th><th>Devuelto</th></tr>
// //     </thead><tbody>`;

// //   checklist.forEach(c => {
// //     const f = c.fields;
// //     html += `<tr>
// //       <td>${formatDate(f.Día)}</td>
// //       <td>${f["Vestidos a preparar"] || ''}</td>
// //       <td>${f.Pagó || ''}</td>
// //       <td>${f.Devuelto || ''}</td>
// //     </tr>`;
// //   });

// //   html += "</tbody></table>";
// //   contentArea.innerHTML = html;
// // }

// // async function renderFinanzas() {
// //   const finanzas = await fetchAirtable("FINANZAS");
// //   if (!finanzas) {
// //     contentArea.innerHTML = "<p>Error cargando finanzas.</p>";
// //     return;
// //   }

// //   let html = `<h1>Finanzas</h1>
// //   <table>
// //     <thead>
// //       <tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Observaciones</th><th>Saldo</th></tr>
// //     </thead><tbody>`;

// //   finanzas.forEach(f => {
// //     const d = f.fields;
// //     html += `<tr>
// //       <td>${formatDate(d.Fecha)}</td>
// //       <td>${d.Tipo || ''}</td>
// //       <td>${d.Monto || ''}</td>
// //       <td>${d.Motivo || ''}</td>
// //       <td>${d.Observaciones || ''}</td>
// //       <td>${d["Saldo acumulado"] || ''}</td>
// //     </tr>`;
// //   });

// //   html += "</tbody></table>";
// //   contentArea.innerHTML = html;
// // }

// // async function renderHorarios() {
// //   const horarios = await fetchAirtable("HORARIOS DISPONIBLES");
// //   if (!horarios) {
// //     contentArea.innerHTML = "<p>Error cargando horarios disponibles.</p>";
// //     return;
// //   }

// //   let html = `<h1>Horarios Disponibles</h1>`;
// //   horarios.forEach(h => {
// //     const f = h.fields;
// //     html += `<h3>${formatDate(f.Fecha)}</h3>`;
// //     html += `<ul>`;
// //     for (const key in f) {
// //       if (key !== "Fecha" && f.hasOwnProperty(key)) {
// //         const estado = f[key] === true || f[key] === "✅" ? "Disponible" : "No disponible";
// //         html += `<li>${key}: ${estado}</li>`;
// //       }
// //     }
// //     html += `</ul>`;
// //   });

// //   contentArea.innerHTML = html;
// // }

// // const modules = {
// //   reservas: renderReservas,
// //   clientas: renderClientas,
// //   vestidos: renderVestidos,
// //   checklist: renderChecklist,
// //   finanzas: renderFinanzas,
// //   horarios: renderHorarios,
// // };

// // async function loadTab(tab) {
// //   setActiveTab(tab);
// //   if (modules[tab]) {
// //     contentArea.innerHTML = "<p>Cargando...</p>";
// //     await modules[tab]();
// //   } else {
// //     contentArea.innerHTML = "<p>Módulo no encontrado.</p>";
// //   }
// // }

// // loadTab("reservas");

// // sidebarLinks.forEach(link => {
// //   link.addEventListener("click", e => {
// //     e.preventDefault();
// //     loadTab(link.dataset.tab);
// //   });
// // });
// import { AIRTABLE_API_KEY, BASE_ID } from "./airtableConfig.js";

// const contentArea = document.getElementById("content-area");
// const sidebarLinks = document.querySelectorAll(".sidebar a");

// function setActiveTab(tab) {
//   sidebarLinks.forEach(link => {
//     link.classList.toggle("active", link.dataset.tab === tab);
//   });
// }

// async function fetchAirtable(table) {
//   const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
//   try {
//     const res = await fetch(url, {
//       headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
//     });
//     if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
//     const data = await res.json();
//     return data.records;
//   } catch (error) {
//     console.error("Fetch Airtable error:", error);
//     return null;
//   }
// }

// function formatDate(d) {
//   if (!d) return "";
//   const date = new Date(d);
//   return date.toLocaleDateString();
// }
// async function renderReservas() {
//   const reservas = await fetchAirtable("RESERVAS");
//   if (!reservas) {
//     contentArea.innerHTML = "<p>Error cargando reservas.</p>";
//     return;
//   }

//   let html = `<h1>Reservas</h1>
//   <form id="form-reserva" style="background:#fff; padding:16px; margin-bottom:20px; border-radius:8px; box-shadow:0 0 8px rgba(0,0,0,0.1); display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
//     <input name="Nombre" placeholder="Nombre" required />
//     <input name="FechaReserva" type="date" required />
//     <input name="Hora" placeholder="Hora (ej: 15:30)" required />
//     <input name="Cantidad" type="number" placeholder="Personas" min="1" required />
//     <input name="Comentarios" placeholder="Comentarios" />
//     <button type="submit" style="grid-column: span 2;">Agregar Reserva</button>
//   </form>
//   <table>
//     <thead>
//       <tr>
//         <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Comentarios</th>
//       </tr>
//     </thead><tbody>`;

//   reservas.forEach(r => {
//     const f = r.fields;
//     html += `<tr>
//       <td>${f.Nombre || ''}</td>
//       <td>${formatDate(f["Fecha de la reserva"])}</td>
//       <td>${f.Hora || ''}</td>
//       <td>${f["Cantidad de personas"] || ''}</td>
//       <td>${f.Comentarios || ''}</td>
//     </tr>`;
//   });

//   html += "</tbody></table>";
//   contentArea.innerHTML = html;

//   // formulario
//   document.getElementById("form-reserva").addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const form = e.target;
//     const data = {
//       fields: {
//         "Nombre": form.Nombre.value,
//         "Fecha de la reserva": form.FechaReserva.value,
//         "Hora": form.Hora.value,
//         "Cantidad de personas": parseInt(form.Cantidad.value),
//         "Comentarios": form.Comentarios.value
//       }
//     };

//     try {
//       const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/RESERVAS`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${AIRTABLE_API_KEY}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//       });

//       if (!res.ok) throw new Error("Error al guardar");
//       alert("✅ Reserva guardada");
//       form.reset(); // ← limpia el formulario
//       await renderReservas();
//     } catch (err) {
//       console.error(err);
//       alert("❌ Error al guardar la reserva. Verificá los nombres de campos en Airtable.");
//     }
//   });
// }

// // async function renderReservas() {
// //   const reservas = await fetchAirtable("RESERVAS");
// //   if (!reservas) {
// //     contentArea.innerHTML = "<p>Error cargando reservas.</p>";
// //     return;
// //   }

// //   let html = `<h1>Reservas</h1>
// //   <form id="form-reserva" style="background:#fff; padding:16px; margin-bottom:20px; border-radius:8px; box-shadow:0 0 8px rgba(0,0,0,0.1); display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
// //     <input name="Nombre" placeholder="Nombre" required />
// //     <input name="FechaReserva" type="date" required />
// //     <input name="Hora" placeholder="Hora (ej: 15:30)" required />
// //     <input name="Cantidad" type="number" placeholder="Personas" min="1" required />
// //     <input name="FechaEvento" type="date" required />
// //     <input name="Comentarios" placeholder="Comentarios" />
// //     <button type="submit" style="grid-column: span 2;">Agregar Reserva</button>
// //   </form>
// //   <table>
// //     <thead>
// //       <tr>
// //         <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Fecha Evento</th><th>Comentarios</th>
// //       </tr>
// //     </thead><tbody>`;

// //   reservas.forEach(r => {
// //     const f = r.fields;
// //     html += `<tr>
// //       <td>${f.Nombre || ''}</td>
// //       <td>${formatDate(f["Fecha de la reserva"])}</td>
// //       <td>${f.Hora || ''}</td>
// //       <td>${f["Cantidad de personas"] || ''}</td>
// //       <td>${formatDate(f["Fecha del evento"])}</td>
// //       <td>${f.Comentarios || ''}</td>
// //     </tr>`;
// //   });

// //   html += "</tbody></table>";
// //   contentArea.innerHTML = html;

// //   // formulario
// //   document.getElementById("form-reserva").addEventListener("submit", async (e) => {
// //     e.preventDefault();
// //     const form = e.target;
// //     const data = {
// //       fields: {
// //         "Nombre": form.Nombre.value,
// //         "Fecha de la reserva": form.FechaReserva.value,
// //         "Hora": form.Hora.value,
// //         "Cantidad de personas": parseInt(form.Cantidad.value),
// //         "Fecha del evento": form.FechaEvento.value,
// //         "Comentarios": form.Comentarios.value
// //       }
// //     };

// //     try {
// //       const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/RESERVAS`, {
// //         method: "POST",
// //         headers: {
// //           Authorization: `Bearer ${AIRTABLE_API_KEY}`,
// //           "Content-Type": "application/json"
// //         },
// //         body: JSON.stringify(data)
// //       });

// //       if (!res.ok) throw new Error("Error al guardar");
// //       alert("✅ Reserva guardada");
// //       await renderReservas();
// //     } catch (err) {
// //       console.error(err);
// //       alert("❌ Error al guardar la reserva");
// //     }
// //   });
// // }

// // async function renderClientas() {
// //   const clientas = await fetchAirtable("CLIENTAS");
// //   if (!clientas) {
// //     contentArea.innerHTML = "<p>Error cargando clientas.</p>";
// //     return;
// //   }

//   let html = `<h1>Clientas</h1>
//   <table>
//     <thead>
//       <tr><th>Nombre</th><th>Celular</th><th>Mail</th><th>Reservas</th><th>Última Reserva</th></tr>
//     </thead><tbody>`;

//   clientas.forEach(c => {
//     const f = c.fields;
//     html += `<tr>
//       <td>${f.Nombre || ''}</td>
//       <td>${f.Celular || ''}</td>
//       <td>${f.Mail || ''}</td>
//       <td>${f["Historial de reservas"] || ''}</td>
//       <td>${formatDate(f["Última reserva"])}</td>
//     </tr>`;
//   });

//   html += "</tbody></table>";
//   contentArea.innerHTML = html;
// }

// async function renderVestidos() {
//   const vestidos = await fetchAirtable("VESTIDOS");
//   if (!vestidos) {
//     contentArea.innerHTML = "<p>Error cargando vestidos.</p>";
//     return;
//   }

//   let html = `<h1>Vestidos</h1>
//   <table>
//     <thead>
//       <tr><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th><th>Veces alquilado</th></tr>
//     </thead><tbody>`;

//   vestidos.forEach(v => {
//     const f = v.fields;
//     html += `<tr>
//       <td>${f.Nombre || ''}</td>
//       <td>${f.Talle || ''}</td>
//       <td>${f.Color || ''}</td>
//       <td>${f.Estado || ''}</td>
//       <td>${f["Veces alquilado"] || 0}</td>
//     </tr>`;
//   });

//   html += "</tbody></table>";
//   contentArea.innerHTML = html;
// }

// async function renderChecklist() {
//   const checklist = await fetchAirtable("CHECKLIST");
//   if (!checklist) {
//     contentArea.innerHTML = "<p>Error cargando checklist.</p>";
//     return;
//   }

//   let html = `<h1>Checklist (Fin de Semana)</h1>
//   <table>
//     <thead>
//       <tr><th>Día</th><th>Vestido - Clienta</th><th>Pagó</th><th>Devuelto</th></tr>
//     </thead><tbody>`;

//   checklist.forEach(c => {
//     const f = c.fields;
//     html += `<tr>
//       <td>${formatDate(f.Día)}</td>
//       <td>${f["Vestidos a preparar"] || ''}</td>
//       <td>${f.Pagó || ''}</td>
//       <td>${f.Devuelto || ''}</td>
//     </tr>`;
//   });

//   html += "</tbody></table>";
//   contentArea.innerHTML = html;
// }

// async function renderFinanzas() {
//   const finanzas = await fetchAirtable("FINANZAS");
//   if (!finanzas) {
//     contentArea.innerHTML = "<p>Error cargando finanzas.</p>";
//     return;
//   }

//   let html = `<h1>Finanzas</h1>
//   <table>
//     <thead>
//       <tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Observaciones</th><th>Saldo</th></tr>
//     </thead><tbody>`;

//   finanzas.forEach(f => {
//     const d = f.fields;
//     html += `<tr>
//       <td>${formatDate(d.Fecha)}</td>
//       <td>${d.Tipo || ''}</td>
//       <td>${d.Monto || ''}</td>
//       <td>${d.Motivo || ''}</td>
//       <td>${d.Observaciones || ''}</td>
//       <td>${d["Saldo acumulado"] || ''}</td>
//     </tr>`;
//   });

//   html += "</tbody></table>";
//   contentArea.innerHTML = html;
// }

// async function renderHorarios() {
//   const horarios = await fetchAirtable("HORARIOS DISPONIBLES");
//   if (!horarios) {
//     contentArea.innerHTML = "<p>Error cargando horarios disponibles.</p>";
//     return;
//   }

//   let html = `<h1>Horarios Disponibles</h1>`;
//   horarios.forEach(h => {
//     const f = h.fields;
//     html += `<h3>${formatDate(f.Fecha)}</h3><ul>`;
//     for (const key in f) {
//       if (key !== "Fecha" && f.hasOwnProperty(key)) {
//         const estado = f[key] === true || f[key] === "✅" ? "✅ Disponible" : "❌ Ocupado";
//         html += `<li>${key}: ${estado}</li>`;
//       }
//     }
//     html += `</ul>`;
//   });

//   contentArea.innerHTML = html;
// }

// const modules = {
//   reservas: renderReservas,
//   clientas: renderClientas,
//   vestidos: renderVestidos,
//   checklist: renderChecklist,
//   finanzas: renderFinanzas,
//   horarios: renderHorarios,
// };

// async function loadTab(tab) {
//   setActiveTab(tab);
//   if (modules[tab]) {
//     contentArea.innerHTML = "<p>Cargando...</p>";
//     await modules[tab]();
//   } else {
//     contentArea.innerHTML = "<p>Módulo no encontrado.</p>";
//   }
// }

// loadTab("reservas");

// sidebarLinks.forEach(link => {
//   link.addEventListener("click", e => {
//     e.preventDefault();
//     loadTab(link.dataset.tab);
//   });
// });
