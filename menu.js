document.addEventListener('DOMContentLoaded', () => {
  // Por ejemplo, si tenés un menú hamburguesa, asegúrate que existan los elementos
  const btnMenu = document.getElementById('btn-menu');
  const menu = document.getElementById('menu');

  if (!btnMenu || !menu) return;

  btnMenu.addEventListener('click', () => {
    menu.classList.toggle('activo');
  });
});
