import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import coreHotspots from "../core_hotspots.json";

// Color scale based on ride count
const getColor = (count) => {
  if (count >= 2000) return "#ef4444"; // red
  if (count >= 1000) return "#f59e0b"; // orange
  if (count >= 500) return "#10b981";  // green
  return "#3b82f6"; // blue
};

const AnalyticsMap = () => {
  return (
    <div className="analytics-map-container">
      <MapContainer
        center={[-1.286389, 36.817223]} // Nairobi CBD
        zoom={12.5}
        style={{ height: "80vh", width: "100%", borderRadius: "10px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {coreHotspots.map((spot, idx) => {
          const position = [spot.latitude, spot.longitude];
          const color = getColor(spot.ride_count);

          return (
            <CircleMarker
              key={idx}
              center={position}
              radius={15}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.5,
              }}
            >
              <Popup>
                <strong>{spot.name}</strong>
                <br />
                Rides: {spot.ride_count}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default AnalyticsMap;
