/* =========================
   USER + AVATAR + LOGOUT
========================= */

const avatarBtn = document.getElementById("avatarBtn");
const avatarMenu = document.getElementById("avatarMenu");

// Username
const username = localStorage.getItem("username") || "User";
const initial = username.charAt(0).toUpperCase();

// Set UI text
if (avatarBtn) avatarBtn.innerText = initial;
document.getElementById("menuAvatar").innerText = initial;
document.getElementById("menuUserName").innerText = username;
document.getElementById("welcomeUser").innerText = `Welcome back, ${username}!`;

// Toggle dropdown
avatarBtn.onclick = () => {
  avatarMenu.classList.toggle("show");
  avatarMenu.setAttribute(
    "aria-hidden",
    !avatarMenu.classList.contains("show")
  );
};

// Close when clicking outside
document.addEventListener("click", e => {
  if (!avatarMenu.contains(e.target) && e.target !== avatarBtn) {
    avatarMenu.classList.remove("show");
    avatarMenu.setAttribute("aria-hidden", true);
  }
});

// Logout (shared button)
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  window.location.href = "/login";
};


/* =========================
   DASHBOARD DATA + UI
========================= */

const API_BASE = "http://localhost:5001";

let reports = [];
let filterType = "All";
let searchQuery = "";

// Redirect helper
function goto(path) {
  window.location.href = path;
}

// Fetch Dashboard Data
async function loadDashboard() {
  try {
    // Stats API
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

    // Issues API
    const issuesRes = await fetch(
      `${API_BASE}/api/issues?limit=20&sort=submittedDate:desc`
    );
    const issues = await issuesRes.json();

    reports = issues.data.map(issue => ({
      id: issue._id,
      title: issue.title,
      location: issue.location,
      date: new Date(issue.submittedDate).toLocaleDateString(),
      category: issue.department,
      status: issue.status,
      priority: issue.priority,
      progress:
        issue.status === "resolved"
          ? 100
          : issue.status === "in-progress"
          ? 65
          : issue.status === "pending"
          ? 10
          : 0
    }));

    renderReports();

  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}


// Render Reports
function renderReports() {
  const list = document.getElementById("reportsList");
  list.innerHTML = "";

  let filtered = reports;

  if (filterType !== "All") {
    filtered = filtered.filter(r => r.category === filterType);
  }

  if (searchQuery.trim()) {
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(searchQuery) ||
      r.location.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = `<p>No reports found</p>`;
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

    div.onclick = () => window.location.href = `/report/${r.id}`;

    list.appendChild(div);
  });
}


// Filter buttons
function setFilter(type) {
  filterType = type;
  renderReports();
}


// Search
document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.toLowerCase();
  renderReports();
});


// Footer year
document.getElementById("year").innerText = new Date().getFullYear();


// Start dashboard
loadDashboard();
