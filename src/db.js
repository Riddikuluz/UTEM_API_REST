const { Client } = require("pg");
const functions = require("./functions");
require("dotenv").config({ path: "./config/.env" });

async function onlineDB() {
  const client = new Client({
    user: process.env.usuario_DB,
    host: process.env.public_IP,
    database: process.env.nombre_DB,
    password: process.env.clave_DB,
    port: process.env.pub_Port,
  });

  try {
    await client.connect();
    return "Conexión exitosa a la base de datos.";
  } catch (error) {
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}

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
  fecha
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
    INSERT INTO usuarios (usuario_id, nombre, fecha)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

    const userResult = await client.query(insertOrUpdateUserQuery, [
      usuario_id,
      nombre,
      fecha,
    ]);
    //const userId = userResult.rows[0].id;

    const insertVoteQuery = `
      INSERT INTO votos (curso_id, nombre_curso, fecha, valoracion)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const voteResult = await client.query(insertVoteQuery, [
      curso_id,
      nombre_curso,
      fecha,
      valoracion,
    ]);
    //const voteId = voteResult.rows[0].id;
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
  onlineDB,
  consultaRamo,
};
