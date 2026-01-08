// js/map/map-core.js

export let map;

export function initMap() {
  map = L.map("map").setView([23.03, 72.54], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  return map;
}
