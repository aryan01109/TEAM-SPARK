/* =========================
   AUTO-FILL EMAIL
========================= */
const savedEmail = localStorage.getItem("lastRegisteredEmail");
const emailInput = document.getElementById("email");
if (savedEmail && emailInput) {
  emailInput.value = savedEmail;
  localStorage.removeItem("lastRegisteredEmail");
}

/* =========================
   ROLE SWITCH
========================= */
const roles = document.querySelectorAll(".role");
const ssoLink = document.getElementById("ssoLink");
let activeRole = "citizen";

roles.forEach(btn => {
  btn.addEventListener("click", () => {
    roles.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeRole = btn.dataset.role;
    ssoLink.style.display = activeRole === "staff" ? "block" : "none";
  });
});
ssoLink.style.display = "none";

/* =========================
   PASSWORD TOGGLE
========================= */
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

/* =========================
   LOGIN
========================= */
const form = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const spinner = submitBtn.querySelector(".spinner");
const btnText = submitBtn.querySelector(".btn-text");

const currentPath = window.location.pathname;
const basePath = currentPath.split("/civic")[0];

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (activeRole === "staff") {
    alert("City staff must login using Municipal SSO");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  btnText.textContent = "Signing in...";
 if (spinner) spinner.classList.remove("hidden");
  submitBtn.disabled = true;

  console.log("LOGIN PAYLOAD:", {
  identifier: email,
  password
});

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: email,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      if (spinner) spinner.classList.add("hidden");
      if (btnText) btnText.textContent = "Signing in...";
      submitBtn.disabled = false;
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

// Redirect based on role
     if (data.role === "Staff") {
     window.location.href = basePath + "/html/admin/AdminDashboard.html";
} 
else if (data.role === "Citizen" || data.role === "User") {
      window.location.href = basePath + "/html/user/UserDashboard.html";
}
else {
  alert("Unknown role: " + data.role);
}


  } catch {
    alert("Server not reachable");
  }
});
