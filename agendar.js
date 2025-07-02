document.addEventListener("DOMContentLoaded", () => {
  const fechaCita = document.getElementById("fecha-cita");
  const horaTurno = document.getElementById("hora-turno");
  const form = document.getElementById("form-agendar");
  const respuesta = document.getElementById("form-respuesta");
  const scriptURL = "https://script.google.com/macros/s/TU_SCRIPT_ID/exec";

  const horariosBase = ["15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30"];

  fechaCita.addEventListener("change", () => {
    horaTurno.innerHTML = "<option>Cargando...</option>";
    fetch(`${scriptURL}?fecha=${fechaCita.value}`)
      .then(r => r.json())
      .then(d => {
        horaTurno.innerHTML = "<option value=''>Seleccioná</option>";
        Object.entries(d).forEach(([h, disp]) => {
          if(disp) horaTurno.innerHTML += `<option value="${h}">${h}</option>`;
        });
      }).catch(() => horaTurno.innerHTML = "<option>Error</option>");
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    fetch(scriptURL, {method: "POST", body: new URLSearchParams(new FormData(form))})
      .then(() => respuesta.textContent = "¡Tu reserva fue enviada con éxito!")
      .catch(() => respuesta.textContent = "Error, intentá de nuevo.")
      .finally(() => form.reset());
  });
});
