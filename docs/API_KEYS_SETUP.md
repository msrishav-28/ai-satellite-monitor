# API Keys & Configuration Setup Guide

This guide provides step-by-step instructions for obtaining and configuring all required API keys for the Environmental Intelligence Platform.

## 🔑 Required API Keys

### Essential APIs (Required for Core Functionality)

#### 1. Mapbox Access Token
**Purpose**: 3D globe visualization and map rendering
**Cost**: Free tier available (50,000 map loads/month)

**Setup Steps:**
1. Visit [Mapbox](https://www.mapbox.com/)
2. Create account and verify email
3. Go to Account → Access Tokens
4. Create new token with these scopes:
   - `styles:read`
   - `fonts:read` 
   - `datasets:read`
   - `vision:read`
5. Copy token to `.env.local`: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here`

#### 2. OpenWeatherMap API Key
**Purpose**: Real-time weather data
**Cost**: Free tier (1,000 calls/day)

**Setup Steps:**
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Go to API Keys section
4. Copy default API key
5. Add to `backend/.env`: `OPENWEATHER_API_KEY=your_api_key_here`

#### 3. World Air Quality Index (WAQI) API Token
**Purpose**: Real-time air quality data
**Cost**: Free tier (1,000 requests/day)

**Setup Steps:**
1. Visit [WAQI API](https://aqicn.org/api/)
2. Request API token (usually instant approval)
3. Add to `backend/.env`: `WAQI_API_KEY=your_token_here`

### Advanced APIs (Optional but Recommended)

#### 4. Google Earth Engine Service Account
**Purpose**: Satellite imagery and geospatial analysis
**Cost**: Free for research/non-commercial use

**Setup Steps:**
1. Visit [Google Earth Engine](https://earthengine.google.com/)
2. Sign up and request access (may take 1-2 days)
3. Create Google Cloud Project
4. Enable Earth Engine API
5. Create Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create new service account
   - Download JSON key file
6. Configure in `backend/.env`:
   ```
   GEE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
   GEE_PROJECT_ID=your-gcp-project-id
   ```

#### 5. Sentinel Hub API
**Purpose**: High-resolution satellite imagery
**Cost**: Free tier (1,000 processing units/month)

**Setup Steps:**
1. Visit [Sentinel Hub](https://www.sentinel-hub.com/)
2. Create account
3. Go to Dashboard → Configuration Utility
4. Create new configuration
5. Note Client ID and Client Secret
6. Add to `backend/.env`:
   ```
   SENTINEL_HUB_CLIENT_ID=your_client_id
   SENTINEL_HUB_CLIENT_SECRET=your_client_secret
   ```

#### 6. Microsoft Planetary Computer
**Purpose**: Additional satellite data sources
**Cost**: Free with registration

**Setup Steps:**
1. Visit [Planetary Computer](https://planetarycomputer.microsoft.com/)
2. Request access
3. Get subscription key from dashboard
4. Add to `backend/.env`: `PC_SUBSCRIPTION_KEY=your_subscription_key`

## 🔧 Configuration Files

### Backend Environment (.env)
Create `backend/.env` from `backend/.env.example`:

```bash
# Application Settings
DEBUG=True
HOST=0.0.0.0
PORT=8000
SECRET_KEY=your-secret-key-change-in-production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/env_intel

# Redis
REDIS_URL=redis://localhost:6379

# External APIs
OPENWEATHER_API_KEY=your_openweather_api_key
WAQI_API_KEY=your_waqi_api_key

# Google Earth Engine
GEE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
GEE_PROJECT_ID=your-gee-project-id

# Sentinel Hub
SENTINEL_HUB_CLIENT_ID=your_sentinel_hub_client_id
SENTINEL_HUB_CLIENT_SECRET=your_sentinel_hub_client_secret

# Planetary Computer
PC_SUBSCRIPTION_KEY=your_pc_subscription_key
```

### Frontend Environment (.env.local)
Create `frontend/.env.local` from `frontend/.env.example`:

```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES=true
```

## 🚀 Quick Start Priority

**Minimum viable setup (for basic functionality):**
1. Mapbox Access Token (frontend)
2. OpenWeatherMap API Key (backend)

**Recommended setup (for full features):**
1. All above APIs
2. Google Earth Engine (for satellite data)
3. WAQI API (for air quality)

**Production setup:**
1. All APIs configured
2. Proper database setup (PostgreSQL)
3. Redis for caching
4. Environment-specific secrets

## 🔒 Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all secrets**
3. **Rotate API keys regularly**
4. **Monitor API usage and set up alerts**
5. **Use different keys for development/production**

## 📊 API Usage Monitoring

Most APIs provide usage dashboards:
- **Mapbox**: Account → Usage
- **OpenWeatherMap**: Dashboard → Statistics
- **Google Earth Engine**: Cloud Console → APIs & Services
- **Sentinel Hub**: Dashboard → Statistics

## 🆘 Troubleshooting

### Common Issues:
1. **"Invalid API key"**: Check key format and permissions
2. **"Quota exceeded"**: Monitor usage limits
3. **"Access denied"**: Verify account approval status
4. **"Network timeout"**: Check firewall/proxy settings

### Testing API Keys:
Use the platform's health check endpoint: `GET /health`
This will verify all configured APIs are working correctly.
