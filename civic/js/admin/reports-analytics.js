document.addEventListener("DOMContentLoaded", () => {

  /* ---------- DATA ---------- */
  const reports = [
    { id: "RPT-01", title: "Pothole", zone: "Zone A", status: "New", lat: 23.02, lng: 72.57 },
    { id: "RPT-02", title: "Garbage", zone: "Zone B", status: "In Progress", lat: 23.01, lng: 72.56 },
    { id: "RPT-03", title: "Street Light", zone: "Zone A", status: "Resolved", lat: 23.03, lng: 72.58 },
    { id: "RPT-04", title: "Water Leak", zone: "Zone C", status: "New", lat: 23.04, lng: 72.55 }
  ];

  /* ---------- TABLE ---------- */
  const table = document.getElementById("reportTable");
  reports.forEach(r => {
    table.innerHTML += `
      <tr>
        <td>${r.id}</td>
        <td>${r.title}</td>
        <td>${r.zone}</td>
        <td>${r.status}</td>
        <td>Today</td>
      </tr>
    `;
  });

  /* ---------- CHARTS ---------- */
  const zoneCount = {};
  const statusCount = {};

  reports.forEach(r => {
    zoneCount[r.zone] = (zoneCount[r.zone] || 0) + 1;
    statusCount[r.status] = (statusCount[r.status] || 0) + 1;
  });

  new Chart(document.getElementById("zoneChart"), {
    type: "bar",
    data: {
      labels: Object.keys(zoneCount),
      datasets: [{
        label: "Reports",
        data: Object.values(zoneCount)
      }]
    }
  });

  new Chart(document.getElementById("statusChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(statusCount),
      datasets: [{
        data: Object.values(statusCount)
      }]
    }
  });

  /* ---------- MAP ---------- */
  const map = L.map("map").setView([23.02, 72.57], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  reports.forEach(r => {
    L.marker([r.lat, r.lng])
      .addTo(map)
      .bindPopup(`<strong>${r.title}</strong><br>${r.zone}`);
  });

  /* ---------- TOGGLE ---------- */
  const listView = document.getElementById("listView");
  const mapView = document.getElementById("mapView");

  document.getElementById("mapBtn").onclick = () => {
    listView.classList.add("hidden");
    mapView.classList.remove("hidden");
    document.getElementById("mapBtn").classList.add("active");
    document.getElementById("listBtn").classList.remove("active");
    map.invalidateSize();
  };

  document.getElementById("listBtn").onclick = () => {
    mapView.classList.add("hidden");
    listView.classList.remove("hidden");
    document.getElementById("listBtn").classList.add("active");
    document.getElementById("mapBtn").classList.remove("active");
  };
});
