
const catalogoContainer = document.getElementById('catalogo-vestidos');
const filtroColor = document.getElementById('filtro-color');

async function cargarVestidos() {
    const url = `https://www.googleapis.com/drive/v3/files?q='1-Ex9DNg9wjFRPrvDX457gmBw0I7hvk_W'+in+parents+and+mimeType+contains+'image/'&key=AIzaSyAhMwiBz4IQ5QEB_lM4RRanekuWR52zdvY&fields=files(id,name,mimeType)&orderBy=name`;
//https://drive.google.com/drive/folders/1-Ex9DNg9wjFRPrvDX457gmBw0I7hvk_W?usp=sharing
    try {
        const respuesta = await fetch(url);
        const data = await respuesta.json();

        mostrarVestidos(data.files);
        crearOpcionesFiltro(data.files);
    } catch (error) {
        console.error('Error al cargar vestidos:', error);
    }
}

function mostrarVestidos(vestidos) {
    catalogoContainer.innerHTML = '';

    const colorSeleccionado = filtroColor.value.toLowerCase();

    vestidos.forEach(file => {
        const nameParts = file.name.replace(/\.[^/.]+$/, "").split(" "); // quita extensión
        const color = nameParts.find(p => p.toLowerCase().includes('azul') || p.toLowerCase().includes('rojo') || p.toLowerCase().includes('negro') || p.toLowerCase().includes('verde') || p.toLowerCase().includes('rosa') || p.toLowerCase().includes('plateado') || p.toLowerCase().includes('dorado') || p.toLowerCase().includes('blanco') || p.toLowerCase().includes('nude')) || 'Otro';

        if (colorSeleccionado !== 'todos' && color.toLowerCase() !== colorSeleccionado) return;

        const img = document.createElement('img');
        img.src = `https://drive.google.com/uc?id=${file.id}`;
        img.alt = file.name;
        img.className = 'vestido-img';

        const descripcion = document.createElement('p');
        descripcion.textContent = file.name.replace(/\.[^/.]+$/, "");

        const card = document.createElement('div');
        card.className = 'vestido-card';
        card.appendChild(img);
        card.appendChild(descripcion);

        catalogoContainer.appendChild(card);
    });
}

function crearOpcionesFiltro(vestidos) {
    const colores = new Set(['Todos']);

    vestidos.forEach(file => {
        const nameParts = file.name.toLowerCase();
        if (nameParts.includes('azul')) colores.add('Azul');
        if (nameParts.includes('rojo')) colores.add('Rojo');
        if (nameParts.includes('verde')) colores.add('Verde');
        if (nameParts.includes('negro')) colores.add('Negro');
        if (nameParts.includes('blanco')) colores.add('Blanco');
        if (nameParts.includes('rosa')) colores.add('Rosa');
        if (nameParts.includes('plateado')) colores.add('Plateado');
        if (nameParts.includes('dorado')) colores.add('Dorado');
        if (nameParts.includes('nude')) colores.add('Nude');
    });

    filtroColor.innerHTML = '';
    colores.forEach(color => {
        const option = document.createElement('option');
        option.value = color.toLowerCase();
        option.textContent = color;
        filtroColor.appendChild(option);
    });

    filtroColor.addEventListener('change', () => mostrarVestidos(vestidos));
}

document.addEventListener('DOMContentLoaded', cargarVestidos);
