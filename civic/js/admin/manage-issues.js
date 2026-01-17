/* =====================================================
   MANAGE ISSUES – CIVICCARE ADMIN (FIXED)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     ISSUE ID FROM URL
     =============================== */
  const issueId = new URLSearchParams(window.location.search).get("id");
  const token = localStorage.getItem("token");

  if (!issueId) {
    alert("Invalid Issue ID");
    return;
  }

  /* ===============================
     MAP (LEAFLET)
     =============================== */
  const map = L.map("map").setView([23.0225, 72.5714], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([23.0225, 72.5714])
    .addTo(map)
    .bindPopup("📍 Issue Location");

  /* ===============================
     IMAGE GALLERY
     =============================== */
  const mainImage = document.getElementById("mainImage");
  const thumbs = document.querySelectorAll(".thumb");

  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      thumbs.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.src;
    });
  });

  /* ===============================
     VOICE NOTE PLAYER
     =============================== */
  const audio = document.getElementById("voiceAudio");
  const toggleBtn = document.getElementById("voiceToggle");
  const icon = document.getElementById("voiceIcon");
  const progressBar = document.getElementById("voiceProgress");
  const timeLabel = document.getElementById("voiceTime");

  toggleBtn.addEventListener("click", () => {
    audio.paused ? audio.play() : audio.pause();
    icon.textContent = audio.paused ? "play_arrow" : "pause";
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progressBar.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    const mins = Math.floor(audio.currentTime / 60);
    const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
    timeLabel.textContent = `${mins}:${secs}`;
  });

  audio.addEventListener("ended", () => {
    icon.textContent = "play_arrow";
    progressBar.style.width = "0%";
  });

  /* ===============================
     ACTIVITY LOG
     =============================== */
  const activityLog = document.getElementById("activityLog");

  function addLog(message) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `
      <strong>${new Date().toLocaleString()}</strong>
      <p>${message}</p>
    `;
    activityLog.prepend(entry);
  }

  addLog("Issue loaded in admin panel");

  /* ===============================
     ADMIN CONTROLS
     =============================== */
  const statusSelect = document.getElementById("status");
  const prioritySelect = document.getElementById("priority");
  const crewSelect = document.getElementById("crew");
  const noteInput = document.getElementById("note");

  const addNoteBtn = document.getElementById("addNote");
  const updateIssueBtn = document.getElementById("updateIssue");

  /* ---------- ADD NOTE ---------- */
  addNoteBtn.addEventListener("click", async () => {
    const note = noteInput.value.trim();
    if (!note) return alert("Please enter a note");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/issues/${issueId}/note`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ note })
        }
      );

      if (!res.ok) throw new Error("Failed to add note");

      addLog(`📝 Internal Note: ${note}`);
      noteInput.value = "";

    } catch (err) {
      alert("Error adding note");
    }
  });

  /* ---------- UPDATE ISSUE ---------- */
  updateIssueBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/issues/${issueId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: statusSelect.value,
            priority: prioritySelect.value,
            crew: crewSelect.value
          })
        }
      );

      if (!res.ok) throw new Error("Update failed");

      addLog(`✅ Issue updated → Status: ${statusSelect.value}, Priority: ${prioritySelect.value}, Crew: ${crewSelect.value || "Unassigned"}`);
      alert("Issue updated successfully");

    } catch (err) {
      alert("Failed to update issue");
    }
  });

  /* ===============================
     EXPORT PDF
     =============================== */
  document.getElementById("exportPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("CivicCare Issue Report", 20, 20);

    pdf.setFontSize(12);
    pdf.text("Status: " + statusSelect.value, 20, 40);
    pdf.text("Priority: " + prioritySelect.value, 20, 50);
    pdf.text("Assigned Crew: " + (crewSelect.value || "None"), 20, 60);

    pdf.save("issue-report.pdf");
  });

  console.log("✅ Manage Issues JS Loaded & Connected");
});
