/* =====================================================
   REPORT ANALYTICS – ADMIN (TRULY STABLE VERSION)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ======================
     AUTH
  ====================== */
  let session;
  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {}

  if (!session?.token) {
    window.location.replace("/civic/html/auth/adminLogin.html");
    return;
  }

  const TOKEN = session.token;
  const API = "http://localhost:5000/api/admin";

  /* ======================
     ELEMENTS
  ====================== */
  const zoneCanvas = document.getElementById("zoneChart");
  const statusCanvas = document.getElementById("statusChart");
  const deptCanvas = document.getElementById("departmentChart");
  const tableBody = document.getElementById("reportTable");

  if (!zoneCanvas && !statusCanvas && !deptCanvas) {
    console.warn("No chart canvas found");
    return;
  }

  /* 🔒 LOCK CANVAS SIZE (CRITICAL) */
  [zoneCanvas, statusCanvas, deptCanvas].forEach(c => {
    if (c) {
      c.width = 420;
      c.height = 260;
    }
  });

  let reports = [];
  let lastDataHash = "";

  let zoneChart = null;
  let statusChart = null;
  let deptChart = null;

  /* ======================
     FETCH REPORTS
  ====================== */
  async function fetchReports() {
    try {
      const res = await fetch(`${API}/reports`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      const hash = JSON.stringify(data.map(r => r._id + r.status));

      // ⛔ NO DATA CHANGE → NO UPDATE
      if (hash === lastDataHash) return;

      lastDataHash = hash;
      reports = normalize(data);

      renderTable();
      updateCharts();

    } catch (err) {
      console.error("Analytics fetch error:", err.message);
    }
  }

  /* ======================
     NORMALIZE
  ====================== */
  function normalize(data) {
    return data.map(r => ({
      ...r,
      zone: r.zone || r.area || "General",
      department: r.department || "Unassigned",
      status: (r.status || "Unknown").trim()
    }));
  }

  /* ======================
     TABLE
  ====================== */
  function renderTable() {
    if (!tableBody) return;

    tableBody.innerHTML = reports.map(r => `
      <tr>
        <td>${r._id.slice(-6)}</td>
        <td>${r.title || "-"}</td>
        <td>${r.zone}</td>
        <td>${r.status}</td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join("");
  }

  /* ======================
     AGGREGATE
  ====================== */
  function aggregate() {
    const zone = {}, status = {}, dept = {};
    reports.forEach(r => {
      zone[r.zone] = (zone[r.zone] || 0) + 1;
      status[r.status] = (status[r.status] || 0) + 1;
      dept[r.department] = (dept[r.department] || 0) + 1;
    });
    return { zone, status, dept };
  }

  /* ======================
     CHART OPTIONS (LOCKED)
  ====================== */
  const lockedOptions = {
    responsive: false,          
    animation: false,
    devicePixelRatio: 1,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  /* ======================
     UPDATE CHARTS (STABLE)
  ====================== */
  function updateCharts() {
    if (typeof Chart === "undefined") return;

    const { zone, status, dept } = aggregate();

    // ZONE
    if (zoneCanvas) {
      if (!zoneChart) {
        zoneChart = new Chart(zoneCanvas, {
          type: "bar",
          data: {
            labels: Object.keys(zone),
            datasets: [{ data: Object.values(zone) }]
          },
          options: lockedOptions
        });
      } else {
        zoneChart.data.labels = Object.keys(zone);
        zoneChart.data.datasets[0].data = Object.values(zone);
        zoneChart.update("none");
      }
    }

    // STATUS
    if (statusCanvas) {
      if (!statusChart) {
        statusChart = new Chart(statusCanvas, {
          type: "doughnut",
          data: {
            labels: Object.keys(status),
            datasets: [{ data: Object.values(status) }]
          },
          options: { ...lockedOptions, scales: undefined }
        });
      } else {
        statusChart.data.labels = Object.keys(status);
        statusChart.data.datasets[0].data = Object.values(status);
        statusChart.update("none");
      }
    }

    // DEPARTMENT
    if (deptCanvas) {
      if (!deptChart) {
        deptChart = new Chart(deptCanvas, {
          type: "bar",
          data: {
            labels: Object.keys(dept),
            datasets: [{ data: Object.values(dept) }]
          },
          options: lockedOptions
        });
      } else {
        deptChart.data.labels = Object.keys(dept);
        deptChart.data.datasets[0].data = Object.values(dept);
        deptChart.update("none");
      }
    }
  }

  /* ======================
     VISIBILITY CONTROL
  ====================== */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) fetchReports();
  });

  /* ======================
     INIT
  ====================== */
  fetchReports();
  setInterval(fetchReports, 30000);

  console.log("Analytics running in FULLY STABLE mode");

});
