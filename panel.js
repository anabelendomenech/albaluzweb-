function verificarAcceso() {
  const pass = document.getElementById("password").value;
  if (pass === "ALBALUZ2025") {
    document.getElementById("login").style.display = "none";
    document.getElementById("panel").style.display = "block";
    cargarPanel();
  } else {
    alert("Contraseña incorrecta");
  }
}

function cargarPanel() {
  cargarReservas();
  cargarClientas();
  cargarVestidos();
  cargarChecklist();
  cargarFinanzas();
  cargarHorarios();
}

function cargarReservas() {
  fetch(`https://api.airtable.com/v0/${BASE_ID}/RESERVAS`, { headers })
    .then(res => res.json())
    .then(data => {
      const cont = document.getElementById("reservas");
      cont.innerHTML = data.records.map(r => {
        const f = r.fields;
        return `<div class="item reserva ${f.Hora?.includes('❌') ? 'ocupado' : ''}">
          <strong>${f.Nombre}</strong><br>
          Fecha: ${f["Fecha de la reserva"]} - Hora: ${f.Hora}<br>
          Personas: ${f["Cantidad de personas a probarse"]}<br>
          Evento: ${f["Fecha del evento"]}<br>
          Comentarios: ${f.Comentarios || ""}
        </div>`;
      }).join("");
    });
}

function cargarClientas() {
  fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS`, { headers })
    .then(res => res.json())
    .then(data => {
      const cont = document.getElementById("clientas");
      cont.innerHTML = data.records.map(r => {
        const f = r.fields;
        return `<div class="item clienta">
          <strong>${f.Nombre}</strong> - ${f.Celular}<br>
          Última vez: ${f["Cuándo fue la última vez"] || "-"}<br>
          Alquileres: ${f["Cuántas veces alquiló"] || 0}
        </div>`;
      }).join("");
    });
}

function cargarVestidos() {
  fetch(`https://api.airtable.com/v0/${BASE_ID}/VESTIDOS`, { headers })
    .then(res => res.json())
    .then(data => {
      const cont = document.getElementById("vestidos");
      cont.innerHTML = data.records.map(r => {
        const f = r.fields;
        return `<div class="item vestido">
          <img src="${f.Foto?.[0]?.url || '#'}" alt="${f.Nombre}" style="max-width:100px" /><br>
          <strong>${f.Nombre}</strong><br>
          Talle: ${f.Talle} - Color: ${f.Color}<br>
          Estado: ${f.Estado || "Disponible"}<br>
          Veces alquilado: ${f["Veces alquilado"] || 0}
        </div>`;
      }).join("");
    });
}

function cargarChecklist() {
  fetch(`https://api.airtable.com/v0/${BASE_ID}/CHECKLIST`, { headers })
    .then(res => res.json())
    .then(data => {
      const cont = document.getElementById("checklist");
      cont.innerHTML = data.records.map(r => {
        const f = r.fields;
        return `<div class="item checklist">
          Día: ${f.Día} - Vestido: ${f["Vestidos a preparar"]} - Cliente: ${f.Clienta}<br>
          Pagó: ${f.Pagó ? "✔️" : "❌"} | Devuelto: ${f.Devuelto ? "✔️" : "❌"}
        </div>`;
      }).join("");
    });
}

function cargarFinanzas() {
  fetch(`https://api.airtable.com/v0/${BASE_ID}/FINANZAS`, { headers })
    .then(res => res.json())
    .then(data => {
      const cont = document.getElementById("finanzas");
      let saldo = 0;
      const items = data.records.map(r => {
        const f = r.fields;
        const monto = f.Monto || 0;
        saldo += f.Tipo === "ingreso" ? monto : -monto;
        return `<div class="item finanza ${f.Tipo}">
          ${f.Fecha} - ${f.Tipo.toUpperCase()} - $${monto} <br> ${f.Motivo || ""} ${f.Observaciones || ""}
        </div>`;
      });
      cont.innerHTML = `<strong>Saldo actual: $${saldo}</strong><br><br>` + items.join("");
    });
}

function cargarHorarios() {
  fetch(`https://api.airtable.com/v0/${BASE_ID}/HORARIOS DISPONIBLES`, { headers })
    .then(res => res.json())
    .then(data => {
      const cont = document.getElementById("horarios");
      cont.innerHTML = data.records.map(r => {
        const f = r.fields;
        let filas = Object.entries(f).filter(([k]) => k !== "Fecha").map(([hora, val]) => {
          return `<span class="${val === "✔️" ? "libre" : "ocupado"}">${hora}: ${val}</span>`;
        }).join(" | ");
        return `<div class="item horario"><strong>${f.Fecha}</strong><br>${filas}</div>`;
      }).join("");
    });
}
