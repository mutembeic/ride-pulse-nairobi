import React from 'react';

const PredictionResult = ({ result, error, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-8 p-4 bg-gray-700 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-900 border border-red-700 rounded-lg">
        <p className="font-bold text-red-300">Error</p>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
        <div className="mt-8 p-4 text-center bg-gray-700/50 border border-dashed border-gray-600 rounded-lg">
            <p className="text-gray-400">Your prediction results will appear here.</p>
        </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-cyan-900 to-gray-800 border border-cyan-700 rounded-lg shadow-lg">
      
      {/* 1. Show a warning message ONLY if it was a fallback */}
      {result.is_fallback && (
        <div className="mb-3 p-2 text-sm text-center bg-yellow-900/50 text-yellow-300 rounded-md">
          No data for exact spot. Showing nearest hotspot:
        </div>
      )}

      {/* 2. Show the location's name if we have one */}
      {result.location_display_name && (
        <>
            <p className="text-gray-400 text-sm">
                {result.is_fallback ? 'Recommended Location:' : 'Location:'}
            </p>
            <p className="text-lg font-semibold text-cyan-300 mb-2">
                {result.location_display_name}
            </p>
        </>
      )}
      
      {/* 3. Show the distance ONLY if it was a fallback */}
      {result.is_fallback && result.fallback_distance_km && (
         <p className="text-xs text-yellow-400 mb-3">
            (approx. {result.fallback_distance_km} km away)
          </p>
      )}
      
      <p className="text-6xl font-bold text-white tracking-tight">
        {result.predicted_demand_rounded}
        <span className="text-2xl text-gray-400 ml-2">rides</span>
      </p>
       <p className="text-xs text-gray-500 mt-2">
        Raw value: {result.predicted_demand.toFixed(2)}
      </p>
    </div>
  );
};

export default PredictionResult;