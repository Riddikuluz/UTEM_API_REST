const axios = require("axios");
const functions = require("../utils/functions");

// Middleware que verifica si el usuario ha iniciado sesión

async function isLogIn(req, res, next) {
  try {
    if (await req.user) {
      next();
    } else {
      res.sendStatus(401); // Si el usuario no está autenticado, responde con un estado 401 (No autorizado)
    }
  } catch (error) {
    functions.logError(error);
    console.error("Error en isLogIn:", error);
    res.sendStatus(500); // En caso de error, responde con un estado 500 (Error del servidor)
  }
}

async function verifyToken(req, res, next) {
  try {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader === "undefined") {
      return res.sendStatus(403); // Si no se proporciona el encabezado de autorización, responde con un estado 403 (Prohibido)
    }

    const bearerToken = bearerHeader.split(" ")[1];
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${bearerToken}`
      );
      req.token = response.data;
      next();
    } catch (error) {
      functions.logError(error);
      console.error("Error al realizar la petición a la API externa:", error);
      return res.sendStatus(500); // Error al realizar la petición a la API externa
    }
  } catch (error) {
    functions.logError(error);
    console.error("Error en verifyToken:", error);
  }
}

module.exports = {
  verifyToken,
  isLogIn,
};
