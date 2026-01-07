const API_BASE = "http://localhost:5000";
const GOOGLE_KEY = "YOUR_GOOGLE_KEY";

let selectedFile = null;
let coords = { lat: null, lng: null };
let map = null;
let marker = null;
let leafletMap = null;
let leafletMarker = null;

/* ---------------- TOASTS ---------------- */
function toast(msg, type = "info") {
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.innerText = msg;

  document.getElementById("toastContainer").appendChild(box);

  setTimeout(() => box.remove(), 3000);
}

/* ---------------- VALIDATION ---------------- */
function setError(input, msg) {
  input.parentElement.querySelector(".field-error").innerText = msg || "";
}

/* ---------------- FILE UPLOAD ---------------- */
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

/* Drag drop */
uploadBox.ondragover = e => { e.preventDefault(); uploadBox.classList.add("drag"); }
uploadBox.ondragleave = () => uploadBox.classList.remove("drag");
uploadBox.ondrop = e => {
  e.preventDefault();
  uploadBox.classList.remove("drag");
  photoInput.files = e.dataTransfer.files;
  photoInput.onchange({ target: photoInput });
};

/* ---------------- CAMERA ---------------- */
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
    toast("Camera blocked or unavailable", "error");
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

/* ---------------- MAP ---------------- */
async function loadGoogleMap() {
  try {
    const loader = new google.maps.plugins.loader.Loader({
      apiKey: GOOGLE_KEY,
      version: "weekly"
    });

    await loader.load();

    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 23.0225, lng: 72.5714 },
      zoom: 14
    });

    map.addListener("click", e => setPos({
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }));

    toast("Google Maps loaded", "success");
  } catch {
    loadLeaflet();
  }
}

function loadLeaflet() {
  leafletMap = L.map("map").setView([23.0225, 72.5714], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(leafletMap);

  leafletMap.on("click", e => setPos({
    lat: e.latlng.lat,
    lng: e.latlng.lng
  }));

  toast("Using fallback map", "info");
}

function setPos(pos) {
  coords = pos;

  if (map) {
    if (!marker) marker = new google.maps.Marker({ map });
    marker.setPosition(pos);
  }

  if (leafletMap) {
    if (!leafletMarker) leafletMarker = L.marker(pos).addTo(leafletMap);
    else leafletMarker.setLatLng(pos);
  }
}

/* ---------------- GPS ---------------- */
document.getElementById("btnUseLocation").onclick = () => {
  navigator.geolocation.getCurrentPosition(
    p => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
    () => toast("Location blocked", "error")
  );
};

/* ---------------- SUBMIT ---------------- */
const form = document.getElementById("reportForm");
const loading = document.getElementById("loading");
const submitBtn = document.getElementById("submitBtn");

form.onsubmit = async e => {
  e.preventDefault();

  const title = document.getElementById("title");
  const category = document.getElementById("category");
  const locationText = document.getElementById("locationText");

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
    setError(locationText, "Select a location or type one");
    ok = false;
  } else setError(locationText);

  if (!ok) return toast("Fix errors first", "error");

  loading.hidden = false;
  submitBtn.disabled = true;

  const fd = new FormData();
  fd.append("title", title.value.trim());
  fd.append("category", category.value);
  fd.append("description", document.getElementById("description").value.trim());
  fd.append("location_text", locationText.value.trim());
  fd.append("lat", coords.lat || "");
  fd.append("lng", coords.lng || "");

  if (selectedFile) fd.append("photo", selectedFile);

  try {
    const res = await fetch(`${API_BASE}/reports`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`
      },
      body: fd
    });

    if (!res.ok) throw new Error();

    toast("Report submitted!", "success");
    setTimeout(() => location.href = "/dashboard", 1200);

  } catch {
    toast("Submit failed", "error");
  }

  loading.hidden = true;
  submitBtn.disabled = false;
};



/* ---------------- INIT ---------------- */
loadGoogleMap();
