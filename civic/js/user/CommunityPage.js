/* ----------------- LOGOUT ----------------- */
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "/login";
};

/* ----------------- SAMPLE COMMUNITY DATA ----------------- */
const sampleCommunity = [
  { user: "Ravi Patel", text: "Large pothole repaired near Nehru Nagar.", likes: 23, comments: 5 },
  { user: "Aisha Khan", text: "Streetlights fixed in Vastrapur. Thanks AMC!", likes: 12, comments: 2 },
  { user: "Vivek Shah", text: "Garbage overflow reported and cleaned.", likes: 40, comments: 7 }
];

/* ----------------- RENDER FEED ----------------- */
function loadCommunityFeed() {

  const container = document.getElementById("communityFeed");
  const skeleton = document.getElementById("skeletonContainer");

  // simulate API delay
  setTimeout(() => {

    skeleton.style.display = "none";

    sampleCommunity.forEach(post => {
      const card = document.createElement("div");
      card.className = "community-card";

      card.innerHTML = `
        <div class="post-user">👤 ${post.user}</div>
        <p class="post-text">${post.text}</p>
        <div class="post-meta">
          👍 ${post.likes} &nbsp;&nbsp; 💬 ${post.comments}
        </div>
      `;

      container.appendChild(card);
    });

  }, 1500);
}

loadCommunityFeed();