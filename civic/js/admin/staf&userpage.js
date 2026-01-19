/* =====================================================
   USER & STAFF MANAGEMENT – CIVIC ADMIN (FINAL FIX)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ======================
     AUTH GUARD (STRICT)
  ====================== */
  let session = null;

  try {
    const raw = localStorage.getItem("citizenSession");
    if (raw) session = JSON.parse(raw);
  } catch {
    session = null;
  }

  // //  STOP if session/token missing
  // if (!session || !session.token) {
  //   console.warn("No valid admin session. Redirecting to login.");
  //   localStorage.removeItem("citizenSession");
  //   window.location.replace("/civic/html/auth/adminLogin.html");
  //   return;
  // }

  const TOKEN = session.token;
  const API = "http://localhost:5000/api/admin";

  /* ---------- ELEMENTS ---------- */
  const tableBody = document.getElementById("userTableBody");
  const searchInput = document.getElementById("liveSearch");
  const statusFilter = document.getElementById("statusFilter");
  const roleFilter = document.getElementById("roleFilter");
  const pagination = document.getElementById("pagination");

  /* ---------- STATE ---------- */
  let users = [];
  let filteredUsers = [];

  const rowsPerPage = 6;
  let currentPage = 1;

  /* ======================
     FETCH USERS
  ====================== */
  async function loadUsers() {
    try {
      const res = await fetch(`${API}/users`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      // if (res.status === 401 || res.status === 403) {
      //   console.warn("Session expired or forbidden.");
      //   localStorage.removeItem("citizenSession");
      //   window.location.replace("/civic/html/auth/adminLogin.html");
      //   return;
      // }

      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`);
      }

      users = await res.json();
      normalizeUsers();
      applyFilters();

    } catch (err) {
      console.error("USER LOAD ERROR:", err.message);
      if (tableBody) {
        tableBody.innerHTML =
          `<tr><td colspan="7">Failed to load users</td></tr>`;
      }
    }
  }

  /* ======================
     NORMALIZE DATA
  ====================== */
  function normalizeUsers() {
    users = users.map(u => ({
      ...u,
      name: u.name || "Unknown",
      email: u.email || "—",
      role: (u.role || "citizen").toLowerCase(),
      status: (u.status || "active").toLowerCase(),
      lastActive:
        u.lastActive ||
        u.lastLogin ||
        (u.updatedAt
          ? new Date(u.updatedAt).toLocaleString()
          : "—")
    }));
  }

  /* ======================
     FILTER + SEARCH
  ====================== */
  function applyFilters() {
    const search = searchInput?.value.toLowerCase().trim() || "";
    const status = statusFilter?.value || "all";
    const role = roleFilter?.value || "all";

    filteredUsers = users.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search);

      const matchStatus = status === "all" || u.status === status;
      const matchRole = role === "all" || u.role === role;

      return matchSearch && matchStatus && matchRole;
    });

    currentPage = 1;
    renderTable();
  }

  /* ======================
     TABLE RENDER
  ====================== */
  function renderTable() {
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!filteredUsers.length) {
      tableBody.innerHTML =
        `<tr><td colspan="7">No users found</td></tr>`;
      renderPagination(0);
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filteredUsers.slice(start, start + rowsPerPage);

    pageData.forEach(user => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><div class="avatar">${user.name.charAt(0)}</div></td>
        <td>
          <strong>${user.name}</strong><br>
          <small>${user.email}</small>
        </td>
        <td>${capitalize(user.role)}</td>
        <td>${user.department || "—"}</td>
        <td>
          <span class="status ${user.status}">
            ${capitalize(user.status)}
          </span>
        </td>
        <td>${user.lastActive}</td>
        <td>
          <button class="action-btn" data-id="${user._id}">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    renderPagination(filteredUsers.length);
    attachActions();
  }

  /* ======================
     PAGINATION
  ====================== */
  function renderPagination(total) {
    if (!pagination) return;

    pagination.innerHTML = "";
    const pages = Math.ceil(total / rowsPerPage);

    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = i === currentPage ? "active" : "";

      btn.onclick = () => {
        currentPage = i;
        renderTable();
      };

      pagination.appendChild(btn);
    }
  }

  /* ======================
     ACTIONS
  ====================== */
  function attachActions() {
    document.querySelectorAll(".action-btn").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const user = users.find(u => u._id === id);
        if (!user) return;

        const action = prompt(
          `Action for ${user.name}:\n1 = View\n2 = Toggle Status`
        );

        if (action === "1") {
          alert(
            `Name: ${user.name}\nRole: ${user.role}\nDepartment: ${user.department || "—"}`
          );
        }

        if (action === "2") {
          await toggleStatus(id);
        }
      };
    });
  }

  /* ======================
     STATUS TOGGLE
  ====================== */
  async function toggleStatus(id) {
    try {
      const res = await fetch(`${API}/users/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      if (!res.ok) throw new Error("Update failed");

      await loadUsers();
      alert("Status updated successfully");

    } catch {
      alert("Failed to update status");
    }
  }

  /* ======================
     UTIL
  ====================== */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ======================
     EVENTS
  ====================== */
  searchInput?.addEventListener("input", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);
  roleFilter?.addEventListener("change", applyFilters);

  /* ======================
     INIT
  ====================== */
  loadUsers();
  console.log(" User & Staff Management Loaded Successfully");

});
