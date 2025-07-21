
const http = require("http");
const { Client } = require("pg");
const connectionData = {
  user: "postgres",
  host: "127.0.0.1",
  database: "formulariodb",
  password: "kae123",
  port: 5432,
};
const client = new Client(connectionData);
client.connect();
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204); // Sin contenido
    res.end();
    return;
  }
  if (req.method === "GET" && req.url === "/") {
    client.query(`SELECT * FROM practica.usuarios ORDER BY correo`).then((respone) => {
      res.writeHead(200, { "content-type": "text/json" });
      res.end(JSON.stringify(respone.rows));
    });
  } else if (req.method === "GET" && req.url.startsWith("/")) {
    client
      .query(
        `SELECT * FROM practica.usuarios where correo like '${req.url.substring(
          1
        )}%' ORDER BY correo`
      )
      .then((response) => {
        const respuesta = response.rows || [];
        res.writeHead(200, { "content-type": "text/json" });
        res.end(JSON.stringify(respuesta));
      });
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
              mensaje: "Hubo un error ",
              data: err,
            })
          );
        });
    });
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
                mensaje: "se actualizo correctamente",
                data: body,
              })
            );
          } else {
            res.writeHead(400, { "content-Type": "application/json" });
            res.end(
              JSON.stringify({
                mensaje: "no se encontro el elemento",
              })
            );
          }
        })
        .catch((err) => {
          res.writeHead(404, { "content-Type": "application/json" });
          res.end(
            JSON.stringify({
              mensaje: "error al actualizar",
              data: err,
            })
          );
        });
    });
  } else if (req.method === "DELETE" && req.url.startsWith("/eliminar/")) {
    let body = {};
    console.log("ngjisdahiugfa");
    console.log(req.url.substring(10));
    client
        .query(
          `DELETE FROM practica.usuarios WHERE correo LIKE '${req.url.substring(10)}'`
        )
        .then((response) => {
          if (response.rowCount) {
            res.writeHead(201, { "Concente-Type": "application/json" });
            res.end(
              JSON.stringify({
                mensaje: "eliminado con exito",
                data: body,
              })
            );
          } else {
            res.writeHead(404, { "Concente-Type": "apliccation/json" });
            res.end(
              JSON.stringify({
                mensaje: "elemento no encontrado",
                data: body,
              })
            );
          }
        })
        .catch((err) => {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end({
            mensaje: "Hubo un error al eliminar ",
            data: err,
          });
        });

  } else if (req.method === "PATCH" && req.url === "/parcial") {
    console.log("nice");
    let body = {};
    req.on("data", (chuck) => {
      body = JSON.parse(chuck);
      console.log(body);
      console.log(typeof body);
      typeof body;
      for (const key of Object.keys(body)) {
        if (key == "correo") {

        } else {
          console.log(key);
          console.log(body[key]);
          client
            .query(
              `UPDATE practica.usuarios SET ${key} = '${body[key]}' WHERE correo = '${body.correo}'`
            )
            .then((response) => {
              if (response.rowCount) {
                res.writeHead(200, { "Concente-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    mensaje: "modificado con exito",
                    data: body,
                  })
                );
              } else {
                res.writeHead(404, { "Concente-Type": "apliccation/json" });
                res.end(
                  JSON.stringify({
                    mensaje: "elemento no encontrado",
                    data: body,
                  })
                );
              }
            })
            .catch((err) => {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end({
                mensaje: "Hubo un error al modificar ",
                data: err,
              });
            });
        }
      }
    });
  } else {
    console.log("bad");
    console.warn(
      "error del metodo " +
        "method: " +
        req.method +
        "; URL: " +
        req.url +
        "   "
    );
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log("Servidor conectado en el puerto 3000");
});
