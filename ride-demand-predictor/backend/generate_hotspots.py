import pandas as pd
import h3
import json
import requests
import time
import os

# --- CONFIGURATION ---
# We are in `ride-demand-predictor/backend/`, so we go up two levels to reach the project root.
TRAIN_DATA_PATH = '../../Train.csv' 
H3_RESOLUTION = 9 # Use a larger hex for regional hotspots (covers ~0.74 km²)
# The output path is also relative to the `backend` folder.
OUTPUT_PATH = '../frontend/src/core_hotspots.json'

def get_location_name(lat, lon):
    """Uses Nominatim to get a common name for coordinates."""
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    # Nominatim requires a descriptive User-Agent header for API calls.
    headers = {'User-Agent': 'RidePulse-Nairobi-App/1.0 (your-email@example.com)'}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status() # Raises an exception for bad status codes (4xx or 5xx)
        data = response.json()
        address = data.get('address', {})
        # Prioritize more specific names first, falling back to broader ones.
        name = address.get('road', address.get('neighbourhood', address.get('suburb', 'Unknown Area')))
        return name
    except Exception as e:
        print(f"--> Geocoding error for {lat},{lon}: {e}")
        return "Geocoding Failed"

def main():
    # --- Check if the input file exists ---
    if not os.path.exists(TRAIN_DATA_PATH):
        print(f"Error: Cannot find training data at the expected path: '{TRAIN_DATA_PATH}'")
        print("Please ensure the script is being run from the 'ride-demand-predictor/backend/' directory.")
        return

    print(f"Loading training data from '{TRAIN_DATA_PATH}'...")
    df = pd.read_csv(TRAIN_DATA_PATH)

    print(f"Converting {len(df)} ride locations to H3 cells at resolution {H3_RESOLUTION}...")
    df['h3_cell'] = df.apply(
        lambda row: h3.latlng_to_cell(row['Pickup Lat'], row['Pickup Long'], H3_RESOLUTION),
        axis=1
    )

    print("Identifying top 10 busiest zones...")
    top_10_zones = df['h3_cell'].value_counts().nlargest(10)
    
    hotspots = []
    print("\nFetching names for top hotspots (this may take about 10-15 seconds)...")
    for i, (h3_cell, count) in enumerate(top_10_zones.items()):
        lat, lon = h3.cell_to_latlng(h3_cell)
        
        print(f"[{i+1}/10] Resolving name for hotspot: {h3_cell} (Ride Count: {count})")
        location_name = get_location_name(lat, lon)
        
        hotspots.append({
            "name": f"{location_name}", # Simplified the name
            "h3_cell": h3_cell,
            "latitude": lat,
            "longitude": lon,
            "ride_count": int(count)
        })
        # Be respectful to Nominatim's API usage policy (max 1 request per second)
        time.sleep(1.1) 

    # Ensure the target directory exists for the output
    output_dir = os.path.dirname(OUTPUT_PATH)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"\nSaving hotspot data to '{OUTPUT_PATH}'...")
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(hotspots, f, indent=2)
        
    print("\n✅ Core hotspot data generated successfully!")
    print("The file is now available for your React frontend.")

if __name__ == '__main__':
    main()