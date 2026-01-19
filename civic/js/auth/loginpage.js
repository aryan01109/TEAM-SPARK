document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================= */
  const API_BASE = "http://localhost:5000/api";

  /* =========================
     ELEMENTS
  ========================= */
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn?.querySelector(".btn-text");

  const roleButtons = document.querySelectorAll(".role");
  const ssoLink = document.getElementById("ssoLink");
  const adminBtn = document.getElementById("adminLoginBtn");

  let activeRole = "citizen";

  /* =========================
     AUTO REDIRECT IF LOGGED IN
  ========================= */
  try {
    const session = JSON.parse(localStorage.getItem("citizenSession"));
    if (session?.token) {
      redirectByRole(session.role);
      return;
    }
  } catch {}

  /* =========================
     ROLE SWITCH
  ========================= */
  roleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      roleButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeRole = btn.dataset.role;

      if (ssoLink) {
        ssoLink.style.display = activeRole === "staff" ? "block" : "none";
      }
    });
  });

  /* =========================
     LOGIN SUBMIT
  ========================= */
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        alert("Email and password are required");
        return;
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Signing in...";

      try {
        const endpoint =
          activeRole === "staff"
            ? `${API_BASE}/staff/login`
            : `${API_BASE}/login`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        /* =========================
           SAVE SESSION
        ========================= */
        localStorage.setItem("citizenSession", JSON.stringify({
          token: data.token,
          role: data.role,
          name: data.name,
          lastActive: Date.now()
        }));

        redirectByRole(data.role);

      } catch (err) {
        alert(err.message);
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Sign In";
      }
    });
  }

  /* =========================
     ADMIN LOGIN BUTTON
  ========================= */
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      window.location.href = "/civic/html/auth/adminLogin.html";
    });
  }

  /* =========================
     REDIRECT HELPERS
  ========================= */
  function redirectByRole(role) {
    const r = (role || "").toLowerCase();

    if (r === "admin") {
      window.location.href = "/civic/html/admin/AdminDashboard.html";
    } else if (r === "staff") {
      window.location.href = "/civic/html/staff/StaffDashboard.html";
    } else {
      window.location.href = "/civic/html/user/UserDashboard.html";
    }
  }

  console.log("Login page loaded successfully");
});
