const { Client } = require("pg");
const functions = require("../utils/functions");
require("dotenv").config({ path: "./config/.env" });

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
      `;

    await client.query(insertUserQuery, [usuario_id, nombre, fecha, curso_id]);

    const insertVoteQuery = `
        INSERT INTO votos (curso_id, nombre_curso, fecha, valoracion, seccion_curso, semestre, anio, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
    throw error;
  } finally {
    await client.end();
  }
}
module.exports = {
  registrarVoto,
};
