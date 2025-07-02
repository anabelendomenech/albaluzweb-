document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agendar");
  const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");

  // Configuración: URL del webhook de Google Apps Script para guardar reservas
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnFKqNNrTuHyRaGr6eMqVceBb1TJLUgdZBTqkfBFILepCfRtMEjWvEYDhUU-7K8it2bQ/exec";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recoger datos del formulario
    const nombre = form.nombre.value.trim();
    const fechaEvento = form["fecha-evento"].value;
    const fechaCita = form["fecha-cita"].value;
    const cantidadPersonas = form["cantidad-personas"].value;
    const mensajeExtra = form["mensaje-extra"].value.trim();

    // Validar fechas
    const hoy = new Date();
    const fechaEventoDate = new Date(fechaEvento);
    const fechaCitaDate = new Date(fechaCita);

    if (fechaEventoDate < hoy) {
      alert("La fecha del evento no puede ser pasada.");
      return;
    }
    if (fechaCitaDate < hoy) {
      alert("La fecha para visitarnos no puede ser pasada.");
      return;
    }

    // Validar máximo 1 mes de anticipación (aprox 31 días)
    const diffMs = fechaCitaDate - hoy;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 31) {
      alert("Podés agendar con un máximo de 1 mes de anticipación.");
      return;
    }

    // Crear objeto reserva
    const reserva = {
      nombre,
      fechaEvento,
      fechaCita,
      cantidadPersonas,
      mensajeExtra,
      codigoDescuento: "ALBALUZANIVERSARIO",
      timestamp: new Date().toISOString(),
    };

    try {
      // Enviar datos a Google Sheets (Apps Script)
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(reserva),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Error al guardar la reserva.");

      // Mostrar mensaje de confirmación
      form.style.display = "none";
      mensajeConfirmacion.style.display = "block";

      // Enviar WhatsApp automáticamente (abre ventana)
      enviarWhatsApp(reserva);
    } catch (error) {
      alert("Hubo un problema al procesar tu reserva. Por favor, intentá de nuevo.");
      console.error(error);
    }
  });

  function enviarWhatsApp(reserva) {
    // Número de teléfono del negocio (sin signos ni espacios, con código de país)
    const telefonoNegocio = "59898256239"; // Cambiar por el real

    // Mensaje para enviar por WhatsApp (url encodeado)
    const mensaje = `
Hola Albaluz! Tengo una reserva:
- Nombre: ${reserva.nombre}
- Fecha del evento: ${reserva.fechaEvento}
- Fecha para la cita: ${reserva.fechaCita}
- Cantidad personas: ${reserva.cantidadPersonas}
- Comentarios: ${reserva.mensajeExtra || "Ninguno"}
- Código descuento: ${reserva.codigoDescuento}
`.trim();

    const urlWhatsApp = `https://wa.me/${telefonoNegocio}?text=${encodeURIComponent(mensaje)}`;

    // Abrir WhatsApp Web en nueva pestaña para enviar mensaje al negocio
    window.open(urlWhatsApp, "_blank");
  }
});
