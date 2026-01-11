/* ---------- DEFAULT DATA ---------- */
const defaultSettings = {
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
  theme: "light"
};

let settings = JSON.parse(localStorage.getItem("userSettings") || "null") || defaultSettings;

/* ---------- GET ELEMENTS ---------- */
const emailInput = document.getElementById("emailInput");

const notifEmail = document.getElementById("notifEmail");
const notifPush = document.getElementById("notifPush");
const notifSms = document.getElementById("notifSms");

const privacyProfile = document.getElementById("privacyProfile");
const privacyActivity = document.getElementById("privacyActivity");
const privacyShare = document.getElementById("privacyShare");

/* ---------- FILL UI ---------- */
function loadSettings() {
  emailInput.value = settings.email;

  notifEmail.checked = settings.notifications.email;
  notifPush.checked = settings.notifications.push;
  notifSms.checked = settings.notifications.sms;

  privacyProfile.checked = settings.privacy.publicProfile;
  privacyActivity.checked = settings.privacy.showActivity;
  privacyShare.checked = settings.privacy.shareData;

  document.querySelectorAll("input[name='theme']").forEach(r => {
    r.checked = r.value === settings.theme;
  });
}

loadSettings();

/* ---------- SAVE ---------- */
document.getElementById("settingsForm").addEventListener("submit", function(e) {
  e.preventDefault();

  settings = {
    email: emailInput.value,
    notifications: {
      email: notifEmail.checked,
      push: notifPush.checked,
      sms: notifSms.checked
    },
    privacy: {
      publicProfile: privacyProfile.checked,
      showActivity: privacyActivity.checked,
      shareData: privacyShare.checked
    },
    theme: document.querySelector("input[name='theme']:checked").value
  };

  localStorage.setItem("userSettings", JSON.stringify(settings));

  alert("Settings saved successfully");
});

/* ---------- RESET ---------- */
document.getElementById("btnReset").addEventListener("click", function() {
  settings = structuredClone(defaultSettings);
  loadSettings();
});