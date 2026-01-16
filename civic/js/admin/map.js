/* =====================================================
   ADMIN MAP – SMART CITY (LEAFLET)
   ===================================================== */

/* ---------- MAP INITIALIZATION ---------- */
const map = L.map("map").setView([22.9734, 78.6569], 5); // India center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

/* ---------- ISSUE DATA (DUMMY / API READY) ---------- */
const issues = [
  {
    id: 1,
    title: "Water Pipeline Burst",
    description: "Heavy leakage reported near main road",
    status: "critical",
    location: "Delhi – Sector 12",
    coords: [28.6139, 77.2090]
  },
  {
    id: 2,
    title: "Garbage Overflow",
    description: "Bins overflowing for 2 days",
    status: "warning",
    location: "Mumbai – Andheri",
    coords: [19.0760, 72.8777]
  },
  {
    id: 3,
    title: "Street Light Not Working",
    description: "Dark zone reported by citizens",
    status: "info",
    location: "Bengaluru – Whitefield",
    coords: [12.9716, 77.5946]
  },
  {
    id: 4,
    title: "Road Cave-In",
    description: "Road partially collapsed",
    status: "critical",
    location: "Ahmedabad – SG Highway",
    coords: [23.0225, 72.5714]
  }
];

/* ---------- STATUS COLORS ---------- */
const statusColor = {
  critical: "#e53935",
  warning: "#fb8c00",
  info: "#1e88e5"
};

/* ---------- MARKER STORAGE ---------- */
const markers = [];

/* ---------- CREATE MARKERS ---------- */
issues.forEach(issue => {
  const marker = L.circleMarker(issue.coords, {
    radius: 9,
    color: statusColor[issue.status],
    fillColor: statusColor[issue.status],
    fillOpacity: 0.85
  }).addTo(map);

  marker.bindPopup(`
    <div style="min-width:220px">
      <h3 style="margin:0;color:${statusColor[issue.status]}">
        ${issue.title}
      </h3>
      <p>${issue.description}</p>
      <strong>📍 ${issue.location}</strong><br>
      <small>Status: ${issue.status.toUpperCase()}</small>
      <hr>
      <button onclick="assignCrew(${issue.id})">🚑 Assign Crew</button>
      <button onclick="resolveIssue(${issue.id})">✅ Mark Resolved</button>
    </div>
  `);

  markers.push(marker);
});

/* ---------- ADMIN ACTIONS ---------- */
window.assignCrew = function (id) {
  alert(`🚧 Crew assigned to issue ID: ${id}`);
};

window.resolveIssue = function (id) {
  alert(`✅ Issue ID ${id} marked as resolved`);
};

/* ---------- LIVE ISSUE SIMULATION ---------- */
setInterval(() => {
  const random = issues[Math.floor(Math.random() * issues.length)];
  const pulse = L.circle(random.coords, {
    radius: 200,
    color: statusColor[random.status],
    fillOpacity: 0.2
  }).addTo(map);

  setTimeout(() => map.removeLayer(pulse), 1500);
}, 4000);

/* ---------- GEOLOCATION (ADMIN VIEW) ---------- */
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const adminLocation = [pos.coords.latitude, pos.coords.longitude];

    L.marker(adminLocation)
      .addTo(map)
      .bindPopup("🧑‍💼 You (Admin)")
      .openPopup();

    map.setView(adminLocation, 10);
  });
}

/* ---------- CONSOLE CONFIRM ---------- */
console.log("✅ Admin Smart City Map Loaded Successfully");
