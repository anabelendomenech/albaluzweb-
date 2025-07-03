

async function cargarVestidos() {
    const url = `https://www.googleapis.com/drive/v3/files?q='1-Ex9DNg9wjFRPrvDX457gmBw0I7hvk_W'+in+parents+and+mimeType+contains+'image/'&key=AIzaSyAhMwiBz4IQ5QEB_lM4RRanekuWR52zdvY&fields=files(id,name,mimeType)&orderBy=name`;
//https://drive.google.com/drive/folders/1-Ex9DNg9wjFRPrvDX457gmBw0I7hvk_W?usp=sharing
     try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.files) {
      throw new Error("No se recibieron archivos. Verificá el permiso público de la carpeta.");
    }

    mostrarVestidos(data.files);
  } catch (error) {
    console.error('Error al cargar vestidos:', error);
  }
}

function mostrarVestidos(lista) {
  const contenedor = document.getElementById('catalogo');
  contenedor.innerHTML = '';
  contenedor.style.marginTop = '100px'; // para que no tape el título

  lista.forEach((file) => {
    const div = document.createElement('div');
    div.className = 'vestido';

    const img = document.createElement('img');
    img.src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w600`; // Usa thumbnail para evitar errores de permisos
    img.alt = file.name;

    const nombre = document.createElement('p');
    nombre.textContent = file.name.replace(/\.(jpg|jpeg|png)$/i, '');

    div.appendChild(img);
    div.appendChild(nombre);
    contenedor.appendChild(div);
  });
}
