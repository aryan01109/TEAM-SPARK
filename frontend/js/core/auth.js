// js/core/auth.js

import { can } from "./permissions.js";

export function protectPage(requiredPermission) {
  const role = localStorage.getItem("role");

  if (!role) {
    redirectToLogin();
    return;
  }

  if (!can(role, requiredPermission)) {
    document.body.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        height:100vh;
        font-family:system-ui;
        background:#f8fafc;
      ">
        <div style="text-align:center">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
          <button onclick="location.href='../auth/login.html'">
            Go to Login
          </button>
        </div>
      </div>
    `;
  }
}

function redirectToLogin() {
  window.location.href = "../auth/login.html";
}
