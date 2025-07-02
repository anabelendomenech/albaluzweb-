document.addEventListener('DOMContentLoaded', () => {
  const fechaEventoInput = document.getElementById('fecha-evento');
  const fechaCitaSelect = document.getElementById('fecha-cita');
  const horaCitaSelect = document.getElementById('hora-cita');
  const form = document.getElementById('form-agendar');
  const formMessage = document.getElementById('form-message');

  // Horarios base con media hora entre 15 y 18:30 hs
  const horariosBase = [
    "15", "15:30", "16", "16:30", "17", "17:30", "18", "18:30"
  ];

  // Simulación: horarios ocupados para fechas
  // Aquí en producción se consultaría Google Sheets para obtener horarios ocupados
  // El formato: { 'YYYY-MM-DD': ['15', '16:30', ...] }
  const horariosOcupados = {
    // Ejemplo: '2025-07-12': ['15', '16:30'],
    // Se reemplazará con datos reales desde Google Sheets
  };

  // Función para cargar fechas disponibles máximo 1 mes desde hoy
  function cargarFechasDisponibles() {
    fechaCitaSelect.innerHTML = '<option value="" disabled selected>Seleccioná una fecha</option>';
    const hoy = new Date();
    for (let i = 0; i < 31; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      fechaCitaSelect.innerHTML += `<option value="${fechaStr}">${fecha.toLocaleDateString()}</option>`;
    }
  }

  // Al cambiar fecha, carga horarios disponibles
  fechaCitaSelect.addEventListener('change', () => {
    horaCitaSelect.innerHTML = '<option value="" disabled selected>Seleccioná un horario</option>';
    const fecha = fechaCitaSelect.value;
    const ocupados = horariosOcupados[fecha] || [];

    horariosBase.forEach(horario => {
      if (!ocupados.includes(horario)) {
        horaCitaSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
      }
    });

    if (horaCitaSelect.options.length === 1) {
      horaCitaSelect.innerHTML = '<option disabled selected>No hay horarios disponibles</option>';
    }
  });

  // Al enviar el formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validaciones extra si querés agregar

    // Simulación de guardar reserva y enviar notificaciones
    formMessage.style.color = 'green';
    formMessage.textContent = '¡Cita agendada exitosamente!';

    // Aquí va el código para enviar a Google Sheets y WhatsApp (API o Zapier)

    // Opcional: resetear formulario
    form.reset();
    horaCitaSelect.innerHTML = '<option value="" disabled selected>Seleccioná un horario</option>';
  });

  cargarFechasDisponibles();
});
