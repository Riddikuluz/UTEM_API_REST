const passport = require("passport");
const path = require("path");
const functions = require("../utils/functions");
const aouthToken = require("../services/oauthToken");

module.exports = function (app) {
  // Ruta principal que devuelve el archivo index.html
  app.get("/", (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    } catch (error) {
      functions.logError(error);
      console.error("Error en la ruta /:", error);
      res.status(500).send("Error en el servidor");
    }
  });

  // Ruta de autenticación con Google
  app.get("/auth/google", (req, res) => {
    try {
      passport.authenticate("google", {
        session: false,
        scope: ["profile", "email"],
        accessType: "offline",
        approvalPrompt: "force",
      })(req, res);
    } catch (error) {
      functions.logError(error);
      console.error("Error en la ruta /auth/google:", error);
      res.status(500).send("Error en el servidor");
    }
  });

  // Callback de autenticación con Google
  app.get("/auth/google/callback", (req, res) => {
    try {
      passport.authenticate("google", {
        successRedirect: "/auth/jwt",
        failureRedirect: "/auth/failure",
      })(req, res);
    } catch (error) {
      functions.logError(error);
      console.error("Error en la ruta /auth/google/callback:", error);
      res.status(500).send("Error en el servidor");
    }
  });

  // Ruta protegida con autenticación JWT
  app.get("/auth/jwt", aouthToken.isLogIn, (req, res) => {
    try {
      const jwtToken = req.user;
      res.status(200).json(jwtToken);
    } catch (error) {
      functions.logError(error);
      console.error(error);
      res.sendStatus(500);
    }
  });

  // Ruta para obtener el token JWT
  app.get("/auth/jwt/data", aouthToken.verifyToken, function (req, res) {
    try {
      const tokenData = req.token;
      res.status(200).json(tokenData);
    } catch (error) {
      functions.logError(error);
      res.sendStatus(404).json(error);
    }
  });

  // Ruta para cerrar sesión
  app.get("/auth/logout", (req, res) => {
    try {
      req.session.destroy();
      res.json("Hasta luego.");
    } catch (error) {
      functions.logError(error);
      console.error("Error en la ruta /auth/logout:", error);
      res.status(500).send("Error en el servidor");
    }
  });

  // Ruta para manejar el fallo de autenticación
  app.get("/auth/failure", (req, res) => {
    try {
      res.status(500).json("Credenciales no válidas.");
    } catch (error) {
      functions.logError(error);
      console.error("Error en la ruta /auth/failure:", error);
      res.status(500).send("Error en el servidor");
    }
  });
};
