const express = require("express");
//const jwt = require("jsonwebtoken");
const routes = require("./routes");
const expressAPP = require("./expressAPP");
require("dotenv").config({ path: "./config/.env" });
require("./oauth20");
const app = express();
const puerto = process.env.puertoServer || process.env.puerto;

// Configuraciones y middlewares de Express
expressAPP(app);

// Rutas
routes(app);

// Iniciar el servidor
app.listen(puerto, () => {
  console.log(`Escuchando en el puerto ${puerto}`);
});
