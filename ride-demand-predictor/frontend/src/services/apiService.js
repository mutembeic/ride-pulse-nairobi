import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';
// New: Nominatim Geocoding API endpoint
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search';
// New: Nominatim Reverse Geocoding API endpoint
const REVERSE_GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse';


const apiService = axios.create({
  baseURL: API_URL,
});

export const getDemandPrediction = async (predictionData) => {
  try {
    const response = await apiService.post('/predict', predictionData);
    return response.data;
  } catch (error) {
    console.error("Error fetching prediction:", error);
    throw error.response?.data?.detail || "An unknown error occurred.";
  }
};

// NEW FUNCTION: Converts a place name to coordinates
export const getCoordsFromLocationName = async (locationName) => {
  try {
    const response = await axios.get(GEOCODE_URL, {
      params: {
        q: `${locationName}, Nairobi, Kenya`, // Be specific to improve results
        format: 'json',
        limit: 1 // We only want the top result
      }
    });
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      throw new Error("Location not found.");
    }
  } catch (error) {
    console.error("Error geocoding location:", error);
    throw "Could not find coordinates for the specified location.";
  }
};


// NEW FUNCTION: Converts coordinates to a place name
export const getLocationNameFromCoords = async (latitude, longitude) => {
  try {
    const response = await axios.get(REVERSE_GEOCODE_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
      }
    });
    if (response.data && response.data.display_name) {
      // Return a concise part of the address
      return response.data.display_name.split(',').slice(0, 2).join(', ');
    } else {
      return "Nearby area"; // Fallback name
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "Nearby hotspot"; // Fallback name on error
  }
};

export const getHeatmapData = async (params) => {
  try {
    // params should be { lat, lon, day, hour }
    const response = await apiService.get('/heatmap', { params });
    return response.data.hotspots;
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    // Return empty array on error so the app doesn't crash
    return [];
  }
};