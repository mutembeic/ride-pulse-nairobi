import { useState, useEffect } from 'react';
import * as h3 from 'h3-js';
import { getDistance } from 'geolib';
import { getDemandPrediction, getCoordsFromLocationName, getLocationNameFromCoords, getHeatmapData } from './services/apiService';
import MapComponent from './components/MapComponent';
import PredictionControls from './components/PredictionControls';
import PredictionResult from './components/PredictionResult';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]); // Default: Nairobi CBD
  const [markerPosition, setMarkerPosition] = useState([-1.286389, 36.817223]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [lastParams, setLastParams] = useState(null); // Tracks the last user search

  const handlePredict = async (params) => {
    if (!params) return;

    setLoading(true);
    setError('');
    setPrediction(null);
    
    try {
      let latitude, longitude;

      // Step 1: Get coordinates, either from geocoding a name or from a pre-defined hotspot
      if (params.location.type === 'name') {
        const coords = await getCoordsFromLocationName(params.location.value);
        latitude = coords.latitude;
        longitude = coords.longitude;
      } else {
        latitude = params.location.value.latitude;
        longitude = params.location.value.longitude;
      }
      
      setMarkerPosition([latitude, longitude]);
      setMapCenter([latitude, longitude]);

      const { dateTime, businessRatio } = params;

      // Step 2: Prepare parameters for API calls and store them
      const apiParams = {
        latitude,
        longitude,
        day_of_week: dateTime.getDay() === 0 ? 6 : dateTime.getDay() - 1,
        hour_of_day: dateTime.getHours(),
        business_ratio: businessRatio,
      };
      setLastParams(apiParams); // Save the last successful search parameters

      // Step 3: Fetch heatmap data in the background
      getHeatmapData({
        lat: latitude,
        lon: longitude,
        day: apiParams.day_of_week,
        hour: apiParams.hour_of_day,
      }).then(setHeatmapData);

      // Step 4: Get the primary prediction for the exact point
      const result = await getDemandPrediction(apiParams);

      // Step 5: If it was a fallback, enrich the result with a name and distance
      if (result.is_fallback) {
        const [fallbackLat, fallbackLon] = h3.cellToLatLng(result.prediction_h3_cell);
        const fallbackName = await getLocationNameFromCoords(fallbackLat, fallbackLon);
        
        const distanceInMeters = getDistance(
          { latitude, longitude },
          { latitude: fallbackLat, longitude: fallbackLon }
        );
        
        result.location_display_name = fallbackName;
        result.fallback_distance_km = (distanceInMeters / 1000).toFixed(1);
      } else {
        // If it's NOT a fallback, get the name of the searched location
        result.location_display_name = await getLocationNameFromCoords(latitude, longitude);
      }
      
      setPrediction(result);

    } catch (err) {
      setError(err.toString());
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for when a user clicks a hexagon on the map
  const handleHotspotClick = async (hotspotData) => {
    setLoading(true);
    setError('');

    try {
        const [lat, lon] = h3.cellToLatLng(hotspotData.h3_cell);
        const name = await getLocationNameFromCoords(lat, lon);
        
        // Construct a new prediction result object directly from the heatmap data
        const newPrediction = {
            requested_h3_cell: hotspotData.h3_cell,
            prediction_h3_cell: hotspotData.h3_cell,
            predicted_demand: hotspotData.demand,
            predicted_demand_rounded: Math.round(hotspotData.demand),
            is_fallback: false, // Not a fallback, it's a direct click on a known cell
            fallback_location_name: name, // Reuse this field to show the name
            fallback_distance_km: 0, // No distance as it's a direct selection
            location_display_name: name 
        };
        
        setPrediction(newPrediction);
        setMarkerPosition([lat, lon]);
        setMapCenter([lat, lon]);

    } catch (err) {
        setError("Could not get details for the selected hotspot.");
    } finally {
        setLoading(false);
    }
  };

  // Effect to get user's location and initial heatmap on app load
  useEffect(() => {
    const defaultLocation = { lat: -1.286389, lon: 36.817223 };
    
    const fetchInitialHeatmap = (coords) => {
        const now = new Date();
        const heatmapParams = {
            lat: coords.lat,
            lon: coords.lon,
            day: now.getDay() === 0 ? 6 : now.getDay() - 1,
            hour: now.getHours(),
        };
        setLoading(true);
        getHeatmapData(heatmapParams)
          .then(setHeatmapData)
          .finally(() => setLoading(false));
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = { 
              lat: position.coords.latitude, 
              lon: position.coords.longitude 
          };
          setMapCenter([userCoords.lat, userCoords.lon]);
          setMarkerPosition([userCoords.lat, userCoords.lon]);
          fetchInitialHeatmap(userCoords);
        },
        () => {
          console.warn("User denied location. Defaulting to CBD.");
          fetchInitialHeatmap(defaultLocation);
        }
      );
    } else {
      console.log("Geolocation not available. Defaulting to CBD.");
      fetchInitialHeatmap(defaultLocation);
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
      <div className="w-full md:w-[450px] p-6 bg-gray-800 shadow-2xl overflow-y-auto flex-shrink-0">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">RidePulse</h1>
          <p className="text-gray-400">Nairobi's Boda-Boda Demand Forecaster</p>
        </header>
        <PredictionControls
          onPredict={handlePredict}
          isLoading={loading}
          apiError={error}
          setMarkerPosition={setMarkerPosition}
          setMapCenter={setMapCenter}
          lastParams={lastParams}
        />
        <PredictionResult result={prediction} isLoading={loading} error={error} />
      </div>
      <div className="w-full flex-grow h-full">
        <MapComponent
          center={mapCenter}
          markerPosition={markerPosition}
          setMarkerPosition={setMarkerPosition}
          predictionResult={prediction}
          heatmapData={heatmapData}
          onHotspotClick={handleHotspotClick}
        />
      </div>
    </div>
  );
}

export default App;
