import React, { useState, useEffect } from 'react';
import coreHotspots from '../core_hotspots.json';

// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Helper to get current time in 'HH:MM' format
const getCurrentTimeString = () => {
  const now = new Date();
  const pad = (num) => num.toString().padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const PredictionControls = ({ onPredict, isLoading, apiError, setMapCenter, setMarkerPosition }) => {
  const [locationName, setLocationName] = useState('');
  const [selectedHotspot, setSelectedHotspot] = useState(coreHotspots[0].h3_cell);
  const [dateInput, setDateInput] = useState(getTodayDateString);
  const [timeInput, setTimeInput] = useState(getCurrentTimeString);
  const [locationType, setLocationType] = useState('commercial');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (selectedHotspot) {
      const hotspot = coreHotspots.find(h => h.h3_cell === selectedHotspot);
      if (hotspot) {
        const coords = [hotspot.latitude, hotspot.longitude];
        setMapCenter(coords);
        setMarkerPosition(coords);
      }
    }
  }, [selectedHotspot, setMapCenter, setMarkerPosition]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const selectedDateTime = new Date(`${dateInput}T${timeInput}`);
    if (selectedDateTime < new Date()) {
      setLocalError("Please select a future date and time for prediction.");
      return;
    }

    let businessRatioValue = 0.5;
    if (locationType === 'commercial') {
      businessRatioValue = 0.85;
    } else if (locationType === 'residential') {
      businessRatioValue = 0.20;
    } else if (locationType === 'mixed') {
      businessRatioValue = 0.55;
    }
    
    let targetLocation;
    if (locationName.trim() !== "") {
        targetLocation = { type: 'name', value: locationName };
    } else if (selectedHotspot) {
        const hotspot = coreHotspots.find(h => h.h3_cell === selectedHotspot);
        targetLocation = { type: 'coords', value: { latitude: hotspot.latitude, longitude: hotspot.longitude }};
    } else {
        setLocalError("Please select a hotspot or enter a custom location.");
        return;
    }

    onPredict({
      location: targetLocation,
      dateTime: selectedDateTime,
      businessRatio: businessRatioValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="hotspot" className="block text-sm font-medium text-gray-300 mb-2">
          Select a Core Hotspot Zone
        </label>
        <select
          id="hotspot"
          value={selectedHotspot}
          onChange={(e) => {
              setSelectedHotspot(e.target.value);
              setLocationName('');
              setLocalError('');
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
        >
          {coreHotspots.map((spot) => (
            <option key={spot.h3_cell} value={spot.h3_cell}>
              {spot.name} ({spot.ride_count} rides)
            </option>
          ))}
        </select>
      </div>

      <div className="text-center text-gray-500 text-sm">OR</div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
          Enter a Custom Location
        </label>
        <input
          type="text"
          id="location"
          value={locationName}
          onChange={(e) => {
              setLocationName(e.target.value);
              setSelectedHotspot('');
              setLocalError('');
          }}
          placeholder="e.g., The Sarit Centre"
          className={`w-full bg-gray-700 border rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 ${localError ? 'border-red-500' : 'border-gray-600'}`}
        />
      </div>

      <div>
        <label htmlFor="locationType" className="block text-sm font-medium text-gray-300 mb-2">
          Select Location Type
        </label>
        <select
          id="locationType"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="commercial">Commercial / Office Area</option>
          <option value="mixed">Mixed-Use / Entertainment</option>
          <option value="residential">Residential Area</option>
        </select>
      </div>

      <div className="flex gap-4 pt-2">
        <div className="w-1/2">
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input type="date" id="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>
        <div className="w-1/2">
          <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">Time</label>
          <input type="time" id="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>
      </div>
      
      {localError && <p className="text-sm text-red-400 mt-2">{localError}</p>}
      {apiError && <p className="text-sm text-red-400 mt-2">{apiError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full font-bold py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 transition-colors duration-300 mt-4"
      >
        {isLoading ? 'Predicting...' : 'Predict Demand'}
      </button>
    </form>
  );
};

export default PredictionControls;