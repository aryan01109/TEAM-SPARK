/* =====================================================
   ADMIN LOGIN – CIVIC SYSTEM (BACKEND CONNECTED)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("form");
  const empIdInput = document.getElementById("empId");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  function showMessage(message, type = "error") {
    alert(type === "error" ? "❌ " + message : "✅ " + message);
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
      // ✅ CORRECT ADMIN LOGIN API
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

      // ✅ SAVE AUTH STATE
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));

      showMessage("Login successful", "success");

      // ✅ REDIRECT (RELATIVE PATH – LIVE SERVER SAFE)
      setTimeout(() => {
        window.location.href = "../admin/AdminDashboard.html";
      }, 800);

    } catch (err) {
      console.error(err);
      showMessage("Server error. Please try again later");
    }
  });

  console.log("✅ Admin Login JS Loaded (Backend Connected)");
});
