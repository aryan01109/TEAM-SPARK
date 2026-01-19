/* ===============================
   TEAM-SPARK — USER PROFILE
================================ */

const API = "http://localhost:5000/api/profile";

/* ===============================
   AUTH
================================ */
// const session = JSON.parse(localStorage.getItem("citizenSession"));
// if (!session || !session.token) {
//   window.location.href = "/civic/html/auth/LoginPage.html";
// }

/* ===============================
   LOAD PROFILE FROM SERVER
================================ */
async function loadProfile() {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      return window.location.href = "/civic/html/auth/LoginPage.html";
    }

    const user = await res.json();
    renderProfile(user);

  } catch (err) {
    console.error("PROFILE LOAD ERROR:", err);
    alert("Failed to load profile");
  }
}

/* ===============================
   RENDER EVERYTHING
================================ */
function renderProfile(user) {

  /* ---------- BASIC ---------- */
  document.getElementById("userInitials").innerText = user.initials;
  document.getElementById("userName").innerText = user.name;
  document.getElementById("roleLabel").innerText = user.roleLabel;
  document.getElementById("userEmail").innerText = user.email;

  /* ---------- STATS ---------- */
  document.getElementById("statReports").innerText = user.totals.reports;
  document.getElementById("statResolved").innerText = user.totals.resolved;
  document.getElementById("statPoints").innerText = user.totals.points;
  document.getElementById("statRank").innerText = "#" + user.totals.rank;

  document.getElementById("pointsLeft").innerText = user.pointsToLeader;
  document.getElementById("progressBar").style.width = user.progressToLeader + "%";

  /* ---------- BADGES ---------- */
  document.getElementById("badgesList").innerHTML =
    user.badges.map(b => `
      <div class="badge ${b.earned ? "earned" : "locked"}">
        <div class="badge-icon">${b.icon}</div>
        <div>
          <div class="badge-title">${b.title}</div>
          <div class="badge-desc">${b.desc}</div>
        </div>
      </div>
    `).join("");

  /* ---------- LEADERBOARD ---------- */
  document.getElementById("leaderboard").innerHTML =
    user.leaderboard.map((p, i) => `
      <li class="${p.name === user.name ? "highlight" : ""}">
        <div class="rank">${i + 1}</div>
        <div class="person">
          <div class="person-name">${p.name}</div>
          <div class="person-sub">${p.reports} reports</div>
        </div>
        <div class="person-points">${p.points} pts</div>
      </li>
    `).join("");

  /* ---------- ACTIVITY ---------- */
  document.getElementById("activityList").innerHTML =
    user.activity.map(a => `
      <li>
        <div class="activity-title">${a.title}</div>
        <div class="activity-meta">${a.date}
          <span class="activity-points"> +${a.points} pts</span>
        </div>
      </li>
    `).join("");

  /* ---------- IMPACT ---------- */
  document.getElementById("impactResolved").innerText = user.impact.helpedResolved;
  document.getElementById("impactUpvotes").innerText = user.impact.upvotes;
  document.getElementById("impactAvgDays").innerText = user.impact.avgResponseDays + " days";

  document.getElementById("tlResolved").innerText = user.impact.contributionTimeline.resolved;
  document.getElementById("tlProgress").innerText = user.impact.contributionTimeline.inProgress;
  document.getElementById("tlSuccess").innerText = user.impact.contributionTimeline.successRate + "%";
}

/* ===============================
   TABS
================================ */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;

    document.getElementById("tab-achievements").style.display =
      tab === "achievements" ? "block" : "none";

    document.getElementById("tab-activity").style.display =
      tab === "activity" ? "block" : "none";

    document.getElementById("tab-impact").style.display =
      tab === "impact" ? "block" : "none";
  });
});

/* ===============================
   START
================================ */
loadProfile();
