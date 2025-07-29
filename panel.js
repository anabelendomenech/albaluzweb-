import { AIRTABLE_API_KEY, BASE_ID } from "./airtableConfig.js";

const content = document.querySelector("main");

// -------- UTILIDADES ---------
function formatDateISO(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}
function formatDateLocal(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString();
}

// -------- AIRTABLE FETCHES ---------
async function airtableFetch(table, filterFormula = "") {
  let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?pageSize=100`;
  if (filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
  });
  if (!res.ok) throw new Error(`Error al cargar ${table}: ${res.statusText}`);
  const data = await res.json();
  return data.records;
}
async function airtableCreate(table, fields) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Error al crear en ${table}: ${JSON.stringify(err)}`);
  }
  return await res.json();
}
async function airtableUpdate(table, id, fields) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Error al actualizar en ${table}: ${JSON.stringify(err)}`);
  }
  return await res.json();
}

// -------- RESERVAS ---------
const formReserva = document.getElementById("form-reserva");
const tablaReservasBody = document.querySelector("#tabla-reservas tbody");
const msgReserva = document.getElementById("msg-reserva");

async function cargarReservas() {
  try {
    const reservas = await airtableFetch("RESERVAS");
    tablaReservasBody.innerHTML = "";
    reservas.sort((a,b)=> new Date(a.fields["Fecha de la reserva"]) - new Date(b.fields["Fecha de la reserva"]));
    reservas.forEach(r => {
      const f = r.fields;
      tablaReservasBody.innerHTML += `
        <tr>
          <td>${f.Nombre||""}</td>
          <td>${formatDateLocal(f["Fecha de la reserva"])}</td>
          <td>${f.Hora||""}</td>
          <td>${f["Cantidad de personas"]||""}</td>
          <td>${f.Comentarios||""}</td>
        </tr>`;
    });
  } catch(e) {
    console.error(e);
    msgReserva.textContent = "Error al cargar reservas.";
    msgReserva.className = "msg error";
  }
}

formReserva.addEventListener("submit", async e => {
  e.preventDefault();
  msgReserva.textContent = "";
  const data = {
    Nombre: formReserva["Nombre"].value.trim(),
    "Fecha de la reserva": formReserva["Fecha de la reserva"].value,
    Hora: formReserva["Hora"].value,
    "Cantidad de personas": parseInt(formReserva["Cantidad de personas"].value),
    Comentarios: formReserva["Comentarios"].value.trim()
  };
  if (!data.Nombre || !data["Fecha de la reserva"] || !data.Hora || !data["Cantidad de personas"]) {
    msgReserva.textContent = "Completa todos los campos obligatorios.";
    msgReserva.className = "msg error";
    return;
  }
  try {
    await airtableCreate("RESERVAS", data);
    msgReserva.textContent = "✅ Reserva guardada con éxito.";
    msgReserva.className = "msg success";
    formReserva.reset();
    cargarReservas();
  } catch(err) {
    console.error(err);
    msgReserva.textContent = "Error al guardar reserva.";
    msgReserva.className = "msg error";
  }
});

// -------- CLIENTAS ---------
let clientasGlobal = [];
const alquilerClientaSelect = document.getElementById("alquiler-clienta-existente");
const clienteNuevoFields = document.getElementById("cliente-nuevo-fields");

async function cargarClientas() {
  try {
    const clientas = await airtableFetch("CLIENTAS");
    clientasGlobal = clientas;
    alquilerClientaSelect.innerHTML = '<option value="">-- Selecciona una clienta --</option>';
    clientas.forEach(c => {
      const f = c.fields;
      alquilerClientaSelect.innerHTML += `<option value="${c.id}">${f.Nombre}</option>`;
    });
  } catch(e) {
    console.error(e);
  }
}

alquilerClientaSelect.addEventListener("change", () => {
  if (alquilerClientaSelect.value === "") {
    clienteNuevoFields.classList.remove("hidden");
  } else {
    clienteNuevoFields.classList.add("hidden");
  }
});

// -------- VESTIDOS ---------
let vestidosGlobal = [];
const alquilerVestidoSelect = document.getElementById("alquiler-vestido");
const tablaVestidosBody = document.querySelector("#tabla-vestidos tbody");
const formVestido = document.getElementById("form-vestido");
const msgVestido = document.getElementById("msg-vestido");

async function cargarVestidos() {
  try {
    const vestidos = await airtableFetch("VESTIDOS");
    vestidosGlobal = vestidos;
    alquilerVestidoSelect.innerHTML = '<option value="">-- Selecciona un vestido --</option>';
    tablaVestidosBody.innerHTML = "";
    vestidos.forEach(v => {
      const f = v.fields;
      alquilerVestidoSelect.innerHTML += `<option value="${v.id}">${f.Nombre} (${f.Talle})</option>`;
      let imgHtml = f.Imagen && f.Imagen.length ? `<img class="img-thumb" src="${f.Imagen[0].url}" alt="${f.Nombre}">` : "";
      tablaVestidosBody.innerHTML += `
        <tr>
          <td>${imgHtml}</td>
          <td>${f.Nombre || ""}</td>
          <td>${f.Talle || ""}</td>
          <td>${f.Color || ""}</td>
          <td>${f.Estado || ""}</td>
        </tr>`;
    });
  } catch(e) {
    console.error(e);
    msgVestido.textContent = "Error al cargar vestidos.";
    msgVestido.className = "msg error";
  }
}

formVestido.addEventListener("submit", async e => {
  e.preventDefault();
  msgVestido.textContent = "";

  const nombre = formVestido["Nombre"].value.trim();
  const talle = formVestido["Talle"].value.trim();
  const color = formVestido["Color"].value.trim();
  const estado = formVestido["Estado"].value;

  if (!nombre || !talle || !color || !estado) {
    msgVestido.textContent = "Completa todos los campos obligatorios.";
    msgVestido.className = "msg error";
    return;
  }

  // Subir imagen a Airtable attachments
  let imagenFiles = formVestido["Imagen"].files;
  let attachments = [];

  if (imagenFiles.length > 0) {
    // Airtable no permite subir directamente archivos desde el navegador a través de la API pública
    // Por eso se necesita subir la imagen a un hosting público y luego pasar la URL a Airtable
    // Aquí se usa https://api.imgbb.com o similares para subir la imagen, o se puede implementar otro hosting.
    // Como ejemplo simple y rápido (y para no complicar) voy a rechazar subir imagen (te aviso)
    msgVestido.textContent = "⚠️ Subida de imagen no está implementada automáticamente. Sube la imagen manualmente en Airtable por ahora.";
    msgVestido.className = "msg error";
    return;
  }

  // Armar campos
  const fields = {
    Nombre: nombre,
    Talle: talle,
    Color: color,
    Estado: estado,
  };
  if (attachments.length) fields.Imagen = attachments;

  try {
    await airtableCreate("VESTIDOS", fields);
    msgVestido.textContent = "✅ Vestido guardado con éxito.";
    msgVestido.className = "msg success";
    formVestido.reset();
    cargarVestidos();
  } catch(err) {
    console.error(err);
    msgVestido.textContent = "Error al guardar vestido.";
    msgVestido.className = "msg error";
  }
});

// -------- ALQUILERES ---------
const formAlquiler = document.getElementById("form-alquiler");
const tablaAlquileresBody = document.querySelector("#tabla-alquileres tbody");
const msgAlquiler = document.getElementById("msg-alquiler");

async function cargarAlquileres() {
  try {
    const alquileres = await airtableFetch("ALQUILERES");
    tablaAlquileresBody.innerHTML = "";
    alquileres.sort((a,b) => {
      let fa = a.fields["Fecha del evento"] || "";
      let fb = b.fields["Fecha del evento"] || "";
      return new Date(fa) - new Date(fb);
    });
    for (const a of alquileres) {
      const f = a.fields;
      let clientaNombre = "";
      if (f.ClientaId && clientasGlobal.length) {
        const c = clientasGlobal.find(c=>c.id === f.ClientaId[0]);
        if(c) clientaNombre = c.fields.Nombre;
      }
      let vestidoNombre = "";
      if (f.VestidoId && vestidosGlobal.length) {
        const v = vestidosGlobal.find(v=>v.id === f.VestidoId[0]);
        if(v) vestidoNombre = v.fields.Nombre;
      }
      tablaAlquileresBody.innerHTML += `
        <tr>
          <td>${clientaNombre}</td>
          <td>${vestidoNombre}</td>
          <td>${formatDateLocal(f["Fecha del evento"])}</td>
          <td>${f.Pagó || ""}</td>
          <td>${f.Devuelto || ""}</td>
        </tr>
      `;
    }
  } catch(e) {
    console.error(e);
    msgAlquiler.textContent = "Error al cargar alquileres.";
    msgAlquiler.className = "msg error";
  }
}

formAlquiler.addEventListener("submit", async e => {
  e.preventDefault();
  msgAlquiler.textContent = "";

  try {
    let clientaId = alquilerClientaSelect.value;
    // Si no existe clienta, crear una nueva
    if (!clientaId) {
      // validar campos nuevo cliente
      const nombre = document.getElementById("cliente-nuevo-nombre").value.trim();
      const celular = document.getElementById("cliente-nuevo-celular").value.trim();
      const mail = document.getElementById("cliente-nuevo-mail").value.trim();
      const cumple = document.getElementById("cliente-nuevo-cumple").value;
      if (!nombre || !celular || !mail || !cumple) {
        msgAlquiler.textContent = "Completa todos los datos de la nueva clienta.";
        msgAlquiler.className = "msg error";
        return;
      }
      // Crear clienta
      const nuevaClienta = await airtableCreate("CLIENTAS", {
        Nombre: nombre,
        Celular: celular,
        Mail: mail,
        Cumpleaños: cumple
      });
      clientaId = nuevaClienta.id;
      cargarClientas(); // actualizar select
    }

    const vestidoId = alquilerVestidoSelect.value;
    const fechaEvento = formAlquiler["Fecha del evento"].value;
    const pago = formAlquiler["Pagó"].value;
    const devuelto = formAlquiler["Devuelto"].value;

    if (!vestidoId || !fechaEvento || !pago || !devuelto) {
      msgAlquiler.textContent = "Completa todos los campos obligatorios.";
      msgAlquiler.className = "msg error";
      return;
    }

    // Crear alquiler
    await airtableCreate("ALQUILERES", {
      ClientaId: [clientaId],
      VestidoId: [vestidoId],
      "Fecha del evento": fechaEvento,
      Pagó: pago,
      Devuelto: devuelto
    });

    msgAlquiler.textContent = "✅ Alquiler registrado con éxito.";
    msgAlquiler.className = "msg success";
    formAlquiler.reset();
    clienteNuevoFields.classList.remove("hidden");
    cargarAlquileres();

  } catch(err) {
    console.error(err);
    msgAlquiler.textContent = "Error al guardar alquiler.";
    msgAlquiler.className = "msg error";
  }
});

// -------- CHECKLIST ---------

const tablaChecklistBody = document.querySelector("#tabla-checklist tbody");

async function generarChecklist() {
  try {
    // Cargar alquileres con clientas y vestidos
    const alquileres = await airtableFetch("ALQUILERES");
    // Solo fines de semana (sábado y domingo)
    const checklistItems = [];

    for (const a of alquileres) {
      const f = a.fields;
      if (!f["Fecha del evento"]) continue;
      const fechaEvento = new Date(f["Fecha del evento"]);
      const diaSemana = fechaEvento.getDay(); // 6=Sab, 0=Dom
      if (diaSemana !== 6 && diaSemana !== 0) continue;

      // Clienta y vestido
      let clientaNombre = "";
      if (f.ClientaId && clientasGlobal.length) {
        const c = clientasGlobal.find(c=>c.id === f.ClientaId[0]);
        if(c) clientaNombre = c.fields.Nombre;
      }
      let vestidoNombre = "";
      if (f.VestidoId && vestidosGlobal.length) {
        const v = vestidosGlobal.find(v=>v.id === f.VestidoId[0]);
        if(v) vestidoNombre = v.fields.Nombre;
      }

      checklistItems.push({
        fecha: formatDateLocal(f["Fecha del evento"]),
        clienta: clientaNombre,
        vestido: vestidoNombre,
        pago: f.Pagó || "",
        devuelto: f.Devuelto || ""
      });
    }

    tablaChecklistBody.innerHTML = "";
    checklistItems.forEach(item => {
      tablaChecklistBody.innerHTML += `
      <tr>
        <td>${item.fecha}</td>
        <td>${item.clienta}</td>
        <td>${item.vestido}</td>
        <td>${item.pago}</td>
        <td>${item.devuelto}</td>
      </tr>`;
    });
  } catch(e) {
    console.error(e);
    tablaChecklistBody.innerHTML = `<tr><td colspan="5">Error al generar checklist.</td></tr>`;
  }
}

// -------- HORARIOS DISPONIBLES ---------

const calendarEl = document.getElementById("calendar");
const agendaDiaEl = document.getElementById("agenda-dia");

let horariosDisponiblesGlobal = [];
let horariosFechaSeleccionada = null;

async function cargarHorarios() {
  try {
    horariosDisponiblesGlobal = await airtableFetch("HORARIOS DISPONIBLES");
    dibujarCalendario();
  } catch(e) {
    console.error(e);
    calendarEl.innerHTML = "Error al cargar horarios.";
  }
}

function dibujarCalendario() {
  // Calendario simple mes actual, días con horarios disponibles
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  let primerDiaMes = new Date(year, month, 1);
  let ultimoDiaMes = new Date(year, month + 1, 0);
  let diaSemanaPrimerDia = primerDiaMes.getDay();
  diaSemanaPrimerDia = diaSemanaPrimerDia === 0 ? 7 : diaSemanaPrimerDia; // domingo=7

  let html = `<table><thead><tr><th>Lun</th><th>Mar</th><th>Mié</th><th>Jue</th><th>Vie</th><th>Sáb</th><th>Dom</th></tr></thead><tbody><tr>`;

  // Rellenar celdas vacías previas
  for (let i=1; i<diaSemanaPrimerDia; i++) {
    html += `<td></td>`;
  }

  const diasMes = ultimoDiaMes.getDate();

  for(let dia=1; dia<=diasMes; dia++) {
    const currentDate = new Date(year, month, dia);
    const currentDateStr = formatDateISO(currentDate);

    // Ver si existe horario para este día
    const diaHorario = horariosDisponiblesGlobal.find(h => h.fields.Fecha === currentDateStr);
    const clases = [];
    if (currentDateStr === formatDateISO(new Date())) clases.push("selected");

    html += `<td data-fecha="${currentDateStr}" class="${clases.join(" ")}">${dia}</td>`;

    if ((dia + diaSemanaPrimerDia - 1) % 7 === 0 && dia !== diasMes) {
      html += "</tr><tr>";
    }
  }

  // Rellenar celdas vacías finales
  let celdasUltimaFila = (diasMes + diaSemanaPrimerDia - 1) % 7;
  if(celdasUltimaFila !== 0) {
    for(let i = celdasUltimaFila; i<7; i++) {
      html += `<td></td>`;
    }
  }
  html += "</tr></tbody></table>";

  calendarEl.innerHTML = html;

  // Eventos click
  calendarEl.querySelectorAll("td[data-fecha]").forEach(td => {
    td.addEventListener("click", () => {
      seleccionarFecha(td.dataset.fecha);
    });
  });
}

async function seleccionarFecha(fechaStr) {
  horariosFechaSeleccionada = fechaStr;
  // marcar en calendario
  calendarEl.querySelectorAll("td.selected").forEach(td => td.classList.remove("selected"));
  const td = calendarEl.querySelector(`td[data-fecha="${fechaStr}"]`);
  if (td) td.classList.add("selected");

  // Mostrar agenda del día
  mostrarAgendaDia(fechaStr);
}

function mostrarAgendaDia(fechaStr) {
  if (!horariosDisponiblesGlobal.length) {
    agendaDiaEl.innerHTML = "No hay horarios cargados.";
    return;
  }
  const diaHorario = horariosDisponiblesGlobal.find(h => h.fields.Fecha === fechaStr);
  let horariosDia = {};
  if (diaHorario) {
    horariosDia = {...diaHorario.fields};
    delete horariosDia.Fecha;
  }

  // Generar bloques de 15:00 a 19:30 en media hora
  let bloques = [];
  for (let h = 15; h <= 19; h++) {
    bloques.push(`${h}:00`);
    bloques.push(`${h}:30`);
  }
  bloques.pop(); // Quitar 19:30 (19:30 no era horario para elegir?)

  let html = `<h4>Agenda para ${formatDateLocal(fechaStr)}</h4>`;
  html += `<form id="form-agenda-dia">`;

  bloques.forEach(bloque => {
    const estado = horariosDia[bloque] === true || horariosDia[bloque] === "✅" ? true : false;
    html += `<div class="horario-item">
      <span>${bloque}</span>
      <select name="${bloque}">
        <option value="Disponible" ${estado ? "selected" : ""}>Disponible</option>
        <option value="No disponible" ${!estado ? "selected" : ""}>No disponible</option>
      </select>
    </div>`;
  });
  html += `<button type="submit">Guardar horarios</button></form><div id="msg-horarios"></div>`;
  agendaDiaEl.innerHTML = html;

  document.getElementById("form-agenda-dia").addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fieldsToUpdate = {};
    for (let [key,value] of formData.entries()) {
      fieldsToUpdate[key] = value === "Disponible" ? "✅" : "";
    }

    // Buscar el registro para la fecha
    const registro = horariosDisponiblesGlobal.find(h => h.fields.Fecha === fechaStr);
    if (!registro) {
      alert("No se encontró registro para esta fecha en Airtable.");
      return;
    }
    try {
      await airtableUpdate("HORARIOS DISPONIBLES", registro.id, fieldsToUpdate);
      document.getElementById("msg-horarios").textContent = "✅ Horarios actualizados.";
      cargarHorarios();
    } catch(err) {
      console.error(err);
      document.getElementById("msg-horarios").textContent = "Error al actualizar horarios.";
    }
  });
}

// -------- INICIAL ---------
async function inicializar() {
  await cargarClientas();
  await cargarVestidos();
  await cargarReservas();
  await cargarAlquileres();
  await generarChecklist();
  await cargarHorarios();
  seleccionarFecha(formatDateISO(new Date()));
}

inicializar();
// // 🔐 CONFIGURACIÓN
// import { AIRTABLE_API_KEY, BASE_ID } from "./airtableConfig.js";

// const contentArea = document.getElementById("content-area");
// const sidebarLinks = document.querySelectorAll(".sidebar a");

// function setActiveTab(tab) {
//   sidebarLinks.forEach(link => link.classList.toggle("active", link.dataset.tab === tab));
// }

// async function fetchAirtable(table) {
//   const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
//   try {
//     const res = await fetch(url, {
//       headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
//     });
//     if (!res.ok) throw new Error(`Error ${res.status}`);
//     return (await res.json()).records;
//   } catch (e) {
//     console.error(e);
//     return null;
//   }
// }

// function formatDate(d) {
//   return d ? new Date(d).toLocaleDateString() : "";
// }

// function renderForm(fields, id, buttonText, onSubmit) {
//   const inputs = fields.map(f => `<input name="${f.name}" type="${f.type || 'text'}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} />`).join("\n");
//   return `<form id="${id}" style="background:#fff;padding:16px;margin-bottom:20px;border-radius:8px;box-shadow:0 0 8px rgba(0,0,0,0.1);display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">
//     ${inputs}
//     <button type="submit" style="grid-column: span 2;">${buttonText}</button>
//   </form>`;
// }

// // --- RESERVAS ---
// async function renderReservas() {
//   const reservas = await fetchAirtable("RESERVAS");
//   if (!reservas) return contentArea.innerHTML = "<p>Error cargando reservas.</p>";

//   let html = `<h1>Reservas</h1>`;
//   html += renderForm([
//     { name: "Nombre", placeholder: "Nombre", required: true },
//     { name: "Evento", placeholder: "Evento", required: true },
//     { name: "Cita", placeholder: "Fecha cita", type: "date", required: true },
//     { name: "Horario", placeholder: "Horario", required: true },
//     { name: "Personas", placeholder: "Personas", type: "number", required: true },
//     { name: "Mensaje", placeholder: "Mensaje" }
//   ], "form-reserva", "Agregar Reserva");

//   html += `<table><thead><tr><th>Nombre</th><th>Evento</th><th>Cita</th><th>Horario</th><th>Personas</th><th>Mensaje</th></tr></thead><tbody>`;
//   reservas.forEach(r => {
//     const f = r.fields;
//     html += `<tr><td>${f.Nombre || ''}</td><td>${f.Evento || ''}</td><td>${formatDate(f.Cita)}</td><td>${f.Horario || ''}</td><td>${f.Personas || ''}</td><td>${f.Mensaje || ''}</td></tr>`;
//   });
//   html += `</tbody></table>`;
//   contentArea.innerHTML = html;

//   document.getElementById("form-reserva").addEventListener("submit", async e => {
//     e.preventDefault();
//     const f = e.target;
//     const data = {
//       fields: {
//         Nombre: f.Nombre.value,
//         Evento: f.Evento.value,
//         Cita: f.Cita.value,
//         Horario: f.Horario.value,
//         Personas: parseInt(f.Personas.value),
//         Mensaje: f.Mensaje.value
//       }
//     };
//     try {
//       await fetch(`https://api.airtable.com/v0/${BASE_ID}/RESERVAS`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${AIRTABLE_API_KEY}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//       });
//       f.reset();
//       renderReservas();
//     } catch (err) {
//       alert("Error al guardar reserva");
//     }
//   });
// }

// // --- CLIENTAS ---
// async function renderClientas() {
//   const clientas = await fetchAirtable("CLIENTAS");
//   if (!clientas) return contentArea.innerHTML = "<p>Error cargando clientas.</p>";

//   let html = `<h1>Clientas</h1>`;
//   html += renderForm([
//     { name: "Nombre", placeholder: "Nombre", required: true },
//     { name: "Celular", placeholder: "Celular", required: true },
//     { name: "Mail", placeholder: "Mail", type: "email", required: true }
//   ], "form-clienta", "Agregar Clienta");

//   html += `<table><thead><tr><th>Nombre</th><th>Celular</th><th>Mail</th><th>Última Reserva</th></tr></thead><tbody>`;
//   clientas.forEach(c => {
//     const f = c.fields;
//     html += `<tr><td>${f.Nombre || ''}</td><td>${f.Celular || ''}</td><td>${f.Mail || ''}</td><td>${formatDate(f["Última reserva"])}</td></tr>`;
//   });
//   html += `</tbody></table>`;
//   contentArea.innerHTML = html;

//   document.getElementById("form-clienta").addEventListener("submit", async e => {
//     e.preventDefault();
//     const f = e.target;
//     const data = { fields: { Nombre: f.Nombre.value, Celular: f.Celular.value, Mail: f.Mail.value } };
//     try {
//       await fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${AIRTABLE_API_KEY}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//       });
//       f.reset();
//       renderClientas();
//     } catch (err) {
//       alert("Error al guardar clienta");
//     }
//   });
// }

// // --- VESTIDOS ---
// async function renderVestidos() {
//   const vestidos = await fetchAirtable("VESTIDOS");
//   if (!vestidos) return contentArea.innerHTML = "<p>Error cargando vestidos.</p>";

//   let html = `<h1>Vestidos</h1>`;
//   html += renderForm([
//     { name: "Nombre", placeholder: "Nombre", required: true },
//     { name: "Talle", placeholder: "Talle", required: true },
//     { name: "Color", placeholder: "Color", required: true },
//     { name: "Estado", placeholder: "Estado (ej: Disponible)", required: true }
//   ], "form-vestido", "Agregar Vestido");

//   html += `<table><thead><tr><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th><th>Veces alquilado</th></tr></thead><tbody>`;
//   vestidos.forEach(v => {
//     const f = v.fields;
//     html += `<tr><td>${f.Nombre || ''}</td><td>${f.Talle || ''}</td><td>${f.Color || ''}</td><td>${f.Estado || ''}</td><td>${f["Veces alquilado"] || 0}</td></tr>`;
//   });
//   html += `</tbody></table>`;
//   contentArea.innerHTML = html;

//   document.getElementById("form-vestido").addEventListener("submit", async e => {
//     e.preventDefault();
//     const f = e.target;
//     const data = { fields: { Nombre: f.Nombre.value, Talle: f.Talle.value, Color: f.Color.value, Estado: f.Estado.value } };
//     try {
//       await fetch(`https://api.airtable.com/v0/${BASE_ID}/VESTIDOS`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
//         body: JSON.stringify(data)
//       });
//       f.reset();
//       renderVestidos();
//     } catch (err) {
//       alert("Error al guardar vestido");
//     }
//   });
// }

// // --- CHECKLIST ---
// async function renderChecklist() {
//   const checklist = await fetchAirtable("CHECKLIST");
//   if (!checklist) return contentArea.innerHTML = "<p>Error cargando checklist.</p>";

//   let html = `<h1>Checklist</h1>`;
//   html += renderForm([
//     { name: "Día", placeholder: "Fecha", type: "date", required: true },
//     { name: "Vestidos", placeholder: "Vestidos a preparar", required: true },
//     { name: "Pagó", placeholder: "Pagó", required: true },
//     { name: "Devuelto", placeholder: "Devuelto", required: true }
//   ], "form-checklist", "Agregar Item");

//   html += `<table><thead><tr><th>Día</th><th>Vestido - Clienta</th><th>Pagó</th><th>Devuelto</th></tr></thead><tbody>`;
//   checklist.forEach(c => {
//     const f = c.fields;
//     html += `<tr><td>${formatDate(f.Día)}</td><td>${f["Vestidos a preparar"] || ''}</td><td>${f.Pagó || ''}</td><td>${f.Devuelto || ''}</td></tr>`;
//   });
//   html += `</tbody></table>`;
//   contentArea.innerHTML = html;

//   document.getElementById("form-checklist").addEventListener("submit", async e => {
//     e.preventDefault();
//     const f = e.target;
//     const data = { fields: { Día: f.Día.value, "Vestidos a preparar": f.Vestidos.value, Pagó: f.Pagó.value, Devuelto: f.Devuelto.value } };
//     try {
//       await fetch(`https://api.airtable.com/v0/${BASE_ID}/CHECKLIST`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
//         body: JSON.stringify(data)
//       });
//       f.reset();
//       renderChecklist();
//     } catch (err) {
//       alert("Error al guardar checklist");
//     }
//   });
// }

// // --- FINANZAS ---
// async function renderFinanzas() {
//   const finanzas = await fetchAirtable("FINANZAS");
//   if (!finanzas) return contentArea.innerHTML = "<p>Error cargando finanzas.</p>";

//   let html = `<h1>Finanzas</h1>`;
//   html += renderForm([
//     { name: "Fecha", placeholder: "Fecha", type: "date", required: true },
//     { name: "Tipo", placeholder: "Ingreso/Egreso", required: true },
//     { name: "Monto", placeholder: "Monto", type: "number", required: true },
//     { name: "Motivo", placeholder: "Motivo", required: true },
//     { name: "Observaciones", placeholder: "Observaciones" },
//     { name: "Saldo", placeholder: "Saldo acumulado" }
//   ], "form-finanzas", "Agregar Movimiento");

//   html += `<table><thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Observaciones</th><th>Saldo</th></tr></thead><tbody>`;
//   finanzas.forEach(f => {
//     const d = f.fields;
//     html += `<tr><td>${formatDate(d.Fecha)}</td><td>${d.Tipo || ''}</td><td>${d.Monto || ''}</td><td>${d.Motivo || ''}</td><td>${d.Observaciones || ''}</td><td>${d["Saldo acumulado"] || ''}</td></tr>`;
//   });
//   html += `</tbody></table>`;
//   contentArea.innerHTML = html;

//   document.getElementById("form-finanzas").addEventListener("submit", async e => {
//     e.preventDefault();
//     const f = e.target;
//     const data = { fields: { Fecha: f.Fecha.value, Tipo: f.Tipo.value, Monto: parseFloat(f.Monto.value), Motivo: f.Motivo.value, Observaciones: f.Observaciones.value, "Saldo acumulado": f.Saldo.value } };
//     try {
//       await fetch(`https://api.airtable.com/v0/${BASE_ID}/FINANZAS`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
//         body: JSON.stringify(data)
//       });
//       f.reset();
//       renderFinanzas();
//     } catch (err) {
//       alert("Error al guardar finanza");
//     }
//   });
// }

// // --- HORARIOS DISPONIBLES ---
// async function renderHorarios() {
//   const horarios = await fetchAirtable("HORARIOS DISPONIBLES");
//   if (!horarios) return contentArea.innerHTML = "<p>Error cargando horarios disponibles.</p>";

//   let html = `<h1>Horarios Disponibles</h1>`;
//   horarios.forEach(h => {
//     const f = h.fields;
//     html += `<h3>${formatDate(f.Fecha)}</h3><ul>`;
//     Object.entries(f).forEach(([k, v]) => {
//       if (k !== "Fecha") {
//         html += `<li>${k}: ${v === true || v === "✅" ? '✅' : '❌'}</li>`;
//       }
//     });
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
//   horarios: renderHorarios
// };

// async function loadTab(tab) {
//   setActiveTab(tab);
//   contentArea.innerHTML = "<p>Cargando...</p>";
//   await modules[tab]();
// }

// sidebarLinks.forEach(link => {
//   link.addEventListener("click", e => {
//     e.preventDefault();
//     loadTab(link.dataset.tab);
//   });
// });

// loadTab("reservas");
// // // import { AIRTABLE_API_KEY, BASE_ID } from "./airtableConfig.js";

// // // const contentArea = document.getElementById("content-area");
// // // const sidebarLinks = document.querySelectorAll(".sidebar a");

// // // function setActiveTab(tab) {
// // //   sidebarLinks.forEach(link => {
// // //     link.classList.toggle("active", link.dataset.tab === tab);
// // //   });
// // // }

// // // async function fetchAirtable(table) {
// // //   const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
// // //   try {
// // //     const res = await fetch(url, {
// // //       headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
// // //     });
// // //     if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
// // //     const data = await res.json();
// // //     return data.records;
// // //   } catch (error) {
// // //     console.error("Fetch Airtable error:", error);
// // //     console.log("Base ID:", BASE_ID);
// // //     console.log("API KEY:", AIRTABLE_API_KEY);
// // //     return null;
// // //   }
// // // }

// // // function formatDate(d) {
// // //   if (!d) return "";
// // //   const date = new Date(d);
// // //   return date.toLocaleDateString();
// // // }

// // // async function renderReservas() {
// // //   const reservas = await fetchAirtable("RESERVAS");
// // //   if (!reservas) {
// // //     contentArea.innerHTML = "<p>Error cargando reservas.</p>";
// // //     return;
// // //   }

// // //   let html = `<h1>Reservas</h1>
// // //   <table>
// // //     <thead>
// // //       <tr>
// // //         <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Fecha Evento</th><th>Comentarios</th>
// // //       </tr>
// // //     </thead><tbody>`;

// // //   reservas.forEach(r => {
// // //     const f = r.fields;
// // //     html += `<tr>
// // //       <td>${f.Nombre || ''}</td>
// // //       <td>${formatDate(f["Fecha de la reserva"])}</td>
// // //       <td>${f.Hora || ''}</td>
// // //       <td>${f["Cantidad de personas"] || ''}</td>
// // //       <td>${formatDate(f["Fecha del evento"])}</td>
// // //       <td>${f.Comentarios || ''}</td>
// // //     </tr>`;
// // //   });

// // //   html += "</tbody></table>";
// // //   contentArea.innerHTML = html;
// // // }

// // // async function renderClientas() {
// // //   const clientas = await fetchAirtable("CLIENTAS");
// // //   if (!clientas) {
// // //     contentArea.innerHTML = "<p>Error cargando clientas.</p>";
// // //     return;
// // //   }

// // //   let html = `<h1>Clientas</h1>
// // //   <table>
// // //     <thead>
// // //       <tr><th>Nombre</th><th>Celular</th><th>Mail</th><th>Reservas</th><th>Última Reserva</th></tr>
// // //     </thead><tbody>`;

// // //   clientas.forEach(c => {
// // //     const f = c.fields;
// // //     html += `<tr>
// // //       <td>${f.Nombre || ''}</td>
// // //       <td>${f.Celular || ''}</td>
// // //       <td>${f.Mail || ''}</td>
// // //       <td>${f["Historial de reservas"] || ''}</td>
// // //       <td>${formatDate(f["Última reserva"])}</td>
// // //     </tr>`;
// // //   });

// // //   html += "</tbody></table>";
// // //   contentArea.innerHTML = html;
// // // }

// // // async function renderVestidos() {
// // //   const vestidos = await fetchAirtable("VESTIDOS");
// // //   if (!vestidos) {
// // //     contentArea.innerHTML = "<p>Error cargando vestidos.</p>";
// // //     return;
// // //   }

// // //   let html = `<h1>Vestidos</h1>
// // //   <table>
// // //     <thead>
// // //       <tr><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th><th>Veces alquilado</th></tr>
// // //     </thead><tbody>`;

// // //   vestidos.forEach(v => {
// // //     const f = v.fields;
// // //     html += `<tr>
// // //       <td>${f.Nombre || ''}</td>
// // //       <td>${f.Talle || ''}</td>
// // //       <td>${f.Color || ''}</td>
// // //       <td>${f.Estado || ''}</td>
// // //       <td>${f["Veces alquilado"] || 0}</td>
// // //     </tr>`;
// // //   });

// // //   html += "</tbody></table>";
// // //   contentArea.innerHTML = html;
// // // }

// // // async function renderChecklist() {
// // //   const checklist = await fetchAirtable("CHECKLIST");
// // //   if (!checklist) {
// // //     contentArea.innerHTML = "<p>Error cargando checklist.</p>";
// // //     return;
// // //   }

// // //   let html = `<h1>Checklist (Fin de Semana)</h1>
// // //   <table>
// // //     <thead>
// // //       <tr><th>Día</th><th>Vestido - Clienta</th><th>Pagó</th><th>Devuelto</th></tr>
// // //     </thead><tbody>`;

// // //   checklist.forEach(c => {
// // //     const f = c.fields;
// // //     html += `<tr>
// // //       <td>${formatDate(f.Día)}</td>
// // //       <td>${f["Vestidos a preparar"] || ''}</td>
// // //       <td>${f.Pagó || ''}</td>
// // //       <td>${f.Devuelto || ''}</td>
// // //     </tr>`;
// // //   });

// // //   html += "</tbody></table>";
// // //   contentArea.innerHTML = html;
// // // }

// // // async function renderFinanzas() {
// // //   const finanzas = await fetchAirtable("FINANZAS");
// // //   if (!finanzas) {
// // //     contentArea.innerHTML = "<p>Error cargando finanzas.</p>";
// // //     return;
// // //   }

// // //   let html = `<h1>Finanzas</h1>
// // //   <table>
// // //     <thead>
// // //       <tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Observaciones</th><th>Saldo</th></tr>
// // //     </thead><tbody>`;

// // //   finanzas.forEach(f => {
// // //     const d = f.fields;
// // //     html += `<tr>
// // //       <td>${formatDate(d.Fecha)}</td>
// // //       <td>${d.Tipo || ''}</td>
// // //       <td>${d.Monto || ''}</td>
// // //       <td>${d.Motivo || ''}</td>
// // //       <td>${d.Observaciones || ''}</td>
// // //       <td>${d["Saldo acumulado"] || ''}</td>
// // //     </tr>`;
// // //   });

// // //   html += "</tbody></table>";
// // //   contentArea.innerHTML = html;
// // // }

// // // async function renderHorarios() {
// // //   const horarios = await fetchAirtable("HORARIOS DISPONIBLES");
// // //   if (!horarios) {
// // //     contentArea.innerHTML = "<p>Error cargando horarios disponibles.</p>";
// // //     return;
// // //   }

// // //   let html = `<h1>Horarios Disponibles</h1>`;
// // //   horarios.forEach(h => {
// // //     const f = h.fields;
// // //     html += `<h3>${formatDate(f.Fecha)}</h3>`;
// // //     html += `<ul>`;
// // //     for (const key in f) {
// // //       if (key !== "Fecha" && f.hasOwnProperty(key)) {
// // //         const estado = f[key] === true || f[key] === "✅" ? "Disponible" : "No disponible";
// // //         html += `<li>${key}: ${estado}</li>`;
// // //       }
// // //     }
// // //     html += `</ul>`;
// // //   });

// // //   contentArea.innerHTML = html;
// // // }

// // // const modules = {
// // //   reservas: renderReservas,
// // //   clientas: renderClientas,
// // //   vestidos: renderVestidos,
// // //   checklist: renderChecklist,
// // //   finanzas: renderFinanzas,
// // //   horarios: renderHorarios,
// // // };

// // // async function loadTab(tab) {
// // //   setActiveTab(tab);
// // //   if (modules[tab]) {
// // //     contentArea.innerHTML = "<p>Cargando...</p>";
// // //     await modules[tab]();
// // //   } else {
// // //     contentArea.innerHTML = "<p>Módulo no encontrado.</p>";
// // //   }
// // // }

// // // loadTab("reservas");

// // // sidebarLinks.forEach(link => {
// // //   link.addEventListener("click", e => {
// // //     e.preventDefault();
// // //     loadTab(link.dataset.tab);
// // //   });
// // // });
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
// //   <form id="form-reserva" style="background:#fff; padding:16px; margin-bottom:20px; border-radius:8px; box-shadow:0 0 8px rgba(0,0,0,0.1); display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
// //     <input name="Nombre" placeholder="Nombre" required />
// //     <input name="FechaReserva" type="date" required />
// //     <input name="Hora" placeholder="Hora (ej: 15:30)" required />
// //     <input name="Cantidad" type="number" placeholder="Personas" min="1" required />
// //     <input name="Comentarios" placeholder="Comentarios" />
// //     <button type="submit" style="grid-column: span 2;">Agregar Reserva</button>
// //   </form>
// //   <table>
// //     <thead>
// //       <tr>
// //         <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Comentarios</th>
// //       </tr>
// //     </thead><tbody>`;

// //   reservas.forEach(r => {
// //     const f = r.fields;
// //     html += `<tr>
// //       <td>${f.Nombre || ''}</td>
// //       <td>${formatDate(f["Fecha de la reserva"])}</td>
// //       <td>${f.Hora || ''}</td>
// //       <td>${f["Cantidad de personas"] || ''}</td>
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
// //       form.reset(); // ← limpia el formulario
// //       await renderReservas();
// //     } catch (err) {
// //       console.error(err);
// //       alert("❌ Error al guardar la reserva. Verificá los nombres de campos en Airtable.");
// //     }
// //   });
// // }

// // // async function renderReservas() {
// // //   const reservas = await fetchAirtable("RESERVAS");
// // //   if (!reservas) {
// // //     contentArea.innerHTML = "<p>Error cargando reservas.</p>";
// // //     return;
// // //   }

// // //   let html = `<h1>Reservas</h1>
// // //   <form id="form-reserva" style="background:#fff; padding:16px; margin-bottom:20px; border-radius:8px; box-shadow:0 0 8px rgba(0,0,0,0.1); display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
// // //     <input name="Nombre" placeholder="Nombre" required />
// // //     <input name="FechaReserva" type="date" required />
// // //     <input name="Hora" placeholder="Hora (ej: 15:30)" required />
// // //     <input name="Cantidad" type="number" placeholder="Personas" min="1" required />
// // //     <input name="FechaEvento" type="date" required />
// // //     <input name="Comentarios" placeholder="Comentarios" />
// // //     <button type="submit" style="grid-column: span 2;">Agregar Reserva</button>
// // //   </form>
// // //   <table>
// // //     <thead>
// // //       <tr>
// // //         <th>Nombre</th><th>Fecha Reserva</th><th>Hora</th><th>Personas</th><th>Fecha Evento</th><th>Comentarios</th>
// // //       </tr>
// // //     </thead><tbody>`;

// // //   reservas.forEach(r => {
// // //     const f = r.fields;
// // //     html += `<tr>
// // //       <td>${f.Nombre || ''}</td>
// // //       <td>${formatDate(f["Fecha de la reserva"])}</td>
// // //       <td>${f.Hora || ''}</td>
// // //       <td>${f["Cantidad de personas"] || ''}</td>
// // //       <td>${formatDate(f["Fecha del evento"])}</td>
// // //       <td>${f.Comentarios || ''}</td>
// // //     </tr>`;
// // //   });

// // //   html += "</tbody></table>";
// // //   contentArea.innerHTML = html;

// // //   // formulario
// // //   document.getElementById("form-reserva").addEventListener("submit", async (e) => {
// // //     e.preventDefault();
// // //     const form = e.target;
// // //     const data = {
// // //       fields: {
// // //         "Nombre": form.Nombre.value,
// // //         "Fecha de la reserva": form.FechaReserva.value,
// // //         "Hora": form.Hora.value,
// // //         "Cantidad de personas": parseInt(form.Cantidad.value),
// // //         "Fecha del evento": form.FechaEvento.value,
// // //         "Comentarios": form.Comentarios.value
// // //       }
// // //     };

// // //     try {
// // //       const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/RESERVAS`, {
// // //         method: "POST",
// // //         headers: {
// // //           Authorization: `Bearer ${AIRTABLE_API_KEY}`,
// // //           "Content-Type": "application/json"
// // //         },
// // //         body: JSON.stringify(data)
// // //       });

// // //       if (!res.ok) throw new Error("Error al guardar");
// // //       alert("✅ Reserva guardada");
// // //       await renderReservas();
// // //     } catch (err) {
// // //       console.error(err);
// // //       alert("❌ Error al guardar la reserva");
// // //     }
// // //   });
// // // }

// // // async function renderClientas() {
// // //   const clientas = await fetchAirtable("CLIENTAS");
// // //   if (!clientas) {
// // //     contentArea.innerHTML = "<p>Error cargando clientas.</p>";
// // //     return;
// // //   }

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
// //     html += `<h3>${formatDate(f.Fecha)}</h3><ul>`;
// //     for (const key in f) {
// //       if (key !== "Fecha" && f.hasOwnProperty(key)) {
// //         const estado = f[key] === true || f[key] === "✅" ? "✅ Disponible" : "❌ Ocupado";
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
