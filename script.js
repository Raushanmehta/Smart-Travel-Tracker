const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const exportBtn = document.getElementById("exportBtn");

const networkTypeSpan = document.getElementById("networkType");
const networkSpeedSpan = document.getElementById("networkSpeed");
const logTableBody = document.querySelector("#logTable tbody");

let tracking = false;
let intervalId = null;
let logs = [];

function getNetworkInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    return {
      type: conn.effectiveType || "unknown",
      speed: conn.downlink ? conn.downlink + " Mbps" : "unknown",
    };
  }
  return { type: "unknown", speed: "unknown" };
}

function updateNetworkDisplay() {
  const net = getNetworkInfo();
  networkTypeSpan.textContent = net.type;
  networkSpeedSpan.textContent = net.speed;
}

function logData({ latitude, longitude }) {
  const time = new Date().toLocaleTimeString();
  const net = getNetworkInfo();

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${time}</td>
    <td>${latitude.toFixed(5)}</td>
    <td>${longitude.toFixed(5)}</td>
    <td>${net.type}</td>
    <td>${net.speed}</td>
  `;
  logTableBody.appendChild(row);

  logs.push({ time, latitude, longitude, network: net.type, speed: net.speed });
}

function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  tracking = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  exportBtn.disabled = true;

  intervalId = setInterval(() => {
    updateNetworkDisplay();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        logData(pos.coords);
      },
      (err) => {
        console.warn("Location error:", err);
      }
    );
  }, 5000); // every 5 seconds
}

function stopTracking() {
  tracking = false;
  clearInterval(intervalId);
  startBtn.disabled = false;
  stopBtn.disabled = true;
  exportBtn.disabled = logs.length === 0;
}

function exportCSV() {
  let csv = "Time,Latitude,Longitude,Network Type,Network Speed\n";
  logs.forEach(log => {
    csv += `${log.time},${log.latitude},${log.longitude},${log.network},${log.speed}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "travel-log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

startBtn.addEventListener("click", startTracking);
stopBtn.addEventListener("click", stopTracking);
exportBtn.addEventListener("click", exportCSV);
