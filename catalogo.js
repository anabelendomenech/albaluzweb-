const API_KEY = 'AIzaSyAhMwiBz4IQ5QEB_lM4RRanekuWR52zdvY';
const FOLDER_ID = '1-Ex9DNg9wjFRPrvDX457gmBw0I7hvk_W';

// Convierte el link completo de Drive a link directo usable en <img>
function getDriveImageUrlById(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

document.addEventListener('DOMContentLoaded', () => {
  cargarVestidos();

  // Evento para filtros
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
    if (!data.files) throw new Error('No files found');

    todosVestidos = data.files.map(file => {
      // Separar nombre para color, tipo, talle y descripcion
      const [color, tipo, talle, ...descripcionArr] = file.name.split('_');
      return {
        id: file.id,
        nombre: file.name,
        tipo,
        color,
        talle,
        descripcion: descripcionArr.join(' ').replace(/\.(jpg|jpeg|png)$/i, ''),
       url: `https://drive.google.com/uc?export=view&id=${file.id}`

      };
    });
    mostrarVestidos(todosVestidos);
  } catch (e) {
    document.getElementById('galeria').innerHTML = '<p>Error al cargar los vestidos.</p>';
    console.error('Error al cargar vestidos:', e);
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
      <img src="https://drive.google.com/uc?export=view&id=${v.id}" alt="${v.descripcion}">
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

