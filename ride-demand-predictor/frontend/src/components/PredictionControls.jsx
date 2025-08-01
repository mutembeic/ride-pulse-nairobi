import React, { useState } from 'react';

// Helper functions (getTodayDateString, getCurrentTimeString) remain the same...
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getCurrentTimeString = () => {
  const now = new Date();
  const pad = (num) => num.toString().padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const PredictionControls = ({ onPredict, isLoading, apiError }) => {
  const [locationName, setLocationName] = useState("Kenya National Archives");
  const [dateInput, setDateInput] = useState(getTodayDateString);
  const [timeInput, setTimeInput] = useState(getCurrentTimeString);
  // --- NEW: State for Location Type ---
  const [locationType, setLocationType] = useState('commercial'); // Default to commercial
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const selectedDateTime = new Date(`${dateInput}T${timeInput}`);
    if (selectedDateTime < new Date()) {
      setLocalError("Please select a future date and time for prediction.");
      return;
    }

    // --- NEW: Convert location type to a business_ratio ---
    let businessRatio = 0.5; // Neutral default
    if (locationType === 'commercial') {
      businessRatio = 0.85; // High for business/work areas
    } else if (locationType === 'residential') {
      businessRatio = 0.20; // Low for residential areas
    } else if (locationType === 'mixed') {
      businessRatio = 0.55; // Medium for malls, entertainment
    }

    onPredict({
      locationName,
      dateTime: selectedDateTime,
      businessRatio: businessRatio, // Pass the dynamic ratio
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
          Enter Location Name
        </label>
        <input
          type="text"
          id="location"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g., Yaya Centre"
          className={`w-full bg-gray-700 border rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 ${localError ? 'border-red-500' : 'border-gray-600'}`}
          required
        />
        {localError && <p className="mt-2 text-sm text-red-400">{localError}</p>}
      </div>

      {/* --- NEW: Location Type Dropdown --- */}
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

      <div className="flex gap-4">
        {/* Date and Time inputs are unchanged */}
        <div className="w-1/2">
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input type="date" id="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>
        <div className="w-1/2">
          <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">Time</label>
          <input type="time" id="time" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>
      </div>
      
      {apiError && <p className="text-sm text-red-400">{apiError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full font-bold py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 transition-colors duration-300"
      >
        {isLoading ? 'Predicting...' : 'Predict Demand'}
      </button>
    </form>
  );
};

export default PredictionControls;