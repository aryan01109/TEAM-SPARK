/* =====================================================
   ADMIN DASHBOARD – AUTH + DATA HANDLER
   ===================================================== */

/* ======================
   AUTH GUARD (VERY FIRST)
   ====================== */
const token = localStorage.getItem("adminToken");

if (!token) {
  // Not logged in → redirect immediately
  window.location.href = "/civic/html/auth/adminLogin.html";
}

/* ======================
   DOM READY
   ====================== */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- ELEMENTS ---------- */
  const totalReportsEl = document.getElementById("totalReports");
  const activeReportsEl = document.getElementById("activeReports");
  const avgResolutionEl = document.getElementById("avgResolution");
  const activeCrewsEl = document.getElementById("activeCrews");
  const satisfactionEl = document.getElementById("satisfaction");

  const adminNameEl = document.getElementById("adminName");
  const adminEmailEl = document.getElementById("adminEmail");

  const logoutBtn = document.getElementById("logoutBtn");

  /* ======================
     FETCH DASHBOARD STATS
     ====================== */
  async function loadDashboardStats() {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Stats request failed (${res.status})`);
      }

      const data = await res.json();

      if (totalReportsEl) totalReportsEl.textContent = data.totalReports ?? 0;
      if (activeReportsEl) activeReportsEl.textContent = data.activeReports ?? 0;
      if (avgResolutionEl) avgResolutionEl.textContent = data.avgResolution ?? "—";
      if (activeCrewsEl) activeCrewsEl.textContent = data.activeCrews ?? "—";
      if (satisfactionEl) satisfactionEl.textContent = data.satisfaction ?? "—";

      console.log("Admin dashboard stats loaded");

    } catch (error) {
      console.error("Dashboard stats error:", error.message);
      alert("Unable to load dashboard statistics");
    }
  }

  /* ======================
     FETCH ADMIN PROFILE
     ====================== */
  async function loadAdminProfile() {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Profile request failed (${res.status})`);
      }

      const data = await res.json();

      if (adminNameEl) adminNameEl.textContent = data.name || "Admin";
      if (adminEmailEl) adminEmailEl.textContent = data.email || "";

      console.log("Admin profile loaded");

    } catch (error) {
      console.error("Profile error:", error.message);
      alert("Unable to load admin profile");
    }
  }

  /* ======================
     LOGOUT HANDLER
     ====================== */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/civic/html/auth/adminLogin.html";
    });
  }

  /* ======================
     INIT LOAD
     ====================== */
  loadAdminProfile();
  loadDashboardStats();

});
