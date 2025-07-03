https://script.google.com/macros/s/AKfycbyclc0dGhsZkaBBmFVYWc_zNbjCP25yt-cfpNwNRvlLQx6aWRnf-ckhgq_ImtYF7XLdng/exec
const form = document.getElementById('form-agendar');
const fechaEventoInput = document.getElementById('fecha-evento');
const fechaCitaSelect = document.getElementById('fecha-cita');
const horarioSelect = document.getElementById('horario');
const mensajeExtra = document.getElementById('mensaje');
const errorMessageDiv = document.getElementById('error-message');

// Cambiar esta URL por la de tu Apps Script desplegado:
const scriptURL = 'https://script.google.com/macros/s/AKfycbyclc0dGhsZkaBBmFVYWc_zNbjCP25yt-cfpNwNRvlLQx6aWRnf-ckhgq_ImtYF7XLdng/exec';

fechaEventoInput.addEventListener('change', () => {
  const fecha = fechaEventoInput.value;
  fetch('https://opensheet.elk.sh/1bRrBPeyILT5xAIkzjdKWqO06P40mptDttEk1pQWHMsQ/HORARIOS%20DISPONIBLES')
    .then(res => res.json())
    .then(data => {
      const fila = data.find(row => row.Fecha === fecha);
      if (!fila) {
        horarioSelect.innerHTML = '<option disabled>No hay horarios cargados para ese día</option>';
        return;
      }

      horarioSelect.innerHTML = '';
      Object.entries(fila).forEach(([hora, estado]) => {
        if (hora !== "Fecha" && estado !== "✔️") {
          const opt = document.createElement('option');
          opt.value = hora;
          opt.textContent = hora;
          horarioSelect.appendChild(opt);
        }
      });
    });
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const evento = document.getElementById('evento').value;
  const fechaEvento = fechaEventoInput.value;
  const fechaCita = fechaCitaSelect.value;
  const horario = horarioSelect.value;
  const personas = document.getElementById('personas').value;
  const mensaje = mensajeExtra.value;
  const contacto = document.getElementById('contacto').value;

  if (!nombre || !fechaCita || !horario || !contacto) {
    errorMessageDiv.textContent = 'Por favor completá todos los campos obligatorios.';
    return;
  }

  const data = {
    nombre,
    evento,
    fechaEvento,
    fechaCita,
    horario,
    personas,
    mensaje,
    contacto
  };

  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(response => {
      alert('¡Reserva confirmada! Pronto te llegará un mensaje con los detalles.');
      form.reset();
    })
    .catch(err => {
      console.error('Error al enviar', err);
      alert('Hubo un error. Intentalo nuevamente.');
    });
});
