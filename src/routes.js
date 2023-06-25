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
      res.status(200).json(dataUser);
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
      res.status(200).json(tokenData);
    } catch (error) {
      functions.logError(error); // Registra el error en caso de que ocurra
      //console.error(error); // Muestra el error en la consola
      res.sendStatus(500).json(error); // Envía un código de estado 500 (Error del servidor)
    }
  });

  // Ruta para obtener los usuarios desde la base de datos
  app.get(
    "/auth/jwt/token/consuta",
    functions.verifyToken,
    async function (req, res) {
      const dataResultados = await postDB.consultadb();
      res.status(200).json(dataResultados);
    }
  );

  app.get(
    "/auth/jwt/token/cursos",
    functions.verifyToken,
    async function (req, res) {
      const dataResultados = await postDB.dbcurso();
      res.status(200).json(dataResultados);
    }
  );

  app.get(
    "/auth/jwt/token/consuta/ramo/:curso_id",
    functions.verifyToken,
    async function (req, res) {
      //https://example.com/auth/jwt/token/consuta/ramo/INFB1234
      //const curso_id = "INFB1234";
      const curso_id = req.params.curso_id;
      const dataResultados = await postDB.consultaRamo(curso_id);
      if (dataResultados.length > 0) {
        const promedio = functions.calcularPromedio(dataResultados);
        res.json({ [curso_id]: promedio });
      } else {
        res.status(404).json({ error: "No hay registros" });
      }
    }
  );

  //, functions.verifyToken
  app.post("/auth/jwt/token/voto", async (req, res) => {
    // Datos del voto recibidos en el cuerpo de la solicitud
    const {
      token,
      curso_id,
      nombre_curso,
      fecha,
      valoracion,
      usuario_id,
      nombre,
      seccion_curso,
    } = req.body;
    //const fecha = new Date().toLocaleDateString("es-CL");
    if (!functions.verifyTokenbody(token)) {
      res.status(500).json("Error al realizar la petición a la API externa"); // Enviar código de estado 500 y mensaje de error
    } else {
      const dataResultados = await postDB.consultadb();
      if (
        functions.yaVoto(dataResultados.usuarios, usuario_id, fecha, curso_id)
      ) {
        await postDB.registrarVoto(
          curso_id,
          nombre_curso,
          fecha,
          valoracion,
          usuario_id,
          nombre,
          fecha,
          seccion_curso
        );
        res.status(200).json("Ya voto por este ramo, espere el proximo dia.");
      } else {
        res.status(200).json("votacion realizada.");
      }
    }
  });

  // Ruta para cerrar sesión
  app.get("/auth/logout", (req, res) => {
    req.session.destroy(); // Destruye la sesión del usuario
    res.json("Hasta luego."); // Envía un mensaje de despedida
  });

  // Ruta para manejar el fallo de autenticación
  app.get("/auth/failure", (req, res) => {
    // Envía un código de estado 500 (Error del servidor)
    res.sendStatus(500).json("Credenciales no válidas."); // Envía un mensaje de error
  });
};
