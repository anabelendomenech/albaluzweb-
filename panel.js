// panel.js
const API_KEY = "pat4Z3hm5lJaeSBxQ.568935dff179a1efd1d93ec53da2a523f432a391c248fbfc7da27e124da92f19";
const BASE_ID = "appraIuHWdh5tA4FU";
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

// ================== RESERVAS ==================

document.getElementById("form-reservas").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = e.target.nombre.value;
  const fechaReserva = e.target.fechaReserva.value;
  const hora = e.target.hora.value;
  const personas = parseInt(e.target.personas.value);
  const fechaEvento = e.target.fechaEvento.value;
  const comentarios = e.target.comentarios.value;

  const fields = {
    "Nombre": nombre,
    "Fecha de la reserva": fechaReserva,
    "Hora": hora,
    "Cantidad de personas": personas,
    "Fecha del evento": fechaEvento,
    "Comentarios": comentarios
  };

  const response = await fetch(`${BASE_URL}/RESERVAS`, {
    method: "POST",
    headers,
    body: JSON.stringify({ fields })
  });

  if (response.ok) {
    alert("✅ Reserva guardada correctamente");
    e.target.reset();
    obtenerReservas();
  } else {
    alert("❌ Error al guardar la reserva");
  }
});

async function obtenerReservas() {
  const res = await fetch(`${BASE_URL}/RESERVAS`, { headers });
  const data = await res.json();
  const contenedor = document.getElementById("tabla-reservas");

  if (!data.records) return;

  contenedor.innerHTML = `
    <table>
      <tr>
        <th>Nombre</th>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Personas</th>
        <th>Evento</th>
        <th>Comentarios</th>
      </tr>
      ${data.records.map(r => `
        <tr>
          <td>${r.fields["Nombre"] || ""}</td>
          <td>${r.fields["Fecha de la reserva"] || ""}</td>
          <td>${r.fields["Hora"] || ""}</td>
          <td>${r.fields["Cantidad de personas"] || ""}</td>
          <td>${r.fields["Fecha del evento"] || ""}</td>
          <td>${r.fields["Comentarios"] || ""}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

// ================== CHECKLIST ==================

async function obtenerChecklist() {
  const res = await fetch(`${BASE_URL}/CHECKLIST`, { headers });
  const data = await res.json();
  const contenedor = document.getElementById("tabla-checklist");

  if (!data.records) return;

  contenedor.innerHTML = `
    <table>
      <tr>
        <th>Día</th>
        <th>Vestidos</th>
        <th>Cliente</th>
        <th>Pagó</th>
        <th>Devuelto</th>
      </tr>
      ${data.records.map(r => `
        <tr>
          <td>${r.fields["Día"] || ""}</td>
          <td>${r.fields["Vestidos"] || ""}</td>
          <td>${r.fields["Cliente"] || ""}</td>
          <td>${r.fields["Pagó"] || "❌"}</td>
          <td>${r.fields["Devuelto"] || "❌"}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

// ================== CARGA INICIAL ==================
document.addEventListener("DOMContentLoaded", () => {
  obtenerReservas();
  obtenerChecklist();
});
