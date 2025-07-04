import { API_KEY, BASE_ID } from "./airtableConfig.js";

let clientasCache = [];
const listaClientasEl = document.getElementById("listaClientas");
const buscador = document.getElementById("buscador");
const form = document.getElementById("formClienta");
const formTitle = document.getElementById("formTitle");
const inputId = document.getElementById("clientaId");
const inputNombre = document.getElementById("nombreClienta");
const inputCelular = document.getElementById("celularClienta");
const inputEmail = document.getElementById("emailClienta");
const btnCancelar = document.getElementById("btnCancelar");

async function cargarClientas() {
  try {
    const resp = await fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS?maxRecords=200&view=Grid%20view`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const data = await resp.json();
    clientasCache = data.records.map(r => ({ 
      id: r.id, 
      nombre: r.fields.Nombre || "", 
      celular: r.fields.Celular || "", 
      email: r.fields.Mail || "" 
    }));
    mostrarLista(clientasCache);
  } catch (error) {
    console.error("Error cargando clientas:", error);
  }
}

function mostrarLista(clientas) {
  listaClientasEl.innerHTML = clientas.length ? clientas.map(c => `<li data-id="${c.id}">${c.nombre}</li>`).join("") : "<li>No hay clientas</li>";
}

buscador.addEventListener("input", () => {
  const val = buscador.value.toLowerCase().trim();
  const filtradas = clientasCache.filter(c => c.nombre.toLowerCase().includes(val));
  mostrarLista(filtradas);
});

listaClientasEl.addEventListener("click", e => {
  if (e.target.tagName === "LI" && e.target.dataset.id) {
    const clienta = clientasCache.find(c => c.id === e.target.dataset.id);
    if (!clienta) return;
    cargarFormulario(clienta);
  }
});

function cargarFormulario(clienta) {
  formTitle.textContent = "Editar clienta";
  inputId.value = clienta.id;
  inputNombre.value = clienta.nombre;
  inputCelular.value = clienta.celular;
  inputEmail.value = clienta.email;
  btnCancelar.style.display = "inline-block";
}

btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
});

function limpiarFormulario() {
  formTitle.textContent = "Agregar nueva clienta";
  inputId.value = "";
  inputNombre.value = "";
  inputCelular.value = "";
  inputEmail.value = "";
  btnCancelar.style.display = "none";
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const id = inputId.value;
  const nombre = inputNombre.value.trim();
  const celular = inputCelular.value.trim();
  const email = inputEmail.value.trim();

  if (!nombre) return alert("El nombre es obligatorio.");

  const body = {
    fields: {
      Nombre: nombre,
      Celular: celular,
      Mail: email
    }
  };

  try {
    let resp;
    if (id) {
      // Editar
      resp = await fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
      });
    } else {
      // Crear
      resp = await fetch(`https://api.airtable.com/v0/${BASE_ID}/CLIENTAS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
      });
    }
    const data = await resp.json();
    if (data.id) {
      alert("Clienta guardada con éxito!");
      limpiarFormulario();
      cargarClientas();
    } else {
      alert("Error al guardar clienta");
    }
  } catch (error) {
    console.error("Error guardando clienta:", error);
    alert("Error al guardar clienta");
  }
});

cargarClientas();
