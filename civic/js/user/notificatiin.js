document.addEventListener("DOMContentLoaded", () => {

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
  const markAllBtn = document.getElementById("markAllRead");
  const filterLinks = document.querySelectorAll(".settings-nav a");
  const notifications = document.querySelectorAll(".notification");

  /* ===============================
     LOAD READ STATUS
  =============================== */
  const saved = JSON.parse(localStorage.getItem("notificationState") || "{}");

  notifications.forEach((note, index) => {
    if (saved[index] === "read") {
      note.classList.remove("unread");
    }
  });

  /* ===============================
     CLICK TO MARK AS READ
  =============================== */
  notifications.forEach((note, index) => {
    note.addEventListener("click", () => {
      note.classList.remove("unread");
      saved[index] = "read";
      localStorage.setItem("notificationState", JSON.stringify(saved));
    });
  });

  /* ===============================
     MARK ALL AS READ
  =============================== */
  markAllBtn.addEventListener("click", () => {
    notifications.forEach((note, i) => {
      note.classList.remove("unread");
      saved[i] = "read";
    });
    localStorage.setItem("notificationState", JSON.stringify(saved));
  });

  /* ===============================
     FILTER SYSTEM
  =============================== */
  filterLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      filterLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const filter = link.textContent.toLowerCase();

      notifications.forEach(note => {
        if (filter === "all") {
          note.style.display = "flex";
        }
        else if (filter === "unread") {
          note.style.display = note.classList.contains("unread") ? "flex" : "none";
        }
        else if (filter === "rewards") {
          note.style.display = note.classList.contains("reward") ? "flex" : "none";
        }
      });
    });
  });

  /* ===============================
     AUTO UPDATE TITLE COUNT
  =============================== */
  function updateTitle() {
    const unread = document.querySelectorAll(".notification.unread").length;
    if (unread > 0) {
      document.title = `(${unread}) Notifications – Civic Reporter`;
    } else {
      document.title = "Notifications – Civic Reporter";
    }
  }

  updateTitle();

  notifications.forEach(note => {
    note.addEventListener("click", updateTitle);
  });

});
