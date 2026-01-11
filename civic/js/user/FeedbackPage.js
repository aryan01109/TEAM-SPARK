/* ---------------- STATE ---------------- */
let rating = 5;
let submitting = false;

/* ---------------- ELEMENTS ---------------- */
const form = document.getElementById("feedbackForm");
const submitBtn = document.getElementById("submitBtn");

const successBox = document.getElementById("successBox");
const errorBox = document.getElementById("errorBox");

const subjectInput = document.getElementById("subject");
const messageInput = document.getElementById("message");
const emailInput = document.getElementById("email");

const subjectError = document.getElementById("subjectError");
const messageError = document.getElementById("messageError");
const emailError = document.getElementById("emailError");

/* ---------------- RATING ---------------- */
const stars = document.querySelectorAll(".star");
const ratingText = document.getElementById("ratingText");

function updateStars() {
  stars.forEach(star => {
    star.classList.toggle("filled", Number(star.dataset.value) <= rating);
  });
  ratingText.innerText = `(${rating}/5)`;
}

stars.forEach(star => {
  star.addEventListener("click", () => {
    rating = Number(star.dataset.value);
    updateStars();
  });
});

updateStars();

/* ---------------- VALIDATION ---------------- */
function validate() {
  let errors = {};

  subjectError.innerText = "";
  messageError.innerText = "";
  emailError.innerText = "";

  subjectInput.classList.remove("has-error");
  messageInput.classList.remove("has-error");
  emailInput.classList.remove("has-error");

  if (!subjectInput.value.trim()) {
    errors.subject = "Subject is required";
  }

  if (!messageInput.value.trim()) {
    errors.message = "Message is required";
  } else if (messageInput.value.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }

  if (emailInput.value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
    errors.email = "Invalid email format";
  }

  if (errors.subject) {
    subjectError.innerText = errors.subject;
    subjectInput.classList.add("has-error");
  }

  if (errors.message) {
    messageError.innerText = errors.message;
    messageInput.classList.add("has-error");
  }

  if (errors.email) {
    emailError.innerText = errors.email;
    emailInput.classList.add("has-error");
  }

  return errors;
}

/* ---------------- SUBMIT ---------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitting) return;

  const errors = validate();
  if (Object.keys(errors).length > 0) return;

  submitting = true;
  submitBtn.innerText = "Submitting...";
  submitBtn.disabled = true;

  try {
    /* simulate API call */
    await new Promise(res => setTimeout(res, 1500));

    successBox.hidden = false;
    errorBox.hidden = true;

    form.reset();
    rating = 5;
    updateStars();

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3000);

  } catch (err) {
    errorBox.innerText = "Failed to submit feedback. Please try again.";
    errorBox.hidden = false;
  } finally {
    submitting = false;
    submitBtn.innerText = "Submit Feedback";
    submitBtn.disabled = false;
  }
});

/* ---------------- CANCEL ---------------- */
document.getElementById("cancelBtn").onclick = () => {
  history.back();
};
