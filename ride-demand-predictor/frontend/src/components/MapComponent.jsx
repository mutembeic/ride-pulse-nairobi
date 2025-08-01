import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as h3 from 'h3-js';

// Fix for default Leaflet marker icon issue with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A component to handle map events and updates
const MapEvents = ({ setMarkerPosition, predictionResult, center }) => {
  const map = useMap();

  useEffect(() => {
    if (predictionResult && predictionResult.is_fallback) {
      // Convert the fallback H3 cell back to lat/lon to center the map
      const [lat, lon] = h3.cellToLatLng(predictionResult.prediction_h3_cell);
      map.flyTo([lat, lon], 15); // Animate to the new location
    } else if (center) {
        map.setView(center, map.getZoom());
    }
  }, [predictionResult, center, map]);

  map.on('click', (e) => {
    setMarkerPosition([e.latlng.lat, e.latlng.lng]);
  });

  return null;
};

const MapComponent = ({ center, markerPosition, setMarkerPosition, predictionResult }) => {
    
  const predictionHexagon = useMemo(() => {
    if (!predictionResult) return null;
    const [lat, lon] = h3.cellToLatLng(predictionResult.prediction_h3_cell);
    const boundary = h3.cellToBoundary(predictionResult.prediction_h3_cell);
    return { center: [lat, lon], boundary };
  }, [predictionResult]);

  return (
    <MapContainer
      center={center || markerPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      {/* Use a modern, dark map theme */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapEvents setMarkerPosition={setMarkerPosition} predictionResult={predictionResult} center={center} />
      
      {markerPosition && !predictionResult && (
        <Marker position={markerPosition}>
          <Popup>Selected Location. Press "Predict" to see demand.</Popup>
        </Marker>
      )}

      {predictionResult && (
        <>
        <Marker position={predictionHexagon.center}>
          <Popup>
            Hotspot Location <br />
            Demand: {predictionResult.predicted_demand_rounded}
          </Popup>
        </Marker>
        <Circle
          center={predictionHexagon.center}
          radius={100} // Radius in meters
          pathOptions={{
              color: 'cyan',
              fillColor: '#0891b2',
              fillOpacity: 0.3
          }}
        />
        </>
      )}
    </MapContainer>
  );
};

export default MapComponent;