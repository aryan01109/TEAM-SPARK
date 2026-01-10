const token = localStorage.getItem("token");

if (!token) {
  alert("Admin not logged in");
  window.location.href = "Login.html";
}

/* Initialize map */
const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* Fetch issues from backend */
fetch("http://localhost:5000/api/map/issues", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => res.json())
.then(issues => {
  issues.forEach(issue => {

    let color = "red";
    if (issue.status === "In Progress") color = "orange";
    if (issue.status === "Resolved") color = "green";

    const marker = L.circleMarker([issue.latitude, issue.longitude], {
      radius: 10,
      color: color,
      fillOpacity: 0.85
    }).addTo(map);

    marker.bindPopup(`
      <b>${issue.title}</b><br>
      ${issue.description}<br>
      <b>Status:</b> ${issue.status}<br><br>
      <button onclick="updateStatus('${issue._id}','Resolved')">
        Mark Resolved
      </button>
    `);
  });
});

/* Update status */
function updateStatus(id, status) {
  fetch("http://localhost:5000/api/map/issue/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status })
  })
  .then(() => location.reload());
}
