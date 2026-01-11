/* =========================
   CONFIG
========================= */
const API_BASE = "http://localhost:5000";

/* =========================
   USER + AVATAR
========================= */

const avatarBtn = document.getElementById("avatarBtn");
const avatarMenu = document.getElementById("avatarMenu");

const username = localStorage.getItem("username") || "User";
const initial = username.charAt(0).toUpperCase();

if (avatarBtn) avatarBtn.innerText = initial;
document.getElementById("menuAvatar").innerText = initial;
document.getElementById("menuUserName").innerText = username;
document.getElementById("welcomeUser").innerText = `Welcome back, ${username}!`;

avatarBtn.onclick = () => {
  avatarMenu.classList.toggle("show");
};

document.addEventListener("click", e => {
  if (!avatarMenu.contains(e.target) && e.target !== avatarBtn) {
    avatarMenu.classList.remove("show");
  }
});

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "./LoginPage.html";
};

/* =========================
   DASHBOARD DATA
========================= */

let reports = [];
let filterType = "All";
let searchQuery = "";

function goto(path) {
  window.location.href = path;
}

async function loadDashboard() {
  try {
    // Fetch stats
    const statsRes = await fetch(`${API_BASE}/api/user/statistics`);
    const statsData = await statsRes.json();

    const s = statsData.submittedIssues;

    document.getElementById("totalReports").innerText = s.total;
    document.getElementById("resolvedReports").innerText = s.byStatus.resolved;
    document.getElementById("progressReports").innerText = s.byStatus.inProgress;

    const rate = s.total
      ? Math.round((s.byStatus.resolved / s.total) * 100)
      : 0;

    document.getElementById("responseRate").innerText = rate + "%";

    // Fetch issues
    const issuesRes = await fetch(`${API_BASE}/api/issues`);
    const issuesData = await issuesRes.json();

    reports = issuesData.data.map(issue => ({
      id: issue._id,
      title: issue.title,
      location: issue.location,
      date: new Date(issue.submittedDate).toLocaleDateString(),
      category: issue.department,
      status: issue.status,
      priority: issue.priority
    }));

    renderReports();

  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

/* =========================
   RENDER REPORTS
========================= */

function renderReports() {
  const list = document.getElementById("reportsList");
  list.innerHTML = "";

  let filtered = reports;

  if (filterType !== "All") {
    filtered = filtered.filter(r => r.category === filterType);
  }

  if (searchQuery) {
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(searchQuery) ||
      r.location.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = "<p>No reports found</p>";
    return;
  }

  filtered.forEach(r => {
    const div = document.createElement("div");
    div.className = "report-row";

    div.innerHTML = `
      <div class="report-title">${r.title}</div>
      <div class="report-meta">${r.location} • ${r.date}</div>
      <div class="priority">${r.priority}</div>
    `;

    div.onclick = () => window.location.href = `./ReportView.html?id=${r.id}`;

    list.appendChild(div);
  });
}

/* =========================
   FILTER & SEARCH
========================= */

function setFilter(type) {
  filterType = type;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.innerText === type) btn.classList.add("active");
  });

  renderReports();
}

document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.toLowerCase();
  renderReports();
});

/* =========================
   FOOTER YEAR
========================= */
document.getElementById("year").innerText = new Date().getFullYear();

/* =========================
   INIT
========================= */
loadDashboard();
