document.addEventListener("DOMContentLoaded", () => {
  const form = document.forms["agendar"];
  form.addEventListener("submit", () => {
    alert("✅ ¡Tu cita fue agendada con éxito!");
  });
});
