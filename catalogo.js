const catalogoContainer = document.getElementById('catalogo');
const filtroColor = document.getElementById('filtro-color');

let vestidos = [];

async function cargarVestidos() {
  try {
    const res = await fetch('vestidos.json');
    vestidos = await res.json();
    mostrarVestidos();
  } catch (e) {
    console.error('Error al cargar vestidos:', e);
  }
}

function mostrarVestidos() {
  let colorSeleccionado = filtroColor.value;

  let vestidosFiltrados = vestidos.filter(v => colorSeleccionado === 'todos' || v.color === colorSeleccionado);

  catalogoContainer.innerHTML = '';

  vestidosFiltrados.forEach(vestido => {
    const card = document.createElement('div');
    card.className = 'vestido-card';

    card.innerHTML = `
      <img src="${vestido.url}" alt="${vestido.descripcion}" />
      <h3>${vestido.nombre}</h3>
      <p><strong>Talle:</strong> ${vestido.talle}</p>
      <p><strong>Color:</strong> ${vestido.color}</p>
      <p><strong>Precio:</strong> Consultar por WhatsApp</p>
      <a href="https://wa.me/59898256239" target="_blank" class="btn-wsp">Consultar</a>
    `;

    catalogoContainer.appendChild(card);
  });
}

filtroColor.addEventListener('change', mostrarVestidos);

window.addEventListener('DOMContentLoaded', cargarVestidos);

// Código para mostrar la galería de nueva colección en index.html
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider');

  fetch('vestidos.json')
    .then(res => res.json())
    .then(vestidos => {
      const nuevaColeccion = vestidos.slice(0, 10);

      nuevaColeccion.forEach(v => {
        const div = document.createElement('div');
        div.innerHTML = `
          <img src="${v.url}" alt="${v.descripcion}" />
          <h3>${v.nombre}</h3>
          <p><strong>Talle:</strong> ${v.talle}</p>
          <a href="https://wa.me/59898256239" target="_blank" class="btn-wsp">Consultar</a>
        `;
        slider.appendChild(div);
      });

      // Auto scroll simple para slider horizontal
      let scrollPos = 0;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      setInterval(() => {
        scrollPos += 1;
        if (scrollPos > maxScroll) scrollPos = 0;
        slider.scrollTo(scrollPos, 0);
      }, 40);
    });
});

