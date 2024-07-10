import L from "leaflet";
import orangeMarker from "../assets/icons/marker-orange-96.png";
import purpleMarker from "../assets/icons/marker-purple-96.png";
import redMarker from "../assets/icons/marker-red-96.png";

const markerSize = [32, 41];
const markerAnchor = [12, 41];
const popupAnchor = [1, -34];
const shadowSize = [41, 41];

const orangeIcon = new L.Icon({
  iconUrl: orangeMarker,
  iconSize: markerSize,
  iconAnchor: markerAnchor,
  popupAnchor: popupAnchor,
  shadowSize: shadowSize,
});

const purpleIcon = new L.Icon({
  iconUrl: purpleMarker,
  iconSize: markerSize,
  iconAnchor: markerAnchor,
  popupAnchor: popupAnchor,
  shadowSize: shadowSize,
});

const redIcon = new L.Icon({
  iconUrl: redMarker,
  iconSize: markerSize,
  iconAnchor: markerAnchor,
  popupAnchor: popupAnchor,
  shadowSize: shadowSize,
});

export { orangeIcon, purpleIcon, redIcon };
