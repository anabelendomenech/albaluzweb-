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

// Devuelve el alquiler activo (no devuelto) que ocupa ese vestido en esas fechas, o null si está libre.
// excludeId sirve para no chocar contra el propio alquiler cuando se edita uno existente.
function alquilerQueOcupa(vestidoId, fechaRetiro, fechaDevolucion, alquileres, excludeId) {
  return alquileres.find(a =>
    String(a.VestidoID) === String(vestidoId) &&
    a.Estado !== 'Devuelto' && a.Estado !== 'Anulado' &&
    (!excludeId || String(a.ID) !== String(excludeId)) &&
    rangosSeSolapan(fechaRetiro, fechaDevolucion, a.FechaRetiro, a.FechaDevolucion)
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
    const m = v.match(/(\d{1,2}):(\d{2})/);
    if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  }
  const d = new Date(v);
  if (!isNaN(d)) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return String(v);
}

// "lunes 21 de jul" — encabezado de cada día en la agenda.
function fmtDiaLargo(d) {
  const date = new Date(d);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'short' });
}
