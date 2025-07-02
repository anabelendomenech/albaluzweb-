document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-ruleta');
  const cerrar = document.getElementById('cerrar-ruleta');
  const girarBtn = document.getElementById('girar');
  const resultado = document.getElementById('resultado');
  const canvas = document.getElementById('ruleta');
  const ctx = canvas.getContext('2d');

  const opciones = ["🎉 10% Descuento 🎉"];
  const colores = ['#FFD700'];

  function dibujarRuleta() {
    const total = opciones.length;
    const angulo = 2 * Math.PI / total;

    opciones.forEach((opcion, i) => {
      const inicio = i * angulo;
      const fin = inicio + angulo;

      ctx.beginPath();
      ctx.moveTo(150, 150);
      ctx.arc(150, 150, 150, inicio, fin);
      ctx.fillStyle = colores[i % colores.length];
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = '16px Arial';
      ctx.save();
      ctx.translate(150, 150);
      ctx.rotate(inicio + angulo / 2);
      ctx.textAlign = 'right';
      ctx.fillText(opcion, 140, 10);
      ctx.restore();
    });
  }

  dibujarRuleta();

  girarBtn.addEventListener('click', () => {
    resultado.textContent = `🎊 Tu código de descuento es: ALBALUZANIVERSARIO 🎊`;
  });

  cerrar.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  setTimeout(() => {
    modal.style.display = 'flex';
  }, 1000);
});
