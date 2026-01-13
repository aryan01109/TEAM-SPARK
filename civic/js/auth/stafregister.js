document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */
  const form = document.getElementById("staffForm");
  const email = document.getElementById("email");
  const strengthBox = document.getElementById("strengthBox");
  const strengthText = document.getElementById("strengthText");
  const termsCheckbox = document.getElementById("terms");
  const termsError = document.getElementById("termsError");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = submitBtn.querySelector(".spinner");
  const btnText = submitBtn.querySelector(".btn-text");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");

  submitBtn.disabled = true;

  /* =========================
     PASSWORD TOGGLE
  ========================= */
  togglePassword.addEventListener("click", () => {
    const hidden = passwordInput.type === "password";
    passwordInput.type = hidden ? "text" : "password";
    togglePassword.textContent = hidden ? "👁" : "🙈";
  });

  /* =========================
     PASSWORD STRENGTH
  ========================= */
  passwordInput.addEventListener("input", () => {
    const v = passwordInput.value;
    let score = 0;

    if (v.length >= 12) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    strengthBox.className = "strength";

    if (score <= 1) {
      strengthBox.classList.add("weak");
      strengthText.textContent = "Strength: Weak";
    } else if (score === 2) {
      strengthBox.classList.add("medium");
      strengthText.textContent = "Strength: Medium";
    } else if (score === 3) {
      strengthBox.classList.add("strong");
      strengthText.textContent = "Strength: Strong";
    } else {
      strengthBox.classList.add("very-strong");
      strengthText.textContent = "Strength: Very Strong";
    }
  });

  /* =========================
     TERMS
  ========================= */
  termsCheckbox.addEventListener("change", () => {
    submitBtn.disabled = !termsCheckbox.checked;
    termsError.style.display = "none";
  });

  /* =========================
     FORM SUBMIT
  ========================= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!termsCheckbox.checked) {
      termsError.textContent = "You must accept the security terms.";
      termsError.style.display = "block";
      return;
    }

    if (!email.value.endsWith(".gov")) {
      alert("Only .gov emails allowed");
      return;
    }

    if (passwordInput.value.length < 12) {
      alert("Password must be at least 12 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/staff/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("fullName").value,
          email: email.value,
          password: passwordInput.value,
          department: document.getElementById("department").value,
          employeeId: document.getElementById("employeeId").value
        })
      });

      const data = await res.json();
      alert(data.message);
      window.location.href = "/civic/html/auth/LoginPage.html";

    } catch {
      alert("Server not reachable");
    }
  });

});
