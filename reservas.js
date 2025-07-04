import { API_KEY, BASE_ID } from "./airtableConfig.js";

let clientasCache = [];

async function cargarClientas() {
  try {
    const resp = await fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS?maxRecords=100&view=Grid%20view`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const data = await resp.json();
    clientasCache = data.records.map(r => ({ id: r.id, nombre: r.fields.Nombre }));
  } catch (error) {
    console.error("Error cargando clientas:", error);
  }
}
cargarClientas();

const input = document.getElementById("clienteInput");
const sugerencias = document.getElementById("sugerencias");
const btnAgregarClienta = document.getElementById("btnAgregarClienta");
let clientaSeleccionada = null;

input.addEventListener("input", () => {
  const val = input.value.toLowerCase().trim();
  if (!val) {
    sugerencias.style.display = "none";
    btnAgregarClienta.style.display = "none";
    clientaSeleccionada = null;
    return;
  }
  const matches = clientasCache.filter(c => c.nombre.toLowerCase().includes(val));
  if (matches.length) {
    sugerencias.innerHTML = matches.map(c => `<div class="sugerencia-item" data-id="${c.id}">${c.nombre}</div>`).join("");
    sugerencias.style.display = "block";
    btnAgregarClienta.style.display = "none";
  } else {
    sugerencias.innerHTML = "";
    sugerencias.style.display = "none";
    btnAgregarClienta.style.display = "inline-block";
  }
  clientaSeleccionada = null;
});

sugerencias.addEventListener("click", (e) => {
  if (e.target.classList.contains("sugerencia-item")) {
    clientaSeleccionada = { id: e.target.dataset.id, nombre: e.target.textContent };
    input.value = clientaSeleccionada.nombre;
    sugerencias.style.display = "none";
    btnAgregarClienta.style.display = "none";
  }
});

btnAgregarClienta.addEventListener("click", async () => {
  const nombreNuevo = input.value.trim();
  if (!nombreNuevo) return alert("Escribí un nombre para la nueva clienta");

  try {
    const resp = await fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ fields: { Nombre: nombreNuevo } })
    });
    const data = await resp.json();
    if (data.id) {
      clientasCache.push({ id: data.id, nombre: nombreNuevo });
      clientaSeleccionada = { id: data.id, nombre: nombreNuevo };
      alert("Clienta agregada!");
      btnAgregarClienta.style.display = "none";
      sugerencias.style.display = "none";
    } else {
      alert("Error al agregar clienta");
    }
  } catch (error) {
    console.error("Error agregando clienta:", error);
    alert("Error al agregar clienta");
  }
});

async function agregarReserva() {
  if (!clientaSeleccionada) return alert("Seleccioná o agregá una clienta antes");

  const fecha = document.getElementById("fechaReserva").value;
  const hora = document.getElementById("horaReserva").value;
  const personas = parseInt(document.getElementById("personasReserva").value, 10);
  const evento = document.getElementById("eventoReserva").value;
  const comentarios = document.getElementById("comentariosReserva").value;

  if (!fecha || !hora || !personas || !evento) {
    return alert("Completar todos los campos obligatorios");
  }

  // Lógica para ajustar duración según personas (por si querés usarla luego)

  const body = {
    fields: {
      Nombre: [clientaSeleccionada.id], // vinculación con clienta
      "Fecha de la reserva": fecha,
      Hora: hora,
      "Cantidad de personas a probarse": personas,
      "Fecha del evento": evento,
      Comentarios: comentarios
    }
  };

  try {
    const resp = await fetch(`https://api.airtable.com/v0/${BASE_ID}/RESERVAS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if (data.id) {
      alert("Reserva agregada con éxito!");
      document.getElementById("formReserva").reset();
      clientaSeleccionada = null;
    } else {
      alert("Error al guardar la reserva");
    }
  } catch (error) {
    console.error("Error guardando reserva:", error);
    alert("Error al guardar la reserva");
  }
}
