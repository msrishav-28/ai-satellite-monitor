# Environmental Intelligence Platform

A comprehensive AI-powered platform for real-time environmental analysis and multi-hazard prediction using satellite imagery, machine learning models, and live APIs. Built for ISRO and NASA collaboration.

## 🌍 Platform Overview

This platform provides:

- **Interactive 3D Globe Interface** with AOI drawing tools
- **Real-Time Environmental Metrics** (weather, AQI, satellite data)
- **Multi-Hazard AI Prediction Models** (wildfire, flood, landslide, etc.)
- **Advanced Analytics** (anomaly detection, causal inference)
- **Impact Analysis** (carbon emissions, biodiversity, agriculture)
- **Time-lapse Generation** from satellite imagery

## 🏗️ Architecture

### Frontend (Next.js 14 + TypeScript)
- Interactive 3D globe using Mapbox GL
- Real-time data visualization with Recharts
- Responsive UI with glassmorphism design
- State management with Zustand

### Backend (FastAPI + Python)
- RESTful API with async/await support
- PostgreSQL database with SQLAlchemy ORM
- Redis for caching and background tasks
- Integration with satellite data sources

### Data Sources
- **Weather**: OpenWeatherMap API
- **Air Quality**: World Air Quality Index API
- **Satellite Imagery**: Google Earth Engine, Sentinel Hub
- **Elevation Data**: SRTM, ASTER GDEM
- **Land Cover**: ESA WorldCover, MODIS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- PostgreSQL 13+
- Redis 6+

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd environmental-intelligence-platform
npm install
npm run install:backend
```

2. **Set up environment variables:**
```bash
# Frontend
cp .env.example .env.local
# Add your Mapbox token and API keys

# Backend
cd backend
cp .env.example .env
# Add your database URL and API keys
```

3. **Start the development servers:**
```bash
# Start both frontend and backend
npm run dev:full

# Or start individually
npm run dev              # Frontend only (port 3000)
npm run dev:backend      # Backend only (port 8000)
```

## 📊 Current Implementation Status

### ✅ Completed Features
- Interactive 3D globe with AOI drawing
- Real-time weather and AQI data integration
- Complete UI components and panels
- Backend API structure with FastAPI
- Mock data for all hazard prediction models
- Comprehensive error handling

### 🚧 In Progress
- Real satellite data integration (Google Earth Engine)
- Actual ML model training and deployment
- Time-lapse generation from satellite imagery
- Database models and data persistence

### 📋 Next Steps
1. **Satellite Data Integration**: Connect to real satellite APIs
2. **ML Model Development**: Train and deploy actual hazard prediction models
3. **Real-time Streaming**: Implement WebSocket connections
4. **Authentication**: Add user management and API security
5. **Deployment**: Set up production infrastructure