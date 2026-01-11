document.addEventListener("DOMContentLoaded", () => {

  // Clear old session
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");

  const form = document.getElementById("registerForm");
  const roleSelect = document.getElementById("role");
  const userFields = document.getElementById("userFields");
  const adminFields = document.getElementById("adminFields");
  const submitBtn = document.getElementById("submitBtn");
  const messageDiv = document.getElementById("message");

  roleSelect.addEventListener("change", () => {
    if (roleSelect.value === "Admin") {
      userFields.style.display = "none";
      adminFields.style.display = "block";
    } else {
      userFields.style.display = "block";
      adminFields.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = roleSelect.value;
    const fullName = document.getElementById("fullName").value.trim();
    const identifier = document.getElementById("identifier").value.trim();
    const adminEmail = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const govId = document.getElementById("govId").value.trim();
    const department = document.getElementById("department").value.trim();
    const securityCode = document.getElementById("securityCode").value.trim();

    clearErrors();

    let errors = {};

    if (!fullName) errors.fullName = "Full name is required";

    if (role === "User") {
      if (!identifier) errors.identifier = "Email or phone required";
    } else {
      if (!adminEmail) errors.adminEmail = "Admin email required";
      if (!govId) errors.govId = "Government ID required";
    }

    if (!password || password.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (confirm !== password)
      errors.confirm = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: role === "Admin" ? adminEmail : identifier,
          password,
          role,
          govId,
          department,
          securityCode
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || data.message);

      localStorage.setItem("username", fullName);
      localStorage.setItem("role", role);

      showMessage("Registration successful! Redirecting...", true);

      setTimeout(() => {
        if (role === "Admin") {
          window.location.href = "./AdminDashboard.html";
        } else {
          window.location.href = "./UserDashboard.html";
        }
      }, 1500);

    } catch (err) {
      showMessage(err.message || "Registration failed", false);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(state) {
    submitBtn.disabled = state;
    submitBtn.textContent = state ? "Registering..." : "Register";
  }

  function showMessage(msg, success) {
    messageDiv.textContent = msg;
    messageDiv.style.display = "block";
    messageDiv.style.color = success ? "limegreen" : "red";
  }

  function clearErrors() {
    document.querySelectorAll(".field-error").forEach(el => {
      el.textContent = "";
      el.style.display = "none";
    });
    messageDiv.style.display = "none";
  }

  function showErrors(errors) {
    Object.keys(errors).forEach(key => {
      const el = document.getElementById(key + "Error");
      if (el) {
        el.textContent = errors[key];
        el.style.display = "block";
      }
    });
  }

});
