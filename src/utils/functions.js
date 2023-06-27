const fs = require("fs");

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
    const data = fs.readFileSync("./log/logError.json", "utf8");
    errorLogs = JSON.parse(data);
  } catch (err) {
    // Si no se puede leer el archivo o está vacío, se crea un array vacío
    errorLogs = [];
  }
  // Agregar el nuevo registro de error al array
  errorLogs.push(errorLog);
  // Escribir los registros en el archivo JSON
  fs.writeFileSync(
    "./log/logError.json",
    JSON.stringify(errorLogs, null, 2),
    "utf8"
  );
}

function yaVoto(dataResultados, usuarioV, fechaV, cursoV) {
  try {
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

      if (
        voto.usuario_id == usuarioV &&
        fechaObj1.getTime() === fechaObj2.getTime() &&
        voto.curso_id == cursoV
      ) {
        return true;
      }
    }
    return false;
  } catch (error) {
    logError(error);
    console.error("Error en la función yaVoto:", error);
    return false;
  }
}

function calcularPromedio(dataResultados) {
  try {
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
  } catch (error) {
    logError(error);
    console.error("Error en la función calcularPromedio:", error);
    return "Error al calcular el promedio.";
  }
}

module.exports = {
  logError,
  yaVoto,
  calcularPromedio,
};
