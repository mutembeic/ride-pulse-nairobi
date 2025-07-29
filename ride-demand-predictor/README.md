# Nairobi Ride Demand Prediction

A full-stack application that predicts ride-hailing demand in Nairobi based on location, time, and live weather data. The backend uses FastAPI with a machine learning model, while the frontend provides an interactive React interface with map functionality.

## Table of Contents
- [Nairobi Ride Demand Prediction](#nairobi-ride-demand-prediction)
  - [Table of Contents](#table-of-contents)
  - [Project Architecture](#project-architecture)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Backend Setup](#backend-setup)
    - [File Structure](#file-structure)
    - [Installation Steps](#installation-steps)
  - [Frontend Setup](#frontend-setup)
    - [File Structure](#file-structure-1)
    - [Installation Steps](#installation-steps-1)
  - [Machine Learning Model](#machine-learning-model)
    - [Model Artifacts](#model-artifacts)
  - [API Documentation](#api-documentation)
    - [Main Endpoints](#main-endpoints)
  - [Configuration](#configuration)
    - [Backend Configuration](#backend-configuration)
    - [Frontend Configuration](#frontend-configuration)
    - [Environment Variables](#environment-variables)
  - [Contributing](#contributing)
  - [License](#license)

## Project Architecture

The project is structured as a monorepo with two main components:

- **Backend (`backend/`)**: Python-based API built with **FastAPI** that handles business logic, fetches real-time weather data, preprocesses input, and serves predictions from a trained LightGBM model
- **Frontend (`frontend/`)**: React single-page application with **Vite** and **Leaflet** maps for interactive location selection and demand visualization

## Features

- 🗺️ Interactive map interface for location selection
- 🌤️ Real-time weather data integration via OpenWeatherMap API
- 🤖 Machine learning predictions using LightGBM
- 📊 Historical demand analysis
- 🚀 Fast API responses with automatic documentation
- 📱 Responsive design for mobile and desktop

## Prerequisites

- **Backend**: Python 3.7+, pip, venv (recommended)
- **Frontend**: Node.js 16+, npm
- **API Key**: OpenWeatherMap API key ([Get one here](https://openweathermap.org/api))

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nairobi-ride-demand-prediction
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   echo "OPENWEATHER_API_KEY=your_api_key_here" > .env
   ```

4. **Start the backend server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://127.0.0.1:8000/docs

## Backend Setup

### File Structure
```
backend/
├── .env                        # Environment variables (not in Git)
├── main.py                     # FastAPI application and routes
├── requirements.txt            # Python dependencies
├── core/
│   └── config.py              # Environment configuration
├── ml_models/
│   ├── lgbm_model.joblib      # Trained model
│   ├── scaler.joblib          # Feature scaler
│   └── h3_categories.json     # H3 cell mappings
├── schemas/
│   └── prediction.py          # Pydantic request/response models
└── services/
    ├── prediction_service.py   # ML prediction logic
    └── weather_service.py      # Weather API integration
```

### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   Create `.env` file with:
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```

5. **Run the server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## Frontend Setup

### File Structure
```
frontend/
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── MapComponent.jsx
│   │   └── PredictionControls.jsx
│   ├── services/
│   │   └── apiService.js      # Backend API calls
│   ├── App.css               # Main stylesheet
│   ├── App.jsx               # Main component
│   └── main.jsx              # React entry point
├── index.html                # HTML template
└── package.json              # Dependencies and scripts
```

### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Machine Learning Model

The prediction service uses a **LightGBM Regressor** trained on historical ride data with the following features:

| Feature | Description |
|---------|-------------|
| `h3_cell` | Geospatial index for pickup location |
| `day_of_week` | Day of week (0=Monday, 6=Sunday) |
| `hour_of_day` | Hour of day (0-23) |
| `business_ratio` | Business (1) vs personal (0) ride |
| `temperature` | Current temperature (°C) |
| `precipitation` | Rainfall in last hour (mm) |

### Model Artifacts
- `lgbm_model.joblib`: Trained LightGBM model
- `scaler.joblib`: Feature preprocessing scaler
- `h3_categories.json`: H3 cell category mappings

## API Documentation

Once the backend is running, visit `http://127.0.0.1:8000/docs` for interactive API documentation powered by Swagger UI.

### Main Endpoints
- `POST /predict`: Get demand prediction for location and time

## Configuration

### Backend Configuration
- **Environment Variables**: Configure in `backend/.env`
- **API Settings**: Modify `backend/core/config.py`

### Frontend Configuration
- **API Endpoint**: Update `API_URL` in `frontend/src/services/apiService.js`
- **Map Settings**: Configure map defaults in `MapComponent.jsx`

### Environment Variables
```env
# Backend (.env file)
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for Nairobi's transportation ecosystem**
