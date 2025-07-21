const http = require("http");
const { Client } = require("pg");
// Configuración de conexión a la base de datos
const connectionData = {
  user: "postgres",
  host: "127.0.0.1",
  database: "formulariodb",
  password: "kae123",
  port: 5432,
};




const client = new Client(connectionData);
client.connect();

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

// Ruta para obtener todos los usuarios
  if (req.method === "GET" && req.url === "/") {
    client
      .query(`SELECT * FROM practica.usuarios ORDER BY correo`)
      .then((respone) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(respone.rows));
      }).catch((err) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error al obtener datos", body: err }));
      });

  // Ruta para buscar usuarios por correo (parcial)
  } else if (req.method === "GET" && req.url.startsWith("/")) {
    client
      .query(
        `SELECT * FROM practica.usuarios where correo like '${req.url.substring(
          1
        )}%' ORDER BY correo`
      )
      .then((response) => {
        if (response.rowCount == 0) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({mensaje: "Usuario no encontrado"}));
        }else{
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify(response.rows));
        }
      }).catch((err) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error en búsqueda", body: err }));
      });

  // Ruta para registrar un nuevo usuario
  } else if (req.method === "POST" && req.url === "/registro") {
    let body = {};

    req.on("data", (chunk) => {
      body = JSON.parse(chunk);
      client
        .query(
          `INSERT INTO practica.usuarios (correo, nombre, mensaje) VALUES ('${body.correo}','${body.nombre}','${body.mensaje}')`
        )
        .then(() => {
          res.writeHead(201, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              mensaje: "se creo correctamente ",
              data: body,
            })
          );
        })
        .catch((err) => {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              mensaje: "Hubo un error al insertar el usuario ",
              data: err,
            })
          );
        });
    });

  // Ruta para actualizar usuario completamente
  } else if (req.method === "PUT" && req.url.startsWith("/actualizar/")) {
    let body = {};
    req.on("data", (chunk) => {
      body = JSON.parse(chunk);
      client
        .query(
          `UPDATE practica.usuarios SET nombre = '${body.nombre}', mensaje = '${body.mensaje}' WHERE correo like '${body.correo}'`
        )
        .then((response) => {
          if (response.rowCount) {
            res.writeHead(200, { "content-Type": "application/json" });
            res.end(
              JSON.stringify({
                mensaje: "Se actualizo correctamente",
                data: body,
              })
            );
          } else {
            res.writeHead(404, { "content-Type": "application/json" });
            res.end(
              JSON.stringify({
                mensaje: "Usuario no encontrado",
              })
            );
          }
        })
        .catch((err) => {
          res.writeHead(500, { "content-Type": "application/json" });
          res.end(
            JSON.stringify({
              mensaje: "error al actualizar",
              data: err,
            })
          );
        });
    });
    
  // Ruta para eliminar un usuario
  } else if (req.method === "DELETE" && req.url.startsWith("/eliminar/")) {
    let body = {};
    client
      .query(
        `DELETE FROM practica.usuarios WHERE correo LIKE '${req.url.substring(
          10
        )}'`
      )
      .then((response) => {
        if (response.rowCount) {
          res.writeHead(200, { "Concente-Type": "application/json" });
          res.end(
            JSON.stringify({
              mensaje: "Eliminado con exito",
              data: body,
            })
          );
        } else {
          res.writeHead(404, { "Concente-Type": "apliccation/json" });
          res.end(
            JSON.stringify({
              mensaje: "Usuario no encontrado",
              data: body,
            })
          );
        }
      })
      .catch((err) => {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end({
          mensaje: "Error al eliminar ",
          data: err,
        });
      });

  // Ruta para actualizar parcialmente con PATCH
  } else if (req.method === "PATCH" && req.url === "/parcial") {
    let body = {};
    req.on("data", (chuck) => {
      body = JSON.parse(chuck);
      for (const key of Object.keys(body)) {
        if (key != "correo") {
          client
            .query(
              `UPDATE practica.usuarios SET ${key} = '${body[key]}' WHERE correo = '${body.correo}'`
            )
            .then((response) => {
              if (response.rowCount>0) {
                res.writeHead(200, { "Concente-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    mensaje: "Actualizado con exito",
                    data: body,
                  })
                );
              } else {
                res.writeHead(404, { "Concente-Type": "apliccation/json" });
                res.end(
                  JSON.stringify({
                    mensaje: "No se encontro al usuario",
                  })
                );
              }
            })
            .catch((err) => {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end({
                mensaje: "Error al modificar ",
                data: err,
              });
            });
        }
      }
    });

  // Ruta no encontrada
  } else {
    console.log("bad");
    console.warn(
      "Ruta no válida - Method: " +
        req.method +
        "; URL: " +
        req.url
    );
    res.writeHead(404, {"Content-Type":"application/json"});
    res.end(JSON.stringify({mensaje: "Ruta o metodo no encontrado"}));
  }
});

// Escuchar en el puerto 3000
server.listen(3000, () => {
  console.log("Servidor conectado en el puerto 3000");
});
