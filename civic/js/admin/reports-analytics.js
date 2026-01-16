/* =====================================================
   REPORTS – ADMIN ANALYTICS (FINAL)
   ===================================================== */

/* ======================
   AUTH GUARD
   ====================== */
const token = localStorage.getItem("adminToken");
if (!token) {
  window.location.href = "/civic/html/auth/adminLogin.html";
}

/* ======================
   DOM READY
   ====================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- ELEMENTS ---------- */
  const tableBody = document.getElementById("reportTable");
  const mapView = document.getElementById("mapView");
  const listView = document.getElementById("listView");

  const mapBtn = document.getElementById("mapBtn");
  const listBtn = document.getElementById("listBtn");

  const zoneChartEl = document.getElementById("zoneChart");
  const statusChartEl = document.getElementById("statusChart");

  let reports = [];
  let map;
  let zoneChart, statusChart;

  /* ======================
     FETCH REPORTS
     ====================== */
  async function loadReports() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/reports", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }

      reports = await res.json();

      renderTable();
      renderCharts();
      initMap();

    } catch (err) {
      console.error(err);
      alert("Unable to load reports");
    }
  }

  /* ======================
     TABLE RENDER
     ====================== */
  function renderTable() {
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (reports.length === 0) {
      tableBody.innerHTML =
        "<tr><td colspan='5'>No reports found</td></tr>";
      return;
    }

    reports.forEach(r => {
      tableBody.innerHTML += `
        <tr>
          <td>${r.id}</td>
          <td>${r.title}</td>
          <td>${r.zone}</td>
          <td>${r.status}</td>
          <td>${new Date(r.date).toLocaleDateString()}</td>
        </tr>
      `;
    });
  }

  /* ======================
     CHARTS
     ====================== */
  function renderCharts() {
    const zoneCount = {};
    const statusCount = {};

    reports.forEach(r => {
      zoneCount[r.zone] = (zoneCount[r.zone] || 0) + 1;
      statusCount[r.status] = (statusCount[r.status] || 0) + 1;
    });

    if (zoneChart) zoneChart.destroy();
    if (statusChart) statusChart.destroy();

    zoneChart = new Chart(zoneChartEl, {
      type: "bar",
      data: {
        labels: Object.keys(zoneCount),
        datasets: [{
          label: "Reports",
          data: Object.values(zoneCount)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    statusChart = new Chart(statusChartEl, {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCount),
        datasets: [{
          data: Object.values(statusCount)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  /* ======================
     MAP
     ====================== */
  function initMap() {
    if (!map) {
      map = L.map("map").setView([23.02, 72.57], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);
    }

    reports.forEach(r => {
      if (r.lat && r.lng) {
        L.marker([r.lat, r.lng])
          .addTo(map)
          .bindPopup(`<strong>${r.title}</strong><br>${r.zone}`);
      }
    });
  }

  /* ======================
     VIEW TOGGLE
     ====================== */
  if (mapBtn && listBtn) {

    mapBtn.addEventListener("click", () => {
      listView.classList.add("hidden");
      mapView.classList.remove("hidden");

      mapBtn.classList.add("active");
      listBtn.classList.remove("active");

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    });

    listBtn.addEventListener("click", () => {
      mapView.classList.add("hidden");
      listView.classList.remove("hidden");

      listBtn.classList.add("active");
      mapBtn.classList.remove("active");
    });
  }

  /* ======================
     INIT
     ====================== */
  loadReports();
  console.log("✅ Reports Analytics Loaded");
});
