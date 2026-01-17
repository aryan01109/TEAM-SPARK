/* =====================================================
   CITY DEPARTMENT MANAGEMENT – ADMIN (FINAL)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     ELEMENTS
     =============================== */
  const deptGrid = document.querySelector(".dept-grid");
  const newDeptBtn = document.querySelector(".new-dept");
  const searchInput = document.querySelector(".top-actions input");
  const notificationIcon = document.querySelector(
    ".top-actions .material-symbols-outlined"
  );

  const TOKEN = localStorage.getItem("token");

  if (!TOKEN) {
    alert("Unauthorized. Please login again.");
    window.location.href = "/civic/html/auth/adminLogin.html";
    return;
  }

  let departments = [];

  /* ===============================
     RENDER DEPARTMENTS
     =============================== */
  function renderDepartments(data) {
    if (!deptGrid) return;

    deptGrid.innerHTML = "";

    if (!data.length) {
      deptGrid.innerHTML = "<p>No departments found.</p>";
      return;
    }

    data.forEach(dept => {
      const card = document.createElement("div");
      card.className = `dept-card ${dept.sla < 80 ? "warning" : ""}`;

      card.innerHTML = `
        <h3>${dept.name}</h3>
        <p class="code">${dept.code}</p>

        <div class="meta">
          <span>Active Staff</span>
          <strong>${dept.staff}</strong>
        </div>

        <div class="meta">
          <span>Open Orders</span>
          <strong>${dept.orders}</strong>
        </div>

        <div class="sla">
          <div class="sla-bar ${dept.sla < 80 ? "warning" : ""}" style="width:0%"></div>
        </div>

        <button data-code="${dept.code}">Manage Settings</button>
      `;

      deptGrid.appendChild(card);

      /* SLA animation */
      setTimeout(() => {
        const bar = card.querySelector(".sla-bar");
        if (bar) bar.style.width = dept.sla + "%";
      }, 100);
    });

    attachManageHandlers();
  }

  /* ===============================
     LOAD DEPARTMENTS FROM BACKEND
     =============================== */
  async function loadDepartments() {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/departments",
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      departments = data;
      renderDepartments(departments);

    } catch (err) {
      console.error(err);
      alert("Failed to load departments");
    }
  }

  /* ===============================
     MANAGE SETTINGS
     =============================== */
  function attachManageHandlers() {
    document.querySelectorAll(".dept-card button").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.code;
        alert(`⚙️ Managing settings for department: ${code}`);
        // Future: window.location.href = `/admin/department/${code}`;
      });
    });
  }

  /* ===============================
     CREATE NEW DEPARTMENT
     =============================== */
  if (newDeptBtn) {
    newDeptBtn.addEventListener("click", async () => {
      const name = prompt("Enter Department Name:");
      if (!name) return;

      const code = prompt("Enter Department Code:");
      if (!code) return;

      try {
        const res = await fetch(
          "http://localhost:5000/api/admin/departments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify({ name, code })
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message);
          return;
        }

        departments.push(data.department);
        renderDepartments(departments);

        alert("✅ Department created successfully");

      } catch (err) {
        console.error(err);
        alert("Server error while creating department");
      }
    });
  }

  /* ===============================
     SEARCH FILTER
     =============================== */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const value = searchInput.value.toLowerCase();

      const filtered = departments.filter(dept =>
        dept.name.toLowerCase().includes(value) ||
        dept.code.toLowerCase().includes(value)
      );

      renderDepartments(filtered);
    });
  }

  /* ===============================
     NOTIFICATIONS
     =============================== */
  if (notificationIcon) {
    notificationIcon.addEventListener("click", () => {
      alert("No new notifications");
    });
  }

  /* ===============================
     INIT
     =============================== */
  loadDepartments();

  console.log("✅ Manage Departments Frontend Loaded Successfully");
});
