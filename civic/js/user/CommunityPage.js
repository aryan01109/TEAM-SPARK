const API = "http://localhost:5000/api/community";

/* =============================
   AUTH
============================= */
const session = JSON.parse(localStorage.getItem("citizenSession"));

if (!session || !session.token) {
  window.location.href = "/civic/html/auth/LoginPage.html";
  throw new Error("Not authenticated");
}

/* =============================
   ELEMENTS
============================= */
const feed = document.querySelector(".feed");
const avatar = document.querySelector(".avatar");

/* =============================
   LOGOUT
============================= */
avatar.onclick = () => {
  localStorage.removeItem("citizenSession");
  window.location.href = "/civic/html/auth/LoginPage.html";
};

/* =============================
   LOAD FEED
============================= */
async function loadFeed() {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    // Token expired
    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      window.location.href = "/civic/html/auth/LoginPage.html";
      return;
    }

    const posts = await res.json();
    renderFeed(posts);
  } catch (err) {
    console.error("COMMUNITY LOAD ERROR:", err);
    feed.innerHTML = "<p style='color:red'>Failed to load community feed.</p>";
  }
}

/* =============================
   RENDER POSTS
============================= */
function renderFeed(posts) {
  feed.innerHTML = "";

  if (!posts.length) {
    feed.innerHTML = "<p>No community posts yet.</p>";
    return;
  }

  posts.forEach(p => {
    const el = document.createElement("article");
    el.className = "post";

    el.innerHTML = `
      <header class="post-header">
        <div class="user">
          <div class="user-avatar"></div>
          <div>
            <div class="user-name">${p.userName || "Citizen"}</div>
            <p class="meta">${p.location || "Local Area"}</p>
          </div>
        </div>
      </header>

      <div class="post-body">
        <h3>${p.title}</h3>
        <p>${p.description || ""}</p>
      </div>

      <div class="before-after">
        ${p.beforeImage ? `<img src="http://localhost:5000/uploads/${p.beforeImage}" />` : ""}
        ${p.afterImage ? `<img src="http://localhost:5000/uploads/${p.afterImage}" />` : ""}
      </div>

      <footer class="post-actions">
        <button onclick="likePost('${p._id}')">👍 ${p.likes || 0}</button>
      </footer>
    `;

    feed.appendChild(el);
  });
}

/* =============================
   LIKE
============================= */
async function likePost(id) {
  try {
    await fetch(API + "/like/" + id, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + session.token
      }
    });

    loadFeed();
  } catch (err) {
    console.error("LIKE ERROR:", err);
  }
}

/* =============================
   START
============================= */
loadFeed();
