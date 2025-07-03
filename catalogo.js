const ID_CARPETA = "1-Ex9DNg9wjFRPrvDX457gmBw0I7hvk_W";
const galeria = document.getElementById("galeria");
const filtroColor = document.getElementById("filtro-color");

async function cargarVestidos() {
  const url = `https://www.googleapis.com/drive/v3/files?q='${ID_CARPETA}'+in+parents&key=AIzaSyD7A0RlH2kNzJ0&fields=files(id,name,mimeType)&orderBy=name`;

  const respuesta = await fetch(url);
  const datos = await respuesta.json();

  galeria.innerHTML = "";

  datos.files.forEach(vestido => {
    if (vestido.mimeType.startsWith("image/")) {
      const urlImagen = `https://drive.google.com/uc?id=${vestido.id}`;
      const nombre = vestido.name.replace(/\.[^/.]+$/, "");
      const color = detectarColor(nombre);

      const item = document.createElement("div");
      item.className = "vestido-item";
      item.setAttribute("data-color", color);

      item.innerHTML = `
        <img src="${urlImagen}" alt="${nombre}">
        <p>${nombre}</p>
      `;

      galeria.appendChild(item);
    }
  });
}

function detectarColor(nombre) {
  const colores = ["Azul", "Rojo", "Negro", "Verde", "Rosa", "Blanco"];
  const encontrado = colores.find(color => nombre.toLowerCase().includes(color.toLowerCase()));
  return encontrado || "Otro";
}

filtroColor.addEventListener("change", () => {
  const colorSeleccionado = filtroColor.value;
  document.querySelectorAll(".vestido-item").forEach(item => {
    if (!colorSeleccionado || item.dataset.color === colorSeleccionado) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});

cargarVestidos();
