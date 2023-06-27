const axios = require("axios");

// Middleware que verifica si el usuario ha iniciado sesión
function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401); // Si el usuario no está autenticado, responde con un estado 401 (No autorizado)
}

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
    //console.error(error); // Mostrar el error en la consola
  }
}

async function verifyTokenbody(token) {
  try {
    if (typeof token !== "undefined") {
      try {
        const response = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
        );
        if (response.data.aud) {
          return {
            usuario_id: response.data.sub,
            nombre: response.data.name,
          };
        }

        //return response.data;
      } catch (error) {
        logError(error); // Registrar el error en caso de que ocurra
        return false; // Error al realizar la petición a la API externa 500
      }
    } else {
      return false; // Si no se proporciona el encabezado de autorización 403
    }
  } catch (error) {
    logError(error); // Registrar el error en caso de que ocurra
    return false; // Error interno del servidor 500
  }
}

module.exports = {
  verifyToken,
  verifyTokenbody,
  isLogIn,
};
