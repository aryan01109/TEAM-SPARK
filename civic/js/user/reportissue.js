// Category select
document.querySelectorAll(".category-grid button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category-grid button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Submit
document.querySelector(".primary").onclick = () => {
  alert("Report submitted successfully (frontend demo)");
};
