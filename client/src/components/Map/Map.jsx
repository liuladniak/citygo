import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.scss";
import { orangeIcon, purpleIcon, redIcon } from "../../utils/customMarkers";
import { useEffect } from "react";

const AdjustMapBounds = ({ itinerary }) => {
  const map = useMap();

  useEffect(() => {
    if (itinerary.length > 0) {
      const bounds = itinerary.map((stop) => [
        parseFloat(stop.latitude),
        parseFloat(stop.longitude),
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [itinerary, map]);

  return null;
};

const Map = ({
  className,
  longitude,
  latitude,
  popupText = "Istanbul, Turkey. A beautiful city.",
  category,
  tours = [],
  itinerary = [],
  landmarks = [],
}) => {
  // useEffect(() => {
  //   return () => {
  //     const mapContainer = document.getElementById("map");
  //     if (mapContainer && mapContainer._leaflet_id) {
  //       mapContainer._leaflet_id = null;
  //     }
  //   };
  // }, []);

  useEffect(() => {
    return () => {
      const mapContainer = document.getElementById("map");
      if (mapContainer && mapContainer._leaflet_id) {
        delete mapContainer._leaflet_id; // Ensures no reused ID issues
      }
    };
  }, []);

  const getMarkerIcon = (category) => {
    switch (category) {
      case "Culinary tour":
        return orangeIcon;
      case "Guided tour":
        return purpleIcon;
      case "Experience":
        return redIcon;
      case "Historical":
        return orangeIcon;
      case "Modern":
        return purpleIcon;
      case "Shopping":
        return purpleIcon;
      case "Office":
        return redIcon;

      default:
        return redIcon;
    }
  };
  const mapKey = `${latitude}-${longitude}-${itinerary.length}-${tours.length}-${landmarks.length}`;

  return (
    <div className="map-wrp">
      <div className={`map ${className}`}>
        {latitude && longitude && (
          <MapContainer
            key={mapKey}
            id="map"
            center={[latitude || 41.0082, longitude || 28.9784]}
            zoom={13}
            style={{ height: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=ZnLcneIbh8Ixa1isCwwnIY9DnyIm8bsqPzZmMHxfvuiZytP2vhlUbBIW67hhJsTx"
              attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {itinerary.length > 1 && <AdjustMapBounds itinerary={itinerary} />}

            {latitude && longitude && (
              <Marker
                position={[latitude, longitude]}
                icon={getMarkerIcon(category)}
              >
                <Popup>{popupText}</Popup>
              </Marker>
            )}

            {tours.length > 0 &&
              tours.map((tour) => (
                <Marker
                  key={tour.id}
                  position={[
                    parseFloat(tour.latitude),
                    parseFloat(tour.longitude),
                  ]}
                  icon={getMarkerIcon(tour.category)}
                >
                  <Popup>{tour.tour_name}</Popup>
                </Marker>
              ))}

            {itinerary.length > 1 && (
              <>
                <Polyline
                  positions={itinerary
                    .slice(0, -1)
                    .map((stop) => [
                      parseFloat(stop.latitude),
                      parseFloat(stop.longitude),
                    ])}
                  pathOptions={{ color: "blue", weight: 4 }}
                />

                {itinerary.map((stop, index) => (
                  <Marker
                    key={stop.id}
                    position={[stop.latitude, stop.longitude]}
                    icon={redIcon}
                  >
                    <Popup>{stop.name}</Popup>
                  </Marker>
                ))}
              </>
            )}

            {landmarks.map((landmark) => (
              <Marker
                key={landmark.id}
                position={[landmark.latitude, landmark.longitude]}
                icon={getMarkerIcon(landmark.category)}
                eventHandlers={{
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  },
                }}
              >
                <Popup>
                  <strong>{landmark.name}</strong>
                  <p>{landmark.description}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default Map;
