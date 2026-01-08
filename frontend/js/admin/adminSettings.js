/* =========================
   CONFIG
========================= */
const API_URL = "/api/admin/settings";
const STORAGE_KEY = "admin_settings";

/* =========================
   DEFAULT STATE
========================= */
const defaultData = {
  system: {
    maintenanceMode: false,
    notifications: true,
    autoUpdates: true,
    backupEnabled: true
  },
  email: {
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    fromEmail: "admin@civicconnect.org"
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 120,
    passwordComplexity: "high",
    auditLogging: true
  },
  features: {
    userReporting: true,
    communityFeatures: true,
    adminDashboard: true,
    apiAccess: true
  }
};

let formData = loadFromStorage();

/* =========================
   HELPERS
========================= */
const qs = id => document.getElementById(id);

function showToast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerText = msg;
  document.getElementById("toastContainer").appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : structuredClone(defaultData);
}

/* =========================
   RENDER
========================= */
function render() {
  qs("maintenanceMode").checked = formData.system.maintenanceMode;
  qs("systemNotifications").checked = formData.system.notifications;
  qs("autoUpdates").checked = formData.system.autoUpdates;
  qs("backupEnabled").checked = formData.system.backupEnabled;

  qs("smtpHost").value = formData.email.smtpHost;
  qs("smtpPort").value = formData.email.smtpPort;
  qs("fromEmail").value = formData.email.fromEmail;

  qs("twoFactorAuth").checked = formData.security.twoFactorAuth;
  qs("auditLogging").checked = formData.security.auditLogging;
  qs("sessionTimeout").value = formData.security.sessionTimeout;

  document.querySelectorAll('input[name="passwordComplexity"]').forEach(r => {
    r.checked = r.value === formData.security.passwordComplexity;
  });

  qs("userReporting").checked = formData.features.userReporting;
  qs("communityFeatures").checked = formData.features.communityFeatures;
  qs("adminDashboard").checked = formData.features.adminDashboard;
  qs("apiAccess").checked = formData.features.apiAccess;
}

/* =========================
   INPUT HANDLERS
========================= */
qs("maintenanceMode").onchange = e => { formData.system.maintenanceMode = e.target.checked; saveToStorage(); };
qs("systemNotifications").onchange = e => { formData.system.notifications = e.target.checked; saveToStorage(); };
qs("autoUpdates").onchange = e => { formData.system.autoUpdates = e.target.checked; saveToStorage(); };
qs("backupEnabled").onchange = e => { formData.system.backupEnabled = e.target.checked; saveToStorage(); };

qs("smtpHost").oninput = e => { formData.email.smtpHost = e.target.value; saveToStorage(); };
qs("smtpPort").oninput = e => { formData.email.smtpPort = e.target.value; saveToStorage(); };
qs("fromEmail").oninput = e => { formData.email.fromEmail = e.target.value; saveToStorage(); };

qs("twoFactorAuth").onchange = e => { formData.security.twoFactorAuth = e.target.checked; saveToStorage(); };
qs("auditLogging").onchange = e => { formData.security.auditLogging = e.target.checked; saveToStorage(); };
qs("sessionTimeout").oninput = e => {
  formData.security.sessionTimeout = parseInt(e.target.value || 0);
  saveToStorage();
};

document.querySelectorAll('input[name="passwordComplexity"]').forEach(r => {
  r.onchange = e => {
    formData.security.passwordComplexity = e.target.value;
    saveToStorage();
  };
});

qs("userReporting").onchange = e => { formData.features.userReporting = e.target.checked; saveToStorage(); };
qs("communityFeatures").onchange = e => { formData.features.communityFeatures = e.target.checked; saveToStorage(); };
qs("adminDashboard").onchange = e => { formData.features.adminDashboard = e.target.checked; saveToStorage(); };
qs("apiAccess").onchange = e => { formData.features.apiAccess = e.target.checked; saveToStorage(); };

/* =========================
   SAVE TO BACKEND
========================= */
qs("adminSettingsForm").onsubmit = async e => {
  e.preventDefault();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!res.ok) throw new Error();
    showToast("Admin settings saved");
  } catch {
    showToast("Failed to save admin settings", "error");
  }
};

/* =========================
   RESET
========================= */
qs("resetBtn").onclick = () => {
  formData = structuredClone(defaultData);
  saveToStorage();
  render();
  showToast("Settings reset");
};

/* =========================
   LOGOUT
========================= */
qs("logoutBtn").onclick = () => showToast("Logged out");

/* =========================
   INIT
========================= */
render();
