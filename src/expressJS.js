const passport = require("passport");
const session = require("express-session");
const express = require("express");
const path = require("path");

function expressJS(app) {
  // Configuración de Passport
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
}

module.exports = expressJS;
