// panelfinal/menu.js
document.addEventListener("DOMContentLoaded", () => {
  const side = document.getElementById("sideMenu");
  if (!side) {
    console.warn("menu.js: #sideMenu no encontrado (¿id cambiado o archivo cargado en otra ruta?).");
    return;
  }

  side.innerHTML = `
    <h2 class="menu-title">ALBALUZ</h2>
    <div class="menu-item" onclick="location.href='./index.html'">Dashboard</div>
    <div class="menu-item" onclick="location.href='./alquileres.html'">Alquileres</div>
    <div class="menu-item" onclick="location.href='./clientes.html'">Clientes</div>
    <div class="menu-item" onclick="location.href='./vestidos.html'">Vestidos</div>
    <div class="menu-item" onclick="location.href='./gastos.html'">Gastos</div>
    <div class="menu-item" onclick="location.href='./rendimiento.html'">Rendimiento</div>
    <div class="menu-item" onclick="logout()" style="margin-top:30px; color:#a33">Cerrar sesión</div>
  `;
});

function logout(){
  localStorage.removeItem("albaluzPanel");
  location.href = "./login.html";
}
