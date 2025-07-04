import { API_KEY, BASE_ID } from "./airtableConfig.js";

// Módulos (pueden ser funciones que retornen HTML o imports dinámicos)
// Por ahora ejemplos simplificados, luego agregamos la lógica completa por módulo

const modules = {
  reservas: () => `<h1>Modulo Reservas</h1><p>Aquí va el contenido de Reservas</p>`,
  clientas: () => `<h1>Modulo Clientas</h1><p>Aquí va el contenido de Clientas</p>`,
  vestidos: () => `<h1>Modulo Vestidos</h1><p>Aquí va el contenido de Vestidos</p>`,
  checklist: () => `<h1>Modulo Checklist</h1><p>Aquí va el contenido de Checklist</p>`,
  finanzas: () => `<h1>Modulo Finanzas</h1><p>Aquí va el contenido de Finanzas</p>`,
  horarios: () => `<h1>Modulo Horarios</h1><p>Aquí va el contenido de Horarios</p>`
};

const sidebarLinks = document.querySelectorAll(".sidebar a");
const contentArea = document.getElementById("content-area");

function setActiveTab(tab) {
  sidebarLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.tab === tab);
  });
}

function loadTab(tab) {
  setActiveTab(tab);
  contentArea.innerHTML = modules[tab] ? modules[tab]() : "<p>Modulo no encontrado.</p>";
}

// Inicializamos con reservas
loadTab("reservas");

sidebarLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const tab = link.dataset.tab;
    loadTab(tab);
  });
});
