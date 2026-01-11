/* ================= CONFIG ================= */
const API_BASE = "http://localhost:5000";
const GOOGLE_KEY = "AIzaSyA8FykxntkFfQJ521HlzkTExDXdLnitiiU";

<<<<<<< HEAD:civic/js/user/reportissue.js
/* ================= STATE ================= */
=======
/* ---------------- GLOBALS ---------------- */
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
let selectedFile = null;
let coords = { lat: null, lng: null };

let map = null;
let marker = null;
let geocoder = null;

let leafletMap = null;
let leafletMarker = null;
let geocoder = null;

<<<<<<< HEAD:civic/js/user/reportissue.js
/* ================= TOAST ================= */
=======
/* ---------------- TOAST ---------------- */
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
function toast(msg, type = "info") {
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.innerText = msg;
  document.getElementById("toastContainer").appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

<<<<<<< HEAD:civic/js/user/reportissue.js
/* ================= VALIDATION ================= */
function setError(input, msg = "") {
  input.parentElement.querySelector(".field-error").innerText = msg;
}

/* ================= FILE UPLOAD ================= */
=======
/* ---------------- FILE UPLOAD ---------------- */
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
const photoInput = document.getElementById("photoInput");
const uploadBox = document.getElementById("uploadBox");
const previewArea = document.getElementById("previewArea");

uploadBox.onclick = () => photoInput.click();

photoInput.onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 10 * 1024 * 1024)
    return toast("Max 10MB allowed", "error");

  selectedFile = f;
  previewArea.innerHTML = `<img class="preview-img" src="${URL.createObjectURL(f)}">`;
};

<<<<<<< HEAD:civic/js/user/reportissue.js
uploadBox.ondragover = e => {
  e.preventDefault();
  uploadBox.classList.add("drag");
};
uploadBox.ondragleave = () => uploadBox.classList.remove("drag");
uploadBox.ondrop = e => {
  e.preventDefault();
  uploadBox.classList.remove("drag");
  photoInput.files = e.dataTransfer.files;
  photoInput.onchange({ target: photoInput });
};

/* ================= CAMERA ================= */
const btnCamera = document.getElementById("btnCamera");
const cameraView = document.getElementById("cameraView");
const btnCapture = document.getElementById("btnCapture");
const canvas = document.getElementById("photoCanvas");

btnCamera.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraView.srcObject = stream;
    cameraView.hidden = false;
    btnCapture.hidden = false;
  } catch {
    toast("Camera unavailable", "error");
  }
};

btnCapture.onclick = () => {
  const ctx = canvas.getContext("2d");
  canvas.width = cameraView.videoWidth;
  canvas.height = cameraView.videoHeight;
  ctx.drawImage(cameraView, 0, 0);

  canvas.toBlob(blob => {
    selectedFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
    previewArea.innerHTML = `<img class="preview-img" src="${URL.createObjectURL(blob)}">`;
  });

  cameraView.srcObject.getTracks().forEach(t => t.stop());
  cameraView.hidden = true;
  btnCapture.hidden = true;
};

/* ================= MAP ================= */
=======
/* ---------------- MAP ---------------- */
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
async function loadGoogleMap() {
  try {
    const loader = new google.maps.plugins.loader.Loader({
      apiKey: GOOGLE_KEY,
      version: "weekly"
    });

    await loader.load();

    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 23.0225, lng: 72.5714 },
      zoom: 14
    });

    map.addListener("click", e => {
<<<<<<< HEAD:civic/js/user/reportissue.js
      setPos(
        { lat: e.latLng.lat(), lng: e.latLng.lng() },
        true
      );
=======
      setPos({ lat: e.latLng.lat(), lng: e.latLng.lng() }, true);
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
    });

    toast("Map loaded", "success");
  } catch {
    loadLeaflet();
  }
}

function loadLeaflet() {
  leafletMap = L.map("map").setView([23.0225, 72.5714], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(leafletMap);

  leafletMap.on("click", e =>
    setPos({ lat: e.latlng.lat, lng: e.latlng.lng }, false)
  );

  toast("Using fallback map", "info");
}

function setPos(pos, updateText) {
  coords = pos;

  if (map) {
    if (!marker) marker = new google.maps.Marker({ map });
    marker.setPosition(pos);
    map.panTo(pos);
  }

  if (leafletMap) {
    if (!leafletMarker) leafletMarker = L.marker(pos).addTo(leafletMap);
    else leafletMarker.setLatLng(pos);
    leafletMap.panTo(pos);
  }

  if (updateText && geocoder) {
    geocoder.geocode({ location: pos }, (res, status) => {
      if (status === "OK" && res[0]) {
        document.getElementById("locationText").value =
          res[0].formatted_address;
      }
    });
  }
}

/* ================= GPS ================= */
document.getElementById("btnUseLocation").onclick = () => {
  if (!navigator.geolocation)
    return toast("GPS not supported", "error");

  navigator.geolocation.getCurrentPosition(
<<<<<<< HEAD:civic/js/user/reportissue.js
    p =>
      setPos(
        { lat: p.coords.latitude, lng: p.coords.longitude },
        true
      ),
=======
    p => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }, true),
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
    () => toast("Location permission denied", "error"),
    { enableHighAccuracy: true }
  );
};

/* ================= SUBMIT ================= */
const form = document.getElementById("reportForm");
const loading = document.getElementById("loading");
const submitBtn = document.getElementById("submitBtn");

form.onsubmit = async e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const locationText = document.getElementById("locationText").value.trim();
  const description = document.getElementById("description").value.trim();

<<<<<<< HEAD:civic/js/user/reportissue.js
  let ok = true;

  if (title.value.trim().length < 10) {
    setError(title, "Min 10 characters");
    ok = false;
  } else setError(title);

  if (!category.value) {
    setError(category, "Required");
    ok = false;
  } else setError(category);

  if (!locationText.value.trim() && !coords.lat) {
    setError(locationText, "Select a location");
    ok = false;
  } else setError(locationText);

  if (!ok) return toast("Fix errors first", "error");
=======
  if (title.length < 10) return toast("Title must be at least 10 characters", "error");
  if (!category) return toast("Select category", "error");
  if (!locationText && !coords.lat) return toast("Select location", "error");
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js

  loading.hidden = false;
  submitBtn.disabled = true;

  const fd = new FormData();
<<<<<<< HEAD:civic/js/user/reportissue.js
  fd.append("title", title.value.trim());
  fd.append("category", category.value);
  fd.append("description", document.getElementById("description").value.trim());
  fd.append("location_text", locationText.value.trim());
  fd.append("lat", coords.lat || "");
  fd.append("lng", coords.lng || "");
  if (selectedFile) fd.append("photo", selectedFile);
=======
  fd.append("title", title);
  fd.append("department", category);
  fd.append("location", locationText);
  fd.append("description", description);
  fd.append("latitude", coords.lat || "");
  fd.append("longitude", coords.lng || "");
  if (selectedFile) fd.append("image", selectedFile);
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js

  try {
    const res = await fetch(`${API_BASE}/api/issues`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Submit failed");

<<<<<<< HEAD:civic/js/user/reportissue.js
    toast("Report submitted", "success");
    setTimeout(() => (location.href = "/dashboard"), 1200);
  } catch {
    toast("Submit failed", "error");
=======
    toast("Issue submitted successfully", "success");
    setTimeout(() => window.location.href = "./UserDashboard.html", 1200);
  } catch (err) {
    toast(err.message, "error");
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
  }

  loading.hidden = true;
  submitBtn.disabled = false;
};

<<<<<<< HEAD:civic/js/user/reportissue.js
/* ================= INIT ================= */
=======
/* ---------------- INIT ---------------- */
>>>>>>> 271e3ce3046b517a282dfd0425746b0874f3fe45:civic/js/reportissue.js
loadGoogleMap();



