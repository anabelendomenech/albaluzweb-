document.addEventListener('DOMContentLoaded', () => {
  const horaTurno = document.getElementById('hora-turno');
  const horarios = [
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
  ];

  horaTurno.innerHTML = '<option value="">Seleccioná una hora</option>';
  horarios.forEach(hora => {
    const option = document.createElement('option');
    option.value = hora;
    option.textContent = hora;
    horaTurno.appendChild(option);
  });

  const form = document.getElementById('form-agendar');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Formulario enviado correctamente');
  });
});
