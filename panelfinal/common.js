// ⚠️ Pegá acá la URL de tu Web App de Google Apps Script (ver README.md paso 4)
// Backend "ALBALUZ - Backend" (Fase 1 + Agenda de Pruebas), desplegado 2026-07-18.
const API_URL = 'https://script.google.com/macros/s/AKfycbyKCB-mN7pC_OaOJoNhqgsrxCA7ra1rJ966tG-YHCEjxiT_yfnYvkHkimd3PGA6fzjVgg/exec';

async function apiGet(action, params = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${API_URL}?${qs}`);
  return res.json();
}

// Usamos text/plain a propósito: evita el preflight CORS que Apps Script no maneja bien.
async function apiPost(action, data = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return res.json();
}

// Junta varios recursos en un solo viaje al servidor (ej: apiBundle(['alquileres','vestidos']))
// en vez de un apiGet por cada uno, para que la pantalla cargue más rápido.
async function apiBundle(recursos) {
  return apiGet('getBundle', { recursos: recursos.join(',') });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fmtMoney(n) {
  return '$' + (Number(n) || 0).toLocaleString('es-UY');
}

function fmtDate(d) {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#4a1e33;color:#fff;padding:12px 22px;border-radius:999px;font-size:.88rem;z-index:100;box-shadow:0 6px 20px rgba(0,0,0,.2);transition:opacity .3s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = '0', 2200);
}

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute('data-nav') === page) a.classList.add('active');
  });
  const sel = document.getElementById('mobileNav');
  if (sel) sel.value = page;
}
document.addEventListener('DOMContentLoaded', setActiveNav);

// ---- Disponibilidad real por fechas ----
// Dos rangos se solapan si el inicio de uno es antes o igual al fin del otro, en ambas direcciones.
function rangosSeSolapan(inicioA, finA, inicioB, finB) {
  if (!inicioA || !finA || !inicioB || !finB) return false;
  return new Date(inicioA) <= new Date(finB) && new Date(inicioB) <= new Date(finA);
}

// Un alquiler puede incluir más de una prenda (el vestido principal + accesorios/otro
// vestido agregados). Devuelve la lista completa {id, desc, precio} de ese alquiler.
function vestidosDeAlquiler(a) {
  const items = [];
  if (a.VestidoID) items.push({ id: a.VestidoID, desc: a.VestidoDesc, tipo: 'principal' });
  if (a.ItemsExtra) {
    try {
      JSON.parse(a.ItemsExtra).forEach(it => items.push({ id: it.vestidoId, desc: it.vestidoDesc, precio: it.precio, tipo: it.tipo || 'vestido' }));
    } catch (e) { /* ItemsExtra corrupto o vacío: se ignora */ }
  }
  return items;
}

// Precio de UNA prenda dentro de un alquiler que puede tener varias (vestido principal +
// accesorios/otro vestido agregados). Sirve para repartir ingresos/estadísticas por prenda.
function precioDePrendaEnAlquiler(a, vestidoId) {
  const items = vestidosDeAlquiler(a);
  const item = items.find(it => String(it.id) === String(vestidoId));
  if (!item) return 0;
  if (item.precio !== undefined) return Number(item.precio) || 0;
  // Es la prenda principal: su precio es el total menos lo que ya tienen asignado los extras.
  const sumExtra = items.filter(it => it.precio !== undefined).reduce((s, it) => s + (Number(it.precio) || 0), 0);
  return Math.max((Number(a.PrecioBase) || 0) - sumExtra, 0);
}

// Devuelve el alquiler activo (no devuelto) que ocupa ese vestido en esas fechas, o null si está libre.
// Revisa todas las prendas del alquiler (no solo la principal). excludeId sirve para no
// chocar contra el propio alquiler cuando se edita uno existente.
function alquilerQueOcupa(vestidoId, fechaRetiro, fechaDevolucion, alquileres, excludeId) {
  return alquileres.find(a =>
    a.Estado !== 'Devuelto' && a.Estado !== 'Anulado' &&
    (!excludeId || String(a.ID) !== String(excludeId)) &&
    rangosSeSolapan(fechaRetiro, fechaDevolucion, a.FechaRetiro, a.FechaDevolucion) &&
    vestidosDeAlquiler(a).some(v => String(v.id) === String(vestidoId))
  );
}

// Próximo fin de semana (viernes a domingo). Si hoy ya es finde, usa el actual.
function calcularProximoFindeJS(hoy) {
  const diaSemana = hoy.getDay();
  let diasHastaViernes;
  if (diaSemana === 0) diasHastaViernes = -2;
  else if (diaSemana >= 5) diasHastaViernes = 5 - diaSemana;
  else diasHastaViernes = 5 - diaSemana;
  const viernes = new Date(hoy.getTime() + diasHastaViernes * 86400000);
  const domingo = new Date(viernes.getTime() + 2 * 86400000);
  domingo.setHours(23, 59, 59, 999);
  return { viernes, domingo };
}
function proximaOcupacion(vestidoId, alquileres) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const activos = alquileres
    .filter(a => String(a.VestidoID) === String(vestidoId) && a.Estado !== 'Devuelto' && a.Estado !== 'Anulado' && a.FechaDevolucion && new Date(a.FechaDevolucion) >= hoy)
    .sort((a, b) => new Date(a.FechaRetiro) - new Date(b.FechaRetiro));
  return activos[0] || null;
}

// ---- Semana (para la Agenda de Pruebas) ----
// Devuelve el lunes y el domingo de la semana de `hoy`. offsetSemanas desplaza a semanas anteriores (−1) o próximas (+1).
function calcularSemanaJS(hoy, offsetSemanas = 0) {
  const d = new Date(hoy); d.setHours(0, 0, 0, 0);
  const dia = d.getDay(); // 0 dom .. 6 sab
  const diasDesdeLunes = dia === 0 ? 6 : dia - 1;
  const lunes = new Date(d.getTime() + (offsetSemanas * 7 - diasDesdeLunes) * 86400000);
  lunes.setHours(0, 0, 0, 0);
  const domingo = new Date(lunes.getTime() + 6 * 86400000);
  domingo.setHours(23, 59, 59, 999);
  return { lunes, domingo };
}

// Parsea una fecha respetando el día LOCAL. Una cadena "YYYY-MM-DD" sola la interpreta
// JS como medianoche UTC, lo que en Uruguay (UTC-3) la corre un día para atrás. Esto lo evita.
function parseFechaLocal(v) {
  if (!v) return null;
  if (typeof v === 'string') {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

// Normaliza la hora a "HH:MM". Viene como "HH:MM" (ideal, si la columna es texto),
// pero si la planilla la guardó como valor de tiempo, la recupera igual.
function fmtHora(v) {
  if (!v && v !== 0) return '';
  if (typeof v === 'string') {
    // "HH:MM" plano (columna guardada como texto): usar tal cual.
    const plano = v.match(/^\s*(\d{1,2}):(\d{2})\s*$/);
    if (plano) return `${plano[1].padStart(2, '0')}:${plano[2]}`;
  }
  // Date o ISO con fecha (la planilla lo guardó como valor de tiempo): usar la hora LOCAL.
  const d = new Date(v);
  if (!isNaN(d)) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const m = String(v).match(/(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : String(v);
}

// "lunes 21 de jul" — encabezado de cada día en la agenda.
function fmtDiaLargo(d) {
  const date = new Date(d);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'short' });
}

// ---- Contacto (WhatsApp / Instagram) ----
// Normaliza un teléfono uruguayo a formato wa.me: solo dígitos, sin 0 inicial, con 598 adelante.
function telWhatsApp(telefono) {
  let d = String(telefono || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('598')) return d;
  if (d.startsWith('0')) d = d.slice(1);
  return '598' + d;
}
// Link de WhatsApp con mensaje ya escrito. Devuelve '' si no hay teléfono.
function linkWhatsApp(telefono, mensaje) {
  const t = telWhatsApp(telefono);
  if (!t) return '';
  const q = mensaje ? '?text=' + encodeURIComponent(mensaje) : '';
  return `https://wa.me/${t}${q}`;
}
// Link a un perfil de Instagram (acepta handle con o sin @, o una URL completa). '' si vacío.
function linkInstagram(handle) {
  const h = String(handle || '').trim();
  if (!h) return '';
  if (/^https?:\/\//i.test(h)) return h;
  return 'https://instagram.com/' + h.replace(/^@/, '');
}

// Próximo lunes a partir de una fecha (o de hoy). Si `desde` ya es lunes, devuelve el siguiente.
function proximoLunes(desde) {
  const base = desde ? (parseFechaLocal(desde) || new Date(desde)) : new Date();
  const d = new Date(base); d.setHours(0, 0, 0, 0);
  const dia = d.getDay(); // 0 dom .. 1 lun .. 6 sab
  const faltan = ((8 - dia) % 7) || 7; // días hasta el próximo lunes (nunca 0)
  d.setDate(d.getDate() + faltan);
  return d;
}
// Cumpleaños se guarda sin año, como texto "DD/MM". Esto lee tanto ese formato
// como fechas viejas con año (ya guardadas antes de este cambio).
function parseDiaMes(v) {
  if (!v) return null;
  if (typeof v === 'string') {
    const m = v.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (m) {
      const dia = Number(m[1]), mes = Number(m[2]);
      if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12) return { dia, mes };
    }
  }
  const d = parseFechaLocal(v);
  if (!d) return null;
  return { dia: d.getDate(), mes: d.getMonth() + 1 };
}
function formatDiaMes(dia, mes) {
  dia = Number(dia); mes = Number(mes);
  if (!dia || !mes) return '';
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
}
// true si el mes del cumpleaños coincide con el mes actual.
function esMesCumple(cumple) {
  const dm = parseDiaMes(cumple);
  return !!dm && dm.mes === new Date().getMonth() + 1;
}
// Mensaje de saludo de cumpleaños con el 15% off (texto definido por la dueña).
function mensajeCumple(nombre) {
  return `Feliz cumple ${nombre || ''}! Esperamos que estés pasando un bonito día 🎉 Tenés un descuento del 15% en tu próximo alquiler para festejarlo, válido por el resto del mes. Es intransferible. 💛 ALBALUZ`;
}

// Botón de contacto: WhatsApp si hay teléfono; si no hay teléfono pero sí Instagram, el acceso al perfil en su lugar. '' si no hay ninguno.
function botonContacto(telefono, instagram, mensajeWA, texto) {
  texto = texto || '💬';
  const wa = linkWhatsApp(telefono, mensajeWA);
  if (wa) return `<a class="btn ghost sm" href="${wa}" target="_blank" onclick="event.stopPropagation()">${texto}</a>`;
  const ig = linkInstagram(instagram);
  if (ig) return `<a class="btn ghost sm" href="${ig}" target="_blank" onclick="event.stopPropagation()">📷</a>`;
  return '';
}

// ---- Actualización optimista ----
// Replica en el navegador el cálculo que hace el backend (estadoPagoDe en Code.gs),
// para poder mostrar el resultado al instante sin esperar la vuelta del servidor.
function estadoPagoLocal(cobrado, precioFinal) {
  if (cobrado <= 0) return 'Pendiente';
  return cobrado >= precioFinal ? 'Pagado' : 'Seña';
}
