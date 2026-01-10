const API_BASE = "http://localhost:5001";

let activeTab = "my";
let reportsMine = [];
let reportsCommunity = [];
let filtered = [];

let search = "";
let status = "all";
let sortBy = "date";
let view = "card";


// Init
document.addEventListener("DOMContentLoaded", () => {
  loadReports();

  document.getElementById("searchInput").oninput = e => {
    search = e.target.value.toLowerCase();
    applyFilters();
  };

  document.getElementById("sortSelect").onchange = e => {
    sortBy = e.target.value;
    applyFilters();
  };

  document.getElementById("statusSelect").onchange = e => {
    status = e.target.value;
    applyFilters();
  };

  document.getElementById("viewSelect").onchange = e => {
    view = e.target.value;
    render();
  };
});


// Switch Tabs
function setTab(tab) {
  activeTab = tab;

  document.getElementById("tabMy").classList.toggle("tab-active", tab === "my");
  document.getElementById("tabCommunity").classList.toggle("tab-active", tab === "community");

  applyFilters();
}


// Load Data
async function loadReports() {
  try {
    const user = localStorage.getItem("username") || "anonymous";

    const mine = await fetch(`${API_BASE}/api/issues?submittedBy=${user}`);
    const all = await fetch(`${API_BASE}/api/issues`);

    reportsMine = (await mine.json()).data || [];
    reportsCommunity = (await all.json()).data || [];

    applyFilters();

  } catch (err) {
    console.error(err);
  }
}


// Apply Search + Filters + Sorting
function applyFilters() {
  let data = activeTab === "my" ? reportsMine : reportsCommunity;

  filtered = data.filter(r => {
    return (
      (!search || r.title.toLowerCase().includes(search)) &&
      (status === "all" || r.status === status)
    );
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "title": return a.title.localeCompare(b.title);
      case "status": return a.status.localeCompare(b.status);
      case "priority":
        const p = { urgent: 3, high: 2, medium: 1, low: 0 };
        return (p[b.priority] || 0) - (p[a.priority] || 0);
      default:
        return new Date(b.submittedDate) - new Date(a.submittedDate);
    }
  });

  updateStats();
  render();
}

// map location
fetch("http://localhost:5000/api/map/issues", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("token")
  }
})
.then(res => res.json())
.then(data => {
  console.log("Map Issues:", data);
  // Loop & place markers on Leaflet map
});


// Update Stats
function updateStats() {
  document.getElementById("countTotal").innerText = filtered.length;
  document.getElementById("countResolved").innerText = filtered.filter(r => r.status === "resolved").length;
  document.getElementById("countProgress").innerText = filtered.filter(r => r.status === "in-progress").length;
  document.getElementById("countPending").innerText = filtered.filter(r => r.status === "pending").length;
}


// Render Cards
function render() {
  const box = document.getElementById("reportsGrid");
  box.className = `reports-grid ${view}`;
  box.innerHTML = "";

  if (filtered.length === 0) {
    box.innerHTML = `<div class="empty-state">No reports found.</div>`;
    return;
  }

  filtered.forEach(r => {
    const card = document.createElement("article");
    card.className = "report-card";
    card.onclick = () => openModal(r);

    card.innerHTML = `
      <h3>${r.title}</h3>
      <div>${r.location}</div>
      <div>Status: ${r.status}</div>
      <div>Priority: ${r.priority}</div>
    `;

    box.appendChild(card);
  });
}


// Modal
function openModal(r) {
  document.getElementById("modal").style.display = "flex";

  document.getElementById("modalContent").innerHTML = `
    <h3>${r.title}</h3>
    <p>${r.description || "No description."}</p>
    <p>Status: ${r.status}</p>
    <p>Priority: ${r.priority}</p>
  `;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}


// Export CSV
function exportReports() {
  const csv = filtered
    .map(r => `${r.id},${r.title},${r.location},${r.status}`)
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "reports.csv";
  a.click();
}
