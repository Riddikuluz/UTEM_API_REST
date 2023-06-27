const { Client } = require("pg");
const functions = require("../utils/functions");
require("dotenv").config({ path: "./config/.env" });

function getClient() {
  return new Client({
    user: process.env.usuario_DB,
    host: process.env.public_IP,
    database: process.env.nombre_DB,
    password: process.env.clave_DB,
    port: process.env.pub_Port,
  });
}

async function registrarVoto(
  cursoId,
  nombreCurso,
  fecha,
  valoracion,
  usuarioId,
  nombre,
  seccionCurso,
  semestre,
  anio,
  active
) {
  const client = getClient();
  try {
    await client.connect();

    await client.query("BEGIN"); // Inicia la transacción

    const insertUserQuery = `
      INSERT INTO usuarios (usuario_id, nombre, fecha, curso_id)
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(insertUserQuery, [usuarioId, nombre, fecha, cursoId]);

    const insertVoteQuery = `
      INSERT INTO votos (curso_id, nombre_curso, fecha, valoracion, seccion_curso, semestre, anio, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await client.query(insertVoteQuery, [
      cursoId,
      nombreCurso,
      fecha,
      valoracion,
      seccionCurso,
      semestre,
      anio,
      active,
    ]);

    await client.query("COMMIT"); // Confirma la transacción
  } catch (error) {
    await client.query("ROLLBACK"); // Deshace la transacción en caso de error
    functions.logError(error);
    throw error;
  } finally {
    await client.end();
  }
}

module.exports = {
  registrarVoto,
};
