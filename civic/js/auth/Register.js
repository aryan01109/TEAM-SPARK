document.getElementById("role").onchange = e => {
  document.getElementById("adminFields").style.display =
    e.target.value === "Admin" ? "block" : "none";
};

document.getElementById("registerForm").onsubmit = async e => {
  e.preventDefault();

  const role = role.value;
  const name = fullName.value;
  const email = role === "Admin" ? adminEmail.value : identifier.value;
  const password = password.value;
  const confirm = confirm.value;

  if (password !== confirm) return alert("Passwords do not match");

  const res = await fetch("http://localhost:5000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
      govId: govId?.value,
      department: department?.value
    })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) location.href = "./LoginPage.html";
};
