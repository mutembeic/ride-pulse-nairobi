# Nairobi Ride Demand Prediction (RidePulse)

## RidePulse Nairobi
**Helping Boda-Boda Riders Find Customers Faster**

RidePulse Nairobi is a smart map tool created to help boda-boda riders in Nairobi reduce the time and fuel spent looking for passengers. It uses past trip data to predict where riders are most likely to get customers in the city.

### Why This Is Important
Riders often waste fuel and time looking for passengers or crowd in the same busy areas. RidePulse helps solve this by showing riders where there is real demand.

### How It Works
* **Predicts Busy Areas:** It looks at patterns from thousands of rides and guesses where people will need rides at different times.
* **Shows a Simple Map:** The map uses colors to guide the rider:
   * **Red/Orange:** Lots of customers here – go!
   * **Yellow:** Some demand – possible chance.
   * **Blue/Clear:** Few or no customers – avoid.

### The Goal
1. Help riders make more money.
2. Save fuel and time.
3. Reduce overcrowding in traditional hotspots.

### Where the Data Comes From
We use real delivery data from over 20,000 rides in Nairobi. This includes where and when pickups happened.

### Tools Behind the Scenes
* Python, Pandas, NumPy, Scikit-learn
* Mapping: Folium, H3 grid zones
* Interface: Streamlit web app

RidePulse uses smart tools to make your job easier.

---

A full-stack application that predicts boda-boda ride-hailing demand in Nairobi based on location and time. The backend uses FastAPI with a powerful CatBoost machine learning model, and the frontend will provide an interactive React interface with map functionality.

## Table of Contents

- [Nairobi Ride Demand Prediction (RidePulse)](#nairobi-ride-demand-prediction-ridepulse)
  - [RidePulse Nairobi](#ridepulse-nairobi)
    - [Why This Is Important](#why-this-is-important)
    - [How It Works](#how-it-works)
    - [The Goal](#the-goal)
    - [Where the Data Comes From](#where-the-data-comes-from)
    - [Tools Behind the Scenes](#tools-behind-the-scenes)
  - [Table of Contents](#table-of-contents)
  - [Project Architecture](#project-architecture)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Backend Setup \& Quick Start](#backend-setup--quick-start)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Create and Activate the Conda Environment](#2-create-and-activate-the-conda-environment)
    - [3. Install Python Dependencies](#3-install-python-dependencies)
    - [4. Run the Backend Server](#4-run-the-backend-server)
    - [5. Access the API](#5-access-the-api)
  - [File Structure](#file-structure)
    - [Installation Steps](#installation-steps)
  - [Frontend Setup](#frontend-setup)
    - [File Structure](#file-structure-1)
    - [Installation Steps](#installation-steps-1)
  - [Machine Learning Model](#machine-learning-model)
    - [Model Artifacts](#model-artifacts)
  - [API Documentation](#api-documentation)
    - [Main Endpoints](#main-endpoints)
    - [Testing the API Manually](#testing-the-api-manually)
  - [Contributing](#contributing)
  - [License](#license)

## Project Architecture

The project is structured as a monorepo with two main components:

- **Backend (`ride-demand-predictor/backend/`)**: A Python-based API built with FastAPI. It handles prediction requests, preprocesses input, and serves predictions from a trained CatBoost model.

- **Frontend (`ride-demand-predictor/frontend/`)**: A React single-page application (to be built) using Vite and Leaflet for an interactive map interface.

## Features

- 🤖 High-accuracy demand predictions using a CatBoost Regressor model
- 📍 Geospatial logic to find the nearest known hotspot if the requested location has no historical data
- 🚀 A fast, modern API built with FastAPI
- 📚 Automatic, interactive API documentation via Swagger UI
- 📱 A reproducible environment setup for easy team collaboration

## Prerequisites

- **Conda**: For managing Python environments
- **Python 3.8**: The backend is specifically built and tested on this version
- **Node.js 16+ & npm**: For the frontend development

## Backend Setup & Quick Start

These steps will get your backend server running.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ride-pulse-nairobi
```

### 2. Create and Activate the Conda Environment
This project requires Python 3.8. The following commands create a dedicated Conda environment named `ridepulse-api` to ensure all dependencies are compatible.

```bash
conda create --name ridepulse-api python=3.8 --yes
conda activate ridepulse-api
```

### 3. Install Python Dependencies
Navigate to the backend directory and install the required packages using pip and the requirements.txt file.

```bash
cd ride-demand-predictor/backend
pip install -r requirements.txt
```

### 4. Run the Backend Server
From the backend directory, start the Uvicorn server.

```bash
uvicorn main:app --reload --port 8000
```

### 5. Access the API
- **API is now running at**: http://127.0.0.1:8000
- **Interactive API Docs**: http://127.0.0.1:8000/docs

## File Structure

```
backend/
├── main.py                     # FastAPI application and routes
├── requirements.txt            # Python dependencies (pinned for consistency)
├── venv/ or Conda env          # The Python environment
└── ml_models/
    ├── catboost_model.joblib   # Trained CatBoost model
    ├── scaler.joblib           # Feature scaler for 'business_ratio'
    └── h3_categories.json      # H3 cell mappings for the model
```

### Installation Steps

(Covered in the Quick Start section above).

## Frontend Setup

*(This section is a placeholder for when the frontend is developed)*

### File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── MapComponent.jsx
│   └── services/
│       └── apiService.js
└── package.json
```

### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd ride-demand-predictor/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Machine Learning Model

The prediction service uses a **CatBoost Regressor**, which proved to be the most accurate model during evaluation (R² of 0.87, MAE of 0.40). It was trained on historical ride data with the following features:

| Feature | Description |
|---------|-------------|
| `h3_cell` | Geospatial index (hexagon) for the pickup location. Handled as a category. |
| `day_of_week` | The day of the week (0=Monday, 6=Sunday). |
| `hour_of_day` | The hour of the day (0-23). |
| `business_ratio` | The proportion of rides in that area that were for business purposes. |

### Model Artifacts

- **`catboost_model.joblib`**: The final, trained CatBoost model object
- **`scaler.joblib`**: A MinMaxScaler object from scikit-learn, fitted on the business_ratio feature
- **`h3_categories.json`**: A JSON file mapping the string representation of every H3 cell in the training data to an integer code

## API Documentation

Once the backend is running, visit http://127.0.0.1:8000/docs for interactive API documentation.

### Main Endpoints

- **`GET /`**: Root endpoint to check if the API is alive
- **`POST /predict`**: The main prediction endpoint. It accepts latitude/longitude and returns a demand prediction

### Testing the API Manually

Since a user knows a place name (e.g., "Kenya National Archives") but the API needs coordinates, you can test it by following these steps:

1. **Get Coordinates**: Use Google Maps to find the latitude and longitude of a location. Right-click on the map to get the coordinates (e.g., -1.2843, 36.8248).

2. **Use the /docs Interface**: Go to http://127.0.0.1:8000/docs, expand the POST /predict endpoint, and click "Try it out".

3. **Enter the Data**: Fill the request body with the latitude, longitude, and desired time.
   ```json
   {
     "latitude": -1.2843,
     "longitude": 36.8248,
     "day_of_week": 2,
     "hour_of_day": 16,
     "business_ratio": 0.95
   }
   ```

4. **Execute and View Response**: The API will return a detailed response. If it couldn't find data for the exact spot, the `is_fallback` flag will be true, and `prediction_h3_cell` will show the location of the nearby hotspot it used instead.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**Built with ❤️ for Nairobi's transportation ecosystem**