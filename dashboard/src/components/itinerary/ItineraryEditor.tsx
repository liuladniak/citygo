import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, MapPin, ChevronUp, ChevronDown } from "lucide-react";
import { useNominatim } from "@/hooks/useNominatim";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ItineraryPoint {
  id?: number;
  order: number;
  name: string;
  latitude: string;
  longitude: string;
}

interface Props {
  itinerary: ItineraryPoint[];
  onChange: (itinerary: ItineraryPoint[]) => void;
}

function MapUpdater({ points }: { points: ItineraryPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => p.latitude && p.longitude);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView(
        [parseFloat(valid[0].latitude), parseFloat(valid[0].longitude)],
        14
      );
    } else {
      const bounds = L.latLngBounds(
        valid.map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points]);
  return null;
}

function createNumberedIcon(number: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: hsl(221, 83%, 53%); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function StopInput({
  point,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  point: ItineraryPoint;
  index: number;
  total: number;
  onChange: (updated: ItineraryPoint) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [query, setQuery] = useState(point.name);
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, isLoading } = useNominatim(showDropdown ? query : "");
  const [showManual, setShowManual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setQuery(point.name);
  }, [point.name]);

  const handleSelect = (result: any) => {
    const name = result.name || result.display_name.split(",")[0];
    setQuery(name);
    setShowDropdown(false);
    onChange({ ...point, name, latitude: result.lat, longitude: result.lon });
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
      <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold shrink-0 mt-1.5">
        {index + 1}
      </div>

      <div className="flex-1 space-y-2" ref={ref}>
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange({ ...point, name: e.target.value });
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search place name..."
            className="pr-8"
          />
          {isLoading && (
            <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {results.map((r) => (
                <button
                  key={r.place_id}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="truncate">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {point.latitude && point.longitude && (
          <p className="text-xs text-muted-foreground px-1">
            📍 {parseFloat(point.latitude).toFixed(5)},{" "}
            {parseFloat(point.longitude).toFixed(5)}
          </p>
        )}
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-muted-foreground underline"
        >
          {showManual ? "Hide manual entry" : "Enter coordinates manually"}
        </button>

        {showManual && (
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Latitude e.g. 40.8741"
              className="h-7 text-xs"
              value={point.latitude}
              onChange={(e) => onChange({ ...point, latitude: e.target.value })}
            />
            <Input
              placeholder="Longitude e.g. 29.1267"
              className="h-7 text-xs"
              value={point.longitude}
              onChange={(e) =>
                onChange({ ...point, longitude: e.target.value })
              }
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={index === 0}
          onClick={onMoveUp}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={index === total - 1}
          onClick={onMoveDown}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function ItineraryEditor({ itinerary, onChange }: Props) {
  const validPoints = itinerary.filter((p) => p.latitude && p.longitude);
  const polylinePositions = validPoints.map(
    (p) => [parseFloat(p.latitude), parseFloat(p.longitude)] as [number, number]
  );

  const addStop = () => {
    onChange([
      ...itinerary,
      { order: itinerary.length + 1, name: "", latitude: "", longitude: "" },
    ]);
  };

  const updateStop = (index: number, updated: ItineraryPoint) => {
    const arr = [...itinerary];
    arr[index] = updated;
    onChange(arr);
  };

  const removeStop = (index: number) => {
    onChange(itinerary.filter((_, i) => i !== index));
  };

  const moveStop = (from: number, to: number) => {
    const arr = [...itinerary];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr.map((p, i) => ({ ...p, order: i + 1 })));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Stops</p>
          <p className="text-xs text-muted-foreground">
            Search for a place — coordinates fill automatically.
          </p>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {itinerary.map((point, i) => (
              <StopInput
                key={`${point.name}-${point.latitude}-${point.longitude}`}
                point={point}
                index={i}
                total={itinerary.length}
                onChange={(updated) => updateStop(i, updated)}
                onRemove={() => removeStop(i)}
                onMoveUp={() => moveStop(i, i - 1)}
                onMoveDown={() => moveStop(i, i + 1)}
              />
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addStop}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Stop
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Route Preview</p>
          <p className="text-xs text-muted-foreground">
            Updates as you add stops.
          </p>
          <div className="h-[400px] rounded-xl overflow-hidden border border-border">
            {validPoints.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                Add stops to see the route
              </div>
            ) : (
              <MapContainer
                center={[
                  parseFloat(validPoints[0].latitude),
                  parseFloat(validPoints[0].longitude),
                ]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater points={itinerary} />

                {validPoints.map((point, i) => {
                  const originalIndex = itinerary.findIndex(
                    (p) =>
                      p.latitude === point.latitude &&
                      p.longitude === point.longitude &&
                      p.name === point.name
                  );
                  return (
                    <Marker
                      key={i}
                      position={[
                        parseFloat(point.latitude),
                        parseFloat(point.longitude),
                      ]}
                      icon={createNumberedIcon(i + 1)}
                      draggable={true}
                      eventHandlers={{
                        dragend: (e) => {
                          const marker = e.target;
                          const pos = marker.getLatLng();
                          const arr = [...itinerary];
                          arr[originalIndex] = {
                            ...arr[originalIndex],
                            latitude: pos.lat.toFixed(6),
                            longitude: pos.lng.toFixed(6),
                          };
                          onChange(arr);
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-medium">{point.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Drag to adjust location
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {polylinePositions.length > 1 && (
                  <Polyline
                    positions={polylinePositions}
                    color="#3b82f6"
                    weight={2}
                    dashArray="6 4"
                  />
                )}
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
