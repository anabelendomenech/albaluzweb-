async function cargarVestidos() {
  try {
    const res = await fetch('vestidos.json');
    todosVestidos = await res.json();
    mostrarVestidos(todosVestidos);
  } catch (e) {
    document.getElementById('galeria').innerHTML = '<p>Error al cargar los vestidos.</p>';
  }
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
