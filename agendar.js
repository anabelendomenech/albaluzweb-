// const formReserva = document.getElementById('form-reserva');
const inputFecha = document.getElementById('fecha');
const selectHorario = document.getElementById('horario');

const horariosDisponibles = [
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30"
];

// Limitar fecha mínima y máxima (hoy a 1 mes)
const hoy = new Date();
const yyyy = hoy.getFullYear();
const mm = String(hoy.getMonth() + 1).padStart(2, '0');
const dd = String(hoy.getDate()).padStart(2, '0');

const fechaMin = `${yyyy}-${mm}-${dd}`;
const fechaMaxDate = new Date(hoy);
fechaMaxDate.setMonth(fechaMaxDate.getMonth() + 1);

const yyyyMax = fechaMaxDate.getFullYear();
const mmMax = String(fechaMaxDate.getMonth() + 1).padStart(2, '0');
const ddMax = String(fechaMaxDate.getDate()).padStart(2, '0');

const fechaMax = `${yyyyMax}-${mmMax}-${ddMax}`;

inputFecha.min = fechaMin;
inputFecha.max = fechaMax;

function cargarHorarios() {
  selectHorario.innerHTML = '';
  horariosDisponibles.forEach(horario => {
    const option = document.createElement('option');
    option.value = horario;
    option.textContent = horario;
    selectHorario.appendChild(option);
  });
}

formReserva.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    nombre: formReserva.nombre.value.trim(),
    evento: formReserva.evento.value.trim(),
    fecha: formReserva.fecha.value,
    horario: formReserva.horario.value,
    personas: formReserva.personas.value,
    mensaje: formReserva.mensaje.value.trim(),
  };

  // Aquí podrías enviar data a Google Sheets con fetch + API o Google Apps Script

  alert('¡Reserva enviada! Te contactaremos pronto.');
  formReserva.reset();
});

window.addEventListener('DOMContentLoaded', () => {
  cargarHorarios();
});
