/* ======== Config ======== */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbweT6obhgGTDXhtgiYZrvPmNBA7gEtb1FpBR1Q0tkD8iftcb5OCvukMJ1uVwR3PBJ8vjA/exec";

/* ======== Modal ======== */
function abrirModal() {
  document.getElementById("modal").style.display = "flex";
}
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

/* ======== Guardar alquiler (POST) ======== */
async function guardarAlquiler() {
  const cliente = document.getElementById("cliente").value.trim();
  const vestido = document.getElementById("vestido").value.trim();
  const retiro = document.getElementById("retiro").value;
  const devolucion = document.getElementById("devolucion").value;
  const precio = document.getElementById("precio").value;
  const notas = document.getElementById("notas").value.trim();

  if (!cliente || !vestido || !retiro || !devolucion || !precio) {
    alert("Completa todos los campos obligatorios.");
    return;
  }

  const payload = {
    cliente, vestido, retiro, devolucion, precio, notas
  };

  try {
    const resp = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const j = await resp.json();
    if (j.result === "ok" || resp.ok) {
      cerrarModal();
      limpiarModal();
      cargarAlquileres();
    } else {
      alert("Error al guardar. Revisar el script.");
      console.error("Guardar respuesta:", j);
    }
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el servidor. Revisa el endpoint.");
  }
}

function limpiarModal() {
  ["cliente","vestido","retiro","devolucion","precio","notas"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ======== CARGAR ALQUILERES (GET) ======== */
let ALQUILERES_DATA = []; // array de filas

async function cargarAlquileres() {
  try {
    const resp = await fetch(WEB_APP_URL);
    const data = await resp.json(); // array de arrays (filas)
    // Suponemos primera fila = encabezados
    if (!Array.isArray(data) || data.length < 1) {
      console.warn("Hoja vacía o formato inesperado", data);
      ALQUILERES_DATA = [];
    } else {
      // Convertir a objetos para uso cómodo
      const headers = data[0].map(h => String(h).trim());
      const rows = data.slice(1);
      ALQUILERES_DATA = rows.map(r => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = r[i] !== undefined ? r[i] : "";
        });
        return obj;
      });
    }

    renderTabla(ALQUILERES_DATA);
    actualizarWidgets(ALQUILERES_DATA);
  } catch (err) {
    console.error("Error cargando alquileres:", err);
    document.getElementById("tablaAlquileres") && (document.getElementById("tablaAlquileres").innerHTML = "<tr><td colspan='7'>Error cargando datos</td></tr>");
  }
}

/* ======== RENDER TABLA ======== */
function renderTabla(data) {
  const tbody = document.getElementById("tablaAlquileres");
  if (!tbody) return;

  const filtro = document.getElementById("filtro") ? document.getElementById("filtro").value : "todos";
  const hoy = new Date();
  const treintaDias = new Date();
  treintaDias.setDate(hoy.getDate() + 30);

  const filas = data.filter(item => {
    const retiro = item["Retiro"] || item["retiro"] || item["Fecha de retiro"] || "";
    const devolucion = item["Devolución"] || item["devolucion"] || "";
    const estado = calcularEstado(retiro, devolucion);

    if (filtro === "todos") return true;
    if (filtro === "proximos") {
      if (!retiro) return false;
      const r = new Date(retiro);
      return r >= hoy && r <= treintaDias;
    }
    if (filtro === "hoy") {
      if (!retiro) return false;
      const r = new Date(retiro);
      return r.toDateString() === hoy.toDateString();
    }
    if (filtro === "devueltos") {
      return estado === "Devuelto";
    }
    return true;
  });

  let html = "";
  if (filas.length === 0) {
    html = `<tr><td colspan="7">No hay alquileres</td></tr>`;
  } else {
    filas.reverse().forEach(item => {
      const created = item["Timestamp"] || item["timestamp"] || "";
      const cliente = item["Cliente"] || item["cliente"] || "";
      const vestido = item["Vestido"] || item["vestido"] || "";
      const retiro = item["Retiro"] || item["retiro"] || "";
      const devolucion = item["Devolución"] || item["devolucion"] || "";
      const precio = item["Precio"] || item["precio"] || "";
      const estado = calcularEstado(retiro, devolucion);

      html += `
        <tr>
          <td>${formatDateTime(created)}</td>
          <td>${escapeHtml(cliente)}</td>
          <td>${escapeHtml(vestido)}</td>
          <td>${formatDate(retiro)}</td>
          <td>${formatDate(devolucion)}</td>
          <td>$${precio}</td>
          <td>${estado}</td>
        </tr>
      `;
    });
  }

  tbody.innerHTML = html;
}

/* ======== UTILIDADES ======== */
function calcularEstado(retiroStr, devolucionStr) {
  if (!retiroStr && !devolucionStr) return "Reservado";
  const hoy = new Date();
  const devolucion = devolucionStr ? new Date(devolucionStr) : null;
  if (devolucion && endOfDay(devolucion) < startOfDay(hoy)) return "Devuelto";
  const retiro = retiroStr ? new Date(retiroStr) : null;
  if (retiro && startOfDay(retiro) <= endOfDay(hoy) && (!devolucion || endOfDay(devolucion) >= startOfDay(hoy))) return "Retirado";
  return "Reservado";
}
function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x = new Date(d); x.setHours(23,59,59,999); return x; }

function formatDate(d){
  if(!d) return "";
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("es-UY");
  } catch(e){ return d; }
}
function formatDateTime(d){
  if(!d) return "";
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleString("es-UY");
  } catch(e){ return d; }
}
function escapeHtml(text){
  return String(text || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ======== WIDGETS (Dashboard) ======== */
function actualizarWidgets(data) {
  // Reservas esta semana (hoy .. domingo)
  const hoy = new Date();
  const dom = new Date(hoy);
  dom.setDate(hoy.getDate() + (7 - hoy.getDay())); // domingo
  dom.setHours(23,59,59,999);

  const reservasEstaSemana = data.filter(item => {
    const retiro = item["Retiro"] || item["retiro"] || "";
    if (!retiro) return false;
    const r = new Date(retiro);
    return r >= startOfDay(hoy) && r <= dom;
  }).length;

  // Ingresos mes (suma columna Precio en mes actual)
  const mes = hoy.getMonth();
  const año = hoy.getFullYear();
  let ingresos = 0;
  data.forEach(item => {
    const created = item["Timestamp"] || item["timestamp"] || "";
    const precio = Number(item["Precio"] || item["precio"] || 0);
    const dt = created ? new Date(created) : null;
    if (dt && dt.getMonth() === mes && dt.getFullYear() === año) ingresos += (isNaN(precio) ? 0 : precio);
  });

  // Gastos mes: por ahora 0 (implementamos módulo gastos después)
  const gastos = 0;

  // Alquilados próximo finde (viernes-sábado-domingo próximos)
  const nextWeekend = obtenerProximoFinde();
  const alquileresFinde = data.filter(item => {
    const retiro = item["Retiro"] || item["retiro"] || "";
    const devolucion = item["Devolución"] || item["devolucion"] || "";
    // Si la fecha de retiro o la fecha de devolución cae dentro del finde
    const r = retiro ? new Date(retiro) : null;
    const d = devolucion ? new Date(devolucion) : null;
    return (r && r >= nextWeekend.start && r <= nextWeekend.end) || (d && d >= nextWeekend.start && d <= nextWeekend.end);
  });

  // Actualizar DOM en dashboard si existen
  const reservasEl = document.getElementById("reservasSemana");
  if (reservasEl) reservasEl.innerText = reservasEstaSemana;

  const ingresosEl = document.getElementById("ingresosMes");
  if (ingresosEl) ingresosEl.innerText = `$${ingresos}`;

  const gastosEl = document.getElementById("gastosMes");
  if (gastosEl) gastosEl.innerText = `$${gastos}`;

  const findeCountEl = document.getElementById("finDeSemanaCount");
  const findeListEl = document.getElementById("finDeSemanaList");
  if (findeCountEl) findeCountEl.innerText = alquileresFinde.length;
  if (findeListEl) {
    if (alquileresFinde.length === 0) {
      findeListEl.innerText = "—";
    } else {
      findeListEl.innerText = alquileresFinde.slice(-5).map(a => `${a["Vestido"] || a["vestido"] || ""} — ${a["Cliente"] || a["cliente"] || ""}`).join(" · ");
    }
  }

  // Lista "Últimos alquileres" en dashboard (si existe)
  const ultimos = document.getElementById("ultimosAlq");
  if (ultimos) {
    const last = data.slice(-6).reverse();
    ultimos.innerHTML = last.map(i => `<div style="background:#fff;padding:8px;border-radius:8px;margin-bottom:8px;">${formatDateTime(i["Timestamp"]||"")} — <strong>${escapeHtml(i["Cliente"]||"")}</strong> • ${escapeHtml(i["Vestido"]||"")} • $${i["Precio"]||""}</div>`).join("");
  }
}

function obtenerProximoFinde(){
  const hoy = new Date();
  // calcular próximo viernes
  const diasParaViernes = (5 - hoy.getDay() + 7) % 7 || 7; // si hoy es viernes -> siguiente viernes
  const viernes = new Date(hoy);
  viernes.setDate(hoy.getDate() + diasParaViernes);
  viernes.setHours(0,0,0,0);

  const domingo = new Date(viernes);
  domingo.setDate(viernes.getDate() + 2);
  domingo.setHours(23,59,59,999);

  return { start: viernes, end: domingo };
}

/* ======== FILTRO UI ======== */
function aplicarFiltro() {
  renderTabla(ALQUILERES_DATA);
}

/* ======== Iniciar carga ======== */
cargarAlquileres();

// Si estamos en la página de dashboard, recargar cada 90s (opcional)
if (location.pathname.endsWith("/panelfinal/index.html") || location.pathname.endsWith("/panelfinal/")) {
  setInterval(cargarAlquileres, 90000);
}
