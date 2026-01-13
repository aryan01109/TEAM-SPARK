/* =========================
   RBAC
========================= */
const PERMISSIONS = {
  admin: { acknowledge: true, assign: true, resolve: true },
  staff: { acknowledge: true, assign: false, resolve: true },
  viewer: { acknowledge: false, assign: false, resolve: false }
};

const can = (role, action) => !!PERMISSIONS[role]?.[action];
const userRole = "admin";

/* =========================
   STATE
========================= */
let issues = [
  {
    id: 1,
    title: "Road Damage",
    description: "Large pothole on main road",
    location: "Main Street",
    status: "pending",
    priority: "high",
    department: "Public Works",
    assignedTo: null,
    submittedDate: Date.now()
  },
  {
    id: 2,
    title: "Street Light Broken",
    description: "Light not working",
    location: "Park Avenue",
    status: "in-progress",
    priority: "medium",
    department: "Utilities",
    assignedTo: "Team A",
    submittedDate: Date.now()
  }
];

let page = 1;
const pageSize = 5;

/* =========================
   HELPERS
========================= */
const qs = id => document.getElementById(id);

function statusLabel(s) {
  if (s === "pending") return "Pending";
  if (s === "in-progress") return "In Progress";
  if (s === "resolved") return "Resolved";
  return s;
}

/* =========================
   FILTERING
========================= */
function getFiltered() {
  const q = qs("searchInput").value.toLowerCase();
  const status = qs("statusFilter").value;
  const priority = qs("priorityFilter").value;
  const dept = qs("departmentFilter").value;

  return issues.filter(i => {
    if (status !== "All" && i.status !== status) return false;
    if (priority !== "All" && i.priority !== priority) return false;
    if (dept !== "All" && i.department !== dept) return false;

    if (!q) return true;
    return (
      i.title +
      i.id +
      i.department
    ).toLowerCase().includes(q);
  });
}

/* =========================
   RENDER
========================= */
function render() {
  const list = qs("issuesList");
  list.innerHTML = "";

  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  if (page > totalPages) page = totalPages;

  const start = (page - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  visible.forEach(issue => list.appendChild(issueCard(issue)));

  qs("pageInfo").innerText = `Page ${page} of ${totalPages}`;

  qs("firstBtn").disabled = page === 1;
  qs("prevBtn").disabled = page === 1;
  qs("nextBtn").disabled = page === totalPages;
  qs("lastBtn").disabled = page === totalPages;
}

/* =========================
   ISSUE CARD
========================= */
function issueCard(issue) {
  const div = document.createElement("div");
  div.className = "issue-card";

  div.innerHTML = `
    <div class="issue-head">
      <div>
        <h4>${issue.title}</h4>
        <div class="muted">${issue.location} • ${new Date(issue.submittedDate).toLocaleString()}</div>
        <p>${issue.description}</p>
        <div>
          ${statusLabel(issue.status)} • ${issue.priority} • ${issue.assignedTo || "Unassigned"}
        </div>
      </div>
      <div class="issue-actions"></div>
    </div>
  `;

  const actions = div.querySelector(".issue-actions");

  if (can(userRole, "acknowledge") && issue.status === "pending") {
    actions.appendChild(button("Acknowledge", "outline", () =>
      optimisticUpdate(issue, { status: "in-progress" })
    ));
  }

  if (can(userRole, "assign")) {
    actions.appendChild(button("Assign", "outline", () => {
      const a = prompt("Assign to:");
      if (a) optimisticUpdate(issue, { assignedTo: a });
    }));
  }

  if (can(userRole, "resolve") && issue.status !== "resolved") {
    actions.appendChild(button("Resolve", "primary", () =>
      optimisticUpdate(issue, { status: "resolved" })
    ));
  }

  return div;
}

function button(text, cls, handler) {
  const b = document.createElement("button");
  b.className = `btn ${cls}`;
  b.innerText = text;
  b.onclick = handler;
  return b;
}

/* =========================
   OPTIMISTIC UPDATE
========================= */
function optimisticUpdate(issue, patch) {
  const backup = { ...issue };
  Object.assign(issue, patch);
  render();

  fakeApi()
    .catch(() => {
      Object.assign(issue, backup);
      render();
      alert("Action failed. Changes reverted.");
    });
}

/* =========================
   PAGINATION EVENTS
========================= */
qs("firstBtn").onclick = () => { page = 1; render(); };
qs("prevBtn").onclick = () => { page--; render(); };
qs("nextBtn").onclick = () => { page++; render(); };
qs("lastBtn").onclick = () => {
  page = Math.ceil(getFiltered().length / pageSize);
  render();
};

qs("searchInput").oninput = render;
qs("statusFilter").onchange = render;
qs("priorityFilter").onchange = render;
qs("departmentFilter").onchange = render;
qs("clearFilters").onclick = () => {
  qs("searchInput").value = "";
  qs("statusFilter").value = "All";
  qs("priorityFilter").value = "All";
  qs("departmentFilter").value = "All";
  render();
};

/* =========================
   MOCK API
========================= */
function fakeApi() {
  return new Promise((resolve, reject) =>
    setTimeout(() => Math.random() > 0.2 ? resolve() : reject(), 500)
  );
}

render();