/* ======== Config ======== */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxypuZYU4cctCcLuuFvKe6IjaT2xN4VoXwp2DdzSGA4fxnoWQozpOgGy9EfFTeGJYPc-w/exec";

/* ======== Estado local ======== */
let ALQUILERES_DATA = [];
let CLIENTES_DATA = []; // array de objetos {ID, Nombre, Apellido, Celular, Notas}
let VESTIDOS_DATA = []; // array de objetos {ID, Nombre, PrecioBase, ...}

/* ======== UTIL: fetch sheet as array of objects ======== */
async function fetchSheetAsObjects(sheetName) {
  const res = await fetch(`${WEB_APP_URL}?sheet=${encodeURIComponent(sheetName)}`);
  const data = await res.json(); // array de arrays
  if (!Array.isArray(data) || data.length < 1) return [];
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] !== undefined ? row[i] : "");
    return obj;
  });
}

/* ======== CARGAS INICIALES ======== */
async function cargarDatosIniciales() {
  // Cargar clientes y vestidos y alquileres
  CLIENTES_DATA = await fetchSheetAsObjects("CLIENTES");
  VESTIDOS_DATA = await fetchSheetAsObjects("VESTIDOS");
  // Cargar alquileres (igual que antes)
  const alqu = await fetchSheetAsObjects("ALQUILERES");
  ALQUILERES_DATA = alqu;
  renderTabla(ALQUILERES_DATA);
  actualizarWidgets(ALQUILERES_DATA);
}
cargarDatosIniciales();

/* ======== Modal control ======== */
function abrirModal() {
  document.getElementById("modal").style.display = "flex";
  // limpiar y preparar
  document.getElementById("buscarCliente").value = "";
  document.getElementById("clienteId").value = "";
  document.getElementById("vestidoId").value = "";
  document.getElementById("vestidoInfo").innerText = "(ingresá ID para ver nombre y precio)";
  document.getElementById("precioBase").value = "";
  document.getElementById("descuento").value = 0;
  document.getElementById("precioFinal").value = "";
  document.getElementById("debe").value = 0;
  document.getElementById("notas").value = "";
  document.getElementById("panelNuevoCliente").style.display = "none";
}
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

/* ======== Buscar cliente - autocompletar simple ======== */
document.addEventListener("DOMContentLoaded", () => {
  const buscarEl = document.getElementById("buscarCliente");
  const btnNuevo = document.getElementById("btnAgregarClienteNuevo");
  const panelNuevo = document.getElementById("panelNuevoCliente");
  const guardarClienteBtn = document.getElementById("guardarClienteBtn");

  // Toggle panel nuevo cliente
  btnNuevo.addEventListener("click", (ev) => {
    ev.preventDefault();
    panelNuevo.style.display = panelNuevo.style.display === "none" ? "block" : "none";
  });

  // Guardar cliente nuevo
  guardarClienteBtn.addEventListener("click", async () => {
    const nombre = document.getElementById("nuevoNombre").value.trim();
    const apellido = document.getElementById("nuevoApellido").value.trim();
    const celular = document.getElementById("nuevoCelular").value.trim();
    const notas = document.getElementById("nuevoNotas").value.trim();

    if (!nombre || !apellido) { alert("Completa nombre y apellido"); return; }

    // Generar ID simple: 1 + max ID actual (si están vacíos usa 1)
    const maxId = CLIENTES_DATA.reduce((m, c) => Math.max(m, Number(c["ID"] || 0)), 0);
    const newId = String(maxId + 1);

    const rowObj = {
      ID: newId,
      Nombre: nombre,
      Apellido: apellido,
      Celular: celular,
      Notas: notas
    };

    // Post al script: sheet CLIENTES, row = object (ordenado por headers dentro doPost)
    try {
      const resp = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheet: "CLIENTES", row: rowObj })
      });
      const j = await resp.json();
      if (j.result === "ok" || resp.ok) {
        // actualizar clientes local y seleccionar el nuevo
        CLIENTES_DATA.push(rowObj);
        document.getElementById("clienteId").value = newId;
        document.getElementById("buscarCliente").value = `${nombre} ${apellido} • ${celular}`;
        panelNuevo.style.display = "none";
        alert("Cliente creado y seleccionado");
      } else {
        console.error("Error guardando cliente", j);
        alert("No se pudo crear cliente");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al crear cliente");
    }
  });

  // Autocomplete simple: al escribir, buscar coincidencias y si exact match elegir
  buscarEl.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { document.getElementById("clienteId").value = ""; return; }
    const found = CLIENTES_DATA.find(c => {
      const combined = `${c["Nombre"] || ""} ${c["Apellido"] || ""} ${c["Celular"] || ""}`.toLowerCase();
      return combined.includes(q);
    });
    if (found) {
      document.getElementById("clienteId").value = found["ID"] || "";
      // show nicer text
      buscarEl.value = `${found["Nombre"] || ""} ${found["Apellido"] || ""} • ${found["Celular"] || ""}`;
    } else {
      document.getElementById("clienteId").value = "";
    }
  });
});

/* ======== Buscar vestido por ID ======== */
document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "vestidoId") {
    const id = e.target.value.trim();
    if (!id) {
      document.getElementById("vestidoInfo").innerText = "(ingresá ID para ver nombre y precio)";
      document.getElementById("precioBase").value = "";
      calcularPrecioFinal();
      return;
    }
    const found = VESTIDOS_DATA.find(v => String(v["ID"]) === String(id));
    if (found) {
      document.getElementById("vestidoInfo").innerText = `${found["Nombre"] || ""} — ${found["Color"] || ""} — ${found["Tipo"] || ""}`;
      document.getElementById("precioBase").value = found["PrecioBase"] || "";
      calcularPrecioFinal();
    } else {
      document.getElementById("vestidoInfo").innerText = "No encontrado (revisá ID)";
      document.getElementById("precioBase").value = "";
      calcularPrecioFinal();
    }
  }

  if (e.target && e.target.id === "descuento") {
    calcularPrecioFinal();
  }

  if (e.target && e.target.id === "retiro") {
    // calcular devolución por defecto
    const r = e.target.value;
    if (r) {
      const dev = calcularDevolucionDefault(r);
      document.getElementById("devolucion").value = dev;
    }
  }
});

/* ======== Precio final cálculo ======== */
function calcularPrecioFinal() {
  const base = Number(document.getElementById("precioBase").value || 0);
  const ds = Number(document.getElementById("descuento").value || 0);
  if (isNaN(base)) return;
  let final = base;
  if (ds > 0) {
    // si descuento > 0 se interpreta como porcentaje
    final = base - (base * ds / 100);
  }
  document.getElementById("precioFinal").value = Number(final.toFixed(2));
}

/* ======== Devolucion por defecto ======== */
function calcularDevolucionDefault(retiroDateStr) {
  const r = new Date(retiroDateStr);
  if (isNaN(r)) return "";
  const day = r.getDay(); // 0 dom ..6 sab
  const copy = new Date(r);
  if (day === 5 || day === 6 || day === 0) { // vie (5), sab (6), dom (0) -> siguiente lunes
    // avanzar hasta lunes (1)
    const diasParaLunes = ((8 - day) % 7); // si day=5 -> 3, 6->2,0->1
    copy.setDate(copy.getDate() + diasParaLunes);
  } else {
    // día de semana -> +3 días
    copy.setDate(copy.getDate() + 3);
  }
  // formato yyyy-mm-dd para input[type=date]
  const yyyy = copy.getFullYear();
  const mm = String(copy.getMonth()+1).padStart(2,'0');
  const dd = String(copy.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

/* ======== Guardar alquiler (POST) ======== */
async function guardarAlquiler() {
  const clienteId = document.getElementById("clienteId").value || "";
  const clienteText = document.getElementById("buscarCliente").value.trim();
  const vestidoId = document.getElementById("vestidoId").value.trim();
  const retiro = document.getElementById("retiro").value;
  const devolucion = document.getElementById("devolucion").value;
  const precioBase = Number(document.getElementById("precioBase").value || 0);
  const descuento = Number(document.getElementById("descuento").value || 0);
  const precioFinal = Number(document.getElementById("precioFinal").value || 0);
  const debe = Number(document.getElementById("debe").value || 0);
  const notas = document.getElementById("notas").value.trim();

  if (!clienteId) {
    alert("Seleccioná o creá un cliente");
    return;
  }
  if (!vestidoId) {
    alert("Ingresá ID del vestido");
    return;
  }
  if (!retiro || !devolucion) {
    alert("Completá fechas de retiro y devolución");
    return;
  }

  // Obtener datos adicionales
  const clienteObj = CLIENTES_DATA.find(c => String(c["ID"]) === String(clienteId)) || {};
  const vestidoObj = VESTIDOS_DATA.find(v => String(v["ID"]) === String(vestidoId)) || {};

  const rowObj = {
    Timestamp: new Date().toLocaleString("es-UY"),
    ClienteID: clienteId,
    ClienteNombre: clienteObj["Nombre"] || clienteText,
    ClienteApellido: clienteObj["Apellido"] || "",
    VestidoID: vestidoId,
    VestidoNombre: vestidoObj["Nombre"] || "",
    Retiro: retiro,
    Devolucion: devolucion,
    PrecioBase: precioBase,
    Descuento: descuento,
    PrecioFinal: precioFinal,
    Debe: debe,
    Notas: notas,
    Estado: "Preparado"
  };

  try {
    const resp = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ sheet: "ALQUILERES", row: rowObj })
    });
    const j = await resp.json();
    if (j.result === "ok" || resp.ok) {
      alert("Alquiler guardado");
      cerrarModal();
      // refrescar datos
      await cargarDatosIniciales();
    } else {
      console.error("Error guardar alquiler", j);
      alert("No se pudo guardar alquiler");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión al guardar alquiler");
  }
}

/* ======== Render tabla simplificada ======== */
function renderTabla(data) {
  const tbody = document.getElementById("tablaAlquileres");
  if (!tbody) return;
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">No hay alquileres</td></tr>`;
    return;
  }
  // mostrar en orden inverso (últimos arriba)
  const last = data.slice().reverse();
  let html = "";
  last.forEach(item => {
    html += `<tr>
      <td>${escapeHtml(item["Timestamp"]||"")}</td>
      <td>${escapeHtml((item["ClienteNombre"]||"") + " " + (item["ClienteApellido"]||""))}</td>
      <td>${escapeHtml(item["VestidoID"]||"")} — ${escapeHtml(item["VestidoNombre"]||"")}</td>
      <td>${formatDate(item["Retiro"]||"")}</td>
      <td>${formatDate(item["Devolucion"]||"")}</td>
      <td>$${item["PrecioFinal"]||item["PrecioBase"]||""}</td>
      <td>$${item["Debe"]||0}</td>
      <td>${escapeHtml(item["Notas"]||"")}</td>
      <td>${escapeHtml(item["Estado"]||"")}</td>
    </tr>`;
  });
  tbody.innerHTML = html;
}

/* ======== Helpers (formateo) ======== */
function formatDate(d){
  if(!d) return "";
  try {
    const dt = new Date(d);
    if(isNaN(dt)) return d;
    return dt.toLocaleDateString("es-UY");
  } catch(e) { return d; }
}
function escapeHtml(text){
  return String(text || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ======== Widgets (actualizar) ======== */
function actualizarWidgets(data) {
  // reusar lógica previa o dejar simple por ahora
  // ...
}

/* ======== Recarga periódica opcional ======== */
setInterval(cargarDatosIniciales, 120000); // refresca cada 2 min
