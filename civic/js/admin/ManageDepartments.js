/* =====================================================
   MANAGE DEPARTMENTS – CIVIC ADMIN
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- ELEMENTS ---------- */
  const newDeptBtn = document.querySelector(".new-dept");
  const backBtn = document.getElementById("backBtn");
  const searchInput = document.querySelector(".top-actions input");
  const deptCards = document.querySelectorAll(".dept-card");

  /* ---------- NEW DEPARTMENT ---------- */
  if (newDeptBtn) {
    newDeptBtn.addEventListener("click", () => {
      const name = prompt("Enter Department Name");
      const code = prompt("Enter Department Code");

      if (!name || !code) return alert("All fields required");

      alert(`Department Created:\n${name} (${code})`);
      // 🔗 Backend-ready: POST /api/departments
    });
  }

  /* ---------- BACK BUTTON ---------- */
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "/civic/html/admin/AdminDashboard.html";
    });
  }

  /* ---------- SEARCH FILTER ---------- */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const value = searchInput.value.toLowerCase();

      deptCards.forEach(card => {
        const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
        card.style.display = title.includes(value) ? "block" : "none";
      });
    });
  }

  console.log(" Manage Departments JS Loaded Safely");
});
