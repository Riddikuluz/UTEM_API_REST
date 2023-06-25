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
      FROM ramo;
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

async function consultaRamo(curso_id) {
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
      WHERE curso_id = $1;
    `;
    const resultadoVotos = await client.query(consultaVotos, [curso_id]);

    return resultadoVotos.rows;
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
  seccion_curso
) {
  const client = new Client({
    user: process.env.usuario_DB,
    host: process.env.public_IP,
    database: process.env.nombre_DB,
    password: process.env.clave_DB,
    port: process.env.pub_Port,
  });

  try {
    await client.connect();

    const insertOrUpdateUserQuery = `
    INSERT INTO usuarios (usuario_id, nombre, fecha, curso_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

    await client.query(insertOrUpdateUserQuery, [
      usuario_id,
      nombre,
      fecha,
      curso_id,
    ]);

    const insertVoteQuery = `
      INSERT INTO votos (curso_id, nombre_curso, fecha, valoracion, seccion_curso)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    await client.query(insertVoteQuery, [
      curso_id,
      nombre_curso,
      fecha,
      valoracion,
      seccion_curso,
    ]);
  } catch (error) {
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = {
  registrarVoto,
  consultadb,
  consultaRamo,
  dbcurso,
};
