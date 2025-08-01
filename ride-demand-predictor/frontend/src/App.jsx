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
  const [markerPosition, setMarkerPosition] = useState([-1.286389, 36.817223]);

  const handlePredict = async (params) => {
    if (!params) return;

    setLoading(true);
    setError('');
    setPrediction(null);
    
    try {
      let latitude, longitude;

      // Check if we need to geocode a name or if we already have coordinates
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
      const apiParams = {
        latitude,
        longitude,
        day_of_week: dateTime.getDay() === 0 ? 6 : dateTime.getDay() - 1,
        hour_of_day: dateTime.getHours(),
        business_ratio: businessRatio,
      };

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
