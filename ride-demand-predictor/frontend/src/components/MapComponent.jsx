import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { L, divIcon, Icon } from 'leaflet';
import '../App.css';
import * as h3 from 'h3-js';
import MarkerClusterGroup from 'react-leaflet-cluster';
import markerIcon from '../assets/marker-icon.png'
import customPinIcon from '../assets/pin-icon.png';
import predictionDoneIcon from '../assets/predicted.png';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const selectedLocationIcon = new Icon({
  iconUrl: customPinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const finalPredictionIcon = new Icon({
  iconUrl: predictionDoneIcon,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

const getDemandColor = (demand) => {
  if (demand >= 5) return '#ff0000';
  if (demand >= 3) return '#ff8c00';
  if (demand >= 2) return '#ffd700';
  return '#00ff00';
};

const HeatmapLayer = ({ data, onHotspotClick, predictionResult }) => {
  const clusterGroupRef = useRef(null);

  if (predictionResult) {
    return null;
  }

  const customIcon = new Icon({
    iconUrl: markerIcon,
    iconSize: [38, 38]
  });

  const createClusterIconFunc = (cluster) => {
    const childMarkers = cluster.getAllChildMarkers();
    let totalDemand = 0;
    let demandsFound = [];

    childMarkers.forEach(marker => {
      const demandValue = marker.options && typeof marker.options.demand === 'number' ? marker.options.demand : 0;
      totalDemand += demandValue;
      demandsFound.push(demandValue);
    });

    let baseColor = '#3aff00';
    if (childMarkers.length >= 50) baseColor = '#ff4d4d';
    else if (childMarkers.length >= 25) baseColor = '#ffa500';
    else if (childMarkers.length >= 10) baseColor = '#ffe600';


    return divIcon({
      html: `
        <div class="glass-cluster" style="background: radial-gradient(circle, ${baseColor} 40%, transparent 90%);">
          <div class="glass-overlay">
            <span>${childMarkers.length}</span> </div>
        </div>`,
      className: '',
      iconSize: [40, 40],
    });
  };

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterIconFunc}
      ref={clusterGroupRef}
    >
      {data.map((point, i) => {
        const color = getDemandColor(point.demand);
        const [lat, lng] = h3.cellToLatLng(point.h3_cell);

        return (
          <React.Fragment key={i}>
            <Marker
              key={i}
              position={[lat, lng]}
              icon={customIcon}
              options={{ demand: point.demand }}
              eventHandlers={{
                click: (e) => {
                  const marker = e.target;
                  if (clusterGroupRef.current) {
                    const cluster = clusterGroupRef.current.leafletElement.getVisibleParent(marker);
                    if (cluster && cluster.__parent) {
                      clusterGroupRef.current.leafletElement.zoomToShowLayer(marker, () => {
                        setTimeout(() => {
                          onHotspotClick(point);
                        }, 300);
                      });
                      return;
                    }
                  }
                  onHotspotClick(point);
                },
              }}
            >
              <Popup>
                <div className="popup-card">
                  <strong>Hotspot</strong><br />
                  <span>Demand: </span>
                  <span className="demand" style={{ color }}>{Math.round(point.demand.toFixed(2))}</span><br />
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </MarkerClusterGroup>
  );
};


const MapEvents = ({ predictionResult, center, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (predictionResult && predictionResult.is_fallback) {
      const [lat, lon] = h3.cellToLatLng(predictionResult.prediction_h3_cell);
      map.flyTo([lat, lon], 16);
    } else if (center) {
      map.setView(center, map.getZoom());
    }
  }, [predictionResult, center, map]);

  useEffect(() => {
    const handleClick = (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

const tileLayers = [
  {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | © <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }
];

const MapComponent = ({ center, markerPosition, setMarkerPosition, predictionResult, heatmapData, onHotspotClick, onMapClickPredict, onMapClick }) => {
  const [currentTileLayerIndex, setCurrentTileLayerIndex] = useState(0);
  const buttonContainerRef = useRef(null); 

  const handleTileLayerChange = (e) => {
    e.stopPropagation(); 
    setCurrentTileLayerIndex((prevIndex) =>
      (prevIndex + 1) % tileLayers.length
    );
  };

  useEffect(() => {
    if (buttonContainerRef.current) {
      L.DomEvent.disableClickPropagation(buttonContainerRef.current);
    }
  }, []);

  const currentTileLayer = tileLayers[currentTileLayerIndex];

  const predictionHexagon = useMemo(() => {
    if (!predictionResult) return null;
    const [lat, lon] = h3.cellToLatLng(predictionResult.prediction_h3_cell);
    const boundary = h3.cellToBoundary(predictionResult.prediction_h3_cell);
    return { center: [lat, lon], boundary };
  }, [predictionResult]);

  return (
    <MapContainer
      center={center || markerPosition}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution={currentTileLayer.attribution}
        url={currentTileLayer.url}
      />

      <div ref={buttonContainerRef} className="absolute bottom-4 right-4 z-[1000]">
        <button
          onClick={handleTileLayerChange}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
          title={`Switch to ${tileLayers[(currentTileLayerIndex + 1) % tileLayers.length].name} Map`}
        >
          {`Change Map to ${tileLayers[(currentTileLayerIndex + 1) % tileLayers.length].name}`}
        </button>
      </div>

      <MapEvents
        predictionResult={predictionResult}
        center={center}
        onMapClick={onMapClick}
      />

      {heatmapData?.length > 0 && (
        <HeatmapLayer
          data={heatmapData}
          onHotspotClick={onHotspotClick}
          predictionResult={predictionResult}
        />
      )}

      {markerPosition && !predictionResult && (
        <Marker position={markerPosition} icon={selectedLocationIcon}>
          <Popup className="popup-style">
            <div className="popup-card">
              <strong>Predict for this point?</strong><br />
              <button
                onClick={() => onMapClickPredict(markerPosition[0], markerPosition[1])}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1 px-2 rounded-md text-xs mt-2"
              >
                Predict Here
              </button>
            </div>
          </Popup>
        </Marker>
      )}

      {predictionResult && (
        <>
          <Marker position={predictionHexagon.center} icon={finalPredictionIcon}>
            <Popup className="popup-style">
              <strong>Hotspot Location</strong><br />
              Demand: <span>{predictionResult.predicted_demand_rounded}</span>
            </Popup>
          </Marker>

          <Circle
            center={predictionHexagon.center}
            radius={100}
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