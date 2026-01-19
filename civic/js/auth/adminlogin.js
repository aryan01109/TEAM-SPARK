/* =====================================================
   ADMIN LOGIN – CIVIC SYSTEM (FIXED SESSION STORAGE)
===================================================== */




document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("form");
  const empIdInput = document.getElementById("empId");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  function showMessage(message, type = "error") {
    alert(type === "error" ? message : message);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const empId = empIdInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!empId || !email || !password) {
      showMessage("All fields are required");
      return;
    }

    try {
      // ADMIN LOGIN API
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || "Invalid credentials");
        return;
      }

      /* ======================
         SAVE SESSION (CRITICAL FIX)
      ====================== */
      localStorage.setItem(
        "citizenSession",
        JSON.stringify({
          token: data.token,
          admin: data.admin
        })
      );

      showMessage("Login successful", "success");

      // REDIRECT (LIVE SERVER SAFE)
      setTimeout(() => {
        window.location.href = "../admin/AdminDashboard.html";
      }, 600);

    } catch (err) {
      console.error("Login error:", err);
      showMessage("Server error. Please try again later");
    }
  });

  console.log("Admin Login JS Loaded & Session Stored Correctly");
});
