const STORAGE_KEY = "user_settings";

const defaultData = {
  email: "sarah.johnson@email.com",
  theme: "light",
  notifications: { email: true, push: true, sms: false },
  privacy: { publicProfile: true, showActivity: true, shareData: false },
  account: {
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 123-4567"
  }
};

const toast = document.getElementById("toast");

/* ---------- load ---------- */
const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;

/* ---------- bind inputs ---------- */
firstName.value = data.account.firstName;
lastName.value = data.account.lastName;
email.value = data.email;
phone.value = data.account.phone;

notifEmail.checked = data.notifications.email;
notifPush.checked = data.notifications.push;
notifSms.checked = data.notifications.sms;

publicProfile.checked = data.privacy.publicProfile;
showActivity.checked = data.privacy.showActivity;
shareData.checked = data.privacy.shareData;

document.querySelector(`input[name="theme"][value="${data.theme}"]`).checked = true;
document.documentElement.setAttribute("data-theme", data.theme);

/* ---------- save ---------- */
settingsForm.onsubmit = e => {
  e.preventDefault();

  const updated = {
    email: email.value,
    theme: document.querySelector('input[name="theme"]:checked').value,
    notifications: {
      email: notifEmail.checked,
      push: notifPush.checked,
      sms: notifSms.checked
    },
    privacy: {
      publicProfile: publicProfile.checked,
      showActivity: showActivity.checked,
      shareData: shareData.checked
    },
    account: {
      firstName: firstName.value,
      lastName: lastName.value,
      phone: phone.value
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  document.documentElement.setAttribute("data-theme", updated.theme);
  showToast("Settings saved");
};

/* ---------- reset ---------- */
resetBtn.onclick = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  location.reload();
};

/* ---------- theme toggle ---------- */
themeToggle.onclick = () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  data.theme = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/* ---------- toast ---------- */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
