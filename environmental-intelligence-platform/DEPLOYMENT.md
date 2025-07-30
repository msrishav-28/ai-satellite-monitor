# Environmental Intelligence Platform - Deployment Guide

## 🚀 Production Deployment

This guide covers the complete deployment of the Environmental Intelligence Platform for production use.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.9 or higher
- **PostgreSQL**: 13 or higher
- **Redis**: 6 or higher
- **Docker**: 20.x or higher (optional)

### External Services
- **Mapbox Account**: For globe visualization
- **OpenWeatherMap API**: For weather data
- **World Air Quality Index API**: For AQI data
- **Google Earth Engine**: For satellite data (optional)
- **Sentinel Hub**: For satellite imagery (optional)

## 🔧 Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd environmental-intelligence-platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

#### Frontend Environment (.env.local)
```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
```

#### Backend Environment (.env)
```bash
# Application Settings
DEBUG=False
HOST=0.0.0.0
PORT=8000
SECRET_KEY=your-production-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/env_intel

# Redis
REDIS_URL=redis://localhost:6379

# External APIs
OPENWEATHER_API_KEY=your_openweather_api_key
WAQI_API_KEY=your_waqi_api_key

# Google Earth Engine (Optional)
GEE_SERVICE_ACCOUNT_KEY=path/to/service-account-key.json
GEE_PROJECT_ID=your-gee-project-id

# Sentinel Hub (Optional)
SENTINEL_HUB_CLIENT_ID=your_sentinel_hub_client_id
SENTINEL_HUB_CLIENT_SECRET=your_sentinel_hub_client_secret

# CORS Settings
ALLOWED_HOSTS=["https://yourdomain.com"]
```

## 🗄️ Database Setup

### 1. PostgreSQL Setup
```bash
# Create database
createdb env_intel

# Create user
psql -c "CREATE USER env_intel_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE env_intel TO env_intel_user;"
```

### 2. Run Migrations
```bash
cd backend
python -c "
import asyncio
from app.core.database import init_db
asyncio.run(init_db())
"
```

## 🐳 Docker Deployment

### 1. Build Images
```bash
# Build frontend
docker build -t env-intel-frontend ./frontend

# Build backend
docker build -t env-intel-backend ./backend
```

### 2. Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    image: env-intel-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    image: env-intel-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/env_intel
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=env_intel
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. Frontend (Vercel/Netlify)
```bash
# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=frontend/out
```

#### 2. Backend (AWS ECS/Lambda)
```bash
# Create ECR repository
aws ecr create-repository --repository-name env-intel-backend

# Build and push image
docker build -t env-intel-backend ./backend
docker tag env-intel-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/env-intel-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/env-intel-backend:latest
```

#### 3. Database (RDS)
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier env-intel-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

### Google Cloud Deployment

#### 1. Frontend (Cloud Run)
```bash
# Build and deploy
gcloud run deploy env-intel-frontend \
  --source ./frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### 2. Backend (Cloud Run)
```bash
# Build and deploy
gcloud run deploy env-intel-backend \
  --source ./backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup
```bash
# Using Certbot for Let's Encrypt
certbot --nginx -d yourdomain.com
```

### 2. Firewall Rules
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 3. Environment Security
- Use strong, unique passwords
- Enable database encryption
- Configure API rate limiting
- Set up monitoring and alerting

## 📊 Monitoring & Logging

### 1. Application Monitoring
```bash
# Install monitoring tools
pip install prometheus-client
npm install @sentry/nextjs
```

### 2. Log Configuration
```python
# backend/app/core/logging.py
import logging
from pythonjsonlogger import jsonlogger

def setup_production_logging():
    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter()
    logHandler.setFormatter(formatter)
    logger = logging.getLogger()
    logger.addHandler(logHandler)
    logger.setLevel(logging.INFO)
```

## 🧪 Health Checks

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
```

### 2. Frontend Health Check
```bash
curl http://localhost:3000/api/health
```

### 3. Database Health Check
```bash
pg_isready -h localhost -p 5432
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          npm install
          cd backend && pip install -r requirements.txt
          
      - name: Run tests
        run: |
          npm test
          cd backend && pytest
          
      - name: Build and deploy
        run: |
          npm run build
          # Deploy commands here
```

## 📈 Performance Optimization

### 1. Frontend Optimization
- Enable Next.js static generation
- Configure CDN for static assets
- Implement service worker for caching

### 2. Backend Optimization
- Configure database connection pooling
- Enable Redis caching
- Set up load balancing

### 3. Database Optimization
- Create appropriate indexes
- Configure query optimization
- Set up read replicas

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string
   - Verify database is running
   - Check firewall rules

2. **API Rate Limiting**
   - Monitor API usage
   - Implement caching
   - Consider API key rotation

3. **Memory Issues**
   - Monitor memory usage
   - Configure appropriate limits
   - Implement garbage collection

### Support Contacts
- Technical Support: tech-support@environmental-intel.com
- Emergency Contact: emergency@environmental-intel.com

---

**Built for environmental monitoring and disaster prediction in collaboration with ISRO and NASA.**
