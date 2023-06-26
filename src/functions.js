const fs = require("fs");
const axios = require("axios");
const { type } = require("os");

// Middleware que verifica si el usuario ha iniciado sesión
function isLogIn(req, res, next) {
  req.user ? next() : res.sendStatus(401); // Si el usuario no está autenticado, responde con un estado 401 (No autorizado)
}

// Función para registrar errores en un archivo de registro
function logError(error) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    date: new Date().toISOString(),
  };

  // Leer los registros existentes (si hay alguno)
  let errorLogs = [];
  try {
    const data = fs.readFileSync("./src/logError.json", "utf8");
    errorLogs = JSON.parse(data);
  } catch (err) {
    // Si no se puede leer el archivo o está vacío, se crea un array vacío
    errorLogs = [];
  }

  // Agregar el nuevo registro de error al array
  errorLogs.push(errorLog);

  // Escribir los registros en el archivo JSON
  fs.writeFileSync(
    "./src/logError.json",
    JSON.stringify(errorLogs, null, 2),
    "utf8"
  );
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
    res.sendStatus(500); // Error interno del servidor
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

function yaVoto(dataResultados, usuarioV, fechaV, cursoV) {
  for (let i = 0; i < dataResultados.length; i++) {
    const voto = dataResultados[i];
    const fechaR = voto.fecha.toISOString().slice(0, 10);
    const partesFecha1 = fechaR.split("-");
    const fechaObj1 = new Date(
      partesFecha1[0],
      partesFecha1[1] - 1,
      partesFecha1[2]
    );

    const partesFecha2 = fechaV.split("-");
    const fechaObj2 = new Date(
      partesFecha2[2],
      partesFecha2[1] - 1,
      partesFecha2[0]
    );
    //console.log(voto.usuario_id);
    //console.log(usuarioV);
    //console.log(fechaObj2.getTime());
    //console.log(fechaObj1.getTime());
    //console.log(voto.curso_id);
    //console.log(cursoV);

    if (
      voto.usuario_id == usuarioV &&
      fechaObj1.getTime() === fechaObj2.getTime() &&
      voto.curso_id == cursoV
    ) {
      return true;
    }
  }
  return false;
}

function calcularPromedio(dataResultados) {
  const numeros = dataResultados.map((objeto) => objeto.valoracion);

  const sumatoria = numeros.reduce(
    (acumulador, numero) => acumulador + numero,
    0
  );
  if (sumatoria > 0) {
    return sumatoria / numeros.length;
  } else {
    return "No hay registros.";
  }
}

module.exports = {
  isLogIn,
  logError,
  verifyToken,
  verifyTokenbody,
  yaVoto,
  calcularPromedio,
};
