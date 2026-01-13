const session = JSON.parse(localStorage.getItem("citizenSession"));

if (!session) {
  window.location.href = "/civic/html/auth/LoginPage.html";
}

document.getElementById("citizenName").textContent = session.name;
document.getElementById("welcomeName").textContent = session.name.split(" ")[0];

fetch("http://localhost:5000/api/user-dashboard", {
  headers: {
    Authorization: session.token
  }
})
.then(res => res.json())
.then(data => {
  document.querySelector(".stats .card:nth-child(1) .big").textContent = data.total;
  document.querySelector(".stats .card:nth-child(2) .big").textContent = data.resolved;
  document.querySelector(".stats .card:nth-child(3) .big").textContent = data.active;

  const container = document.querySelector(".activity");
  data.recent.forEach(r => {
    container.innerHTML += `
      <div class="activity-item ${r.status}">
        <span class="material-symbols-outlined">engineering</span>
        <div>
          <h4>${r.title}</h4>
          <p>${r.status}</p>
        </div>
      </div>`;
  });
});
