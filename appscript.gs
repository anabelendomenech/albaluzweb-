const SHEET_ID = "1bRrBPeyILT5xAIkzjdKWqO06P40mptDttEk1pQWHMsQ";
function doGet(e) {
  const d = e.parameter.fecha;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("HORARIOS DISPONIBLES");
  const [h, ...rows] = sheet.getDataRange().getValues();
  const fila = rows.find(r => r[0] === d);
  const res = {};
  h.slice(1).forEach((h0,i)=>res[h0] = fila ? fila[i+1] !== "✔️" : true);
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  const form = e.parameter;
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ss.getSheetByName("RESERVAS").appendRow([new Date(), form.nombre || "", form.evento || "", form.cita || "", form.hora || "", form.personas || "", form.mensaje || ""]);
  // Marcar horario en HORARIOS DISPONIBLES
  const hoja = ss.getSheetByName("HORARIOS DISPONIBLES");
  const data = hoja.getDataRange().getValues();
  for(let i=1;i<data.length;i++){
    if(data[i][0]===form.cita){
      const col = data[0].indexOf(form.hora);
      hoja.getRange(i+1,col+1).setValue("✔️");
      break;
    }
  }
  return ContentService.createTextOutput("OK");
}
