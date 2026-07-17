// ⚠️ Pegá acá la URL de tu Web App de Google Apps Script (ver README.md paso 4)
const API_URL = 'https://script.google.com/macros/s/AKfycbzn_KzFf9f7dHM36fNMHsaYvOYTaX45THz29dydMDDlRjGtwm477nlXGzbkuRHONXMvTg/exec';

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
