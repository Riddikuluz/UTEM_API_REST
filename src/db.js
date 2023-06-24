const { Client } = require("pg");
const functions = require("./functions");
require("dotenv").config({ path: "./config/.env" });
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const client = new Client({
  user: process.env.usuario_DB,
  host: process.env.public_IP,
  database: process.env.nombre_DB,
  password: process.env.clave_DB,
  port: process.env.pub_Port,
});

async function onlineDB() {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        functions.logError(err);
        reject(err);
      } else {
        resolve("Conexión exitosa a la base de datos.");
      }
    });
  });
}

async function revisarBaseDatos() {
  try {
    await client.connect();

    // Consulta para obtener todos los votos registrados en la tabla "votos"
    const consulta = `
      SELECT *
      FROM votos;
    `;
    const resultado = await client.query(consulta);

    // Imprimir los resultados
    console.log("Votos registrados:", resultado.rows);
    return resultado.rows;
    //console.log("Total de votos:", resultado.rowCount);
    //return resultado.rows;
  } catch (error) {
    console.error("Error al revisar la base de datos:", error);
  } finally {
    await client.end();
  }
}

async function registrarVoto(usuarioId, fecha, cursoId, valoracion) {
  try {
    await client.connect();

    // Verificar si el usuario ya ha votado para el día y curso actual
    const votoPorUsuarioQuery = `
      SELECT COUNT(*) as count
      FROM votos
      WHERE usuario_id = $1
        AND fecha = $2;
    `;
    const votoPorUsuarioValues = [usuarioId, fecha];
    const votoPorUsuarioResult = await client.query(
      votoPorUsuarioQuery,
      votoPorUsuarioValues
    );
    const votoPorUsuarioRowCount = parseInt(votoPorUsuarioResult.rows[0].count);

    if (votoPorUsuarioRowCount === 0) {
      // Generar el identificador único para el voto
      const votoId = uuid.v4();

      // Insertar el voto en la base de datos
      const insertQuery = `
        INSERT INTO votos (voto_id, usuario_id, fecha, curso_id, valoracion)
        VALUES ($1, $2, $3, $4, $5);
      `;
      const insertValues = [votoId, usuarioId, fecha, cursoId, valoracion];
      await client.query(insertQuery, insertValues);

      console.log("Voto registrado exitosamente.");
    } else {
      console.log("Ya has votado para este día.");
    }
  } catch (error) {
    console.error("Error al registrar el voto:", error);
  } finally {
    await client.end();
  }
}

module.exports = { registrarVoto, revisarBaseDatos, onlineDB };
