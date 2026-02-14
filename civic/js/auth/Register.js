// ============================
// ELEMENTS
// ============================
const form = document.getElementById("registerForm");
const roleButtons = document.querySelectorAll(".role");

const nameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");
const strengthBox = document.getElementById("strengthBox");
const strengthText = document.getElementById("strengthText");

const submitBtn = document.getElementById("submitBtn");
const spinner = submitBtn.querySelector(".spinner");
const btnText = submitBtn.querySelector(".btn-text");

// ✅ DEPLOYED BACKEND URL
const API_BASE = "https://team-spark-1.onrender.com/api";

// ============================
// ROLE SWITCH
// ============================
let activeRole = "User";

roleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    roleButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.role === "staff") {
      window.location.href = "/civic/html/auth/StaffRegister.html";
    } else {
      activeRole = "User";
    }
  });
});

// ============================
// PASSWORD TOGGLE
// ============================
togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "🙈" : "👁";
});

// ============================
// PASSWORD STRENGTH
// ============================
passwordInput.addEventListener("input", () => {
  const val = passwordInput.value;
  let score = 0;

  if (val.length >= 6) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;

  strengthBox.className = "strength";

  if (score <= 1) {
    strengthBox.classList.add("weak");
    strengthText.textContent = "Strength: Weak";
  } else if (score === 2) {
    strengthBox.classList.add("medium");
    strengthText.textContent = "Strength: Medium";
  } else {
    strengthBox.classList.add("strong");
    strengthText.textContent = "Strength: Strong";
  }
});

// ============================
// SUBMIT REGISTER FORM
// ============================
form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Creating Account...";

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    localStorage.setItem("lastRegisteredEmail", email);
    alert("Account created successfully!");

    // Redirect to login page
    window.location.href = "/civic/html/auth/index.html";

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Server not reachable");
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add("hidden");
    btnText.textContent = "Create Account";
  }
});
