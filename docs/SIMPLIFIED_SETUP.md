# 🚀 Simplified Setup Guide (No Database Installation Required!)

## ✨ **What Changed - Now Much Easier!**

The platform has been updated to use **SQLite** (built-in) and **in-memory caching** instead of PostgreSQL and Redis. This means:

- ❌ **No PostgreSQL installation required**
- ❌ **No Redis installation required**  
- ❌ **No database setup commands**
- ✅ **Everything works out of the box!**

## 🔑 **What You Actually Need (Only 3 Things!)**

### 1. Mapbox Access Token (5 minutes)
**Required for the 3D globe to work**

```bash
# Get free token from: https://www.mapbox.com/
# 1. Sign up for free account
# 2. Go to Account → Access Tokens
# 3. Copy your default token (starts with 'pk.')
```

### 2. OpenWeatherMap API Key (3 minutes)
**Required for weather data**

```bash
# Get free key from: https://openweathermap.org/api
# 1. Sign up for free account  
# 2. Go to API Keys section
# 3. Copy your API key
```

### 3. Air Quality API Token (2 minutes)
**Required for air quality data**

```bash
# Get free token from: https://aqicn.org/api/
# 1. Request API token (instant approval)
# 2. Copy your token
```

## 🚀 **Complete Setup (10 minutes total)**

### Step 1: Run Setup Script (1 minute)
```bash
# This creates all environment files automatically
scripts/setup-env.bat
```

### Step 2: Add Your API Keys (5 minutes)

**Edit `frontend/.env.local`:**
```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**Edit `backend/.env`:**
```bash
# Database (SQLite - already configured!)
DATABASE_URL=sqlite:///./env_intel.db

# Cache (in-memory - already configured!)
ENABLE_CACHING=true
CACHE_TTL=300

# API Keys (add your keys here)
OPENWEATHER_API_KEY=your_openweather_key_here
WAQI_API_KEY=your_waqi_token_here
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# Optional (for advanced satellite features)
GEE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
GEE_PROJECT_ID=your-gee-project-id
```

### Step 3: Start Everything (4 minutes)
```bash
# This installs dependencies and starts both servers
scripts/start-dev.bat

# Opens browser automatically to http://localhost:3000
```

## ✅ **That's It! No Database Setup Required**

The platform now:
- ✅ **Creates SQLite database automatically** (env_intel.db file)
- ✅ **Uses in-memory caching** (no Redis needed)
- ✅ **Handles all database tables automatically**
- ✅ **Works immediately after adding API keys**

## 🔍 **Verify Everything Works**

1. **Frontend**: http://localhost:3000 - Should show 3D globe
2. **Backend**: http://localhost:8000/docs - Should show API docs
3. **Health Check**: http://localhost:8000/health - Should return:
   ```json
   {
     "status": "healthy",
     "components": {
       "database": "healthy",
       "cache": "healthy", 
       "background_tasks": "healthy"
     }
   }
   ```

## 🎯 **Testing the Platform**

1. **Draw AOI**: Click "Define Area of Interest" on the globe
2. **Draw polygon**: Click points to create an area
3. **Confirm**: Click "Confirm Selection"  
4. **View data**: Environmental metrics panel should appear

## 🆘 **Troubleshooting**

### Issue: "Mapbox token invalid"
```bash
# Solution: Check token format starts with 'pk.'
# Verify token has 'styles:read' permission
```

### Issue: "API key missing" 
```bash
# Solution: Check backend/.env has your API keys
# Restart backend server after adding keys
```

### Issue: Database error
```bash
# Solution: Delete env_intel.db file and restart
# SQLite database will be recreated automatically
```

## 🔧 **Advanced Features (Optional)**

### Add Google Earth Engine (for real satellite data)
```bash
# 1. Sign up at https://earthengine.google.com/
# 2. Create Google Cloud Project  
# 3. Download service account JSON
# 4. Add to backend/.env:
GEE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
GEE_PROJECT_ID=your-project-id
```

### Upgrade to PostgreSQL (for production)
```bash
# Only needed for high-traffic production deployment
# Update backend/.env:
DATABASE_URL=postgresql://user:pass@localhost:5432/env_intel
```

## 📊 **What's Different Now**

| Before | After |
|--------|-------|
| Install PostgreSQL | ❌ Not needed |
| Install Redis | ❌ Not needed |
| Database setup commands | ❌ Not needed |
| Complex configuration | ❌ Not needed |
| **Just add API keys** | ✅ **That's it!** |

## 🎉 **Summary**

The platform is now **plug-and-play**:

1. **Run setup script** → Creates environment files
2. **Add 3 API keys** → Takes 10 minutes total  
3. **Start servers** → Everything works immediately

No database installation, no complex setup, no configuration headaches!

The SQLite database and in-memory cache provide excellent performance for development and small-to-medium production deployments.
