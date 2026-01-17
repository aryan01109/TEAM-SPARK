/* =====================================================
   REPORT MANAGEMENT – ADMIN FRONTEND
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- ELEMENTS ---------- */
  const reportTable = document.getElementById("reportTable");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");

  if (!reportTable) {
    console.warn("❗ reportTable not found");
    return;
  }

  /* ---------- FETCH REPORTS FROM BACKEND ---------- */
  async function loadReports() {
    try {
      const params = new URLSearchParams({
        search: searchInput?.value || "",
        status: statusFilter?.value || "all",
        priority: priorityFilter?.value || "all"
      });

      const res = await fetch(
        `http://localhost:5000/api/reports?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("Failed to load reports");
      }

      const reports = await res.json();
      renderReports(reports);

    } catch (err) {
      console.error("❌ Error loading reports:", err);
      reportTable.innerHTML =
        `<tr><td colspan="8">Failed to load reports</td></tr>`;
    }
  }

  /* ---------- RENDER TABLE ---------- */
  function renderReports(data) {
    reportTable.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      reportTable.innerHTML =
        `<tr><td colspan="8">No reports found</td></tr>`;
      return;
    }

    data.forEach(r => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${r.id}</td>
        <td><strong>${r.title}</strong></td>
        <td>${r.category}</td>
        <td>${r.location}</td>
        <td class="priority ${r.priority}">
          ${r.priority.toUpperCase()}
        </td>
        <td class="status ${r.status}">
          ${r.status.replace("-", " ").toUpperCase()}
        </td>
        <td>${r.date}</td>
        <td>
          <button class="action-btn" title="View Report" data-id="${r.id}">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </td>
      `;

      reportTable.appendChild(tr);
    });

    attachViewHandlers();
  }

  /* ---------- VIEW ACTION ---------- */
  function attachViewHandlers() {
    document.querySelectorAll(".action-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const reportId = btn.dataset.id;
        window.location.href =
          `/civic/html/admin/manage-issue.html?id=${reportId}`;
      });
    });
  }

  /* ---------- FILTER EVENTS ---------- */
  if (searchInput) {
    searchInput.addEventListener("input", debounce(loadReports, 400));
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", loadReports);
  }

  if (priorityFilter) {
    priorityFilter.addEventListener("change", loadReports);
  }

  /* ---------- DEBOUNCE ---------- */
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /* ---------- INITIAL LOAD ---------- */
  loadReports();

  console.log("✅ Reports Frontend JS Loaded Successfully");
});
