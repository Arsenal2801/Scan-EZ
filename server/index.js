// Import dependencies
import { SerialPort, ReadlineParser } from "serialport";
import http from "http";
import express from "express";
import { Server } from "socket.io";

// Defining useful variables and constants
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Defining the folder that will be used for static assets
// Vuelca el contenido de la carpeta public en la raíz del servidor
app.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const port = new SerialPort({
  path: "COM3",
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

// Open the port
port.on("open", () => {
  console.log("Port open");
});

// Read data from the port
parser.on("data", (data) => {
  try {
    console.log(saveDataOnArray(data));
    io.emit("sendData", saveDataOnArray(data));
  } catch (error) {}
});

// Function to save data on array
const saveDataOnArray = (data) => {
  const dataJSON = JSON.parse(data);
  let date = new Date();
  let hour = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  if (hour < 10) hour = "0" + hour;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;
  let time = `${hour}:${minutes}:${seconds}`;
  dataJSON["time"] = time;
  return dataJSON;
};
