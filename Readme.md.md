# Documentación

Date of delivery: 14/01/2024
Estado: Done
Projects: Scan-EZ (https://www.notion.so/Scan-EZ-4d4916606fe348ea83246185702745a6?pvs=21)

# Circuito

![Untitled](Documentacio%CC%81n%20beb7f08375914e6c96781168be434438/Untitled.png)

## Conexiones

Sensor —→ Arduino

- RSTO(En el sensor es el pin que no tiene impresión) —→ Pin 9 digital
- IRQ —→ sin conexión
- GND —→ GND
- VCC —→ 5V
- SS —→ Pin 10 digital
- MOSI —→ Pin 11 digital
- MISO —→ Pin 12 digital
- SCK —→ Pin 13 digital

---

# Código

## Arduino

```cpp

 // Inclucion de librerias (para que funcione el sensor)
#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>

 // Inicializacion del sensor
PN532_SPI interface(SPI, 10);
NfcAdapter nfc = NfcAdapter(interface);
String tagId = "None";

 // Configuracion Serial y comienzo de las lecturas del nfc (para que pueda hacer lecturas y se imprima en consola)
void setup(void) {
  Serial.begin(115200);
  nfc.begin();
}

 // Codigo repetible (lo de abajo)
void loop(void) {
  readNFC();
}

 // Funcion para la carga de la tarjeta/chip 
void readNFC() {
		// Se valida que exista una tarjeta cerca del lector
  if (nfc.tagPresent()) {
			// Se lee el tag (info)
    NfcTag tag = nfc.read();
			//Se obtiene el mensaje guardado en el tag
    NdefMessage message = tag.getNdefMessage();
    NdefRecord record = message.getRecord(0);

			// Se divide la carga del tag (quitar la info innecesaria)
    byte payloadLength = record.getPayloadLength();
    byte payload[payloadLength];
    record.getPayload(payload);
			
			// Transformacion de la carga para que sea legible en texto plano (no en binario)
    String payloadString = "";
    for (int i = 0; i < payloadLength; i++) {
      payloadString += (char)payload[i];
    }
    
			// Impresion de la informacion
    Serial.println(payloadString);

    tagId = tag.getUidString();
  }
  delay(1000);
}
```

---

## Server

> NOTA:
Para el servidor se requiere hacer la instalación de “NodeJS” en la computadora que se corra el programa.
> 

LINK DE DESCARGA: 

[Download | Node.js](https://nodejs.org/en/download)

Windows installer 64 bits

Para la ejecución del código van a escribir el siguiente comando

```bash
npm start
```

Para ejecutarlo tienes que estar en la carpeta del proyecto.

```jsx
cd .\Desktop\FeriaDeCiencias\
```

![Untitled](Documentacio%CC%81n%20beb7f08375914e6c96781168be434438/Untitled%201.png)

Para abrirlo en el navegador escriba localhost:3000

Explicación del código:

```jsx
// Importacion de dependencias
import { SerialPort, ReadlineParser } from "serialport"; // Conexion con arduino
import http from "http"; // Montaje de server http
import express from "express"; // Manejo del servidor
import { Server } from "socket.io"; // Comunicacion IRT

// Definicion de constantes para el servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Vuelca el contenido de la carpeta public en la raíz del servidor
app.use(express.static("public"));

// Se abre el servidor
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Se crea la conexion con el puerto serial (arduino)
const port = new SerialPort({
  path: "COM3",
  baudRate: 115200,
});

// Se define el delimitador para traer la informacion del puerto serial
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// Se abre el socket (tiempo real) de conexion
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
});

// Se inicializa la conexion con el puerto serial
port.on("open", () => {
  console.log("Port open");
});

// Se lee la informacion del puerto serial
parser.on("data", (data) => {
  try {
		// Se imprime la informacion en formato JSON 
    console.log(saveDataOnArray(data));
		// Se envia la informacion al cliente
    io.emit("sendData", saveDataOnArray(data));
  } catch (error) {}
});

// Conversion de la informacion recibida del puerto serial a JSON para regresarlo
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
```

En este archivo se encuentra la parte mas importante de la lógica que son las conexiones básicas y el montaje del servidor

```jsx
// Se realiza la conexion en tiempo real para obtener la info y ponerla en el index
const socket = io();

// Se comprueba la conexion
socket.on("connection", console.log("a user connected"));

// Se define una lista para obtener y guardar la informacion
const dataArray = [];

// Se vuelca la informacion del puerto seria y se imprime en el html
socket.on("sendData", function (data) {
  const list = document.getElementById("list");
  const item = document.createElement("li");
  item.setAttribute("class", "card");
  item.innerHTML = `<span>${data.name}</span><span>${data.group}</span><span>${data.time}</span>`;
  list.appendChild(item);
  dataArray.push(data);
});

// Se crea la funcion para guardar la informacion en un excel
const downloadData = () => {
  const data = dataArray;
  const date = new Date();
  // Format date to YYYY-MM-DD
  const formattedDate = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${formattedDate}.xlsx`);
};
```