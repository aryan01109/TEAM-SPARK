/* ---------- SAMPLE USER DATA ---------- */
const user = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  initials: "SJ",
  roleLabel: "Civic Champion",
  totals: { reports: 23, resolved: 18, points: 1250, rank: 3 },
  progressToLeader: 54,
  pointsToLeader: 250,
  badges: [
    {title:"First Reporter",desc:"Submitted your first report",earned:true,icon:"🏅"},
    {title:"Photo Pro",desc:"Added photos to 10 reports",earned:true,icon:"📸"},
    {title:"Location Expert",desc:"Provided precise locations",earned:true,icon:"📍"},
    {title:"Community Helper",desc:"Received 50 upvotes",earned:true,icon:"🤝"},
    {title:"Quick Responder",desc:"Reported within 1 hour",earned:false,icon:"⚡"},
    {title:"Neighborhood Watch",desc:"Reported 50 issues",earned:false,icon:"👁️"},
  ],
  activity:[
    {title:"Reported broken streetlight",date:"2024-12-10",points:25},
    {title:"Received 5 upvotes",date:"2024-12-08",points:15},
    {title:"Earned Community Helper badge",date:"2024-12-07",points:100},
  ],
  impact:{helpedResolved:18,upvotes:67,avgResponseDays:2.3,contributionTimeline:{resolved:18,inProgress:5,successRate:78}},
  leaderboard:[
    {name:"Mike Chen",points:1850,reports:31},
    {name:"Lisa Rodriguez",points:1420,reports:28},
    {name:"Sarah Johnson",points:1250,reports:23},
  ]
};

/* ---------- FILL DATA ---------- */
document.getElementById("userInitials").innerText = user.initials;
document.getElementById("userName").innerText = user.name;
document.getElementById("roleLabel").innerText = user.roleLabel;
document.getElementById("userEmail").innerText = user.email;

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
user.leaderboard.map((p,i)=>`
  <li class="${p.name===user.name?"highlight":""}">
    <div class="rank">${i+1}</div>
    <div class="person">
      <div class="person-name">${p.name}</div>
      <div class="person-sub">${p.reports} reports</div>
    </div>
    <div class="person-points">${p.points} pts</div>
  </li>
`).join("");

/* ---------- ACTIVITY ---------- */
document.getElementById("activityList").innerHTML =
user.activity.map(a=>`
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

/* ---------- TAB SWITCH ---------- */
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;

    document.getElementById("tab-achievements").style.display = tab==="achievements"?"block":"none";
    document.getElementById("tab-activity").style.display = tab==="activity"?"block":"none";
    document.getElementById("tab-impact").style.display = tab==="impact"?"block":"none";
  });
});