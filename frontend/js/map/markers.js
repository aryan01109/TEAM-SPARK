// js/map/markers.js

export const cluster = L.markerClusterGroup();
export const heatPoints = [];

function icon(color) {
  return L.icon({
    iconUrl: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
}

const icons = {
  high: icon("red"),
  medium: icon("orange"),
  low: icon("green")
};

export function loadIssueMarkers(map, issues, onClick) {
  cluster.clearLayers();
  heatPoints.length = 0;

  issues.forEach(issue => {
    const marker = L.marker([issue.lat, issue.lng], {
      icon: icons[issue.priority]
    });

    marker.on("click", () => onClick(issue));
    cluster.addLayer(marker);

    heatPoints.push([
      issue.lat,
      issue.lng,
      issue.priority === "high" ? 1 : 0.5
    ]);
  });

  map.addLayer(cluster);
}
