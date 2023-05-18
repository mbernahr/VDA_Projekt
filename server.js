const fs = require("fs");
const path = require("path");
const port = 6789;
let message = `Webserver is running on port ${port}.`;

const express = require("express");
const app = express();
app.use(express.static("public"));
const server = app.listen(port);

console.log(message);

const socket = require("socket.io");
const io = socket(server);

io.sockets.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected.`);

  let disconnect = () => {
    console.log(`Client ${socket.id} disconnected.`);
  };


  let get_boardgames_data = (parameters) => {
    console.log(`Received data request with these parameters: ${parameters}`)
    fs.readFile("./data/boardgames_100.json", "utf8", (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      let json_data = JSON.parse(data)
      socket.emit("boardgames_data", json_data)
    })
  }

  socket.on("disconnect", disconnect);

  socket.on("get_boardgames_data", get_boardgames_data);
});