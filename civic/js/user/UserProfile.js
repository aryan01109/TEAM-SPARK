// ===============================
// USER PROFILE DASHBOARD
// TEAM-SPARK
// ===============================

const API = "http://localhost:5000/api";

// DOM
const nameEl = document.querySelector(".profile-left h2");
const badgeEl = document.querySelector(".badge");
const statsEls = document.querySelectorAll(".stat strong");
const progressBar = document.querySelector(".bar");
const progressText = document.querySelector(".card p");
const monthlyCard = document.querySelector(".highlight strong");
const avatar = document.querySelector(".avatar");
const profilePic = document.querySelector(".profile-pic");
const badgesContainer = document.querySelector(".badges");

// Get token


// Attach token
const authHeaders = {
  "Authorization": "Bearer " + session.token
};

// ===============================
// LOAD PROFILE
// ===============================
async function loadProfile() {
  try {
    const res = await fetch(API + "/user-dashboard", {
      headers: authHeaders
    });

    const data = await res.json();

    renderStats(data);
    renderLevel(data);
    renderBadges(data);

  } catch (err) {
    console.error("PROFILE LOAD ERROR", err);
  }
}

// ===============================
// RENDER USER STATS
// ===============================
function renderStats(data) {
  const total = data.total || 0;
  const resolved = data.resolved || 0;
  const active = data.active || 0;

  statsEls[0].innerText = total;
  statsEls[1].innerText = resolved;
  statsEls[2].innerText = total * 20; // impact points

  nameEl.innerHTML = `${session.name} <span class="badge">Level ${getLevel(total * 20)}</span>`;
}

// ===============================
// LEVEL SYSTEM
// ===============================
function getLevel(points) {
  return Math.floor(points / 200) + 1;
}

function getXP(level) {
  return level * 200;
}

function renderLevel(data) {
  const points = (data.total || 0) * 20;
  const level = getLevel(points);
  const nextXP = getXP(level);
  const prevXP = getXP(level - 1) || 0;
  const progress = ((points - prevXP) / (nextXP - prevXP)) * 100;

  progressBar.style.width = Math.min(progress, 100) + "%";
  progressText.innerText = `${points} / ${nextXP} XP`;
}

// ===============================
// BADGES SYSTEM
// ===============================
function renderBadges(data) {
  const reports = data.total;
  const resolved = data.resolved;

  badgesContainer.innerHTML = "";

  if (reports >= 5) addBadge("🛠️", "First Responder", "5 Reports");
  if (reports >= 10) addBadge("🛣️", "Pothole Patrol", "10 Reports");
  if (resolved >= 10) addBadge("⚡", "Impact Maker", "10 Resolved");
  if (reports >= 25) addBadge("🏆", "Community Hero", "25 Reports");
  if (reports >= 50) addBadge("🌟", "City Champion", "50 Reports");

  monthlyCard.innerText = `+${reports * 10} pts`;
}

function addBadge(icon, title, desc) {
  const div = document.createElement("div");
  div.className = "badge-card";
  div.innerHTML = `
    ${icon}
    <p>${title}</p>
    <small>${desc}</small>
  `;
  badgesContainer.appendChild(div);
}

// ===============================
// LOGOUT
// ===============================
avatar.onclick = () => {
  if (confirm("Logout?")) {
    localStorage.removeItem("session");
    window.location.href = "/civic/html/auth/Login.html";
  }
};

// ===============================
// BUTTONS
// ===============================
document.querySelector(".primary").onclick = () => {
  window.location.href = "/civic/html/user/Report.html";
};

document.querySelector(".secondary").onclick = () => {
  alert("Profile editing coming soon ");
};

// Start
loadProfile();
