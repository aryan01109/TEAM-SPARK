/* =====================================================
   INVITE NEW STAFF MEMBER – SMART CITY ADMIN (FINAL)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     AUTH CHECK
     =============================== */
  const TOKEN = localStorage.getItem("token");
  if (!TOKEN) {
    alert("Unauthorized. Please login again.");
    window.location.href = "/civic/html/auth/adminLogin.html";
    return;
  }

  /* ===============================
     ELEMENTS
     =============================== */
  const steps = document.querySelectorAll(".step");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  const nameInput = document.getElementById("nameInput");
  const empIdInput = document.getElementById("empIdInput");
  const emailInput = document.getElementById("emailInput");
  const emailError = document.getElementById("emailError");
  const photoInput = document.getElementById("photoInput");
  const departmentSelect = document.getElementById("departmentSelect");

  const previewName = document.getElementById("previewName");
  const previewEmpId = document.getElementById("previewEmpId");
  const photoPreview = document.getElementById("photoPreview");
  const qrContainer = document.getElementById("qrCode");

  const downloadPNG = document.getElementById("downloadPNG");
  const downloadPDF = document.getElementById("downloadPDF");
  const printBadge = document.getElementById("printBadge");

  const toastContainer = document.getElementById("toastContainer");

  let currentStep = 0;

  /* ===============================
     INIT
     =============================== */
  generateEmployeeId();
  updateStep();

  /* ===============================
     FUNCTIONS
     =============================== */
  function updateStep() {
    steps.forEach((step, i) => {
      step.style.display = i === currentStep ? "block" : "none";
    });
    backBtn.style.display = currentStep === 0 ? "none" : "inline-block";
    nextBtn.textContent =
      currentStep === steps.length - 1 ? "Finish" : "Next";
  }

  function generateEmployeeId() {
    const id = "EMP-" + Date.now().toString().slice(-6);
    empIdInput.value = id;
    previewEmpId.textContent = id;
  }

  function generateEmail(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ".") + "@smartcity.gov";
  }

  function showToast(msg, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function generateQR(data) {
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: data,
      width: 120,
      height: 120
    });
  }

  /* ===============================
     NEXT / BACK
     =============================== */
  nextBtn.addEventListener("click", async () => {

    /* STEP 1 VALIDATION */
    if (currentStep === 0) {
      if (!nameInput.value.trim()) {
        showToast("Name is required", "error");
        return;
      }

      emailInput.value = generateEmail(nameInput.value);
      previewName.textContent = nameInput.value;
      generateQR(empIdInput.value);
    }

    /* FINAL STEP → SEND TO BACKEND */
    if (currentStep === steps.length - 1) {
      try {
        const res = await fetch(
          "http://localhost:5000/api/admin/staff/invite",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
              name: nameInput.value.trim(),
              empId: empIdInput.value,
              email: emailInput.value.trim(),
              department: departmentSelect.value,
              photo: photoPreview.src || ""
            })
          }
        );

        const data = await res.json();

        if (!res.ok) {
          showToast(data.message || "Failed to invite staff", "error");
          return;
        }

        showToast("✅ Staff invited successfully");
        setTimeout(() => {
          window.location.href = "/civic/html/admin/staf&userpage.html";
        }, 1200);

      } catch (err) {
        console.error(err);
        showToast("Server error", "error");
      }

      return;
    }

    currentStep++;
    updateStep();
  });

  backBtn.addEventListener("click", () => {
    currentStep--;
    updateStep();
  });

  /* ===============================
     PHOTO PREVIEW
     =============================== */
  photoInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      photoPreview.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  /* ===============================
     EMAIL VALIDATION
     =============================== */
  emailInput.addEventListener("input", () => {
    const valid = emailInput.value.endsWith("@smartcity.gov");
    emailError.textContent = valid ? "" : "Invalid work email";
  });

  /* ===============================
     DOWNLOAD PNG
     =============================== */
  downloadPNG.addEventListener("click", () => {
    const img = qrContainer.querySelector("img");
    if (!img) return;

    const link = document.createElement("a");
    link.href = img.src;
    link.download = `${empIdInput.value}.png`;
    link.click();
  });

  /* ===============================
     DOWNLOAD PDF
     =============================== */
  downloadPDF.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.text("Smart City Staff Badge", 20, 20);
    pdf.text(`Name: ${previewName.textContent}`, 20, 30);
    pdf.text(`ID: ${previewEmpId.textContent}`, 20, 40);

    const qrImg = qrContainer.querySelector("img");
    if (qrImg) {
      pdf.addImage(qrImg.src, "PNG", 20, 50, 50, 50);
    }

    pdf.save(`${empIdInput.value}.pdf`);
  });

  /* ===============================
     PRINT BADGE
     =============================== */
  printBadge.addEventListener("click", () => {
    const w = window.open("", "", "width=400,height=600");
    w.document.write(`
      <h3>Smart City Staff Badge</h3>
      <p>${previewName.textContent}</p>
      <p>${previewEmpId.textContent}</p>
      ${qrContainer.innerHTML}
    `);
    w.document.close();
    w.print();
  });

  console.log("✅ Invite Staff Frontend Loaded Successfully");
});
