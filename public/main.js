const socket = io();

socket.on("connection", console.log("a user connected"));

const dataArray = [];

socket.on("sendData", function (data) {
  const list = document.getElementById("list");
  const item = document.createElement("li");
  item.setAttribute("class", "card");
  item.innerHTML = `<span>${data.name}</span><span>${data.group}</span><span>${data.time}</span>`;
  list.appendChild(item);
  dataArray.push(data);
});

// Download excel file
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
