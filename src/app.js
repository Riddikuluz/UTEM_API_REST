const express = require("express");
//const jwt = require("jsonwebtoken");
const routes = require("./routes");
const app = express();
const expressJS = require("./expressJS");
require("dotenv").config({ path: "../config/.env" });
require("./auth");

const puerto = process.env.puertoServer || process.env.puerto;

// Configuraciones y middlewares de Express
expressJS(app);

// Rutas
routes(app);

// Iniciar el servidor
app.listen(puerto, () => {
  console.log(`Escuchando en el puerto ${puerto}`);
});
