document.addEventListener("DOMContentLoaded", () => {

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const form = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn?.querySelector(".btn-text");
  const ssoLink = document.getElementById("ssoLink");
  const googleBtn = document.getElementById("googleBtn");

  // =========================
  // AUTO FILL EMAIL
  // =========================
  const savedEmail = localStorage.getItem("lastRegisteredEmail");
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    localStorage.removeItem("lastRegisteredEmail");
  }

  // =========================
  // ROLE SWITCH
  // =========================
  let activeRole = "citizen";

  document.querySelectorAll(".role").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".role").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeRole = btn.dataset.role;

      if (ssoLink) {
        ssoLink.style.display = activeRole === "staff" ? "block" : "none";
      }
    });
  });

  if (ssoLink) ssoLink.style.display = "none";

  // =========================
  // PASSWORD TOGGLE
  // =========================
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword && passwordInput) {
    togglePassword.onclick = () => {
      passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    };
  }

  // =========================
  // NORMAL LOGIN
  // =========================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (activeRole === "staff") {
        alert("Staff must use Municipal SSO");
        return;
      }

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        alert("Email and password required");
        return;
      }

      submitBtn.disabled = true;
      btnText.textContent = "Signing in...";

      try {
        const res = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })   // 🔥 FIXED
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Login failed");
          submitBtn.disabled = false;
          btnText.textContent = "Sign In";
          return;
        }

        localStorage.setItem("citizenSession", JSON.stringify({
          token: data.token,
          role: data.role,
          name: data.name,
          loginTime: Date.now()
        }));

        window.location.href =
          data.role === "Staff"
            ? "/civic/html/admin/AdminDashboard.html"
            : "/civic/html/user/UserDashboard.html";

      } catch {
        alert("Server not reachable");
        submitBtn.disabled = false;
        btnText.textContent = "Sign In";
      }
    });
  }

  // =========================
  // GOOGLE LOGIN
  // =========================
  if (window.google && googleBtn) {
    google.accounts.id.initialize({
      client_id: "YOUR_REAL_GOOGLE_CLIENT_ID",
      callback: async (response) => {
        const res = await fetch("http://localhost:5000/api/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();
        if (!res.ok) return alert("Google login failed");

        localStorage.setItem("citizenSession", JSON.stringify({
          token: data.token,
          role: data.role,
          name: data.name,
          loginTime: Date.now()
        }));

        window.location.href = "/civic/html/user/UserDashboard.html";
      }
    });

    googleBtn.onclick = () => {
      google.accounts.id.prompt();  // opens Google login popup
    };
  }

});

document.getElementById("adminLoginBtn").addEventListener("click", () => {
  window.location.href = "/civic/html/auth/adminLogin.html";
});
