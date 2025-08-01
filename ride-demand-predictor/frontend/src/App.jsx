import { useState } from 'react';
import * as h3 from 'h3-js';
import { getDemandPrediction, getCoordsFromLocationName, getLocationNameFromCoords } from './services/apiService';
import MapComponent from './components/MapComponent';
import PredictionControls from './components/PredictionControls';
import PredictionResult from './components/PredictionResult';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([-1.286389, 36.817223]);
  const [markerPosition, setMarkerPosition] = useState(mapCenter);

  const handlePredict = async (params) => {
    if (!params) return;

    setLoading(true);
    setError('');
    setPrediction(null);
    
    try {
      // Step 1: Geocode location name
      const { latitude, longitude } = await getCoordsFromLocationName(params.locationName);
      setMarkerPosition([latitude, longitude]);
      setMapCenter([latitude, longitude]);

      // Step 2: Prepare data for our prediction API
      const { dateTime, businessRatio } = params; // Get businessRatio from params
      const apiParams = {
        latitude,
        longitude,
        day_of_week: dateTime.getDay() === 0 ? 6 : dateTime.getDay() - 1,
        hour_of_day: dateTime.getHours(),
        business_ratio: businessRatio, // Use the dynamic value
      };

      // Steps 3 & 4 remain the same
      const result = await getDemandPrediction(apiParams);
      if (result.is_fallback) {
        const [lat, lon] = h3.cellToLatLng(result.prediction_h3_cell);
        const fallbackName = await getLocationNameFromCoords(lat, lon);
        result.fallback_location_name = fallbackName;
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
      <div className="w-full md:w-1/3 p-6 bg-gray-800 shadow-2xl overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">RidePulse</h1>
          <p className="text-gray-400">Nairobi's Boda-Boda Demand Forecaster</p>
        </header>
        <PredictionControls
          onPredict={handlePredict}
          isLoading={loading}
          apiError={error}
        />
        <PredictionResult result={prediction} isLoading={loading} error={error} />
      </div>
      <div className="w-full md:w-2/3 h-full">
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
