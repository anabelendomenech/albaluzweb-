// airtableConfig.js
var airtable_api_key = readFromFile('./.env.dev', AIRTABLE_API_KEY)

const airtableConfig = {
  apiKey: airtable_api_key;
  baseId: "appraIuHWdh5tA4FU"
};


// En archivo .env.dev
//AIRTABLE_API_KEY=patJkwJavmMqqadFg.4d29fe3dfc98fdf81ce2cb8de76da8c4a13e895da077b677a025b82d9e5c3221

//Agregar .env.dev a .gitignore
