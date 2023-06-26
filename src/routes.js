const passport = require("passport");
const path = require("path");
const functions = require("./functions");
const postDB = require("./db");

module.exports = function (app) {
  // Ruta principal que devuelve el archivo index.html
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
    //res.sendStatus(303); // 303 See Other
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
      const jwtToken = req.user;
      res.status(200).json(jwtToken);
    } catch (error) {
      functions.logError(error); // Registra el error en caso de que ocurra
      console.error(error); // Muestra el error en la consola
      res.sendStatus(500); // Envía un código de estado 500 (Error del servidor)
    }
  });

  // Ruta para obtener el token JWT
  app.get("/auth/jwt/data", functions.verifyToken, function (req, res) {
    try {
      const tokenData = req.token;
      res.status(200).json(tokenData);
    } catch (error) {
      functions.logError(error); // Registra el error en caso de que ocurra
      res.sendStatus(404).json(error); // Envía un código de estado 500 (Error del servidor)
    }
  });

  // Ruta para obtener los usuarios desde la base de datos
  app.get(
    "/v1/voter/results",
    functions.verifyToken,
    async function (req, res) {
      try {
        const dataResultados = await postDB.consultadb();
        res.status(200).json(dataResultados);
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.sendStatus(500).json(error); // Envía un código de estado 500 (Error del servidor)
      }
    }
  );

  app.get(
    "/v1/voter/courses",
    functions.verifyToken,
    async function (req, res) {
      try {
        const dataResultados = await postDB.dbcurso();
        res.status(200).json(dataResultados);
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.sendStatus(500).json(error); // Envía un código de estado 500 (Error del servidor)
      }
    }
  );

  app.get(
    "/v1/voter/:seccion_curso/results",
    functions.verifyToken,
    async function (req, res) {
      const seccion_curso = req.params.seccion_curso;
      try {
        const dataResultados = await postDB.consultaRamo(seccion_curso);
        if (dataResultados.valoraciones.length > 0) {
          const promedio = functions.calcularPromedio(
            dataResultados.valoraciones
          );

          const resultados_seccion = {
            votaciones: dataResultados.resultados,
            promedio_seccion: promedio,
          };

          res.json(resultados_seccion);
        } else {
          functions.logError("No hay registros");
          res.status(404).json("No hay registros");
        }
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.status(500).json(error); // Envía un código de estado 500 (Error del servidor)
      }
    }
  );

  app.post("/v1/voter/vote", async (req, res) => {
    // Datos del voto recibidos en el cuerpo de la solicitud
    const { token, fecha, valoracion, seccion_curso } = req.body;
    const dataToken = await functions.verifyTokenbody(token);
    const dataRamos = await postDB.buscaSeccion(seccion_curso);

    if (!dataToken || !dataRamos) {
      res.status(500).json("Error al realizar la petición a la API externa"); // Enviar código de estado 500 y mensaje de error
    } else {
      try {
        const dataResultados = await postDB.consultadb();
        if (
          functions.yaVoto(
            dataResultados.usuarios,
            dataToken.usuario_id,
            fecha,
            dataRamos.curso_id
          )
        ) {
          res.status(200).json("Ya voto por este ramo, espere el próximo día.");
        } else {
          await postDB.registrarVoto(
            dataRamos.curso_id,
            dataRamos.nombre_curso,
            fecha,
            valoracion,
            dataToken.usuario_id,
            dataToken.nombre,
            seccion_curso,
            dataRamos.semestre,
            dataRamos.anio,
            dataRamos.active
          );
          res.status(200).json("Votación realizada.");
        }
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.sendStatus(500).json(error); // Envía un código de estado 500 (Error del servidor)
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
