const API_KEY = "pat4Z3hm5lJaeSBxQ.568935dff179a1efd1d93ec53da2a523f432a391c248fbfc7da27e124da92f19";
const BASE_ID = "appraIuHWdh5tA4FU";

async function fetchAirtableData(tableName) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  });

  if (!response.ok) {
    console.error(`Error al cargar la tabla ${tableName}`, response.status);
    return [];
  }

  const data = await response.json();
  return data.records;
}

function login() {
  const input = document.getElementById("password");
  if (input.value === "ALBALUZ2025") {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("contenido-panel").style.display = "block";
    cargarDatos();
  } else {
    alert("Contraseña incorrecta");
  }
}

async function cargarDatos() {
  // RESERVAS
  const reservas = await fetchAirtableData("RESERVAS");
  mostrarTabla("tabla-reservas", reservas, ["Nombre", "Fecha de la reserva", "Hora", "Cantidad de personas", "Fecha del evento", "Comentarios"]);

  // CLIENTAS
  const clientas = await fetchAirtableData("CLIENTAS");
  mostrarTabla("tabla-clientas", clientas, ["Nombre", "Celular", "Mail", "Historial de reservas", "Cuántas veces alquiló", "Cuándo fue la última vez"]);

  // VESTIDOS
  const vestidos = await fetchAirtableData("VESTIDOS");
  mostrarTabla("tabla-vestidos", vestidos, ["Nombre", "Talle", "Color", "Foto", "Estado", "Veces alquilado"]);

  // CHECKLIST
  const checklist = await fetchAirtableData("CHECKLIST");
  mostrarTabla("tabla-checklist", checklist, ["Día", "Vestidos a preparar", "Pagó", "Devuelto"]);

  // FINANZAS
  const finanzas = await fetchAirtableData("FINANZAS");
  mostrarTabla("tabla-finanzas", finanzas, ["Fecha", "Tipo", "Monto", "Motivo", "Observaciones", "Saldo acumulado"]);

  // HORARIOS
  const horarios = await fetchAirtableData("HORARIOS DISPONIBLES");
  mostrarTabla("tabla-horarios", horarios, ["Fecha", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"]);
}

function mostrarTabla(id, records, columnas) {
  const contenedor = document.getElementById(id);
  if (!contenedor) return;

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  const filaHeader = document.createElement("tr");
  columnas.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    filaHeader.appendChild(th);
  });
  thead.appendChild(filaHeader);

  records.forEach(registro => {
    const fila = document.createElement("tr");
    columnas.forEach(col => {
      const celda = document.createElement("td");
      celda.textContent = registro.fields[col] || "";
      fila.appendChild(celda);
    });
    tbody.appendChild(fila);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  contenedor.innerHTML = "";
  contenedor.appendChild(table);
}
