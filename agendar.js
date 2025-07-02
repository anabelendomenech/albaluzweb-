document.addEventListener('DOMContentLoaded', async () => {
  const fechaEvento = document.getElementById('fecha-evento');
  const fechaCita = document.getElementById('fecha-cita');
  const horaTurno = document.getElementById('hora-turno');
  const form = document.getElementById('form-agendar');
  const formRespuesta = document.getElementById('form-respuesta');

  // Horarios disponibles fijos
  const horariosBase = [
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
  ];

  // Hoja pública con formato: Fecha | Horario | Ocupado (✔️ o vacío)
  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyGsUCt3nGVol3GsISXHxwKk7oWuRkQ9m1635Izk1vwxM9z32om4QQ0yPX1ScYMkauuPQ/exec';

  fechaCita.addEventListener('change', async () => {
    const diaSeleccionado = fechaCita.value;
    const hoy = new Date();
    const fechaSel = new Date(diaSeleccionado);

    const diferenciaDias = (fechaSel - hoy) / (1000 * 60 * 60 * 24);
    if (diferenciaDias > 31) {
      alert("Solo podés agendar con hasta un mes de anticipación.");
      fechaCita.value = "";
      return;
    }

    // Limpiar y cargar los horarios disponibles
    horaTurno.innerHTML = `<option value="">Cargando...</option>`;
    const horariosDisponibles = await obtenerHorariosDisponibles(diaSeleccionado);
    horaTurno.innerHTML = `<option value="">Seleccioná una hora</option>`;
    horariosDisponibles.forEach(hora => {
      const option = document.createElement('option');
      option.value = hora;
      option.textContent = hora;
      horaTurno.appendChild(option);
    });

    if (horariosDisponibles.length === 0) {
      horaTurno.innerHTML = `<option value="">No hay horarios disponibles</option>`;
    }
  });

  async function obtenerHorariosDisponibles(fecha) {
    try {
      const res = await fetch(SHEET_URL);
      const datos = await res.json();
      const horariosOcupados = datos
        .filter(f => f.Fecha === fecha && f.Ocupado === "✔️")
        .map(f => f.Horario);

      return horariosBase.filter(h => !horariosOcupados.includes(h));
    } catch (err) {
      console.error("Error cargando horarios:", err);
      return [];
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      evento: fechaEvento.value,
      cita: fechaCita.value,
      hora: horaTurno.value,
      personas: document.getElementById('personas').value,
      mensaje: document.getElementById('mensaje').value
    };

    // Enviar a Google Sheets vía webhook de App Script (lo configuro ahora si querés)
    const scriptURL = 'https://script.google.com/macros/s/AKfycbEXAMPLE_SCRIPT_ID/exec';

    try {
      const res = await fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams(data)
      });

      // WhatsApp automático a cliente
      const mensajeWsp = `¡Hola! Gracias por reservar con ALBALUZ 💫
📅 Evento: ${data.evento}
🛍️ Cita: ${data.cita} a las ${data.hora}
👯‍♀️ Personas: ${data.personas}
📎 Extra: ${data.mensaje || '---'}

🎉 Código de descuento: *ALBALUZANIVERSARIO*

¡Te esperamos! 🌸`;

      const linkWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensajeWsp)}`;
      window.open(linkWhatsApp, "_blank");

      form.reset();
      formRespuesta.innerHTML = "<p>¡Reserva registrada! Te llegará un WhatsApp con el resumen.</p>";
    } catch (err) {
      console.error("Error al agendar:", err);
      formRespuesta.innerHTML = "<p>Hubo un error. Intentá de nuevo más tarde.</p>";
    }
  });
});
