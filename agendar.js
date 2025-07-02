
const API_URL = "https://script.google.com/macros/s/AKfycbxGi1BB8-eaffVnpk06pesNEoF1bTJyRTZsSasoPorQn5NM_ebeHVAymvbS4EnlCBoYBw/exec"; // reemplazar con tu URL de deployment

document.addEventListener("DOMContentLoaded", () => {
  const fechaEventoInput = document.getElementById("fecha-evento");
  const fechaCitaSelect = document.getElementById("fecha-cita");
  const horaCitaSelect = document.getElementById("hora-cita");
  const form = document.getElementById("form-agendar");
  const formMessage = document.getElementById("form-message");

  // Cargar fechas disponibles (máximo 1 mes)
  function cargarFechas() {
    fechaCitaSelect.innerHTML = `<option value="" disabled selected>Seleccioná una fecha</option>`;
    const hoy = new Date();
    for (let i = 0; i < 31; i++) {
      const f = new Date(hoy);
      f.setDate(hoy.getDate() + i);
      const iso = f.toISOString().split("T")[0];
      const display = f.toLocaleDateString();
      fechaCitaSelect.innerHTML += `<option value="${iso}">${display}</option>`;
    }
  }

  // Al cambiar fecha, consultar horarios libres desde API
  fechaCitaSelect.addEventListener("change", async () => {
    horaCitaSelect.innerHTML = `<option value="" disabled selected>Cargando horarios...</option>`;
    const fecha = fechaCitaSelect.value;

    try {
      const response = await fetch(`${API_URL}?action=getHorarios&fecha=${fecha}`);
      const data = await response.json();

      if (data.horarios && data.horarios.length > 0) {
        horaCitaSelect.innerHTML = `<option value="" disabled selected>Seleccioná un horario</option>`;
        data.horarios.forEach(h => {
          horaCitaSelect.innerHTML += `<option value="${h}">${h}</option>`;
        });
      } else {
        horaCitaSelect.innerHTML = `<option disabled selected>No hay horarios disponibles</option>`;
      }
    } catch (error) {
      horaCitaSelect.innerHTML = `<option disabled selected>Error al cargar horarios</option>`;
    }
  });

  // Enviar reserva a API
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reserva = {
      nombre: form.nombre ? form.nombre.value.trim() : "Anonimo",
      evento: form["fecha-evento"].value.trim(),
      fechaCita: form["fecha-cita"].value.trim(),
      horario: form["hora-cita"].value.trim(),
      personas: form.personas.value.trim(),
      mensaje: form.mensaje.value.trim(),
      action: "guardarReserva",
    };

    // Validaciones básicas
    if (!reserva.fechaCita || !reserva.horario) {
      formMessage.style.color = "red";
      formMessage.textContent = "Por favor, completá todos los campos.";
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "guardarReserva", reserva }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.success) {
        formMessage.style.color = "green";
        formMessage.textContent = "¡Cita agendada exitosamente!";

        // Resetear formulario y horarios
        form.reset();
        horaCitaSelect.innerHTML = `<option value="" disabled selected>Seleccioná un horario</option>`;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      formMessage.style.color = "red";
      formMessage.textContent = `Error: ${error.message}`;
    }
  });

  cargarFechas();
});
