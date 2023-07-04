require("dotenv").config({ path: "./config/.env" });
const session = require("express-session");
const express = require("express");
const passport = require("passport");
const path = require("path");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const app = express();

const googleRoute = require("./routes/googleToken");
const puerto = process.env.puertoServer;
const voterRoute = require("./routes/voter");
require("./services/oauth20");
const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yaml"));

// Configuraciones y middlewares de Express
app.use(passport.initialize());
app.use(express.json()); // Permite el análisis de datos JSON en las solicitudes
app.use(express.static(path.join(__dirname, "client"))); // Define el directorio estático para servir archivos estáticos
app.use(express.urlencoded({ extended: false })); // Permite el análisis de datos de formulario en las solicitudes
app.use(express.static("public")); // Define el directorio estático adicional para servir archivos estáticos
app.use(
  session({
    // Configuración de la sesión
    secret: process.env.clave, // Clave secreta para firmar las cookies de sesión
    resave: false, // No vuelve a guardar la sesión si no ha sido modificada
    saveUninitialized: false, // Guarda sesiones sin inicializar
    cookie: { secure: false }, // Configuración de la cookie de sesión
  })
);
app.use(passport.session()); // Permite el uso de sesiones de Passport

// Rutas Google
googleRoute(app);

// Metodos voter
voterRoute(app);

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Iniciar el servidor
app.listen(puerto, () => {
  console.log(`Escuchando en el puerto ${puerto}`);
});
