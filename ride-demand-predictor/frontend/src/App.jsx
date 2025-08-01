import { useState } from 'react';
import * as h3 from 'h3-js';
import { getDistance } from 'geolib';
import { getDemandPrediction, getCoordsFromLocationName, getLocationNameFromCoords } from './services/apiService';
import MapComponent from './components/MapComponent';
import PredictionControls from './components/PredictionControls';
import PredictionResult from './components/PredictionResult';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]);
  const [markerPosition, setMarkerPosition] = useState([-1.286389, 36.817223]);

  const handlePredict = async (params) => {
    if (!params) return;

    setLoading(true);
    setError('');
    setPrediction(null);
    
    try {
      let latitude, longitude;

      // Step 1: Get coordinates, either from geocoding or the selected hotspot
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

      // Step 2: Prepare data for our prediction API
      const { dateTime, businessRatio } = params;
      const apiParams = {
        latitude,
        longitude,
        day_of_week: dateTime.getDay() === 0 ? 6 : dateTime.getDay() - 1,
        hour_of_day: dateTime.getHours(),
        business_ratio: businessRatio,
      };

      // Step 3: Get the prediction from our backend
      const result = await getDemandPrediction(apiParams);

      // Step 4: If it's a fallback, enrich the result with a name and distance
      if (result.is_fallback) {
        const [fallbackLat, fallbackLon] = h3.cellToLatLng(result.prediction_h3_cell);
        const fallbackName = await getLocationNameFromCoords(fallbackLat, fallbackLon);
        
        const distanceInMeters = getDistance(
          { latitude, longitude },
          { latitude: fallbackLat, longitude: fallbackLon }
        );
        
        result.fallback_location_name = fallbackName;
        result.fallback_distance_km = (distanceInMeters / 1000).toFixed(1);
      }
      
      setPrediction(result);

    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

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
        />
        <PredictionResult result={prediction} isLoading={loading} error={error} />
      </div>
      <div className="w-full flex-grow h-full">
        <MapComponent
          center={mapCenter}
          markerPosition={markerPosition}
          setMarkerPosition={setMarkerPosition}
          predictionResult={prediction}
        />
      </div>
    </div>
  );
}

export default App;
