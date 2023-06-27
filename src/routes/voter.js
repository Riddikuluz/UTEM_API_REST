const functions = require("../utils/functions");
const getDB = require("../models/consultasDB");
const postDB = require("../models/votarDB");
const aouthToken = require("../services/oauthToken");

module.exports = function (app) {
  // Ruta para obtener los usuarios desde la base de datos
  app.get(
    "/v1/voter/results",
    aouthToken.verifyToken,
    async function (req, res) {
      try {
        const dataResultados = await getDB.consultarDB(); //votos y usuarios
        res.status(200).json(dataResultados.votos);
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.sendStatus(500).json(error); // Envía un código de estado 500 (Error del servidor)
      }
    }
  );

  app.get(
    "/v1/voter/courses",
    aouthToken.verifyToken,
    async function (req, res) {
      try {
        const dataResultados = await getDB.consultarDB(); //ramos
        res.status(200).json(dataResultados.ramos);
      } catch (error) {
        functions.logError(error); // Registra el error en caso de que ocurra
        res.sendStatus(500).json(error); // Envía un código de estado 500 (Error del servidor)
      }
    }
  );

  app.get(
    "/v1/voter/:seccion_curso/results",
    aouthToken.verifyToken,
    async function (req, res) {
      const seccion_curso = req.params.seccion_curso;
      try {
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
    const { authorization, fecha, valoracion, seccion_curso } = req.body;
    const dataToken = await aouthToken.verifyTokenbody(authorization);
    const dataRamos = await getDB.buscaSeccion(seccion_curso);

    if (!dataToken || !dataRamos) {
      res.status(500).json("Error al realizar la petición a la API externa"); // Enviar código de estado 500 y mensaje de error
    } else {
      try {
        const dataResultados = await getDB.consultarDB(); //votos y usuarios
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
};
