// js/shared/header.js

const USER = {
  name: "Admin User",
  role: localStorage.getItem("role") || "admin"
};

export function loadHeader(activePage) {
  fetch("../shared/header.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);
      setupHeader(activePage);
    });
}

function setupHeader(activePage) {
  const role = USER.role;

  // Role badge
  const badge = document.getElementById("userRoleBadge");
  badge.innerText = role.toUpperCase();
  badge.className = `role-badge ${role}`;

  // Role-based menu visibility
  document.querySelectorAll(".header-nav a").forEach(link => {
    const allowedRole = link.dataset.role;
    if (allowedRole && allowedRole !== role) {
      link.style.display = "none";
    }
  });

  // Active link
  document.querySelectorAll(".header-nav a").forEach(link => {
    if (link.getAttribute("href").includes(activePage)) {
      link.classList.add("active");
    }
  });

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "../auth/login.html";
  };
}
