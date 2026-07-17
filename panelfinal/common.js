// ⚠️ Pegá acá la URL de tu Web App de Google Apps Script (ver README.md paso 4)
const API_URL = 'https://script.google.com/macros/s/AKfycbyoEJSjK9X0UlUGD2g11StJt4DQhENY2uhzp5JiewhMlvuXrw0AGWDeTxqxMyOW6qacEw/exec';

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

// Próximo alquiler activo (hoy o futuro) de un vestido, para mostrar "Ocupado hasta..." en el catálogo.
function proximaOcupacion(vestidoId, alquileres) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const activos = alquileres
    .filter(a => String(a.VestidoID) === String(vestidoId) && a.Estado !== 'Devuelto' && a.Estado !== 'Anulado' && a.FechaDevolucion && new Date(a.FechaDevolucion) >= hoy)
    .sort((a, b) => new Date(a.FechaRetiro) - new Date(b.FechaRetiro));
  return activos[0] || null;
}
