/* ==========================
   CONFIG
========================== */
const userRole = "admin"; // admin | supervisor

const issues = [
  {
    id: "CIV-101",
    title: "Water leakage",
    priority: "high",
    status: "pending",
    lat: 23.034,
    lng: 72.526
  },
  {
    id: "CIV-102",
    title: "Broken streetlight",
    priority: "medium",
    status: "in-progress",
    lat: 23.045,
    lng: 72.552
  },
  {
    id: "CIV-103",
    title: "Garbage overflow",
    priority: "low",
    status: "pending",
    lat: 23.015,
    lng: 72.565
  }
];

/* ==========================
   MAP INIT
========================== */
const map = L.map("map").setView([23.03, 72.54], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ==========================
   ICONS
========================== */
function icon(color) {
  return new L.Icon({
    iconUrl: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
}

const icons = {
  high: icon("red"),
  medium: icon("orange"),
  low: icon("green")
};

/* ==========================
   MARKERS
========================== */
const cluster = L.markerClusterGroup();
const heatPoints = [];

issues.forEach(issue => {
  const marker = L.marker([issue.lat, issue.lng], {
    icon: icons[issue.priority]
  });

  marker.on("click", () => showDetails(issue));
  cluster.addLayer(marker);

  heatPoints.push([issue.lat, issue.lng, issue.priority === "high" ? 1 : 0.5]);
});

map.addLayer(cluster);

/* ==========================
   HEATMAP
========================== */
let heatLayer = L.heatLayer(heatPoints, {
  radius: 25,
  blur: 15
});

let heatVisible = false;

document.getElementById("toggleHeat").onclick = () => {
  heatVisible = !heatVisible;
  heatVisible ? map.addLayer(heatLayer) : map.removeLayer(heatLayer);
};

/* ==========================
   DETAILS PANEL
========================== */
function showDetails(issue) {
  document.getElementById("details").innerHTML = `
    <div class="issue-row"><strong>${issue.title}</strong></div>
    <div class="issue-row">ID: ${issue.id}</div>
    <div class="issue-row">
      Priority:
      <span class="priority-${issue.priority}">
        ${issue.priority.toUpperCase()}
      </span>
    </div>
    <div class="issue-row">Status: ${issue.status}</div>
  `;
}

/* ==========================
   ADD ISSUE (ADMIN ONLY)
========================== */
const addBtn = document.getElementById("addIssueBtn");

if (userRole !== "admin") {
  addBtn.style.display = "none";
}

addBtn.onclick = () => {
  alert("Click on map to add issue");
  map.once("click", e => {
    const title = prompt("Issue title:");
    if (!title) return;

    const issue = {
      id: "CIV-" + Date.now(),
      title,
      priority: "medium",
      status: "pending",
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };

    const marker = L.marker([issue.lat, issue.lng], {
      icon: icons.medium
    }).addTo(cluster);

    marker.on("click", () => showDetails(issue));
    heatLayer.addLatLng([issue.lat, issue.lng, 0.6]);
  });
};