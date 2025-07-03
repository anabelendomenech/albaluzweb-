document.addEventListener('DOMContentLoaded', () => {
  cargarVestidos();

  document.querySelectorAll('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.tipo || document.querySelector('.filtro[data-tipo].activo')?.dataset.tipo || 'todos';
      const color = btn.dataset.color || document.querySelector('.filtro[data-color].activo')?.dataset.color || 'todos';

      document.querySelectorAll('.filtro').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      filtrarVestidos(tipo, color);
    });
  });
});

let todosVestidos = [];

async function cargarVestidos() {
  try {
    const res = await fetch('vestidos.json');
    todosVestidos = await res.json();
    mostrarVestidos(todosVestidos);
  } catch (e) {
    document.getElementById('galeria').innerHTML = '<p>Error al cargar los vestidos.</p>';
  }
}

function mostrarVestidos(lista) {
  const galeria = document.getElementById('galeria');
  galeria.innerHTML = '';

  if (lista.length === 0) {
    galeria.innerHTML = '<p>No hay vestidos que coincidan con los filtros.</p>';
    return;
  }

  lista.forEach(v => {
    const div = document.createElement('div');
    div.classList.add('vestido');
    div.innerHTML = `
      <img src="${v.url}" alt="${v.descripcion}">
      <h3>${v.descripcion}</h3>
      <p>Color: ${v.color}</p>
      <p>Tipo: ${v.tipo}</p>
      <p>Talle: ${v.talle}</p>
    `;
    galeria.appendChild(div);
  });
}

function filtrarVestidos(tipo, color) {
  let filtrados = [...todosVestidos];

  if (tipo !== 'todos') {
    filtrados = filtrados.filter(v => v.tipo.toLowerCase() === tipo.toLowerCase());
  }

  if (color !== 'todos') {
    filtrados = filtrados.filter(v => v.color.toLowerCase() === color.toLowerCase());
  }

  mostrarVestidos(filtrados);
}
