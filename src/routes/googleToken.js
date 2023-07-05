const passport = require("passport");
const path = require("path");
const functions = require("../utils/functions");
const aouthToken = require("../services/oauthToken");

module.exports = function (app) {
  // Ruta principal que devuelve el archivo index.html
  app.get("/grupoe", (req, res) => {
    try {
      res.sendFile(path.join(__dirname, "../../public/index.html"));
    } catch (error) {
      functions.logError(error);
      console.error("Error en la ruta /:", error);
      res.status(500).send("Error en el servidor");
    }
  });

  // Ruta de autenticación con Google
  app.get(
    "/grupoe/auth/google",
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
      accessType: "offline",
      approvalPrompt: "force",
    })
  );

  app.get("/grupoe/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        functions.logError(err);
        console.error("Error en la ruta /grupoe/auth/google:", err);
        return res.status(500).send("Error en el servidor");
      }

      if (!user) {
        return res.status(401).json({ error: "Autenticación fallida" });
      }

      req.logIn(user, (err) => {
        if (err) {
          functions.logError(err);
          console.error("Error en la ruta /auth/google:", err);
          return res.status(500).send("Error en el servidor");
        }

        res.redirect("/grupoe/auth/jwt");
      });
    })(req, res, next);
  });

  // Ruta protegida con autenticación JWT
  app.get("/grupoe/auth/jwt", aouthToken.isLogIn, (req, res) => {
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
  app.get("/grupoe/auth/jwt/data", aouthToken.verifyToken, function (req, res) {
    try {
      const tokenData = req.token;
      res.status(200).json(tokenData);
    } catch (error) {
      functions.logError(error);
      console.error(error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // Ruta para cerrar sesión
  app.get("/grupoe/auth/logout", aouthToken.isLogIn, (req, res) => {
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
  app.get("/grupoe/auth/failure", (req, res) => {
    try {
      res.status(401).json("Credenciales no válidas.");
    } catch (error) {
      functions.logError(error);
      console.error("Error en la ruta /auth/failure:", error);
      res.status(500).send("Error en el servidor");
    }
  });
};
