/* =====================================================
   CITY DEPARTMENT MANAGEMENT – ADMIN JS
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- ELEMENTS ---------- */
  const deptGrid = document.querySelector(".dept-grid");
  const newDeptBtn = document.querySelector(".new-dept");
  const searchInput = document.querySelector(".top-actions input");
  const notificationIcon = document.querySelector(".top-actions .material-symbols-outlined");

  /* ---------- DATA (API READY) ---------- */
  let departments = [
    {
      name: "Public Works",
      code: "PW-440",
      staff: 142,
      orders: 45,
      sla: 92
    },
    {
      name: "Sanitation",
      code: "SAN-902",
      staff: 210,
      orders: 104,
      sla: 78
    }
  ];

  /* ---------- RENDER DEPARTMENTS ---------- */
  function renderDepartments(data) {
    deptGrid.innerHTML = "";

    if (data.length === 0) {
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

      // Animate SLA bar
      setTimeout(() => {
        card.querySelector(".sla-bar").style.width = dept.sla + "%";
      }, 100);
    });

    attachManageHandlers();
  }

  /* ---------- MANAGE SETTINGS ACTION ---------- */
  function attachManageHandlers() {
    document.querySelectorAll(".dept-card button").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.code;
        alert(`⚙️ Managing settings for department: ${code}`);
        
        // 🔗 API READY
        // window.location.href = `/admin/department/${code}`;
      });
    });
  }

  /* ---------- ADD NEW DEPARTMENT ---------- */
  newDeptBtn.addEventListener("click", () => {
    const name = prompt("Enter Department Name:");
    if (!name) return;

    const code = prompt("Enter Department Code:");
    if (!code) return;

    departments.push({
      name,
      code,
      staff: Math.floor(Math.random() * 200) + 20,
      orders: Math.floor(Math.random() * 120),
      sla: Math.floor(Math.random() * 20) + 75
    });

    renderDepartments(departments);
  });

  /* ---------- SEARCH ---------- */
  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    const filtered = departments.filter(dept =>
      dept.name.toLowerCase().includes(value) ||
      dept.code.toLowerCase().includes(value)
    );

    renderDepartments(filtered);
  });

  /* ---------- NOTIFICATIONS ---------- */
  notificationIcon.addEventListener("click", () => {
    alert("No new notifications");
  });

  /* ---------- INITIAL RENDER ---------- */
  renderDepartments(departments);

  console.log("Manage Departments JS Loaded");
});
