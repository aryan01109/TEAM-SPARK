/* =====================================================
   USER & STAFF MANAGEMENT – CIVIC ADMIN
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- ELEMENTS ---------- */
  const tableBody = document.getElementById("userTableBody");
  const searchInput = document.getElementById("liveSearch");
  const statusFilter = document.getElementById("statusFilter");
  const roleFilter = document.getElementById("roleFilter");
  const pagination = document.getElementById("pagination");

  /* ---------- DATA (API READY) ---------- */
  let users = [
    {
      id: 1,
      name: "Rohit Sharma",
      email: "rohit@civiccare.gov",
      role: "admin",
      department: "Executive",
      status: "active",
      lastActive: "2 mins ago"
    },
    {
      id: 2,
      name: "Neha Patel",
      email: "neha@civiccare.gov",
      role: "dispatcher",
      department: "Control Room",
      status: "active",
      lastActive: "10 mins ago"
    },
    {
      id: 3,
      name: "Amit Verma",
      email: "amit@civiccare.gov",
      role: "crew",
      department: "Public Works",
      status: "suspended",
      lastActive: "Yesterday"
    },
    {
      id: 4,
      name: "Priya Shah",
      email: "priya@gmail.com",
      role: "citizen",
      department: "—",
      status: "active",
      lastActive: "5 hrs ago"
    }
  ];

  /* ---------- PAGINATION ---------- */
  const rowsPerPage = 4;
  let currentPage = 1;

  /* ---------- RENDER TABLE ---------- */
  function renderTable(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
      tableBody.innerHTML =
        "<tr><td colspan='7'>No users found</td></tr>";
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const paginated = data.slice(start, start + rowsPerPage);

    paginated.forEach(user => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <div class="avatar">${user.name[0]}</div>
        </td>
        <td>
          <strong>${user.name}</strong><br>
          <small>${user.email}</small>
        </td>
        <td>${capitalize(user.role)}</td>
        <td>${user.department}</td>
        <td>
          <span class="status ${user.status}">
            ${capitalize(user.status)}
          </span>
        </td>
        <td>${user.lastActive}</td>
        <td>
          <button class="action-btn" data-id="${user.id}">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    renderPagination(data.length);
    attachActionHandlers();
  }

  /* ---------- PAGINATION UI ---------- */
  function renderPagination(total) {
    pagination.innerHTML = "";
    const pages = Math.ceil(total / rowsPerPage);

    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = i === currentPage ? "active" : "";

      btn.addEventListener("click", () => {
        currentPage = i;
        applyFilters();
      });

      pagination.appendChild(btn);
    }
  }

  /* ---------- FILTER & SEARCH ---------- */
  function applyFilters() {
    let filtered = [...users];

    const search = searchInput.value.toLowerCase();
    if (search) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    if (statusFilter.value !== "all") {
      filtered = filtered.filter(
        u => u.status === statusFilter.value
      );
    }

    if (roleFilter.value !== "all") {
      filtered = filtered.filter(
        u => u.role === roleFilter.value
      );
    }

    renderTable(filtered);
  }

  /* ---------- ACTION BUTTONS ---------- */
  function attachActionHandlers() {
    document.querySelectorAll(".action-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const user = users.find(u => u.id === id);

        const action = prompt(
          `Action for ${user.name}:\n1 = View\n2 = Toggle Status\n3 = Delete`
        );

        if (action === "1") {
          alert(
            `👤 ${user.name}\nRole: ${user.role}\nDepartment: ${user.department}`
          );
        }

        if (action === "2") {
          user.status =
            user.status === "active" ? "suspended" : "active";
          alert(`Status updated to ${user.status}`);
          applyFilters();
        }

        if (action === "3") {
          if (confirm("Are you sure you want to delete this user?")) {
            users = users.filter(u => u.id !== id);
            applyFilters();
          }
        }
      });
    });
  }

  /* ---------- UTIL ---------- */
  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /* ---------- EVENTS ---------- */
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    applyFilters();
  });

  statusFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });

  roleFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });

  /* ---------- INITIAL LOAD ---------- */
  applyFilters();

  console.log("Staff & User Management JS Loaded");
});

document.getElementById("backBtn").addEventListener("click", () => {
  window.history.back();
});
