const fs = require("fs");
const axios = require("axios");

// Middleware que verifica si el usuario ha iniciado sesión
function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401); // Si el usuario no está autenticado, responde con un estado 401 (No autorizado)
}

// Función para registrar errores en un archivo de registro
function logError(error) {
  const logFilePath = "log.json";

  // Cargar registros existentes
  let logs = [];
  try {
    const logData = fs.readFileSync(logFilePath, "utf8");
    logs = JSON.parse(logData);
  } catch (error) {
    // Si no se puede leer el archivo, se crea uno vacío
    logs = [];
  }

  // Crear objeto de registro de error
  const errorLog = {
    message: error.message,
    stack: error.stack,
    date: new Date().toISOString(),
  };

  // Agregar el registro al array
  logs.push(errorLog);

  // Escribir los registros en el archivo JSON
  fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), "utf8");
}

// Middleware para verificar el token JWT
async function verifyToken(req, res, next) {
  try {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
      const bearerToken = bearerHeader.split(" ")[1];
      try {
        const response = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${bearerToken}`
        );
        req.token = response.data;
        next();
      } catch (error) {
        logError(error); // Registrar el error en caso de que ocurra
        console.error(error); // Mostrar el error en la consola
        res.sendStatus(500); // Error al realizar la petición a la API externa
      }
    } else {
      res.sendStatus(403); // Si no se proporciona el encabezado de autorización, responde con un estado 403 (Prohibido)
    }
  } catch (error) {
    logError(error); // Registrar el error en caso de que ocurra
    console.error(error); // Mostrar el error en la consola
    res.sendStatus(500); // Error interno del servidor
  }
}

module.exports = { isLogIn, logError, verifyToken };
