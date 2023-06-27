const { Client } = require("pg");
const functions = require("../utils/functions");
require("dotenv").config({ path: "./config/.env" });

async function consultarDB() {
  const client = new Client({
    user: process.env.usuario_DB,
    host: process.env.public_IP,
    database: process.env.nombre_DB,
    password: process.env.clave_DB,
    port: process.env.pub_Port,
  });

  try {
    await client.connect();

    const consultaVotos = `
      SELECT *
      FROM votos;
    `;
    const resultadoVotos = await client.query(consultaVotos);

    const consultaUsuarios = `
      SELECT *
      FROM usuarios;
    `;
    const resultadoUsuarios = await client.query(consultaUsuarios);

    const consultaRamos = `
      SELECT *
      FROM ramos;
    `;
    const resultadoRamos = await client.query(consultaRamos);

    const resultado = {
      votos: resultadoVotos.rows,
      usuarios: resultadoUsuarios.rows,
      ramos: resultadoRamos.rows,
    };
    return resultado;
  } catch (error) {
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}

async function consultaSeccion(seccion_curso) {
  const client = new Client({
    user: process.env.usuario_DB,
    host: process.env.public_IP,
    database: process.env.nombre_DB,
    password: process.env.clave_DB,
    port: process.env.pub_Port,
  });

  try {
    await client.connect();

    const consultaVotos = `
      SELECT valoracion
      FROM votos
      WHERE seccion_curso = $1;
    `;
    const resultadoVotos = await client.query(consultaVotos, [seccion_curso]);

    const consultaCurso = `
      SELECT *
      FROM votos
      WHERE seccion_curso = $1;
    `;
    const resultadoCurso = await client.query(consultaCurso, [seccion_curso]);

    return {
      valoraciones: resultadoVotos.rows,
      resultados: resultadoCurso.rows,
    };
  } catch (error) {
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}

async function buscaSeccion(seccionCurso) {
  const client = new Client({
    user: process.env.usuario_DB,
    host: process.env.public_IP,
    database: process.env.nombre_DB,
    password: process.env.clave_DB,
    port: process.env.pub_Port,
  });

  try {
    await client.connect();

    const query = `
      SELECT curso_id, nombre_curso, semestre, anio, active
      FROM ramos
      WHERE seccion_curso = $1;
    `;
    const values = [seccionCurso];
    const result = await client.query(query, values);

    if (result.rowCount > 0) {
      const curso_id = result.rows[0].curso_id;
      const nombre_curso = result.rows[0].nombre_curso;
      const semestre = result.rows[0].semestre;
      const anio = result.rows[0].anio;
      const active = result.rows[0].active;

      return { curso_id, nombre_curso, semestre, anio, active };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al buscar el curso por sección:", error);
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = {
  consultarDB,
  consultaSeccion,
  buscaSeccion,
};
