import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.scss";
import { orangeIcon, purpleIcon, redIcon } from "../../utils/customMarkers";

const Map = ({
  className,
  longitude = 28.9784,
  latitude = 41.0082,
  popupText = "Istanbul, Turkey. A beautiful city.",
  category,
}) => {
  let markerIcon;
  switch (category) {
    case "Culinary tour":
      markerIcon = orangeIcon;
      break;
    case "Guided tour":
      markerIcon = purpleIcon;
      break;
    case "Experience":
      markerIcon = redIcon;
      break;
    default:
      markerIcon = redIcon;
  }

  return (
    <div className={`map ${className}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=ZnLcneIbh8Ixa1isCwwnIY9DnyIm8bsqPzZmMHxfvuiZytP2vhlUbBIW67hhJsTx"
          attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>{popupText}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
