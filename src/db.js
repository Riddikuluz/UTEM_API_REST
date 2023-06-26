const { Client } = require("pg");
const functions = require("./functions");
require("dotenv").config({ path: "./config/.env" });

async function consultadb() {
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

    const consultausuarios = `
      SELECT *
      FROM usuarios;
    `;
    const resultadousuarios = await client.query(consultausuarios);

    const resultado = {
      votos: resultadoVotos.rows,
      usuarios: resultadousuarios.rows,
    };
    return resultado;
  } catch (error) {
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}
async function dbcurso() {
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
      FROM ramos;
    `;
    const resultadoramos = await client.query(consultaVotos);

    return resultadoramos.rows;
  } catch (error) {
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}

async function consultaRamo(seccion_curso) {
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
    resultadoCurso = await client.query(consultaCurso, [seccion_curso]);

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

async function registrarVoto(
  curso_id,
  nombre_curso,
  fecha,
  valoracion,
  usuario_id,
  nombre,
  seccion_curso,
  semestre,
  anio,
  active
) {
  const client = new Client({
    /* Configuración de conexión a la base de datos */
    user: process.env.usuario_DB,
    host: process.env.public_IP,
    database: process.env.nombre_DB,
    password: process.env.clave_DB,
    port: process.env.pub_Port,
  });

  try {
    await client.connect();

    const insertUserQuery = `
    INSERT INTO usuarios (usuario_id, nombre, fecha, curso_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

    await client.query(insertUserQuery, [usuario_id, nombre, fecha, curso_id]);

    const insertVoteQuery = `
      INSERT INTO votos (curso_id, nombre_curso, fecha, valoracion, seccion_curso, semestre, anio, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    await client.query(insertVoteQuery, [
      curso_id,
      nombre_curso,
      fecha,
      valoracion,
      seccion_curso,
      semestre,
      anio,
      active,
    ]);
  } catch (error) {
    functions.logError(error);
  } finally {
    await client.end();
  }
}
async function buscaSeccion(seccionCurso) {
  const client = new Client({
    /* Configuración de conexión a la base de datos */
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
      WHERE seccion_curso = $1
    `;
    const values = [seccionCurso];
    const result = await client.query(query, values);

    if (result.rowCount > 0) {
      const curso_id = result.rows[0].curso_id;
      const nombre_curso = result.rows[0].nombre_curso;
      const semestre = result.rows[0].semestre;
      const anio = result.rows[0].anio;
      const active = result.rows[0].active;

      //console.log(result.rows[0]);

      return { curso_id, nombre_curso, semestre, anio, active };
    } else {
      return null; // No se encontró ninguna coincidencia
    }
  } catch (error) {
    console.error("Error al buscar el curso por sección:", error);
    functions.logError(error);
  } finally {
    await client.end();
  }
}

module.exports = {
  registrarVoto,
  consultadb,
  consultaRamo,
  dbcurso,
  buscaSeccion,
};
