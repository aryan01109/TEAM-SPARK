/* =====================================================
   MANAGE ISSUES – CIVICCARE ADMIN
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     MAP (LEAFLET)
     ===================================================== */
  const map = L.map("map").setView([23.0225, 72.5714], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([23.0225, 72.5714])
    .addTo(map)
    .bindPopup(" Issue Location")
    .openPopup();

  /* =====================================================
     IMAGE GALLERY
     ===================================================== */
  const mainImage = document.getElementById("mainImage");
  const thumbs = document.querySelectorAll(".thumb");

  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      thumbs.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.src;
    });
  });

  /* =====================================================
     VOICE NOTE PLAYER
     ===================================================== */
  const audio = document.getElementById("voiceAudio");
  const toggleBtn = document.getElementById("voiceToggle");
  const icon = document.getElementById("voiceIcon");
  const progressBar = document.getElementById("voiceProgress");
  const timeLabel = document.getElementById("voiceTime");

  toggleBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      icon.textContent = "pause";
    } else {
      audio.pause();
      icon.textContent = "play_arrow";
    }
  });

  audio.addEventListener("timeupdate", () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + "%";

    const mins = Math.floor(audio.currentTime / 60);
    const secs = Math.floor(audio.currentTime % 60)
      .toString()
      .padStart(2, "0");

    timeLabel.textContent = `${mins}:${secs}`;
  });

  audio.addEventListener("ended", () => {
    icon.textContent = "play_arrow";
    progressBar.style.width = "0%";
  });

  /* =====================================================
     ACTIVITY LOG
     ===================================================== */
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

  addLog("Issue created and awaiting assignment");

  /* =====================================================
     ADMIN CONTROLS
     ===================================================== */
  const statusSelect = document.getElementById("status");
  const prioritySelect = document.getElementById("priority");
  const crewSelect = document.getElementById("crew");
  const noteInput = document.getElementById("note");

  const addNoteBtn = document.getElementById("addNote");
  const updateIssueBtn = document.getElementById("updateIssue");

  addNoteBtn.addEventListener("click", () => {
    if (!noteInput.value.trim()) {
      alert("Please enter a note");
      return;
    }

    addLog(` Internal Note: ${noteInput.value}`);
    noteInput.value = "";
  });

  updateIssueBtn.addEventListener("click", () => {
    addLog(` Issue updated:
      Status → ${statusSelect.value},
      Priority → ${prioritySelect.value},
      Crew → ${crewSelect.value || "Unassigned"}
    `);

    alert("Issue updated successfully");

    /* 🔗 API READY
    fetch("/api/issues/123", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: statusSelect.value,
        priority: prioritySelect.value,
        crew: crewSelect.value
      })
    });
    */
  });

  /* =====================================================
     EXPORT PDF
     ===================================================== */
  const exportPDFBtn = document.getElementById("exportPDF");

  exportPDFBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("CivicCare Issue Report", 20, 20);

    pdf.setFontSize(12);
    pdf.text("Issue: Pothole on Main St.", 20, 35);
    pdf.text("Status: " + statusSelect.value, 20, 45);
    pdf.text("Priority: " + prioritySelect.value, 20, 55);
    pdf.text("Assigned Crew: " + (crewSelect.value || "None"), 20, 65);

    pdf.text("Description:", 20, 80);
    pdf.text(
      "The sidewalk is cracked and dangerous for wheelchairs.",
      20,
      90
    );

    pdf.save("issue-report.pdf");
  });

  console.log("Manage Issues JS Loaded Successfully");
});
