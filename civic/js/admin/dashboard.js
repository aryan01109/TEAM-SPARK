/* ======================
   CONFIG
====================== */
const tenant = {
  id: "ahmedabad",
  name: "Ahmedabad Municipal Corporation"
};

const userRole = "admin"; // admin | staff | viewer

const SLA = {
  responseHours: 24,
  resolutionHours: 72
};

/* ======================
   DATA (demo)
====================== */
let issues = [
  {
    id: "CIV-101",
    title: "Water leakage",
    status: "pending",
    priority: "high",
    submittedDate: Date.now() - 1000 * 60 * 60 * 30
  },
  {
    id: "CIV-102",
    title: "Garbage overflow",
    status: "in-progress",
    priority: "medium",
    submittedDate: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    id: "CIV-103",
    title: "Streetlight fixed",
    status: "resolved",
    priority: "low",
    submittedDate: Date.now()
  }
];

/* ======================
   INIT
====================== */
document.getElementById("tenantName").innerText = tenant.name;
document.getElementById("userRole").innerText = userRole;

applyRBAC();
loadCache();
render();
checkSLABreaches();
detectAnomaly();

/* ======================
   RENDER
====================== */
function render() {
  renderStats();
  renderIssues();
}

function renderStats() {
  document.getElementById("activeIssues").innerText =
    issues.filter(i => i.status !== "resolved").length;

  document.getElementById("urgentIssues").innerText =
    issues.filter(i => i.priority === "high").length;

  document.getElementById("resolvedToday").innerText =
    issues.filter(i => i.status === "resolved").length;
}

function renderIssues() {
  const list = document.getElementById("issueList");
  list.innerHTML = "";

  issues.forEach(i => {
    const div = document.createElement("div");
    div.className = "issue";
    div.innerHTML = `
      <div class="left">
        <div class="title">${i.title}</div>
        <div class="meta">${i.id}</div>
      </div>
      <div class="status ${i.status}">${i.status}</div>
    `;
    list.appendChild(div);
  });
}

/* ======================
   SLA CHECK
====================== */
function checkSLABreaches() {
  const now = Date.now();
  const breached = issues.filter(i => {
    const hours = (now - i.submittedDate) / 36e5;
    return (
      (i.status === "pending" && hours > SLA.responseHours) ||
      (i.status !== "resolved" && hours > SLA.resolutionHours)
    );
  });

  if (breached.length) {
    const banner = document.getElementById("slaBanner");
    banner.innerText = `⚠️ ${breached.length} SLA breaches detected`;
    banner.classList.add("visible");
  }
}

/* ======================
   ANOMALY
====================== */
function detectAnomaly() {
  const last7 = [10,12,11,13,12,11,12];
  const today = issues.length;

  const avg = last7.reduce((a,b)=>a+b,0)/last7.length;
  const variance = last7.reduce((s,v)=>s+(v-avg)**2,0)/last7.length;
  const std = Math.sqrt(variance);

  if (Math.abs(today - avg) > 2 * std) {
    document.getElementById("statActive").classList.add("anomaly");
  }
}

/* ======================
   OFFLINE CACHE
====================== */
function loadCache() {
  const cached = localStorage.getItem("issues");
  if (cached) issues = JSON.parse(cached);
}

function saveCache() {
  localStorage.setItem("issues", JSON.stringify(issues));
}

window.addEventListener("offline", () =>
  document.body.classList.add("offline")
);
window.addEventListener("online", () => {
  document.body.classList.remove("offline");
  saveCache();
});

/* ======================
   RBAC
====================== */
function applyRBAC() {
  document.querySelectorAll("[data-role]").forEach(el => {
    if (el.dataset.role !== userRole) {
      el.style.display = "none";
    }
  });
}

/* ======================
   PDF EXPORT
====================== */
document.getElementById("exportPdfBtn").onclick = async () => {
  const canvas = await html2canvas(document.body, { scale: 2 });
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("landscape");
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 280, 150);
  pdf.save("admin-dashboard.pdf");
};

/* ======================
   SYNC
====================== */
document.getElementById("syncBtn").onclick = () => {
  saveCache();
  alert("Synced");
};

/* ======================
   LIVE UPDATE (SIMULATION)
====================== */
setInterval(() => {
  issues.push({
    id: "CIV-" + Math.floor(Math.random() * 1000),
    title: "Live reported issue",
    status: "pending",
    priority: "low",
    submittedDate: Date.now()
  });
  render();
  checkSLABreaches();
}, 20000);