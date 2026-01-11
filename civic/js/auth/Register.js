const API = "http://localhost:5000/api/register";

const form = document.getElementById("registerForm");
const roleSelect = document.getElementById("role");

const userFields = document.getElementById("userFields");
const adminFields = document.getElementById("adminFields");

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

  // Always define variables first
  const role = roleSelect.value;
  const name = document.getElementById("fullName").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm").value.trim();

  let payload = { name, password, role };

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  if (role === "Admin") {
    payload.email = document.getElementById("adminEmail").value.trim();
    payload.govId = document.getElementById("govId").value.trim();
    payload.department = document.getElementById("department").value.trim();

    if (!payload.email || !payload.govId || !payload.department) {
      alert("All admin fields required");
      return;
    }
  } else {
    payload.identifier = document.getElementById("identifier").value.trim();
    payload.email = payload.identifier;

    if (!payload.identifier) {
      alert("Email or mobile required");
      return;
    }
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Account created successfully!");
    window.location.href = "LoginPage.html";

  } catch (err) {
    alert("Server not reachable");
  }
});
