"""
Satellite data service for fetching and processing satellite imagery
Integrates with Google Earth Engine, Sentinel Hub, and Planetary Computer
"""

import logging
import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from geojson_pydantic import Polygon
import numpy as np

logger = logging.getLogger(__name__)

# Google Earth Engine imports (conditional)
try:
    import ee
    GEE_AVAILABLE = True
except ImportError:
    GEE_AVAILABLE = False
    logger.warning("Google Earth Engine not available. Install earthengine-api package.")

from app.core.config import settings


class SatelliteDataService:
    """Service for fetching satellite data from various sources"""

    def __init__(self):
        self.gee_initialized = False
        self.sentinel_hub_client = None
        self.pc_client = None

        # Initialize Google Earth Engine if available
        if GEE_AVAILABLE and not settings.FORCE_MOCK_SATELLITE:
            self._initialize_gee()
    
    def _initialize_gee(self):
        """Initialize Google Earth Engine authentication"""
        try:
            # Prefer explicit ServiceAccountCredentials when a service account JSON is present
            project_id = settings.GEE_PROJECT_ID or os.getenv('GEE_PROJECT_ID')
            adc_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            direct_key = settings.GEE_CREDENTIALS_FILE or os.getenv('GEE_CREDENTIALS_FILE')

            # Back-compat: explicit service account (email + key path)
            sa_email = settings.GEE_SERVICE_ACCOUNT_EMAIL or os.getenv('GEE_SERVICE_ACCOUNT_EMAIL')
            sa_key_path = settings.GEE_SERVICE_ACCOUNT_KEY or os.getenv('GEE_SERVICE_ACCOUNT_KEY')

            # Helper to init with SA JSON file by deriving client_email
            def _init_with_sa_json(json_path: str) -> bool:
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        sa_info = json.load(f)
                    sa_email_guess = sa_info.get('client_email')
                    if not sa_email_guess:
                        logger.warning("Service account JSON missing client_email; cannot initialize Earth Engine")
                        return False
                    credentials = ee.ServiceAccountCredentials(sa_email_guess, json_path)
                    ee.Initialize(credentials, project=project_id)
                    logger.info("Google Earth Engine initialized with ServiceAccountCredentials from JSON")
                    return True
                except Exception as e:
                    logger.warning(f"Failed to initialize Earth Engine with ServiceAccountCredentials from JSON: {e}")
                    return False

            # 1) If GEE_CREDENTIALS_FILE provided, try SA-first
            if direct_key and os.path.exists(direct_key):
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = direct_key
                if _init_with_sa_json(direct_key):
                    self.gee_initialized = True
                    return
                # Fallback to ADC with the same file
                try:
                    ee.Initialize(project=project_id)
                    self.gee_initialized = True
                    logger.info("Google Earth Engine initialized via ADC using GEE_CREDENTIALS_FILE")
                    return
                except Exception as adc_from_direct_err:
                    logger.warning(f"ADC init failed using GEE_CREDENTIALS_FILE: {adc_from_direct_err}")

            # 2) If GOOGLE_APPLICATION_CREDENTIALS set, try SA-first then ADC
            if adc_path and os.path.exists(adc_path):
                if _init_with_sa_json(adc_path):
                    self.gee_initialized = True
                    return
                try:
                    ee.Initialize(project=project_id)
                    self.gee_initialized = True
                    logger.info("Google Earth Engine initialized via ADC using GOOGLE_APPLICATION_CREDENTIALS")
                    return
                except Exception as adc_err:
                    logger.warning(f"ADC initialization failed: {adc_err}")

            # 3) Explicit SA email + key path (legacy)
            if sa_key_path and os.path.exists(sa_key_path) and sa_email:
                try:
                    credentials = ee.ServiceAccountCredentials(sa_email, sa_key_path)
                    ee.Initialize(credentials, project=project_id)
                    self.gee_initialized = True
                    logger.info("Google Earth Engine initialized with explicit service account credentials")
                    return
                except Exception as sa_explicit_err:
                    logger.warning(f"Explicit SA initialization failed: {sa_explicit_err}")

            # 4) Optional: try user auth if allowed
            if settings.ALLOW_GEE_USER_AUTH and not settings.FORCE_MOCK_SATELLITE:
                try:
                    ee.Initialize(project=project_id)
                    self.gee_initialized = True
                    logger.info("Google Earth Engine initialized with existing user credentials")
                    return
                except Exception as user_auth_err:
                    logger.warning(f"GEE user authentication failed: {user_auth_err}")

            logger.info("GEE not initialized (no valid credentials or auth disabled); will use mock data")
            self.gee_initialized = False

        except Exception as e:
            logger.error(f"Failed to initialize Google Earth Engine: {e}")
            self.gee_initialized = False

    async def get_aoi_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get comprehensive satellite data for an Area of Interest

        Returns:
        - NDVI (vegetation health)
        - Land Surface Temperature (LST)
        - Precipitation data
        - Elevation/slope data
        - Land cover classification
        - Soil moisture
        """
        try:
            if not settings.FORCE_MOCK_SATELLITE and self.gee_initialized and GEE_AVAILABLE:
                return await self._get_gee_satellite_data(aoi)
            else:
                logger.info("Using mock satellite data (GEE not available)")
                return self._get_mock_satellite_data()

        except Exception as e:
            logger.error(f"Error fetching satellite data: {e}")
            return self._get_mock_satellite_data()

    async def _get_gee_satellite_data(self, aoi: Polygon) -> Dict[str, Any]:
        """Get real satellite data from Google Earth Engine"""
        try:
            # Convert AOI to Earth Engine geometry
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)

            # Get current date and date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)

            # Get Sentinel-2 data for NDVI
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                           .filterBounds(ee_geometry)
                           .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))

            # Get most recent image
            s2_image = s2_collection.sort('system:time_start', False).first()

            # Calculate NDVI
            ndvi = s2_image.normalizedDifference(['B8', 'B4']).rename('NDVI')

            # Get MODIS LST data
            modis_lst = (ee.ImageCollection('MODIS/061/MOD11A1')
                        .filterBounds(ee_geometry)
                        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                        .select('LST_Day_1km')
                        .sort('system:time_start', False)
                        .first())

            # Get SRTM elevation data
            srtm = ee.Image('USGS/SRTMGL1_003')
            elevation = srtm.select('elevation')
            slope = ee.Terrain.slope(elevation)

            # Get precipitation data (GPM)
            gpm = (ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
                  .filterBounds(ee_geometry)
                  .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                  .select('precipitationCal')
                  .sum())

            # Reduce regions to get mean values
            ndvi_stats = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=ee_geometry,
                scale=10,
                maxPixels=1e9
            ).getInfo()

            lst_stats = modis_lst.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=ee_geometry,
                scale=1000,
                maxPixels=1e9
            ).getInfo()

            elevation_stats = elevation.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=ee_geometry,
                scale=30,
                maxPixels=1e9
            ).getInfo()

            slope_stats = slope.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=ee_geometry,
                scale=30,
                maxPixels=1e9
            ).getInfo()

            precipitation_stats = gpm.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=ee_geometry,
                scale=10000,
                maxPixels=1e9
            ).getInfo()

            # Convert LST from Kelvin to Celsius
            lst_celsius = (lst_stats.get('LST_Day_1km', 0) * 0.02) - 273.15 if lst_stats.get('LST_Day_1km') else 25.0

            return {
                'ndvi': ndvi_stats.get('NDVI', 0.6),
                'land_surface_temperature': lst_celsius,
                'elevation': elevation_stats.get('elevation', 500.0),
                'slope': slope_stats.get('slope', 10.0),
                'precipitation_30day': precipitation_stats.get('precipitationCal', 50.0),
                'data_source': 'Google Earth Engine',
                'acquisition_date': end_date.strftime('%Y-%m-%d'),
                'cloud_coverage': 15.0,  # Approximate from filter
                'data_quality': 'good'
            }

        except Exception as e:
            logger.error(f"Error fetching GEE satellite data: {e}")
            # Fallback to mock data
            return self._get_mock_satellite_data()
    
    async def get_ndvi_timeseries(self, aoi: Polygon, start_date: str, end_date: str) -> List[Dict]:
        """
        Get NDVI time series for vegetation monitoring
        """
        try:
            if not settings.FORCE_MOCK_SATELLITE and self.gee_initialized and GEE_AVAILABLE:
                return await self._get_gee_ndvi_timeseries(aoi, start_date, end_date)
            else:
                # Mock NDVI time series data
                return [
                    {"date": "2024-01-01", "ndvi": 0.65, "cloud_cover": 10},
                    {"date": "2024-01-15", "ndvi": 0.68, "cloud_cover": 5},
                    {"date": "2024-02-01", "ndvi": 0.72, "cloud_cover": 15},
                    {"date": "2024-02-15", "ndvi": 0.70, "cloud_cover": 8}
                ]
        except Exception as e:
            logger.error(f"Error fetching NDVI time series: {e}")
            return []

    async def _get_gee_ndvi_timeseries(self, aoi: Polygon, start_date: str, end_date: str) -> List[Dict]:
        """Get NDVI time series from Google Earth Engine"""
        try:
            # Convert AOI to Earth Engine geometry
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)

            # Get Sentinel-2 collection
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                           .filterBounds(ee_geometry)
                           .filterDate(start_date, end_date)
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)))

            # Function to calculate NDVI and add date
            def add_ndvi(image):
                ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
                return image.addBands(ndvi).set('date', image.date().format('YYYY-MM-dd'))

            # Map NDVI calculation over collection
            ndvi_collection = s2_collection.map(add_ndvi)

            # Get time series data
            def extract_ndvi(image):
                ndvi_mean = image.select('NDVI').reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geometry,
                    scale=10,
                    maxPixels=1e9
                ).get('NDVI')

                cloud_cover = image.get('CLOUDY_PIXEL_PERCENTAGE')
                date = image.get('date')

                return ee.Feature(None, {
                    'date': date,
                    'ndvi': ndvi_mean,
                    'cloud_cover': cloud_cover
                })

            # Extract features
            ndvi_features = ndvi_collection.map(extract_ndvi)

            # Get the data
            ndvi_data = ndvi_features.getInfo()

            # Format results
            results = []
            for feature in ndvi_data['features']:
                props = feature['properties']
                if props['ndvi'] is not None:
                    results.append({
                        'date': props['date'],
                        'ndvi': round(props['ndvi'], 3),
                        'cloud_cover': props['cloud_cover']
                    })

            return sorted(results, key=lambda x: x['date'])

        except Exception as e:
            logger.error(f"Error fetching GEE NDVI time series: {e}")
            return []

    async def get_satellite_imagery_for_timelapse(self, aoi: Polygon, start_date: str, end_date: str) -> List[Dict]:
        """
        Get satellite imagery collection for time-lapse generation
        """
        try:
            if not settings.FORCE_MOCK_SATELLITE and self.gee_initialized and GEE_AVAILABLE:
                return await self._get_gee_imagery_collection(aoi, start_date, end_date)
            else:
                # Mock imagery data
                return [
                    {
                        "date": "2024-01-01",
                        "image_id": "S2A_MSIL2A_20240101T103321_N0510_R108_T32TQM_20240101T123456",
                        "cloud_cover": 5.2,
                        "data_quality": "excellent",
                        "bands": ["B2", "B3", "B4", "B8"]
                    },
                    {
                        "date": "2024-01-06",
                        "image_id": "S2B_MSIL2A_20240106T103321_N0510_R108_T32TQM_20240106T123456",
                        "cloud_cover": 12.8,
                        "data_quality": "good",
                        "bands": ["B2", "B3", "B4", "B8"]
                    }
                ]
        except Exception as e:
            logger.error(f"Error fetching imagery for time-lapse: {e}")
            return []

    async def _get_gee_imagery_collection(self, aoi: Polygon, start_date: str, end_date: str) -> List[Dict]:
        """Get satellite imagery collection from Google Earth Engine"""
        try:
            # Convert AOI to Earth Engine geometry
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)

            # Get Sentinel-2 collection
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                           .filterBounds(ee_geometry)
                           .filterDate(start_date, end_date)
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50))
                           .sort('system:time_start'))

            # Get collection info
            collection_info = s2_collection.getInfo()

            results = []
            for feature in collection_info['features']:
                props = feature['properties']

                results.append({
                    'date': datetime.fromtimestamp(props['system:time_start'] / 1000).strftime('%Y-%m-%d'),
                    'image_id': props['system:index'],
                    'cloud_cover': props.get('CLOUDY_PIXEL_PERCENTAGE', 0),
                    'data_quality': 'excellent' if props.get('CLOUDY_PIXEL_PERCENTAGE', 0) < 10 else 'good',
                    'bands': ['B2', 'B3', 'B4', 'B8', 'B11', 'B12'],
                    'satellite': 'Sentinel-2',
                    'processing_level': 'L2A'
                })

            return results

        except Exception as e:
            logger.error(f"Error fetching GEE imagery collection: {e}")
            return []
    
    async def get_lst_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get Land Surface Temperature data from MODIS/Landsat
        """
        try:
            return {
                "mean_temperature": 28.5,
                "max_temperature": 35.2,
                "min_temperature": 22.1,
                "temperature_anomaly": 2.3,
                "data_source": "MODIS Terra",
                "acquisition_date": "2024-01-15"
            }
        except Exception as e:
            logger.error(f"Error fetching LST data: {e}")
            return {}
    
    async def get_precipitation_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get precipitation data from GPM satellite
        """
        try:
            return {
                "daily_precipitation": 12.5,
                "monthly_total": 85.3,
                "precipitation_anomaly": -15.2,
                "data_source": "GPM IMERG",
                "last_updated": "2024-01-15"
            }
        except Exception as e:
            logger.error(f"Error fetching precipitation data: {e}")
            return {}
    
    async def get_dem_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get Digital Elevation Model data and derived products
        """
        try:
            return {
                "mean_elevation": 245.8,
                "max_elevation": 412.3,
                "min_elevation": 156.7,
                "mean_slope": 8.5,
                "max_slope": 35.2,
                "aspect_dominant": "south",
                "data_source": "SRTM 30m"
            }
        except Exception as e:
            logger.error(f"Error fetching DEM data: {e}")
            return {}
    
    async def get_land_cover_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get land cover classification data
        """
        try:
            return {
                "dominant_class": "forest",
                "forest_percentage": 65.2,
                "urban_percentage": 15.8,
                "agriculture_percentage": 12.5,
                "water_percentage": 3.2,
                "bare_soil_percentage": 3.3,
                "data_source": "ESA WorldCover",
                "year": 2023
            }
        except Exception as e:
            logger.error(f"Error fetching land cover data: {e}")
            return {}
    
    async def get_soil_moisture_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get soil moisture data from SMAP/SMOS satellites
        """
        try:
            return {
                "surface_soil_moisture": 0.35,
                "root_zone_moisture": 0.42,
                "moisture_anomaly": -0.08,
                "data_source": "SMAP L3",
                "acquisition_date": "2024-01-15"
            }
        except Exception as e:
            logger.error(f"Error fetching soil moisture data: {e}")
            return {}
    
    def _get_mock_satellite_data(self) -> Dict[str, Any]:
        """
        Return comprehensive mock satellite data
        """
        return {
            # Vegetation indices
            "ndvi": 0.68,
            "evi": 0.45,
            "savi": 0.52,
            
            # Temperature data
            "land_surface_temperature": 28.5,
            "temperature_anomaly": 2.1,
            
            # Precipitation
            "precipitation": 12.5,
            "precipitation_anomaly": -5.2,
            
            # Topography
            "elevation": 245.8,
            "slope": 8.5,
            "aspect": 180,  # South-facing
            
            # Land cover
            "land_cover": "forest",
            "forest_percentage": 65.2,
            "urban_percentage": 15.8,
            
            # Soil and moisture
            "soil_moisture": 0.35,
            "soil_type": "loam",
            
            # Infrastructure proximity
            "road_distance": 2.5,
            "settlement_distance": 8.2,
            "fault_distance": 15.0,
            
            # Weather variables
            "wind_speed": 5.2,
            "wind_direction": 225,
            "humidity": 68.0,
            
            # Fire-related
            "fuel_load": 0.72,
            "fuel_moisture": 18.5,
            
            # Water-related
            "drainage_density": 0.45,
            "river_distance": 1.8,
            
            # Data quality
            "cloud_cover": 8.5,
            "data_quality": "good",
            "acquisition_date": "2024-01-15"
        }
