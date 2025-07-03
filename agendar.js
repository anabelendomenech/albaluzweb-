const spreadsheetId = "1bRrBPeyILT5xAIkzjdKWqO06P40mptDttEk1pQWHMsQ";
const sheetName = "HORARIOS DISPONIBLES";
const apiKey = "TU_API_KEY_ACÁ"; // Lo reemplazamos en el paso siguiente

const fechaEventoInput = document.getElementById("fecha-evento");
const fechaCitaSelect = document.getElementById("fecha-cita");
const horarioSelect = document.getElementById("horario");
const mensajeError = document.getElementById("error-message");

const hoy = new Date();
const maxFecha = new Date();
maxFecha.setDate(hoy.getDate() + 31);
fechaEventoInput.min = hoy.toISOString().split("T")[0];
fechaEventoInput.max = maxFecha.toISOString().split("T")[0];

fechaEventoInput.addEventListener("change", async () => {
  const fechaEvento = new Date(fechaEventoInput.value);
  if (fechaEvento > maxFecha) {
    mensajeError.textContent = "Solo podés agendar con un mes de anticipación.";
    return;
  }

  const diaSemana = fechaEvento.getDay(); // 0=Domingo ... 6=Sábado
  if (diaSemana === 0 || diaSemana === 6) {
    mensajeError.textContent = "Solo agendamos de lunes a viernes.";
    return;
  }

  const fechaFormateada = fechaEvento.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).replace(/\//g, "-");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const headers = data.values[0];
    const fila = data.values.find(row => row[0] === fechaFormateada);

    horarioSelect.innerHTML = "";

    if (fila) {
      for (let i = 1; i < headers.length; i++) {
        if (!fila[i] || fila[i] === "") {
          const hora = headers[i];
          const opt = document.createElement("option");
          opt.value = hora;
          opt.textContent = hora;
          horarioSelect.appendChild(opt);
        }
      }

      if (horarioSelect.options.length === 0) {
        mensajeError.textContent = "Ese día ya no hay horarios disponibles.";
      } else {
        mensajeError.textContent = "";
      }
    } else {
      mensajeError.textContent = "Ese día no tiene horarios habilitados.";
    }
  } catch (error) {
    mensajeError.textContent = "Error al cargar horarios.";
    console.error(error);
  }
});
