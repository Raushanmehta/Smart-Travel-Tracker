const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const exportBtn = document.getElementById("exportBtn");

const networkType = document.getElementById("networkType");
const networkSpeed = document.getElementById("networkSpeed");
const logTable = document.querySelector("#logTable tbody");

let watchId = null;
let logData = [];

function getNetworkInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    return {
      type: connection.effectiveType || "unknown",
      downlink: connection.downlink + " Mbps" || "unknown"
    };
  }
  return { type: "unknown", downlink: "unknown" };
}

function logPosition(position) {
  const { latitude, longitude } = position.coords;
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  const network = getNetworkInfo();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${date}</td>
    <td>${time}</td>
    <td>${latitude.toFixed(5)}</td>
    <td>${longitude.toFixed(5)}</td>
    <td>${network.type}</td>
    <td>${network.downlink}</td>
  `;
  logTable.appendChild(row);

  logData.push({
    date,
    time,
    latitude: latitude.toFixed(5),
    longitude: longitude.toFixed(5),
    network: network.type,
    speed: network.downlink
  });

  networkType.textContent = network.type;
  networkSpeed.textContent = network.downlink;

  exportBtn.disabled = false;
}

function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  startBtn.disabled = true;
  stopBtn.disabled = false;

  watchId = navigator.geolocation.watchPosition(logPosition, (error) => {
    alert("Error: " + error.message);
  }, {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  });
}

function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;
}

function exportToCSV() {
  const csvHeader = "Date,Time,Latitude,Longitude,Network,Speed\n";
  const csvRows = logData.map(row =>
    `${row.date},${row.time},${row.latitude},${row.longitude},${row.network},${row.speed}`
  );

  const csvContent = csvHeader + csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "travel_log.csv";
  a.click();
}

startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);
exportBtn.addEventListener("click", exportToCSV);
