/* =========================
   CONFIG
========================= */
const API_URL = "/api/user/settings"; // change to real endpoint
const STORAGE_KEY = "user_settings";

/* =========================
   DEFAULT STATE
========================= */
const defaultData = {
  email: "sarah.johnson@email.com",
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    publicProfile: true,
    showActivity: true,
    shareData: false
  },
  theme: "light", // light | dark | auto
  account: {
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 123-4567"
  }
};

/* =========================
   STATE
========================= */
let formData = loadFromStorage();

/* =========================
   HELPERS
========================= */
const qs = id => document.getElementById(id);

function showToast(message, type = "success") {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerText = message;
  document.body.appendChild(t);
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
   THEME LOGIC
========================= */
function applyTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (formData.theme === "dark") {
    document.body.classList.add("dark");
  } else if (formData.theme === "light") {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.toggle("dark", prefersDark);
  }
}

/* =========================
   RENDER
========================= */
function render() {
  qs("firstName").value = formData.account.firstName;
  qs("lastName").value = formData.account.lastName;
  qs("email").value = formData.email;
  qs("phone").value = formData.account.phone;

  qs("notifEmail").checked = formData.notifications.email;
  qs("notifPush").checked = formData.notifications.push;
  qs("notifSms").checked = formData.notifications.sms;

  qs("privacyPublic").checked = formData.privacy.publicProfile;
  qs("privacyActivity").checked = formData.privacy.showActivity;
  qs("privacyShare").checked = formData.privacy.shareData;

  document.querySelectorAll('input[name="theme"]').forEach(r => {
    r.checked = r.value === formData.theme;
  });

  applyTheme();
}

/* =========================
   INPUT HANDLERS
========================= */
qs("firstName").oninput = e => { formData.account.firstName = e.target.value; saveToStorage(); };
qs("lastName").oninput = e => { formData.account.lastName = e.target.value; saveToStorage(); };
qs("email").oninput = e => { formData.email = e.target.value; saveToStorage(); };
qs("phone").oninput = e => { formData.account.phone = e.target.value; saveToStorage(); };

qs("notifEmail").onchange = e => { formData.notifications.email = e.target.checked; saveToStorage(); };
qs("notifPush").onchange = e => { formData.notifications.push = e.target.checked; saveToStorage(); };
qs("notifSms").onchange = e => { formData.notifications.sms = e.target.checked; saveToStorage(); };

qs("privacyPublic").onchange = e => { formData.privacy.publicProfile = e.target.checked; saveToStorage(); };
qs("privacyActivity").onchange = e => { formData.privacy.showActivity = e.target.checked; saveToStorage(); };
qs("privacyShare").onchange = e => { formData.privacy.shareData = e.target.checked; saveToStorage(); };

document.querySelectorAll('input[name="theme"]').forEach(r => {
  r.onchange = e => {
    formData.theme = e.target.value;
    saveToStorage();
    applyTheme();
  };
});

/* =========================
   BACKEND SAVE
========================= */
qs("settingsForm").onsubmit = async e => {
  e.preventDefault();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!res.ok) throw new Error("Save failed");
    showToast("Settings saved successfully");
  } catch (err) {
    console.error(err);
    showToast("Failed to save settings", "error");
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
qs("logoutBtn").onclick = () => {
  showToast("Logged out");
};

/* =========================
   INIT
========================= */
render();
