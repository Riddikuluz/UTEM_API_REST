const passport = require("passport");
const path = require("path");
const functions = require("./functions");
const postDB = require("./db");
const { v4: uuidv4, validate: validateUUID } = require("uuid");
module.exports = function (app) {
  // Ruta principal que devuelve el archivo index.html
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

  // Ruta de autenticación con Google
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
      accessType: "offline",
      approvalPrompt: "force",
    })
  );

  // Callback de autenticación con Google
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/auth/jwt",
      failureRedirect: "/auth/failure",
    })
  );

  // Ruta protegida con autenticación JWT
  app.get("/auth/jwt", functions.isLogIn, (req, res) => {
    const dataUser = req.user;
    res.json(dataUser);
  });

  // Ruta para obtener el token JWT
  app.get("/auth/jwt/token", functions.verifyToken, function (req, res) {
    try {
      const tokenData = req.token;
      res.send(tokenData);
    } catch (error) {
      functions.logError(error); // Registra el error en caso de que ocurra
      console.error(error); // Muestra el error en la consola
      res.sendStatus(500); // Envía un código de estado 500 (Error del servidor)
    }
  });

  // Ruta para obtener los usuarios desde la base de datos
  app.get("/auth/jwt/token/consuta", async function (req, res) {
    const data = await postDB.revisarBaseDatos();
    res.send(data);
  });

  app.get(
    "/auth/jwt/token/voto",
    functions.verifyToken,
    async function (req, res) {
      const tokenData = req.token;
      const usuarioId = tokenData.email;

      // Validar que el usuarioId sea un UUID válido

      const fecha = new Date().toISOString().split("T")[0];
      const cursoId = "INFB8090";
      const valoracion = 6.9;
      //postDB.registrarVoto(usuarioId, fecha, cursoId, valoracion);
      const response = {
        usuarioId: usuarioId,
        fecha: fecha,
        cursoId: cursoId,
        valoracion: valoracion,
      };
      res.send(response);
    }
  );

  // Ruta para cerrar sesión
  app.get("/auth/logout", (req, res) => {
    req.session.destroy(); // Destruye la sesión del usuario
    res.send("Hasta luego."); // Envía un mensaje de despedida
  });

  // Ruta para manejar el fallo de autenticación
  app.get("/auth/failure", (req, res) => {
    res.sendStatus(500); // Envía un código de estado 500 (Error del servidor)
    res.send("Credenciales no válidas."); // Envía un mensaje de error
  });
};
