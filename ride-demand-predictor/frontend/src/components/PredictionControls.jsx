import React, { useState, useEffect } from 'react';
import coreHotspots from '../core_hotspots.json'; // Import the generated data

const getTodayDateString = () => new Date().toISOString().split('T')[0];
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
  const [localError, setLocalError] = useState('');

  // Effect to update the map when a hotspot is selected from the dropdown
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

    const combinedDateTime = new Date(`${dateInput}T${timeInput}`);
    if (combinedDateTime < new Date()) {
      setLocalError("Please select a future date and time for prediction.");
      return;
    }
    
    let targetLocation;
    // Prioritize the custom text input if the user has typed in it
    if (locationName.trim() !== "") {
        targetLocation = { type: 'name', value: locationName };
    } else {
        const hotspot = coreHotspots.find(h => h.h3_cell === selectedHotspot);
        targetLocation = { type: 'coords', value: { latitude: hotspot.latitude, longitude: hotspot.longitude }};
    }

    onPredict({
      location: targetLocation,
      dateTime: combinedDateTime,
      businessRatio: 0.85, // We can refine this later
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
              setLocationName(''); // Clear custom input when hotspot is chosen
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
              setSelectedHotspot(''); // Clear hotspot when typing custom
              setLocalError('');
          }}
          placeholder="e.g., The Sarit Centre"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
      
      {localError && <p className="text-sm text-red-400 mt-2">{localError}</p>}
      {apiError && <p className="text-sm text-red-400 mt-2">{apiError}</p>}

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