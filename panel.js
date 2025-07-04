import { API_KEY, BASE_ID, headers } from './airtableConfig.js';

document.getElementById('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

function login() {
  const pass = document.getElementById("password").value;
  if (pass === "ALBALUZ2025") {
    document.getElementById("login").style.display = "none";
    document.getElementById("panel").style.display = "block";
    cargarTodo();
  } else {
    alert("Contraseña incorrecta");
  }
}

function fetchData(tabla) {
  return fetch(`https://api.airtable.com/v0/${BASE_ID}/${tabla}`, { headers })
    .then(r => r.json())
    .then(data => data.records)
    .catch(e => {
      console.error(`Error en ${tabla}:`, e);
      return [];
    });
}

async function cargarTodo() {
  const [reservas, clientas, vestidos, checklist, finanzas, horarios] = await Promise.all([
    fetchData("RESERVAS"),
    fetchData("CLIENTAS"),
    fetchData("VESTIDOS"),
    fetchData("CHECKLIST"),
    fetchData("FINANZAS"),
    fetchData("HORARIOS DISPONIBLES"),
  ]);

  renderizar(reservas, "reservas");
  renderizar(clientas, "clientas");
  renderizar(vestidos, "vestidos");
  renderizar(checklist, "checklist");
  renderizar(finanzas, "finanzas");
  renderizarHorarios(horarios);

  renderizarEstadisticas(reservas, clientas, vestidos, finanzas);
}

function renderizar(datos, contenedorID) {
  const cont = document.getElementById(contenedorID);
  cont.innerHTML = "";
  datos.forEach(r => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = Object.entries(r.fields).map(([k, v]) => `<p><b>${k}:</b> ${v}</p>`).join("");
    cont.appendChild(div);
  });
}

function renderizarHorarios(horarios) {
  const cont = document.getElementById("horarios");
  cont.innerHTML = "";
  horarios.forEach(r => {
    const dia = r.fields["Fecha"];
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<h3>${dia}</h3>`;
    for (let hora of ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"]) {
      const estado = r.fields[hora] === "✔️" ? "Ocupado" : "Libre";
      const color = estado === "Ocupado" ? "#f88" : "#8f8";
      div.innerHTML += `<p style="background:${color};padding:3px;border-radius:4px">${hora}: ${estado}</p>`;
    }
    cont.appendChild(div);
  });
}

function renderizarEstadisticas(reservas, clientas, vestidos, finanzas) {
  const cont = document.getElementById("estadisticas");
  const ingresos = finanzas.filter(f => f.fields["Tipo"] === "Ingreso").reduce((a, b) => a + (b.fields["Monto"] || 0), 0);
  const egresos = finanzas.filter(f => f.fields["Tipo"] === "Egreso").reduce((a, b) => a + (b.fields["Monto"] || 0), 0);
  const saldo = ingresos - egresos;

  cont.innerHTML = `
    <p>👥 Total clientas: <b>${clientas.length}</b></p>
    <p>📅 Total reservas: <b>${reservas.length}</b></p>
    <p>👗 Vestidos registrados: <b>${vestidos.length}</b></p>
    <p>💰 Ingresos: $${ingresos} / Egresos: $${egresos} / <b>Saldo: $${saldo}</b></p>
  `;
}
