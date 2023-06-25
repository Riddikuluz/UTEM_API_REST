const passport = require("passport");
const path = require("path");
const functions = require("./functions");
const postDB = require("./db");
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
    try {
      const dataUser = req.user;
      res.json(dataUser);
    } catch (error) {
      functions.logError(error); // Registra el error en caso de que ocurra
      console.error(error); // Muestra el error en la consola
      res.sendStatus(500); // Envía un código de estado 500 (Error del servidor)
    }
  });

  // Ruta para obtener el token JWT , functions.verifyToken
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
    const dataResultados = await postDB.consultadb();
    res.send(dataResultados);
  });

  app.get("/auth/jwt/token/consuta/ramo", async function (req, res) {
    const curso_id = "INFB1234";
    const dataResultados = await postDB.consultaRamo(curso_id);
    const promedio = functions.calcularPromedio(dataResultados);

    res.send({ promedio: promedio });
  });

  //, functions.verifyToken
  app.post("/auth/jwt/token/voto", async (req, res) => {
    // Datos del voto recibidos en el cuerpo de la solicitud
    //const { curso_id, nombre_curso, fecha, valoracion, usuario_id, nombre } =req.body;
    //const tokenData = req.token;
    //const usuarioId = tokenData.email;
    const usuario_id = "1111111111111";
    const nombre = "Riddikulus";
    const fecha = new Date().toISOString().split("T")[0];
    const nombre_curso = "API Node JS";
    const curso_id = "INFB1234";
    const valoracion = 2;

    const dataResultados = await postDB.consultadb();
    if (functions.yaVoto(dataResultados.usuarios, usuario_id, fecha)) {
      res.send("Ya voto, espere el proximo dia.");
    } else {
      await postDB.registrarVoto(
        curso_id,
        nombre_curso,
        fecha,
        valoracion,
        usuario_id,
        nombre,
        fecha
      );
      res.send("votacion ya realizada.");
    }
  });

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
