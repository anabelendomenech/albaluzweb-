document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agendar");
  const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");

  // Configuración: URL del webhook de Google Apps Script para guardar reservas
  const GOOGLE_SCRIPT_URL = "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI";

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
      tim
