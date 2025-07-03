const API_KEY = 'AIzaSyAhMwiBz4IQ5QEB_lM4RRanekuWR52zdvY';
const FOLDER_ID = '1-Ex9DNg9wjFRPrvDX457gmBw0I7hvk_W';

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
  const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType contains 'image/'&key=${API_KEY}&fields=files(id,name)&orderBy=name`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    todosVestidos = data.files.map(file => {
      const [color, tipo, talle, ...descripcionArr] = file.name.split('_');
      return {
        id: file.id,
        nombre: file.name,
        tipo,
        color,
        talle,
        descripcion: descripcionArr.join(' ').replace('.jpg', '').replace('.jpeg', '').replace('.png', ''),
        url: `https://drive.google.com/uc?id=${file.id}`
      };
    });
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
