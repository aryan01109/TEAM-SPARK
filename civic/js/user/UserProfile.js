/* ---------- GET USER DATA FROM STORAGE ---------- */
function getUserData() {
  // Get user data from localStorage
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  
  // Create initials from username
  const createInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    } else {
      return parts[0].substring(0, 2).toUpperCase();
    }
  };
  
  // Return user data object
  return {
    name: username || 'Guest User',
    email: `${username || 'guest'}@example.com`,
    initials: createInitials(username),
    roleLabel: role ? `${role.charAt(0).toUpperCase() + role.slice(1)} User` : 'Registered User',
    totals: { 
      reports: Math.floor(Math.random() * 30), 
      resolved: Math.floor(Math.random() * 25), 
      points: Math.floor(Math.random() * 1500) + 100, 
      rank: Math.floor(Math.random() * 10) + 1 
    },
    progressToLeader: Math.floor(Math.random() * 60) + 20,
    pointsToLeader: Math.floor(Math.random() * 500) + 50,
    badges: [
      {title:"First Reporter",desc:"Submitted your first report",earned:true,icon:"🏅"},
      {title:"Photo Pro",desc:"Added photos to 10 reports",earned:true,icon:"📸"},
      {title:"Location Expert",desc:"Provided precise locations",earned:true,icon:"📍"},
      {title:"Community Helper",desc:"Received 50 upvotes",earned:true,icon:"🤝"},
      {title:"Quick Responder",desc:"Reported within 1 hour",earned:false,icon:"⚡"},
      {title:"Neighborhood Watch",desc:"Reported 50 issues",earned:false,icon:"👁️"},
    ],
    activity:[
      {title:"Reported broken streetlight",date:new Date().toISOString().split('T')[0],points:25},
      {title:"Received 5 upvotes",date:new Date(Date.now() - 86400000).toISOString().split('T')[0],points:15},
      {title:"Earned Community Helper badge",date:new Date(Date.now() - 172800000).toISOString().split('T')[0],points:100},
    ],
    impact:{
      helpedResolved: Math.floor(Math.random() * 25),
      upvotes: Math.floor(Math.random() * 100),
      avgResponseDays: (Math.random() * 5).toFixed(1),
      contributionTimeline:{
        resolved: Math.floor(Math.random() * 25),
        inProgress: Math.floor(Math.random() * 10),
        successRate: Math.floor(Math.random() * 40) + 60
      }
    },
    leaderboard: [
      {name:"Mike Chen",points:1850,reports:31},
      {name:"Lisa Rodriguez",points:1420,reports:28},
      {name: username || 'Current User',points: Math.floor(Math.random() * 1500) + 100,reports: Math.floor(Math.random() * 30)},
    ]
  };
}

// Get user data
const user = getUserData();

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


// Set role label
document.getElementById("roleLabel").innerText = user.roleLabel;