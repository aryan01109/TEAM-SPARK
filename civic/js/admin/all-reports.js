/* =====================================================
   REPORT MANAGEMENT – ADMIN FRONTEND
   (FINAL – TOKEN SAFE, WORKS WITH ALL STORAGE)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ======================
     AUTH RESOLUTION (ROBUST)
  ====================== */
  let TOKEN = null;

  // Option 1: citizenSession
  try {
    const raw = localStorage.getItem("citizenSession");
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.token) TOKEN = session.token;
    }
  } catch {}

  // Option 2: adminToken (fallback)
  if (!TOKEN) {
    TOKEN = localStorage.getItem("adminToken");
  }



  console.log(" Admin token resolved");

  /* ======================
     API CONFIG
  ====================== */
  const API_BASE = "http://localhost:5000/api/admin/reports";

  const authHeaders = {
    Authorization: `Bearer ${TOKEN}`
  };

  /* ======================
     ELEMENTS
  ====================== */
  const reportTable = document.getElementById("reportTable");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const departmentFilter = document.getElementById("departmentFilter");

  if (!reportTable) {
    console.warn("reportTable not found");
    return;
  }

  /* ======================
     FETCH REPORTS
  ====================== */
  async function loadReports() {
    try {
      const params = new URLSearchParams({
        search: searchInput?.value.trim() || "",
        status: statusFilter?.value || "all",
        priority: priorityFilter?.value || "all",
        department: departmentFilter?.value || "all"
      });

      const res = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: authHeaders
      });

      

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reports = await res.json();
      renderReports(reports);

    } catch (err) {
      console.error("Load reports error:", err.message);
      reportTable.innerHTML =
        `<tr><td colspan="8">Failed to load reports</td></tr>`;
    }
  }

  /* ======================
     RENDER TABLE
  ====================== */
  function renderReports(data) {
    reportTable.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      reportTable.innerHTML =
        `<tr><td colspan="8">No reports found</td></tr>`;
      return;
    }

    data.forEach(r => {
      const status = (r.status || "new").toLowerCase();
      const priority = (r.priority || "low").toLowerCase();

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>#${String(r._id).slice(-6)}</td>
        <td><strong>${r.title || "—"}</strong></td>
        <td>${r.category || "—"}</td>
        <td>${formatLocation(r.location)}</td>
        <td class="priority ${priority}">
          ${priority.toUpperCase()}
        </td>
        <td class="status ${status}">
          ${status.replace("-", " ").toUpperCase()}
        </td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="action-btn" data-id="${r._id}">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </td>
      `;

      reportTable.appendChild(tr);
    });

    attachViewHandlers();
  }

  /* ======================
     FORMAT LOCATION
  ====================== */
  function formatLocation(loc) {
    if (!loc) return "—";
    if (typeof loc === "string") return loc;
    if (loc.lat && loc.lng) {
      return `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
    }
    return "—";
  }

  /* ======================
     VIEW HANDLER
  ====================== */
  function attachViewHandlers() {
    document.querySelectorAll(".action-btn").forEach(btn => {
      btn.onclick = () => {
        window.location.href =
          `/civic/html/admin/manage-issue.html?id=${btn.dataset.id}`;
      };
    });
  }

  /* ======================
     DEBOUNCE
  ====================== */
  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  /* ======================
     EVENTS
  ====================== */
  searchInput?.addEventListener("input", debounce(loadReports, 400));
  statusFilter?.addEventListener("change", loadReports);
  priorityFilter?.addEventListener("change", loadReports);
  departmentFilter?.addEventListener("change", loadReports);

  /* ======================
     INIT
  ====================== */
  loadReports();
  console.log(" All Reports page loaded successfully");

});
