const functions = require("../utils/functions");
const getDB = require("../models/consultasDB");
const postDB = require("../models/votarDB");
const aouthToken = require("../services/oauthToken");

module.exports = function (app) {
  // Ruta para obtener los usuarios desde la base de datos
  app.get(
    "/grupoe/votacion/resultados",
    aouthToken.verifyToken,
    async function (req, res) {
      try {
        const tokenData = req.token;
        if (getDB.buscarAdmin(tokenData.sub)) {
          const dataResultados = await getDB.consultarDB();
          res.status(200).json(dataResultados.votos);
        } else {
          res.status(401).json("Acceso no autorizado.");
        }
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.sendStatus(500); // Envía un código de estado 500 (Error del servidor)
      }
    }
  );

  app.get("/grupoe/votacion/ramos", aouthToken.verifyToken, async function (req, res) {
    try {
      const tokenData = req.token;
      if (getDB.buscarAdmin(tokenData.sub)) {
        const dataResultados = await getDB.consultarDB(); //ramos
        res.status(200).json(dataResultados.ramos);
      } else {
        res.status(403).json("Datos del cliente no encontrados.");
      }
    } catch (error) {
      functions.logError(error); // Registra el error en caso de que ocurra
      res.sendStatus(500); // Envía un código de estado 500 (Error del servidor)
    }
  });

  app.get(
    "/grupoe/votacion/:seccion_curso/resultados",
    aouthToken.verifyToken,
    async function (req, res) {
      try {
        const tokenData = req.token;
        const seccion_curso = req.params.seccion_curso;

        if (getDB.buscarAdmin(tokenData.sub)) {
          const dataResultados = await getDB.consultaSeccion(seccion_curso);
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
            res.status(403).json("Datos del cliente no encontrados.");
          }
        } else {
          functions.logError("204 No Content");
          res.sendStatus(204);
        }
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.status(500).json(error); // Envía un código de estado 500 (Error del servidor)
      }
    }
  );

  app.post("/grupoe/votacion/votar", aouthToken.verifyToken, async (req, res) => {
    // Datos del voto recibidos en el cuerpo de la solicitud
    const { fecha, valoracion, seccion_curso } = req.body;
    // retorna datos del token: nombre y sub
    const dataToken = req.token;
    // retorna datos del ramo-seccion: curso_id, nombre_curso, semestre, anio, active
    const dataRamos = await getDB.buscaSeccion(seccion_curso);

    if (!dataToken || !dataRamos) {
      res.status(404).json("Datos del cliente no encontrados."); // Enviar código de estado 404 (No encontrado) y mensaje de error
    } else {
      try {
        const dataResultados = await getDB.consultarDB(); //votos y usuarios
        if (
          functions.yaVoto(
            dataResultados.usuarios,
            dataToken.sub,
            fecha,
            dataRamos.curso_id
          )
        ) {
          res.status(201).json("Ya votó por este ramo, espere al próximo día.");
        } else {
          await postDB.registrarVoto(
            dataRamos.curso_id,
            dataRamos.nombre_curso,
            fecha,
            valoracion,
            dataToken.sub,
            dataToken.name,
            seccion_curso,
            dataRamos.semestre,
            dataRamos.anio,
            dataRamos.active
          );
          res.status(200).json("Votación realizada.");
        }
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.status(500).json(error); // Envía un código de estado 500 (Error del servidor) y mensaje de error
      }
    }
  });
};
