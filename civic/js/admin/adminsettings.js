/* =====================================================
   ADMIN SETTINGS – SMART CITY
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

  /* ---------- DEFAULT ADMIN DATA ---------- */
  const defaultSettings = {
    name: "Super Admin",
    email: "admin@smartcity.com",
    department: "City Operations",
    language: "English",
    notifications: true
  };

  /* ---------- LOAD SETTINGS ---------- */
  function loadSettings() {
    const saved = JSON.parse(localStorage.getItem("adminSettings"));

    const data = saved || defaultSettings;

    nameInput.value = data.name;
    emailInput.value = data.email;
    departmentInput.value = data.department;
    languageSelect.value = data.language;
    notificationCheck.checked = data.notifications;
  }

  loadSettings();

  /* ---------- SAVE SETTINGS ---------- */
  saveBtn.addEventListener("click", () => {
    if (!nameInput.value || !emailInput.value) {
      alert("⚠️ Name and Email are required");
      return;
    }

    const settings = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      department: departmentInput.value.trim(),
      language: languageSelect.value,
      notifications: notificationCheck.checked
    };

    localStorage.setItem("adminSettings", JSON.stringify(settings));

    alert("✅ Settings saved successfully");

    console.log("Saved Admin Settings:", settings);

    /* 🔗 API READY (uncomment when backend connected)
    fetch("http://localhost:5000/api/admin/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_ADMIN_TOKEN"
      },
      body: JSON.stringify(settings)
    });
    */
  });

  /* ---------- CHANGE PASSWORD ---------- */
  passBtn.addEventListener("click", () => {
    if (!oldPassword.value || !newPassword.value) {
      alert("⚠️ Please fill both password fields");
      return;
    }

    if (newPassword.value.length < 6) {
      alert("⚠️ New password must be at least 6 characters");
      return;
    }

    // Demo password check (frontend only)
    const demoOldPassword = "admin123";

    if (oldPassword.value !== demoOldPassword) {
      alert("❌ Old password is incorrect");
      return;
    }

    alert("🔐 Password changed successfully");

    oldPassword.value = "";
    newPassword.value = "";

    /* 🔗 API READY (uncomment when backend connected)
    fetch("http://localhost:5000/api/admin/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_ADMIN_TOKEN"
      },
      body: JSON.stringify({
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      })
    });
    */
  });

  /* ---------- LANGUAGE CHANGE EFFECT ---------- */
  languageSelect.addEventListener("change", () => {
    console.log(`🌐 Language changed to ${languageSelect.value}`);
  });

  /* ---------- NOTIFICATION TOGGLE ---------- */
  notificationCheck.addEventListener("change", () => {
    const status = notificationCheck.checked ? "enabled" : "disabled";
    console.log(`🔔 Notifications ${status}`);
  });

  console.log("✅ Admin Settings JS Loaded");
});
