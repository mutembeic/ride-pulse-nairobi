import pandas as pd
import json
import os

# --- CONFIGURATION ---
TRAIN_DATA_PATH = '../../data/Train.csv'
HOURLY_DATA_OUTPUT_PATH = '../frontend/src/hourly_demand.json'
# --- NEW: Path for daily data ---
DAILY_DATA_OUTPUT_PATH = '../frontend/src/daily_demand.json'

def main():
    print(f"Loading data from {TRAIN_DATA_PATH}...")
    if not os.path.exists(TRAIN_DATA_PATH):
        print(f"Error: Cannot find training data at '{TRAIN_DATA_PATH}'.")
        return

    df = pd.read_csv(TRAIN_DATA_PATH)

    # --- 1. Process Hourly Demand (No changes here) ---
    print("Calculating average demand by hour...")
    df['Placement_Time_dt'] = pd.to_datetime(df['Placement - Time'], format='%I:%M:%S %p').dt.hour
    hourly_demand = df.groupby('Placement_Time_dt').size().reset_index(name='demand_count')
    hourly_demand = hourly_demand.rename(columns={'Placement_Time_dt': 'hour'})
    num_days_total = df['Placement - Day of Month'].nunique()
    if num_days_total > 0:
        hourly_demand['average_demand'] = hourly_demand['demand_count'] / num_days_total
    else:
        hourly_demand['average_demand'] = 0
    hourly_data_list = hourly_demand.to_dict(orient='records')
    
    with open(HOURLY_DATA_OUTPUT_PATH, 'w') as f:
        json.dump(hourly_data_list, f, indent=2)
    print(f"Hourly demand data saved to {HOURLY_DATA_OUTPUT_PATH}")

    # --- 2. NEW: Process Daily Demand ---
    print("Calculating average demand by day of the week...")
    # The 'Placement - Weekday (Mo = 1)' column is already what we need.
    # Let's adjust it to be 0-indexed (0=Monday, 6=Sunday) to be consistent.
    df['day_of_week'] = df['Placement - Weekday (Mo = 1)'] - 1
    
    daily_demand = df.groupby('day_of_week').size().reset_index(name='demand_count')
    
    # To get the average, we need to count how many of each weekday were in the dataset.
    # For example, how many Mondays, Tuesdays, etc., are in the data.
    weekday_counts = df.groupby('day_of_week')['Placement - Day of Month'].nunique()
    daily_demand = daily_demand.merge(weekday_counts.rename('num_weeks'), on='day_of_week')
    
    daily_demand['average_demand'] = daily_demand['demand_count'] / daily_demand['num_weeks']
    
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    daily_demand['day_name'] = daily_demand['day_of_week'].apply(lambda x: day_names[x])

    daily_data_list = daily_demand[['day_name', 'average_demand']].to_dict(orient='records')

    with open(DAILY_DATA_OUTPUT_PATH, 'w') as f:
        json.dump(daily_data_list, f, indent=2)
    print(f"Daily demand data saved to {DAILY_DATA_OUTPUT_PATH}")

    print("\n✅ All analytics data generated successfully!")

if __name__ == '__main__':
    main()