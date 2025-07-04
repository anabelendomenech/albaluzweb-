document.addEventListener('DOMContentLoaded', () => {
  const catalogoContainer = document.getElementById('catalogo');
  const filtroColor = document.getElementById('filtro-color');

  if (!catalogoContainer || !filtroColor) return; // Evitar errores si no existen

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
        <a href="https://wa.me/59898256239" target="_blank" rel="noopener" class="btn-wsp">Consultar</a>
      `;

      catalogoContainer.appendChild(card);
    });
  }

  filtroColor.addEventListener('change', mostrarVestidos);

  cargarVestidos();
});
