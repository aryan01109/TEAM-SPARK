const token = localStorage.getItem("token");

if (!token) {
  alert("Admin not logged in");
  window.location.href = "Login.html";
}

/* Load Admin Settings */
fetch("http://localhost:5000/api/admin/settings", {
  headers: { Authorization: "Bearer " + token }
})
.then(res => res.json())
.then(data => {
  if (!data) return;
  name.value = data.name || "";
  email.value = data.email || "";
  department.value = data.department || "";
  language.value = data.language || "English";
  notifications.checked = data.notifications;
});

/* Save Settings */
document.getElementById("saveBtn").onclick = function() {
  fetch("http://localhost:5000/api/admin/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      department: department.value,
      language: language.value,
      notifications: notifications.checked
    })
  })
  .then(() => alert("Settings saved"));
};

/* Change Password */
document.getElementById("passBtn").onclick = function() {
  fetch("http://localhost:5000/api/admin/settings/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
  })
  .then(res => res.json())
  .then(d => alert(d.message));
};
