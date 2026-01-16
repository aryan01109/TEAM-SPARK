document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registerForm");

  const name = document.getElementById("name");
  const empId = document.getElementById("empId");
  const email = document.getElementById("email");
  const department = document.getElementById("department");
  const designation = document.getElementById("designation");
  const govId = document.getElementById("govId");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  function showMessage(msg, success = false) {
    alert((success ? "✅ " : "❌ ") + msg);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ---------- VALIDATION ----------
    if (
      !name.value ||
      !empId.value ||
      !email.value ||
      !department.value ||
      !designation.value ||
      !govId.value ||
      !password.value ||
      !confirmPassword.value
    ) {
      showMessage("All fields are required");
      return;
    }

    const allowedDomains = [
      "gov.in",
      "nic.in",
      "municipal.gov.in",
      "city.gov.in"
    ];

    const isGovEmail = allowedDomains.some(domain =>
      email.value.toLowerCase().endsWith(domain)
    );

    if (!isGovEmail) {
      showMessage("Use an official government email");
      return;
    }

    if (password.value.length < 6) {
      showMessage("Password must be at least 6 characters");
      return;
    }

    if (password.value !== confirmPassword.value) {
      showMessage("Passwords do not match");
      return;
    }

    // ---------- DATA ----------
    const officer = {
      name: name.value.trim(),
      empId: empId.value.trim(),
      email: email.value.trim(),
      department: department.value,
      designation: designation.value.trim(),
      govId: govId.value.trim(),
      password: password.value
    };

    try {
      const res = await fetch("http://localhost:5000/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(officer)
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || "Registration failed");
        return;
      }

      showMessage(data.message || "Registration successful", true);

      // ✅ CORRECT REDIRECT PATH
      setTimeout(() => {
        window.location.href = "/civic/html/auth/adminLogin.html";
      }, 800);

    } catch (error) {
      console.error(error);
      showMessage("Server not reachable. Try again later");
    }
  });

  console.log("Admin Registration JS Loaded (Redirect Fixed)");
});
