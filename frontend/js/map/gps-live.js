// js/map/gps-live.js

const channel = new BroadcastChannel("responder-gps");
const responderMarkers = {};

const responderIcon = L.icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

export function initLiveGPS(map, modeGetter) {
  channel.onmessage = (e) => {
    if (!["supervisor", "disaster"].includes(modeGetter())) return;

    e.data.forEach(r => {
      if (!responderMarkers[r.id]) {
        responderMarkers[r.id] = L.marker([r.lat, r.lng], {
          icon: responderIcon
        }).addTo(map);
      } else {
        responderMarkers[r.id].setLatLng([r.lat, r.lng]);
      }
    });
  };
}
