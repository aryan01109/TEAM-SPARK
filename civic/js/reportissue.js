const API_BASE = "http://localhost:5000";
const GOOGLE_KEY = "AIzaSyA8FykxntkFfQJ521HlzkTExDXdLnitiiU";

/* ---------------- GLOBALS ---------------- */
let selectedFile = null;
let coords = { lat: null, lng: null };
let map = null;
let marker = null;
let leafletMap = null;
let leafletMarker = null;
let geocoder = null;

/* ---------------- TOAST ---------------- */
function toast(msg, type = "info") {
  const box = document.createElement("div");
  box.className = `toast ${type}`;
  box.innerText = msg;
  document.getElementById("toastContainer").appendChild(box);
  setTimeout(() => box.remove(), 3000);
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

/* ---------------- MAP ---------------- */
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
      setPos({ lat: e.latLng.lat(), lng: e.latLng.lng() }, true);
    });

    toast("Google Maps loaded", "success");
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

/* ---------------- GPS ---------------- */
document.getElementById("btnUseLocation").onclick = () => {
  if (!navigator.geolocation)
    return toast("GPS not supported", "error");

  navigator.geolocation.getCurrentPosition(
    p => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }, true),
    () => toast("Location permission denied", "error"),
    { enableHighAccuracy: true }
  );
};

/* ---------------- SUBMIT ---------------- */
const form = document.getElementById("reportForm");
const loading = document.getElementById("loading");
const submitBtn = document.getElementById("submitBtn");

form.onsubmit = async e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const locationText = document.getElementById("locationText").value.trim();
  const description = document.getElementById("description").value.trim();

  if (title.length < 10) return toast("Title must be at least 10 characters", "error");
  if (!category) return toast("Select category", "error");
  if (!locationText && !coords.lat) return toast("Select location", "error");

  loading.hidden = false;
  submitBtn.disabled = true;

  const fd = new FormData();
  fd.append("title", title);
  fd.append("department", category);
  fd.append("location", locationText);
  fd.append("description", description);
  fd.append("latitude", coords.lat || "");
  fd.append("longitude", coords.lng || "");
  if (selectedFile) fd.append("image", selectedFile);

  try {
    const res = await fetch(`${API_BASE}/api/issues`, {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Submit failed");

    toast("Issue submitted successfully", "success");
    setTimeout(() => window.location.href = "./UserDashboard.html", 1200);
  } catch (err) {
    toast(err.message, "error");
  }

  loading.hidden = true;
  submitBtn.disabled = false;
};

/* ---------------- INIT ---------------- */
loadGoogleMap();
