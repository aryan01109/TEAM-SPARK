document.addEventListener("DOMContentLoaded", async () => {

  /* ===============================
     SESSION CHECK
  =============================== */
  // const session = JSON.parse(localStorage.getItem("citizenSession") || "null");
  // if (!session || !session.token) {
  //   window.location.href = "/civic/html/auth/LoginPage.html";
  //   return;
  // }

  /* ===============================
     ELEMENTS
  =============================== */
  const grid = document.querySelector(".grid");
  const countBox = document.querySelector(".report-count");
  const searchInput = document.querySelector(".search input");
  const filterButtons = document.querySelectorAll(".filter-buttons button");
  const pagination = document.querySelector(".pagination");

  let reports = [];
  let filtered = [];
  let currentPage = 1;
  const PAGE_SIZE = 6;

  /* ===============================
     LOAD REPORTS
  =============================== */
  try {
    const res = await fetch("http://localhost:5000/api/my-reports", {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      return window.location.href = "/civic/html/auth/LoginPage.html";
    }

    reports = await res.json();
    filtered = [...reports];
    updateCount();
    render();

  } catch {
    grid.innerHTML = "<p>Server offline</p>";
  }

  /* ===============================
     SEARCH
  =============================== */
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    filtered = reports.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.reportId.toLowerCase().includes(q)
    );
    currentPage = 1;
    render();
  });

  /* ===============================
     FILTERS
  =============================== */
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.textContent;

      if (text.includes("Status")) {
        const status = prompt("Enter status: Resolved / In Progress / Submitted");
        if (!status) return;

        filtered = reports.filter(r => r.status.toLowerCase() === status.toLowerCase());
      }

      if (text.includes("Issue")) {
        const type = prompt("Enter issue type (ROADS, LIGHTING, etc)");
        if (!type) return;

        filtered = reports.filter(r => r.category.toLowerCase() === type.toLowerCase());
      }

      if (btn.classList.contains("clear")) {
        filtered = [...reports];
      }

      currentPage = 1;
      render();
    });
  });

  /* ===============================
     RENDER
  =============================== */
  function render() {
    grid.innerHTML = "";

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    pageItems.forEach(r => {
      const card = document.createElement("article");
      card.className = `card ${r.status.toLowerCase().replace(" ", "")}`;

      card.innerHTML = `
        <div class="image" style="background-image:url('${r.media?.[0] || "/civic/images/no-image.jpg"}')">
          <span class="status">${r.status}</span>
        </div>
        <div class="content">
          <h3>${r.title}</h3>
          <p class="meta">#${r.reportId} · ${r.location}</p>
          <div class="tags">
            <span>${r.category}</span>
            <span>${r.media.length} Media</span>
          </div>
          <div class="footer">
            <span>${new Date(r.createdAt).toDateString()}</span>
            <em>${r.status}</em>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    renderPagination();
    updateCount();
  }

  /* ===============================
     COUNT
  =============================== */
  function updateCount() {
    countBox.textContent = `Total Reports: ${filtered.length}`;
  }

  /* ===============================
     PAGINATION
  =============================== */
  function renderPagination() {
    pagination.innerHTML = "";

    const pages = Math.ceil(filtered.length / PAGE_SIZE);

    const prev = document.createElement("button");
    prev.textContent = "<";
    prev.disabled = currentPage === 1;
    prev.onclick = () => {
      currentPage--;
      render();
    };
    pagination.appendChild(prev);

    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => {
        currentPage = i;
        render();
      };
      pagination.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = ">";
    next.disabled = currentPage === pages;
    next.onclick = () => {
      currentPage++;
      render();
    };
    pagination.appendChild(next);
  }

});
