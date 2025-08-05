import { useState, useEffect } from 'react';
import * as h3 from 'h3-js';
import { getDistance } from 'geolib';
import { getDemandPrediction, getCoordsFromLocationName, getLocationNameFromCoords, getHeatmapData } from '../services/apiService';
import MapComponent from '../components/MapComponent';
import PredictionControls from '../components/PredictionControls';
import PredictionResult from '../components/PredictionResult';


function Home() {
  
  const [prediction, setPrediction] = useState(null);
  const [lastSuccessfulPrediction, setLastSuccessfulPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]);
  const [markerPosition, setMarkerPosition] = useState([-1.286389, 36.817223]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [lastParams, setLastParams] = useState(null);

  const handlePredict = async (params) => {
    if (!params) return;

    setLoading(true);
    setError('');
    // Clear both the map and the result panel at the start of a new prediction
    setPrediction(null);
    setLastSuccessfulPrediction(null);
    
    try {
      let latitude, longitude;

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

      let dateTime = params.dateTime;
      if (!dateTime) {
        dateTime = new Date();
        dateTime.setHours(dateTime.getHours() + 1);
        dateTime.setMinutes(0);
        dateTime.setSeconds(0);
        dateTime.setMilliseconds(0);
      }

      const businessRatio = params.businessRatio !== undefined ? params.businessRatio : 0.85;

      const apiParams = {
        latitude,
        longitude,
        day_of_week: dateTime.getDay() === 0 ? 6 : dateTime.getDay() - 1,
        hour_of_day: dateTime.getHours(),
        business_ratio: businessRatio,
        dateTime: dateTime, 
      };
      setLastParams(apiParams);

      getHeatmapData({
        lat: latitude,
        lon: longitude,
        day: apiParams.day_of_week,
        hour: apiParams.hour_of_day,
      }).then(setHeatmapData);

      const result = await getDemandPrediction(apiParams);

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
        result.location_display_name = await getLocationNameFromCoords(latitude, longitude);
      }
      
      // On success, update both the map and the result panel
      setPrediction(result);
      setLastSuccessfulPrediction(result);

    } catch (err) {
      setError(err.toString());
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClickPredict = async (latitude, longitude) => {
    const params = {
      location: { type: 'coords', value: { latitude, longitude } },
    };

    if (lastParams && lastParams.dateTime && lastParams.business_ratio !== undefined) {
      params.dateTime = lastParams.dateTime;
      params.businessRatio = lastParams.business_ratio;
    }
    
    await handlePredict(params);
  };

  const handleMapClick = (lat, lng) => {
    // This now ONLY clears the map's prediction state, leaving the result panel intact
    setMarkerPosition([lat, lng]);
    setPrediction(null);
  };

  const handleHotspotClick = async (hotspotData) => {
    setLoading(true);
    setError('');

    try {
        const [lat, lon] = h3.cellToLatLng(hotspotData.h3_cell);
        const name = await getLocationNameFromCoords(lat, lon);
        
        const newPrediction = {
            requested_h3_cell: hotspotData.h3_cell,
            prediction_h3_cell: hotspotData.h3_cell,
            predicted_demand: hotspotData.demand,
            predicted_demand_rounded: Math.round(hotspotData.demand),
            is_fallback: false,
            fallback_location_name: name,
            fallback_distance_km: 0,
            location_display_name: name 
        };
        
        // When clicking a hotspot, treat it as a full prediction
        setPrediction(newPrediction);
        setLastSuccessfulPrediction(newPrediction);
        setMarkerPosition([lat, lon]);
        setMapCenter([lat, lon]);

    } catch (err) {
        setError("Could not get details for the selected hotspot.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const defaultLocation = { lat: -1.286389, lon: 36.817223 };
    
    const initiatePredictionForLocation = async (coords) => {
      setMapCenter([coords.lat, coords.lon]);
      setMarkerPosition([coords.lat, coords.lon]);

      const initialPredictParams = {
        location: { type: 'coords', value: { latitude: coords.lat, longitude: coords.lon } },
      };
      await handlePredict(initialPredictParams);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = { 
              lat: position.coords.latitude, 
              lon: position.coords.longitude 
          };
          initiatePredictionForLocation(userCoords);
        },
        () => {
          console.warn("User denied location. Defaulting to CBD.");
          initiatePredictionForLocation(defaultLocation);
        }
      );
    } else {
      console.log("Geolocation not available. Defaulting to CBD.");
      initiatePredictionForLocation(defaultLocation);
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
        {/* The result panel now uses 'lastSuccessfulPrediction' */}
        <PredictionResult result={lastSuccessfulPrediction} isLoading={loading} error={error} />
      </div>
      <div className="w-full flex-grow h-full">
        <MapComponent
          center={mapCenter}
          markerPosition={markerPosition}
          setMarkerPosition={setMarkerPosition}
          predictionResult={prediction}
          heatmapData={heatmapData}
          onHotspotClick={handleHotspotClick}
          onMapClickPredict={handleMapClickPredict}
          onMapClick={handleMapClick} 
        />
      </div>
    </div>
  );
}

export default Home;