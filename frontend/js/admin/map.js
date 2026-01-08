// js/admin/map.js

import { initMap } from "../map/map-core.js";
import { loadIssueMarkers, heatPoints } from "../map/markers.js";
import { initLiveGPS } from "../map/gps-live.js";

let mode = "map";

const issues = [
  { id:"CIV-1", title:"Flooded road", priority:"high", lat:23.03, lng:72.54 },
  { id:"CIV-2", title:"Garbage", priority:"medium", lat:23.04, lng:72.55 },
  { id:"CIV-3", title:"Streetlight", priority:"low", lat:23.01, lng:72.56 }
];

const map = initMap();

loadIssueMarkers(map, issues, showDetails);
initLiveGPS(map, () => mode);

function showDetails(issue) {
  document.getElementById("panelContent").innerHTML = `
    <strong>${issue.title}</strong><br>
    Priority: ${issue.priority}
  `;
}

document.getElementById("modeSelect").onchange = e => {
  mode = e.target.value;
};
