import { AIRTABLE_API_KEY, BASE_ID } from "./airtableconfig.js";



async function airtableFetch(tabla) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tabla}`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY,}` }
  });
  if (!res.ok) throw new Error(`Error al cargar ${tabla}`);
  const data = await res.json();
  return data.records;
}

async function airtableCreate(tabla, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tabla}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY,}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
  if (!res.ok) {
    const error = await res.json();
    console.error("Error al crear en", tabla, error);
    throw new Error(error?.error?.message || 'Error al guardar');
  }
  return await res.json();
}

// ========== RESERVAS ==========
document.getElementById("formReserva").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const data = {
    "Nombre": form.reservaNombre.value,
    "Fecha de la reserva": form.reservaFecha.value,
    "Hora": form.reservaHora.value,
    "Cantidad de personas": parseInt(form.reservaPersonas.value),
    "Comentarios": form.reservaComentarios.value
  };
  try {
    await airtableCreate("RESERVAS", data);
    alert("Reserva guardada ✅");
    form.reset();
    cargarReservas();
  } catch (err) {
    alert("❌ Error al guardar reserva");
  }
});

async function cargarReservas() {
  const cont = document.getElementById("tablaReservas");
  cont.innerHTML = "";
  const reservas = await airtableFetch("RESERVAS");
  const tabla = document.createElement("table");
  tabla.innerHTML = `
    <tr>
      <th>Nombre</th><th>Fecha</th><th>Hora</th><th>Personas</th><th>Comentarios</th>
    </tr>
  `;
  reservas.sort((a, b) => new Date(a.fields["Fecha de la reserva"]) - new Date(b.fields["Fecha de la reserva"]))
    .forEach(r => {
    const f = r.fields;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.Nombre || ""}</td>
      <td>${f["Fecha de la reserva"]?.split("T")[0]}</td>
      <td>${f.Hora}</td>
      <td>${f["Cantidad de personas"] || ""}</td>
      <td>${f.Comentarios || ""}</td>
    `;
    tabla.appendChild(tr);
  });
  cont.appendChild(tabla);
}

// ========== ALQUILERES ==========
document.getElementById("formAlquiler").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  const nombre = f.clienteNombre.value.trim();
  const fecha = f.alquilerFechaEvento.value;
  const vestido = f.alquilerVestido.value;

  // Verificar si ya existe alquiler para ese día y vestido
  const alquileres = await airtableFetch("ALQUILERES");
  const yaAlquilado = alquileres.some(a =>
    a.fields["Vestido"] === vestido && a.fields["Fecha evento"] === fecha
  );
  if (yaAlquilado) return alert("⚠️ Ese vestido ya está alquilado ese día.");

  // Guardar clienta
  await airtableCreate("CLIENTAS", {
    "Nombre": nombre,
    "Celular": f.clienteCelular.value,
    "Mail": f.clienteMail.value,
    "Cumpleaños": f.clienteCumple.value
  });

  // Registrar alquiler
  await airtableCreate("ALQUILERES", {
    "Nombre": nombre,
    "Vestido": vestido,
    "Fecha evento": fecha,
    "Saldo": parseFloat(f.alquilerSaldo.value || 0),
    "Comentario": f.alquilerComentario.value
  });

  alert("Alquiler registrado ✅");
  f.reset();
  cargarAlquileres();
});

async function cargarAlquileres() {
  const cont = document.getElementById("tablaAlquileres");
  cont.innerHTML = "";
  const data = await airtableFetch("ALQUILERES");
  const tabla = document.createElement("table");
  tabla.innerHTML = `
    <tr><th>Nombre</th><th>Vestido</th><th>Fecha</th><th>Saldo</th><th>Comentario</th></tr>
  `;
  data.forEach(a => {
    const f = a.fields;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.Nombre}</td>
      <td>${f.Vestido}</td>
      <td>${f["Fecha evento"]}</td>
      <td>${f.Saldo || 0}</td>
      <td>${f.Comentario || ""}</td>
    `;
    tabla.appendChild(tr);
  });
  cont.appendChild(tabla);
}

// ========== CLIENTAS ==========
async function cargarClientas() {
  const cont = document.getElementById("tablaClientas");
  cont.innerHTML = "";
  const data = await airtableFetch("CLIENTAS");
  const tabla = document.createElement("table");
  tabla.innerHTML = `<tr><th>Nombre</th><th>Celular</th><th>Mail</th><th>Cumpleaños</th></tr>`;
  data.forEach(c => {
    const f = c.fields;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.Nombre}</td>
      <td>${f.Celular || ""}</td>
      <td>${f.Mail || ""}</td>
      <td>${f.Cumpleaños || ""}</td>
    `;
    tabla.appendChild(tr);
  });
  cont.appendChild(tabla);
}

// ========== VESTIDOS ==========
document.getElementById("formVestido").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  await airtableCreate("VESTIDOS", {
    "Nombre": f.vestidoNombre.value,
    "Talle": f.vestidoTalle.value,
    "Color": f.vestidoColor.value,
    "Estado": f.vestidoEstado.value
  });
  alert("Vestido agregado ✅");
  f.reset();
  cargarVestidos();
});

async function cargarVestidos() {
  const cont = document.getElementById("tablaVestidos");
  cont.innerHTML = "";
  const data = await airtableFetch("VESTIDOS");
  const tabla = document.createElement("table");
  tabla.innerHTML = `<tr><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th></tr>`;
  data.forEach(v => {
    const f = v.fields;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.Nombre}</td>
      <td>${f.Talle}</td>
      <td>${f.Color}</td>
      <td>${f.Estado}</td>
    `;
    tabla.appendChild(tr);
  });
  cont.appendChild(tabla);

  // También actualiza el select de alquiler
  const select = document.getElementById("alquilerVestido");
  select.innerHTML = "";
  data.forEach(v => {
    const f = v.fields;
    const opt = document.createElement("option");
    opt.value = f.Nombre;
    opt.textContent = f.Nombre;
    select.appendChild(opt);
  });
}

// ========== FINANZAS ==========
document.getElementById("formFinanzas").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  await airtableCreate("FINANZAS", {
    "Fecha": f.finanzaFecha.value,
    "Tipo": f.finanzaTipo.value,
    "Monto": parseFloat(f.finanzaMonto.value),
    "Motivo": f.finanzaMotivo.value,
    "Observaciones": f.finanzaObservaciones.value
  });
  alert("Movimiento registrado ✅");
  f.reset();
  cargarFinanzas();
});

async function cargarFinanzas() {
  const cont = document.getElementById("tablaFinanzas");
  cont.innerHTML = "";
  const data = await airtableFetch("FINANZAS");
  const tabla = document.createElement("table");
  tabla.innerHTML = `<tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Motivo</th><th>Observaciones</th></tr>`;
  data.forEach(m => {
    const f = m.fields;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.Fecha}</td>
      <td>${f.Tipo}</td>
      <td>${f.Monto}</td>
      <td>${f.Motivo}</td>
      <td>${f.Observaciones}</td>
    `;
    tabla.appendChild(tr);
  });
  cont.appendChild(tabla);
}

// ========== PDF ==========
window.generarPDFAgenda = () => {
  alert("🖨️ Aquí se generará el PDF de agenda (pendiente)");
};
window.generarPDFChecklist = () => {
  alert("🖨️ Aquí se generará el PDF del checklist (pendiente)");
};

// ========== INICIALIZAR ==========
cargarReservas();
cargarAlquileres();
cargarVestidos();
cargarClientas();
cargarFinanzas();
// import { AIRTABLE_API_KEY, BASE_ID } from './airtableConfig.js';

// const content = document.getElementById('content');
// const tabs = document.querySelectorAll('nav.tabs button');

// tabs.forEach(btn => {
//   btn.addEventListener('click', () => {
//     tabs.forEach(b => b.classList.remove('active'));
//     btn.classList.add('active');
//     cargarVista(btn.dataset.tab);
//   });
// });

// function mostrarMensaje(texto, tipo = 'success') {
//   const msg = document.createElement('div');
//   msg.className = `message ${tipo}`;
//   msg.textContent = texto;
//   content.prepend(msg);
//   setTimeout(() => msg.remove(), 3000);
// }

// async function airtableFetch(tabla) {
//   const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tabla)}?pageSize=100`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
//   });
//   if (!res.ok) throw new Error(`Error al cargar ${tabla}: ${res.status}`);
//   const data = await res.json();
//   return data.records;
// }

// async function airtableCreate(tabla, fields) {
//   const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tabla)}`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${AIRTABLE_API_KEY}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ fields })
//   });
//   if (!res.ok) {
//     const error = await res.json();
//     console.error("Error al crear en", tabla, error);
//     throw new Error(error?.error?.message || 'Error al guardar');
//   }
//   return res.json();
// }

// function crearInput(label, type, name, required = true) {
//   const div = document.createElement('div');
//   const lbl = document.createElement('label');
//   lbl.textContent = label;
//   const input = document.createElement('input');
//   input.type = type;
//   input.name = name;
//   if (required) input.required = true;
//   div.append(lbl, input);
//   return div;
// }
// async function vistaReservas() {
//   content.innerHTML = '';

//   // Formulario para reservar cita
//   const form = document.createElement('form');
//   form.innerHTML = `<h2>Reservar una cita</h2>`;
//   form.append(
//     crearInput('Nombre', 'text', 'nombre'),
//     crearInput('Fecha de la cita', 'date', 'fecha'),
//     crearInput('Hora', 'time', 'hora'),
//     crearInput('Cantidad de personas', 'number', 'personas'),
//     crearInput('Comentario', 'text', 'comentario', false),
//   );

//   const btn = document.createElement('button');
//   btn.textContent = 'Reservar';
//   form.appendChild(btn);

//   form.addEventListener('submit', async e => {
//     e.preventDefault();
//     const datos = Object.fromEntries(new FormData(form));
//     try {
//       await airtableCreate('RESERVAS', {
//         "Nombre": datos.nombre,
//         "Fecha de la reserva": datos.fecha,
//         "Hora": datos.hora,
//         "Cantidad de personas": parseInt(datos.personas),
//         "Comentarios": datos.comentario
//       });
//       form.reset();
//       mostrarMensaje('✅ Reserva guardada con éxito');
//       vistaReservas();
//     } catch (e) {
//       mostrarMensaje('❌ Error al guardar reserva', 'error');
//     }
//   });

//   content.appendChild(form);

//   // Tabla de reservas existentes
//   const registros = await airtableFetch('RESERVAS');
//   const tabla = document.createElement('table');
//   tabla.innerHTML = `
//     <thead><tr>
//       <th>Nombre</th><th>Fecha</th><th>Hora</th><th>Personas</th><th>Comentarios</th>
//     </tr></thead><tbody>
//       ${registros.map(r => {
//         const f = r.fields;
//         return `<tr>
//           <td>${f.Nombre || ''}</td>
//           <td>${f["Fecha de la reserva"] || ''}</td>
//           <td>${f.Hora || ''}</td>
//           <td>${f["Cantidad de personas"] || ''}</td>
//           <td>${f.Comentarios || ''}</td>
//         </tr>`;
//       }).join('')}
//     </tbody>
//   `;
//   content.appendChild(tabla);
// }




// reservas.sort((a, b) => {
//   const fechaA = new Date(a.fields["Fecha de la reserva"]);
//   const fechaB = new Date(b.fields["Fecha de la reserva"]);

//   // Extra: ordenar hora como "15:30"
//   const horaA = a.fields.Hora || "";
//   const horaB = b.fields.Hora || "";

//   return fechaA - fechaB || horaA.localeCompare(horaB);
// });
// document.getElementById("filtroFecha").addEventListener("input", e => {
//   const fechaSeleccionada = e.target.value;
//   if (!fechaSeleccionada) {
//     renderReservas(); // vuelve a mostrar todo
//     return;
//   }

//   const reservasFiltradas = reservas.filter(r => {
//     const fecha = new Date(r.fields["Fecha de la reserva"]).toISOString().split("T")[0];
//     return fecha === fechaSeleccionada;
//   });

//   renderizarTablaReservas(reservasFiltradas);
// });
// function renderizarTablaReservas(reservas) {
//   let html = `<h2>Reservas</h2>
//   <label for="filtroFecha">Filtrar por fecha: </label>
//   <input type="date" id="filtroFecha" />
//   <table>
//     <thead>
//       <tr>
//         <th>Nombre</th>
//         <th>Fecha</th>
//         <th>Hora</th>
//         <th>Personas</th>
//         <th>Comentarios</th>
//       </tr>
//     </thead>
//     <tbody>`;

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

//   // volvemos a agregar el listener del filtro
//   document.getElementById("filtroFecha").addEventListener("input", e => {
//     const fechaSeleccionada = e.target.value;
//     if (!fechaSeleccionada) {
//       renderReservas(); // todo de nuevo
//       return;
//     }

//     const reservasFiltradas = reservas.filter(r => {
//       const fecha = new Date(r.fields["Fecha de la reserva"]).toISOString().split("T")[0];
//       return fecha === fechaSeleccionada;
//     });

//     renderizarTablaReservas(reservasFiltradas);
//   });
// }









// async function vistaClientas() {
//   content.innerHTML = '';

//   const form = document.createElement('form');
//   form.innerHTML = `<h2>Agregar clienta</h2>`;
//   form.append(
//     crearInput('Nombre', 'text', 'nombre'),
//     crearInput('Celular', 'tel', 'celular'),
//     crearInput('Email', 'email', 'email'),
//     crearInput('Cumpleaños', 'date', 'cumple', false),
//   );

//   const btn = document.createElement('button');
//   btn.textContent = 'Agregar clienta';
//   form.appendChild(btn);

//   form.addEventListener('submit', async e => {
//     e.preventDefault();
//     const datos = Object.fromEntries(new FormData(form));
//     try {
//       await airtableCreate('CLIENTAS', {
//         Nombre: datos.nombre,
//         Celular: datos.celular,
//         Mail: datos.email,
//         Cumpleaños: datos.cumple || null
//       });
//       form.reset();
//       mostrarMensaje('✅ Clienta guardada con éxito');
//       vistaClientas();
//     } catch (e) {
//       mostrarMensaje('❌ Error al guardar clienta', 'error');
//     }
//   });

//   content.appendChild(form);

//   const clientas = await airtableFetch('CLIENTAS');
//   const tabla = document.createElement('table');
//   tabla.innerHTML = `
//     <thead><tr>
//       <th>Nombre</th><th>Celular</th><th>Email</th><th>Cumpleaños</th>
//     </tr></thead><tbody>
//       ${clientas.map(c => {
//         const f = c.fields;
//         return `<tr>
//           <td>${f.Nombre || ''}</td>
//           <td>${f.Celular || ''}</td>
//           <td>${f.Mail || ''}</td>
//           <td>${f.Cumpleaños || ''}</td>
//         </tr>`;
//       }).join('')}
//     </tbody>
//   `;
//   content.appendChild(tabla);
// }
// async function vistaAlquileres() {
//   content.innerHTML = '';

//   const clientas = await airtableFetch('CLIENTAS');
//   const vestidos = await airtableFetch('VESTIDOS');

//   const form = document.createElement('form');
//   form.innerHTML = `<h2>Registrar alquiler</h2>`;

//   const selectClienta = document.createElement('select');
//   selectClienta.name = 'clienta';
//   selectClienta.innerHTML = '<option value="">Seleccionar clienta existente</option>' +
//     clientas.map(c => `<option value="${c.id}">${c.fields.Nombre}</option>`).join('');
//   form.append(crearLabel("Clienta existente"), selectClienta);

//   form.append(crearInput('Fecha del evento', 'date', 'fecha_evento'));
//   form.append(crearLabel("Vestido alquilado"));

//   const selectVestido = document.createElement('select');
//   selectVestido.name = 'vestido';
//   selectVestido.innerHTML = vestidos.map(v => {
//     const f = v.fields;
//     return `<option value="${v.id}">${f.Nombre || 'Sin nombre'} (${f.Talle || ''})</option>`;
//   }).join('');
//   form.appendChild(selectVestido);

//   const pago = document.createElement('select');
//   pago.name = 'pago';
//   pago.innerHTML = `<option value="Sí">Sí</option><option value="No">No</option>`;
//   form.append(crearLabel("Pagó"), pago);

//   const devuelto = document.createElement('select');
//   devuelto.name = 'devuelto';
//   devuelto.innerHTML = `<option value="Sí">Sí</option><option value="No">No</option>`;
//   form.append(crearLabel("Devuelto"), devuelto);

//   const btn = document.createElement('button');
//   btn.textContent = 'Registrar alquiler';
//   form.appendChild(btn);

//   form.addEventListener('submit', async e => {
//     e.preventDefault();
//     const datos = Object.fromEntries(new FormData(form));
//     try {
//       await airtableCreate('ALQUILERES', {
//         Fecha: datos.fecha_evento,
//         Clienta: [datos.clienta],
//         Vestido: [datos.vestido],
//         Pagó: datos.pago,
//         Devuelto: datos.devuelto
//       });
//       form.reset();
//       mostrarMensaje('✅ Alquiler registrado');
//       vistaAlquileres();
//     } catch (e) {
//       mostrarMensaje('❌ Error al registrar alquiler', 'error');
//     }
//   });

//   content.appendChild(form);

//   const alquileres = await airtableFetch('ALQUILERES');
//   const tabla = document.createElement('table');
//   tabla.innerHTML = `<thead>
//     <tr><th>Fecha</th><th>Clienta</th><th>Vestido</th><th>Pagó</th><th>Devuelto</th></tr>
//   </thead><tbody>
//     ${alquileres.map(a => {
//       const f = a.fields;
//       return `<tr>
//         <td>${f.Fecha || ''}</td>
//         <td>${f.ClientaNombre || ''}</td>
//         <td>${f.VestidoNombre || ''}</td>
//         <td>${f.Pagó || ''}</td>
//         <td>${f.Devuelto || ''}</td>
//       </tr>`;
//     }).join('')}
//   </tbody>`;
//   content.appendChild(tabla);
// }

// async function vistaVestidos() {
//   content.innerHTML = '';

//   const form = document.createElement('form');
//   form.innerHTML = `<h2>Agregar vestido</h2>`;
//   form.append(
//     crearInput('Nombre', 'text', 'nombre'),
//     crearInput('Talle', 'text', 'talle'),
//     crearInput('Color', 'text', 'color'),
//     crearInput('Estado', 'text', 'estado'),
//     crearInput('Foto (URL)', 'url', 'imagen', false),
//   );

//   const btn = document.createElement('button');
//   btn.textContent = 'Guardar vestido';
//   form.appendChild(btn);

//   form.addEventListener('submit', async e => {
//     e.preventDefault();
//     const datos = Object.fromEntries(new FormData(form));
//     try {
//       const imagen = datos.imagen ? [{ url: datos.imagen }] : undefined;
//       await airtableCreate('VESTIDOS', {
//         Nombre: datos.nombre,
//         Talle: datos.talle,
//         Color: datos.color,
//         Estado: datos.estado,
//         Foto: imagen
//       });
//       form.reset();
//       mostrarMensaje('✅ Vestido guardado');
//       vistaVestidos();
//     } catch (e) {
//       mostrarMensaje('❌ Error al guardar vestido', 'error');
//     }
//   });

//   content.appendChild(form);

//   const vestidos = await airtableFetch('VESTIDOS');
//   const tabla = document.createElement('table');
//   tabla.innerHTML = `<thead>
//     <tr><th>Foto</th><th>Nombre</th><th>Talle</th><th>Color</th><th>Estado</th></tr>
//   </thead><tbody>
//     ${vestidos.map(v => {
//       const f = v.fields;
//       const img = f.Imagen?.[0]?.url || '';
//       return `<tr>
//         <td>${img ? `<img class="preview" src="${img}" />` : ''}</td>
//         <td>${f.Nombre || ''}</td>
//         <td>${f.Talle || ''}</td>
//         <td>${f.Color || ''}</td>
//         <td>${f.Estado || ''}</td>
//       </tr>`;
//     }).join('')}
//   </tbody>`;
//   content.appendChild(tabla);
// }

// function crearLabel(texto) {
//   const label = document.createElement('label');
//   label.textContent = texto;
//   return label;
// }
// async function vistaChecklist() {
//   content.innerHTML = '<h2>Checklist del fin de semana</h2>';

//   const alquileres = await airtableFetch('ALQUILERES');
//   const sabDom = alquileres.filter(a => {
//     const fecha = new Date(a.fields.Fecha);
//     return [6, 0].includes(fecha.getDay());
//   });

//   const tabla = document.createElement('table');
//   tabla.innerHTML = `<thead>
//     <tr><th>Día</th><th>Clienta</th><th>Vestido</th><th>Pagó</th><th>Devuelto</th></tr>
//   </thead><tbody>
//     ${sabDom.map(a => {
//       const f = a.fields;
//       return `<tr>
//         <td>${f.Fecha || ''}</td>
//         <td>${f.ClientaNombre || ''}</td>
//         <td>${f.VestidoNombre || ''}</td>
//         <td>${f.Pagó || ''}</td>
//         <td>${f.Devuelto || ''}</td>
//       </tr>`;
//     }).join('')}
//   </tbody>`;
//   content.appendChild(tabla);
// }

// async function vistaHorarios() {
//   content.innerHTML = `<h2>Horarios Disponibles</h2><p>Manual por ahora. Próximamente: calendario visual editable.</p>`;
//   const horarios = await airtableFetch('HORARIOS DISPONIBLES');
//   const tabla = document.createElement('table');
//   tabla.innerHTML = `<thead><tr><th>Fecha</th><th>15:00 → 18:30</th></tr></thead><tbody>
//     ${horarios.map(h => {
//       const f = h.fields;
//       const fecha = f.Fecha || '';
//       const bloques = Object.keys(f).filter(k => k !== 'Fecha').map(hora =>
//         `${hora}: ${f[hora] === "✔️" ? 'Ocupado' : 'Libre'}`
//       ).join('<br>');
//       return `<tr><td>${fecha}</td><td>${bloques}</td></tr>`;
//     }).join('')}
//   </tbody>`;
//   content.appendChild(tabla);
// }

// function cargarVista(tab) {
//   if (tab === 'reservas') vistaReservas();
//   else if (tab === 'alquileres') vistaAlquileres();
//   else if (tab === 'clientas') vistaClientas();
//   else if (tab === 'vestidos') vistaVestidos();
//   else if (tab === 'checklist') vistaChecklist();
//   else if (tab === 'horarios') vistaHorarios();
// }

// cargarVista('reservas');
