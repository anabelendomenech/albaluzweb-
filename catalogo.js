// const { apiKey, baseId } = airtableConfig;


// let vestidos = [];

// async function cargarCatalogo() {
//   const res = await fetch(`https://api.airtable.com/v0/${baseId}/VESTIDOS`, {
//     headers: { Authorization: `Bearer ${apiKey}` }
//   });

//   const data = await res.json();
//   vestidos = data.records;

//   cargarColores();
//   mostrarVestidos(vestidos);
// }

// function cargarColores() {
//   const filtroColor = document.getElementById("filtro-color");
//   const colores = new Set(vestidos.map(v => v.fields.Color).filter(Boolean));

//   colores.forEach(color => {
//     const op = document.createElement("option");
//     op.value = color;
//     op.textContent = color;
//     filtroColor.appendChild(op);
//   });
// }

// function mostrarVestidos(lista) {
//   const contenedor = document.getElementById("catalogo");
//   contenedor.innerHTML = "";

//   lista.forEach(vestido => {
//     const nombre = vestido.fields.Nombre || "Vestido";
//     const talle = vestido.fields.Talle || "-";
//     const color = vestido.fields.Color || "-";
//     const tipo = vestido.fields.Tipo || "-";
//     const foto = vestido.fields.Foto && vestido.fields.Foto[0] && vestido.fields.Foto[0].url;

//     if (foto) {
//       const card = document.createElement("div");
//       card.className = "card-vestido";
//       card.innerHTML = `
//         <img src="${foto}" alt="${nombre}" />
//         <h3>${nombre}</h3>
//         <p><strong>Talle:</strong> ${talle}</p>
//         <p><strong>Color:</strong> ${color}</p>
//         <p><strong>Tipo:</strong> ${tipo}</p>
//       `;
//       contenedor.appendChild(card);
//     }
//   });
// }

// document.getElementById("filtro-color").addEventListener("change", aplicarFiltros);
// document.getElementById("filtro-tipo").addEventListener("change", aplicarFiltros);

// function aplicarFiltros() {
//   const colorSel = document.getElementById("filtro-color").value;
//   const tipoSel = document.getElementById("filtro-tipo").value;

//   const filtrados = vestidos.filter(v => {
//     const color = v.fields.Color || "";
//     const tipo = v.fields.Tipo || "";
//     return (!colorSel || color === colorSel) && (!tipoSel || tipo === tipoSel);
//   });

//   mostrarVestidos(filtrados);
// }

// cargarCatalogo();

import { AIRTABLE_API_KEY, BASE_ID } from './airtableConfig.js';

const CATALOGO_CONTAINER = document.getElementById("catalogo-vestidos");
const FILTRO_COLOR = document.getElementById("filtro-color");
const FILTRO_TIPO = document.getElementById("filtro-tipo");
const FECHA_CONSULTA = document.getElementById("fecha-consulta");

let todosLosVestidos = [];

async function cargarVestidos() {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/VESTIDOS?api_key=${AIRTABLE_API_KEY}`);
  const data = await res.json();
  todosLosVestidos = data.records;
  renderCatalogo(todosLosVestidos);
}

function renderCatalogo(lista) {
  CATALOGO_CONTAINER.innerHTML = "";
  lista.forEach(record => {
    const v = record.fields;
    const div = document.createElement("div");
    div.className = "vestido-item";
    div.innerHTML = `
      <img src="${v.Foto}" alt="${v.Nombre}" />
      <h3>${v.Nombre}</h3>
      <p><strong>Talle:</strong> ${v.Talle}</p>
      <p><strong>Color:</strong> ${v.Color}</p>
      <p><strong>Tipo:</strong> ${v.Tipo}</p>
      <button onclick="consultarDisponibilidad('${record.id}')">Consultar Disponibilidad</button>
    `;
    CATALOGO_CONTAINER.appendChild(div);
  });
}

FILTRO_COLOR.addEventListener("change", filtrar);
FILTRO_TIPO.addEventListener("change", filtrar);

function filtrar() {
  const color = FILTRO_COLOR.value;
  const tipo = FILTRO_TIPO.value;
  let filtrados = todosLosVestidos;

  if (color) filtrados = filtrados.filter(r => r.fields.Color === color);
  if (tipo) filtrados = filtrados.filter(r => r.fields.Tipo === tipo);

  renderCatalogo(filtrados);
}

window.consultarDisponibilidad = async function (vestidoId) {
  const fecha = FECHA_CONSULTA.value;
  if (!fecha) {
    alert("Seleccioná una fecha para consultar disponibilidad.");
    return;
  }

  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/CHECKLIST?api_key=${AIRTABLE_API_KEY}`);
  const data = await res.json();

  const yaReservado = data.records.some(record => {
    return record.fields.Vestido === [vestidoId] && record.fields.Fecha === fecha;
  });

  alert(yaReservado
    ? "Ese vestido ya está reservado para esa fecha."
    : "¡Disponible para alquilar en esa fecha!");
};

cargarVestidos();

