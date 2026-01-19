// ===============================
// USER DASHBOARD – FINAL VERSION
// ===============================

const API_BASE = "http://localhost:5000/api";
const SESSION_TIMEOUT = 30 * 60 * 1000;


// ===============================
// LOAD SESSION
// ===============================
let session = null;
try {
  session = JSON.parse(localStorage.getItem("citizenSession"));
} catch {
  session = null;
}

if (!session || !session.token) {
  redirectToLogin();
  throw new Error("No active session");
}

// ===============================
// UPDATE LAST ACTIVE
// ===============================
session.lastActive = Date.now();
localStorage.setItem("citizenSession", JSON.stringify(session));

// ===============================
// AUTO LOGOUT ON IDLE
// ===============================
function logout() {
  localStorage.removeItem("citizenSession");
  redirectToLogin();
}

function checkSessionExpiry() {
  const s = JSON.parse(localStorage.getItem("citizenSession"));
  if (!s) return;

  if (Date.now() - s.lastActive > SESSION_TIMEOUT) {
    alert("Session expired. Please login again.");
    logout();
  }
}

["click", "mousemove", "keydown", "scroll"].forEach(evt => {
  document.addEventListener(evt, () => {
    const s = JSON.parse(localStorage.getItem("citizenSession"));
    if (!s) return;
    s.lastActive = Date.now();
    localStorage.setItem("citizenSession", JSON.stringify(s));
  });
});

setInterval(checkSessionExpiry, 60000);

// ===============================
// DISPLAY USER NAME (FIXED)
// ===============================
const userName = session.name || "User";

// Top header name
document.querySelectorAll(".text-sm.font-bold").forEach(el => {
  if (el.textContent.trim().toLowerCase() === "user") {
    el.textContent = userName;
  }
});

// Welcome heading
const welcomeHeading = document.querySelector("h1");
if (welcomeHeading) {
  welcomeHeading.textContent = `Welcome back, ${userName}!`;
}

console.log("Dashboard loaded with user name support:", userName);

// ===============================
// FETCH DASHBOARD DATA
// ===============================
async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/user-dashboard`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });

    if (res.status === 401) {
      logout();
      return;
    }

    if (!res.ok) {
      throw new Error("Dashboard fetch failed");
    }

    const data = await res.json();
    updateStats(data);
    updateActivity(data.reports || []);

  } catch (err) {
    console.error("Dashboard API error:", err.message);
    showFallback();
  }
}

loadDashboard();

// ===============================
// UPDATE STATS
// ===============================
function updateStats(data) {
  const numbers = document.querySelectorAll(".text-3xl.font-black");
  if (numbers.length >= 3) {
    numbers[0].textContent = data.total ?? 0;
    numbers[1].textContent = data.resolved ?? 0;
    numbers[2].textContent = data.active ?? 0;
  }
}

// ===============================
// UPDATE ACTIVITY
// ===============================
function updateActivity(reports) {
  const container = document.querySelector(".lg\\:col-span-2 .bg-white");
  if (!container) return;

  container.innerHTML = "";

  if (!reports.length) {
    container.innerHTML = `
      <div class="p-6 text-gray-400 text-center">
        No recent activity
      </div>
    `;
    return;
  }

  reports.forEach(r => {
    const div = document.createElement("div");
    div.className = "p-6 border-b hover:bg-gray-50 transition";

    div.innerHTML = `
      <div class="flex justify-between mb-2">
        <h4 class="font-bold">${r.title || "Report"}</h4>
        <span class="text-xs text-gray-400">
          ${new Date(r.createdAt).toLocaleString()}
        </span>
      </div>
      <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
        ${r.status || "Submitted"}
      </span>
    `;

    container.appendChild(div);
  });
}

// ===============================
// FALLBACK
// ===============================
function showFallback() {
  updateStats({ total: 0, resolved: 0, active: 0 });
  updateActivity([]);
}
