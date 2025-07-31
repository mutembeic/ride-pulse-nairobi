import pandas as pd
import joblib
import json
import os

#1.Define Paths to Saved Artifacts
MODEL_DIR = './backend/ml_models/'
MODEL_PATH = os.path.join(MODEL_DIR, 'catboost_model.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.joblib')
H3_MAP_PATH = os.path.join(MODEL_DIR, 'h3_categories.json')

def predict_demand(sample_input: dict):
    """
    Loads model artifacts, preprocesses a single input, and returns a demand prediction.
    
    Args:
        sample_input (dict): A dictionary containing the features for prediction.
    
    Returns:
        float: The predicted demand count.
    """
    try:
        #2.Load the Model and Preprocessing Artifacts
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        with open(H3_MAP_PATH, 'r') as f:
            h3_to_code_map = json.load(f)
        
        print("✅ Model and artifacts loaded successfully.")

    except FileNotFoundError as e:
        print(f"❌ Error loading artifacts: {e}")
        print("Please ensure the model files exist in the './backend/ml_models/' directory.")
        return None

    #3.Preprocess the Input Data
    # Convert the sample input dictionary to a pandas DataFrame
    input_df = pd.DataFrame([sample_input])
    print("\nOriginal Input:")
    print(input_df)

    # Scale the numerical feature ('business_ratio')
    input_df['business_ratio'] = scaler.transform(input_df[['business_ratio']])

    # Ensure the categorical column 'h3_cell' has the correct data type.
    # We must define all possible categories the model was trained on.
    all_known_h3_cells = list(h3_to_code_map.keys())
    input_df['h3_cell'] = pd.Categorical(input_df['h3_cell'], categories=all_known_h3_cells)
    
    # Check if the h3_cell is valid (i.e., was seen during training)
    if input_df['h3_cell'].isnull().any():
        print(f"❌ Error: H3 cell '{sample_input['h3_cell']}' was not in the training data.")
        return None

    # Ensure column order matches what the model was trained on
    features_order = ['h3_cell', 'day_of_week', 'hour_of_day', 'business_ratio']
    processed_input_df = input_df[features_order]

    print("\nPreprocessed Input (ready for model):")
    print(processed_input_df)

    # --- 4. Make the Prediction ---
    predicted_demand = model.predict(processed_input_df)
    
    return predicted_demand[0]


#This block runs when the script is executed directly
if __name__ == "__main__":
    # Define a sample input simulating a real-time request.
    # Let's predict for a known busy hexagonal zone (from your data) on
    # a Friday (day 4) at 11 AM (hour 11), a peak business time.
    sample_data = {
        'h3_cell': '8c7a6e42c4629ff',  # A sample H3 cell from your data
        'day_of_week': 4,              # Friday (0=Mon, 1=Tue, ..., 4=Fri)
        'hour_of_day': 11,             # 11 AM
        'business_ratio': 0.90         # High ratio for a commercial area during work hours
    }

    prediction = predict_demand(sample_data)

    if prediction is not None:
        #5. Display the Output
        print("\n" + "="*30)
        print("🚀 RIDE DEMAND PREDICTION 🚀")
        print("="*30)
        print(f"Predicted Raw Demand Count: {prediction:.2f}")
        print(f"Predicted Rounded Demand: {round(prediction)}")
        print("\nThis means the model predicts there will be approximately",
              f"{round(prediction)} ride requests in this specific zone at this time.")
        print("="*30)