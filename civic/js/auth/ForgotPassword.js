const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");

const submitBtn = document.getElementById("submitBtn");
const spinner = submitBtn.querySelector(".spinner");
const btnText = submitBtn.querySelector(".btn-text");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", e => {
  e.preventDefault();

  emailError.textContent = "";

  const email = emailInput.value.trim();

  if (!email) {
    emailError.textContent = "Email is required";
    return;
  }

  if (!isValidEmail(email)) {
    emailError.textContent = "Enter a valid email address";
    return;
  }

  submitBtn.disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Sending...";

  // Simulate backend email send
  fetch("http://localhost:5000/api/forgot-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email })
})
.then(res => res.json())
.then(data => {
  if (data.message) {
    alert("Reset link sent. Check backend console.");
    console.log("RESET LINK:", data.resetLink);
    window.location.href = "/civic/html/auth/LoginPage.html";
  } else {
    emailError.textContent = "Email not found";
  }
})
.catch(() => {
  alert("Server not reachable");
});

});

