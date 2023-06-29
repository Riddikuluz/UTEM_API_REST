const express = require("express");
const routes = require("./routes/googleToken");
const voter = require("./routes/voter");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
require("dotenv").config({ path: "./config/.env" });
require("./services/oauth20");
const app = express();
const puerto = process.env.puertoServer;

// Configuraciones y middlewares de Express
app.use(passport.initialize());
app.use(express.json()); // Permite el análisis de datos JSON en las solicitudes
app.use(express.static(path.join(__dirname, "client"))); // Define el directorio estático para servir archivos estáticos
app.use(express.urlencoded({ extended: false })); // Permite el análisis de datos de formulario en las solicitudes
app.use(express.static("public")); // Define el directorio estático adicional para servir archivos estáticos
// Configuración de la sesión
app.use(
  session({
    secret: process.env.clave, // Clave secreta para firmar las cookies de sesión
    resave: false, // No vuelve a guardar la sesión si no ha sido modificada
    saveUninitialized: false, // Guarda sesiones sin inicializar
    cookie: { secure: false }, // Configuración de la cookie de sesión
  })
);
app.use(passport.session()); // Permite el uso de sesiones de Passport

// Rutas Google
routes(app);

// metodos voter
voter(app);

// Iniciar el servidor
app.listen(puerto, () => {
  console.log(`Escuchando en el puerto ${puerto}`);
});
