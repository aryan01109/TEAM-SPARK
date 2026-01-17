/* =====================================================
   ADMIN SETTINGS – SMART CITY (BACKEND CONNECTED)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- ELEMENTS ---------- */
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const departmentInput = document.getElementById("department");
  const languageSelect = document.getElementById("language");
  const notificationCheck = document.getElementById("notifications");

  const saveBtn = document.getElementById("saveBtn");
  const passBtn = document.getElementById("passBtn");

  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");

  const API_BASE = "http://localhost:5000/api/admin";
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Session expired. Please login again.");
    window.location.href = "/civic/html/auth/adminLogin.html";
    return;
  }

  /* =====================================================
     LOAD ADMIN SETTINGS
     ===================================================== */
  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to load settings");

      const data = await res.json();

      nameInput.value = data.name || "";
      emailInput.value = data.email || "";
      departmentInput.value = data.department || "";
      languageSelect.value = data.language || "English";
      notificationCheck.checked = data.notifications ?? true;

      console.log("✅ Admin settings loaded");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load admin settings");
    }
  }

  loadSettings();

  /* =====================================================
     SAVE SETTINGS
     ===================================================== */
  saveBtn.addEventListener("click", async () => {
    if (!nameInput.value || !emailInput.value) {
      alert("⚠️ Name and Email are required");
      return;
    }

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      department: departmentInput.value.trim(),
      language: languageSelect.value,
      notifications: notificationCheck.checked
    };

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("✅ Settings saved successfully");
      console.log("Updated Settings:", data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save settings");
    }
  });

  /* =====================================================
     CHANGE PASSWORD
     ===================================================== */
  passBtn.addEventListener("click", async () => {
    if (!oldPassword.value || !newPassword.value) {
      alert("⚠️ Please fill both password fields");
      return;
    }

    if (newPassword.value.length < 6) {
      alert("⚠️ New password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: oldPassword.value,
          newPassword: newPassword.value
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("🔐 Password changed successfully");

      oldPassword.value = "";
      newPassword.value = "";
    } catch (err) {
      console.error(err);
      alert("❌ Password change failed");
    }
  });

  /* =====================================================
     UI FEEDBACK
     ===================================================== */
  languageSelect.addEventListener("change", () => {
    console.log(`🌐 Language set to ${languageSelect.value}`);
  });

  notificationCheck.addEventListener("change", () => {
    console.log(
      `🔔 Notifications ${notificationCheck.checked ? "enabled" : "disabled"}`
    );
  });

  console.log("✅ Admin Settings JS Loaded (Backend Connected)");
});
