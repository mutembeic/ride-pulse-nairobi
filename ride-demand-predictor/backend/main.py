from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import json
import os
import h3 
from catboost import Pool
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional


#Application Setup 
app = FastAPI(
    title="RidePulse Nairobi - Demand Predictor API",
    description="Predicts boda-boda ride demand for specific hexagonal zones in Nairobi.",
    version="1.1.0" # Version bump for new feature
)

 
# This is where we define which frontends are allowed to talk to our API.
origins = [
    "http://localhost:5175",   
    "http://localhost:3000",  # A common port for Create React App
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------------------------------------------------

#Pydantic Schemas 
class PredictionInput(BaseModel):
    latitude: float = Field(..., example=-1.2843, description="Latitude of the location.")
    longitude: float = Field(..., example=36.8248, description="Longitude of the location.")
    day_of_week: int = Field(..., ge=0, le=6, example=2, description="Day of the week (0=Monday, 6=Sunday).")
    hour_of_day: int = Field(..., ge=0, le=23, example=16, description="Hour of the day (0-23).")
    business_ratio: float = Field(..., ge=0.0, le=1.0, example=0.95, description="Estimated ratio of business rides (0.0 to 1.0).")

class PredictionOutput(BaseModel):
    requested_h3_cell: str
    prediction_h3_cell: str
    predicted_demand: float
    predicted_demand_rounded: int
    is_fallback: bool = Field(..., description="True if the prediction is for the nearest known cell, not the exact requested cell.")


class HeatmapPoint(BaseModel):
    h3_cell: str
    demand: float

class HeatmapOutput(BaseModel):
    center_h3_cell: str
    hotspots: List[HeatmapPoint]

#Loading Model Artifacts 
MODEL_DIR = './ml_models/'
MODEL_PATH = os.path.join(MODEL_DIR, 'catboost_model.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.joblib')
H3_MAP_PATH = os.path.join(MODEL_DIR, 'h3_categories.json')

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with open(H3_MAP_PATH, 'r') as f:
        # We need a set for fast lookups
        known_h3_cells = set(json.load(f).keys())
    print("✅ Model and artifacts loaded successfully on startup.")
except FileNotFoundError as e:
    print(f"❌ Critical Error: Could not load model artifacts on startup. {e}")
    model = None
    known_h3_cells = set()

#Prediction Logic
def get_prediction(input_data: PredictionInput) -> dict:
    if not model:
        raise HTTPException(status_code=503, detail="Model is not available. Please check server logs.")
        
    H3_RESOLUTION = 12
    
    # 1. Convert input lat/lon to an H3 cell
    requested_h3_cell = h3.latlng_to_cell(input_data.latitude, input_data.longitude, H3_RESOLUTION)
    
    prediction_cell = requested_h3_cell
    is_fallback = False
    
    # Define the categorical features list just once
    categorical_features_indices = [0] # 'h3_cell' is the first column

    # 2. Check if the cell is in our known data
    if requested_h3_cell not in known_h3_cells:
        is_fallback = True
        print(f"⚠️ H3 cell {requested_h3_cell} not in training data. Searching for neighbors...")
        
        found_cell = False
        for k in range(1, 6):
            neighbors = h3.grid_disk(requested_h3_cell, k)
            known_neighbors = [cell for cell in neighbors if cell in known_h3_cells]
            
            if known_neighbors:
                print(f"Found {len(known_neighbors)} known neighbors at distance k={k}.")
                
                neighbor_inputs = []
                for neighbor_cell in known_neighbors:
                    neighbor_inputs.append({
                        'h3_cell': neighbor_cell,
                        'day_of_week': input_data.day_of_week,
                        'hour_of_day': input_data.hour_of_day,
                        'business_ratio': input_data.business_ratio
                    })
                
                neighbor_df = pd.DataFrame(neighbor_inputs)
                neighbor_df['business_ratio'] = scaler.transform(neighbor_df[['business_ratio']])
                
                # IMPORTANT FIX: Create a CatBoost Pool to explicitly pass cat features
                prediction_pool = Pool(data=neighbor_df, cat_features=categorical_features_indices)
                predictions = model.predict(prediction_pool)
                
                best_neighbor_index = predictions.argmax()
                prediction_cell = known_neighbors[best_neighbor_index]
                prediction_value = predictions[best_neighbor_index]
                
                print(f"Best neighbor is {prediction_cell} with predicted demand {prediction_value:.2f}")
                found_cell = True
                break
        
        if not found_cell:
            raise HTTPException(status_code=404, detail="No known ride data available near the requested location.")
    
    else: # If it's not a fallback, predict on the original cell
        input_dict = {
            'h3_cell': requested_h3_cell,
            'day_of_week': input_data.day_of_week,
            'hour_of_day': input_data.hour_of_day,
            'business_ratio': input_data.business_ratio
        }
        
        input_df = pd.DataFrame([input_dict])
        input_df['business_ratio'] = scaler.transform(input_df[['business_ratio']])
        
        # IMPORTANT FIX: Also use a Pool for the non-fallback case for consistency
        prediction_pool = Pool(data=input_df, cat_features=categorical_features_indices)
        prediction_value = model.predict(prediction_pool)[0]

    return {
        "requested_h3_cell": requested_h3_cell,
        "prediction_h3_cell": prediction_cell,
        "predicted_demand": prediction_value,
        "predicted_demand_rounded": round(float(prediction_value)),
        "is_fallback": is_fallback
    }


@app.get("/heatmap", response_model=HeatmapOutput, tags=["Prediction"])
def get_heatmap_data(lat: float, lon: float, day: int, hour: int):
    """
    Generates demand prediction data for a grid of H3 cells around a central point.
    """
    if not model:
        raise HTTPException(status_code=503, detail="Model is not available.")
    
    H3_RESOLUTION = 12 # Use the fine resolution for the grid
    GRID_RADIUS = 7      # How many rings of hexagons to calculate around the center

    try:
        center_cell = h3.latlng_to_cell(lat, lon, H3_RESOLUTION)
        # Get all cells within the specified radius
        grid_cells = h3.grid_disk(center_cell, GRID_RADIUS)
        
        # Filter for only the cells we have historical data for
        relevant_cells = [cell for cell in grid_cells if cell in known_h3_cells]

        if not relevant_cells:
            return HeatmapOutput(center_h3_cell=center_cell, hotspots=[])

        # Prepare a DataFrame for batch prediction
        heatmap_inputs = [{
            'h3_cell': cell,
            'day_of_week': day,
            'hour_of_day': hour,
            'business_ratio': 0.70 # Use an average business_ratio for the heatmap
        } for cell in relevant_cells]
        
        heatmap_df = pd.DataFrame(heatmap_inputs)
        
        # Preprocessing
        heatmap_df['business_ratio'] = scaler.transform(heatmap_df[['business_ratio']])
        
        # Create CatBoost Pool
        prediction_pool = Pool(data=heatmap_df, cat_features=[0])
        
        # Get predictions
        predictions = model.predict(prediction_pool)
        
        # Format the output
        hotspots = [
            HeatmapPoint(h3_cell=cell, demand=demand) 
            for cell, demand in zip(relevant_cells, predictions)
        ]
        
        return HeatmapOutput(center_h3_cell=center_cell, hotspots=hotspots)

    except Exception as e:
        print(f"Error generating heatmap: {e}")
        raise HTTPException(status_code=500, detail="Could not generate heatmap data.")


# --- API Endpoints ---
@app.get("/", tags=["General"])
def read_root():
    return {"message": "Welcome to the RidePulse Nairobi Demand Prediction API!"}

@app.post("/predict", response_model=PredictionOutput, tags=["Prediction"])
def predict_ride_demand(input_data: PredictionInput):
    """
    Accepts latitude/longitude and time, then returns the predicted demand,
    falling back to the nearest known location if necessary.
    """
    prediction_result = get_prediction(input_data)
    return prediction_result