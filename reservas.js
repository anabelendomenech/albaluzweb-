const { apiKey, baseId } = airtableConfig;


const buscarClienta = async (nombre) => {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/CLIENTAS?filterByFormula=FIND(LOWER("${nombre}"), LOWER({Nombre}))`, {
    headers: { Authorization: `Bearer ${airtableApiKey}` }
  });
  const data = await res.json();
  return data.records || [];
};

const guardarReserva = async () => {
  const clienta = document.getElementById('nombre').value;
  const fechaReserva = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;
  const personas = parseInt(document.getElementById('personas').value);
  const evento = document.getElementById('evento').value;
  const comentarios = document.getElementById('comentarios').value;

  const clientas = await buscarClienta(clienta);
  if (clientas.length === 0) {
    alert("La clienta no existe. Por favor, registrala primero.");
    return;
  }

  const clientaId = clientas[0].id;

  const res = await fetch(`https://api.airtable.com/v0/${baseId}/RESERVAS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${airtableApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: {
        "Clienta": [clientaId],
        "Fecha de la reserva": fechaReserva,
        "Hora": hora,
        "Personas": personas,
        "Fecha del evento": evento,
        "Comentarios": comentarios
      }
    })
  });

  if (res.ok) {
    alert("Reserva guardada correctamente.");
    document.getElementById("form-reserva").reset();
  } else {
    alert("Error al guardar la reserva.");
  }
};
