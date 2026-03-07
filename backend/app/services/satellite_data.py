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
from app.core.exceptions import GEEDataUnavailableError


class SatelliteDataService:
    """Service for fetching satellite data from various sources"""

    def __init__(self):
        self.gee_initialized = False
        self.sentinel_hub_client = None
        self.pc_client = None

        # Initialize Google Earth Engine if available
        if GEE_AVAILABLE:
            self._initialize_gee()
    
    def _initialize_gee(self):
        """Initialize Google Earth Engine authentication"""
        try:
            # Prefer explicit ServiceAccountCredentials when a service account JSON is present
            project_id = settings.GEE_PROJECT_ID or os.getenv('GEE_PROJECT_ID')
            # Support both settings and environment for ADC path
            adc_path = settings.GOOGLE_APPLICATION_CREDENTIALS or os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
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
            if settings.ALLOW_GEE_USER_AUTH:
                try:
                    ee.Initialize(project=project_id)
                    self.gee_initialized = True
                    logger.info("Google Earth Engine initialized with existing user credentials")
                    return
                except Exception as user_auth_err:
                    logger.warning(f"GEE user authentication failed: {user_auth_err}")

            logger.info("GEE not initialized — no valid credentials found")
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
            if self.gee_initialized and GEE_AVAILABLE:
                return await self._get_gee_satellite_data(aoi)
            else:
                raise GEEDataUnavailableError("GEE not initialized — set credentials in .env")

        except GEEDataUnavailableError:
            raise
        except Exception as e:
            logger.error(f"Error fetching satellite data: {e}")
            raise GEEDataUnavailableError(f"Satellite data fetch failed: {e}")

    async def _get_gee_satellite_data(self, aoi: Polygon) -> Dict[str, Any]:
        """Get real satellite data from Google Earth Engine.
        
        All .getInfo() calls are offloaded to a thread pool via asyncio.to_thread()
        so they don't block the uvicorn event loop (each call can take 5–30 s).
        """
        try:
            # Convert AOI to Earth Engine geometry
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)

            # Get current date and date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            start_str = start_date.strftime('%Y-%m-%d')
            end_str = end_date.strftime('%Y-%m-%d')

            # --- Build all EE objects (cheap, local) ---

            # Sentinel-2 NDVI
            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                           .filterBounds(ee_geometry)
                           .filterDate(start_str, end_str)
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)))
            s2_image = s2_collection.sort('system:time_start', False).first()
            ndvi = s2_image.normalizedDifference(['B8', 'B4']).rename('NDVI')

            # MODIS LST
            modis_lst = (ee.ImageCollection('MODIS/061/MOD11A1')
                        .filterBounds(ee_geometry)
                        .filterDate(start_str, end_str)
                        .select('LST_Day_1km')
                        .sort('system:time_start', False)
                        .first())

            # SRTM elevation + slope
            srtm = ee.Image('USGS/SRTMGL1_003')
            elevation = srtm.select('elevation')
            slope = ee.Terrain.slope(elevation)

            # GPM precipitation (30-day sum)
            gpm = (ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
                  .filterBounds(ee_geometry)
                  .filterDate(start_str, end_str)
                  .select('precipitationCal')
                  .sum())

            # --- Fire all getInfo calls concurrently in threads ---
            def _ndvi_info():
                return ndvi.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geometry,
                    scale=10,
                    maxPixels=1e9
                ).getInfo()

            def _lst_info():
                return modis_lst.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geometry,
                    scale=1000,
                    maxPixels=1e9
                ).getInfo()

            def _elev_info():
                return elevation.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geometry,
                    scale=30,
                    maxPixels=1e9
                ).getInfo()

            def _slope_info():
                return slope.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geometry,
                    scale=30,
                    maxPixels=1e9
                ).getInfo()

            def _precip_info():
                return gpm.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geometry,
                    scale=10000,
                    maxPixels=1e9
                ).getInfo()

            # Run all five GEE network calls concurrently without blocking event loop
            ndvi_stats, lst_stats, elevation_stats, slope_stats, precipitation_stats = (
                await asyncio.gather(
                    asyncio.to_thread(_ndvi_info),
                    asyncio.to_thread(_lst_info),
                    asyncio.to_thread(_elev_info),
                    asyncio.to_thread(_slope_info),
                    asyncio.to_thread(_precip_info),
                )
            )

            # Convert LST from raw MODIS scale (0.02 K) to Celsius
            lst_raw = lst_stats.get('LST_Day_1km') if lst_stats else None
            lst_celsius = ((lst_raw * 0.02) - 273.15) if lst_raw else 25.0

            return {
                'ndvi': round(ndvi_stats.get('NDVI', 0.6), 4) if ndvi_stats else 0.6,
                'land_surface_temperature': round(lst_celsius, 2),
                'elevation': round(elevation_stats.get('elevation', 500.0), 1) if elevation_stats else 500.0,
                'slope': round(slope_stats.get('slope', 10.0), 2) if slope_stats else 10.0,
                'precipitation_30day': round(precipitation_stats.get('precipitationCal', 50.0), 1) if precipitation_stats else 50.0,
                'data_source': 'Google Earth Engine',
                'acquisition_date': end_str,
                'cloud_coverage': 15.0,
                'data_quality': 'good'
            }

        except Exception as e:
            logger.error(f"Error fetching GEE satellite data: {e}")
            raise GEEDataUnavailableError(f"GEE satellite data processing failed: {e}")

    
    async def get_ndvi_timeseries(self, aoi: Polygon, start_date: str, end_date: str) -> List[Dict]:
        """
        Get NDVI time series for vegetation monitoring
        """
        try:
            if self.gee_initialized and GEE_AVAILABLE:
                return await self._get_gee_ndvi_timeseries(aoi, start_date, end_date)
            else:
                raise GEEDataUnavailableError("GEE not initialized for NDVI time series")
        except Exception as e:
            logger.error(f"Error fetching NDVI time series: {e}")
            return []

    async def _get_gee_ndvi_timeseries(self, aoi: Polygon, start_date: str, end_date: str) -> List[Dict]:
        """Get NDVI time series from Google Earth Engine.
        Uses asyncio.to_thread() for the blocking .getInfo() network call.
        """
        try:
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)

            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                           .filterBounds(ee_geometry)
                           .filterDate(start_date, end_date)
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)))

            def add_ndvi(image):
                ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
                return image.addBands(ndvi).set('date', image.date().format('YYYY-MM-dd'))

            ndvi_collection = s2_collection.map(add_ndvi)

            def extract_ndvi(image):
                ndvi_mean = image.select('NDVI').reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geometry,
                    scale=10,
                    maxPixels=1e9
                ).get('NDVI')
                return ee.Feature(None, {
                    'date': image.get('date'),
                    'ndvi': ndvi_mean,
                    'cloud_cover': image.get('CLOUDY_PIXEL_PERCENTAGE')
                })

            ndvi_features = ndvi_collection.map(extract_ndvi)

            # Blocking network call — run in thread pool
            ndvi_data = await asyncio.to_thread(lambda: ndvi_features.getInfo())

            results = []
            for feature in ndvi_data.get('features', []):
                props = feature['properties']
                if props.get('ndvi') is not None:
                    results.append({
                        'date': props['date'],
                        'ndvi': round(props['ndvi'], 3),
                        'cloud_cover': props.get('cloud_cover', 0)
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
            if self.gee_initialized and GEE_AVAILABLE:
                return await self._get_gee_imagery_collection(aoi, start_date, end_date)
            else:
                raise GEEDataUnavailableError("GEE not initialized for imagery collection")
        except Exception as e:
            logger.error(f"Error fetching imagery for time-lapse: {e}")
            return []

    async def _get_gee_imagery_collection(self, aoi: Polygon, start_date: str, end_date: str) -> List[Dict]:
        """Get satellite imagery collection from Google Earth Engine.
        The collection_info .getInfo() call is offloaded to a thread.
        """
        try:
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)

            s2_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                           .filterBounds(ee_geometry)
                           .filterDate(start_date, end_date)
                           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50))
                           .sort('system:time_start'))

            # Blocking network call — run in thread pool
            collection_info = await asyncio.to_thread(lambda: s2_collection.getInfo())

            results = []
            for feature in collection_info.get('features', []):
                props = feature['properties']
                cloud_pct = props.get('CLOUDY_PIXEL_PERCENTAGE', 0)
                results.append({
                    'date': datetime.fromtimestamp(
                        props['system:time_start'] / 1000
                    ).strftime('%Y-%m-%d'),
                    'image_id': props['system:index'],
                    'cloud_cover': cloud_pct,
                    'data_quality': 'excellent' if cloud_pct < 10 else 'good',
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
        Get Land Surface Temperature data from MODIS via GEE.
        Raises GEEDataUnavailableError if GEE is not available.
        """
        if not (self.gee_initialized and GEE_AVAILABLE):
            raise GEEDataUnavailableError("GEE not initialized for LST")
        try:
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=8)

            modis_lst = (ee.ImageCollection('MODIS/061/MOD11A1')
                        .filterBounds(ee_geometry)
                        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                        .select('LST_Day_1km'))

            def _fetch():
                mean_img = modis_lst.mean()
                max_img = modis_lst.max()
                min_img = modis_lst.min()
                reducer_args = dict(geometry=ee_geometry, scale=1000, maxPixels=1e9)
                mean_v = mean_img.reduceRegion(ee.Reducer.mean(), **reducer_args).getInfo()
                max_v = max_img.reduceRegion(ee.Reducer.max(), **reducer_args).getInfo()
                min_v = min_img.reduceRegion(ee.Reducer.min(), **reducer_args).getInfo()
                return mean_v, max_v, min_v

            mean_v, max_v, min_v = await asyncio.to_thread(_fetch)

            def _to_c(raw):
                v = raw.get('LST_Day_1km') if raw else None
                return round((v * 0.02) - 273.15, 2) if v else None

            mean_c = _to_c(mean_v) or 28.5
            max_c = _to_c(max_v) or mean_c + 6.0
            min_c = _to_c(min_v) or mean_c - 6.0

            return {
                'mean_temperature': mean_c,
                'max_temperature': max_c,
                'min_temperature': min_c,
                'temperature_anomaly': round(mean_c - 25.0, 2),
                'data_source': 'MODIS Terra (GEE)',
                'acquisition_date': end_date.strftime('%Y-%m-%d')
            }
        except GEEDataUnavailableError:
            raise
        except Exception as e:
            logger.error(f"Error fetching LST data from GEE: {e}")
            raise GEEDataUnavailableError(f"LST fetch failed: {e}")

    
    async def get_precipitation_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get precipitation data from GPM IMERG via GEE.
        Returns 30-day cumulative and daily average.
        """
        try:
            if not (self.gee_initialized and GEE_AVAILABLE):
                raise GEEDataUnavailableError("GEE not initialized for precipitation")
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)

            gpm = (ee.ImageCollection('NASA/GPM_L3/IMERG_V06')
                  .filterBounds(ee_geometry)
                  .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                  .select('precipitationCal'))

            def _fetch():
                total = gpm.sum().reduceRegion(
                    ee.Reducer.mean(), geometry=ee_geometry, scale=10000, maxPixels=1e9
                ).getInfo()
                return total

            stats = await asyncio.to_thread(_fetch)
            monthly_total = round(stats.get('precipitationCal', 50.0), 1) if stats else 50.0
            daily_avg = round(monthly_total / 30.0, 2)

            return {
                'daily_precipitation': daily_avg,
                'monthly_total': monthly_total,
                'precipitation_anomaly': round(monthly_total - 65.0, 1),
                'data_source': 'GPM IMERG (GEE)',
                'last_updated': end_date.strftime('%Y-%m-%d')
            }
        except GEEDataUnavailableError:
            raise
        except Exception as e:
            logger.error(f"Error fetching precipitation data from GEE: {e}")
            raise GEEDataUnavailableError(f"Precipitation fetch failed: {e}")

    
    async def get_dem_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get Digital Elevation Model data and slope/aspect from SRTM via GEE.
        """
        try:
            if not (self.gee_initialized and GEE_AVAILABLE):
                raise GEEDataUnavailableError("GEE not initialized for DEM")
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)
            srtm = ee.Image('USGS/SRTMGL1_003')
            elevation = srtm.select('elevation')
            slope_img = ee.Terrain.slope(elevation)
            aspect_img = ee.Terrain.aspect(elevation)

            def _fetch():
                kwargs = dict(geometry=ee_geometry, scale=30, maxPixels=1e9)
                elev_stats = elevation.reduceRegion(
                    ee.Reducer.mean().combine(ee.Reducer.max(), sharedInputs=True)
                    .combine(ee.Reducer.min(), sharedInputs=True), **kwargs
                ).getInfo()
                slope_stats = slope_img.reduceRegion(ee.Reducer.mean(), **kwargs).getInfo()
                max_slope = slope_img.reduceRegion(ee.Reducer.max(), **kwargs).getInfo()
                aspect_stats = aspect_img.reduceRegion(ee.Reducer.mean(), **kwargs).getInfo()
                return elev_stats, slope_stats, max_slope, aspect_stats

            elev_stats, slope_stats, max_slope_stats, aspect_stats = await asyncio.to_thread(_fetch)

            mean_elev = round(elev_stats.get('elevation_mean', 245.8), 1) if elev_stats else 245.8
            max_elev = round(elev_stats.get('elevation_max', mean_elev + 150), 1) if elev_stats else mean_elev + 150
            min_elev = round(elev_stats.get('elevation_min', mean_elev - 80), 1) if elev_stats else mean_elev - 80
            mean_slope = round(slope_stats.get('slope', 8.5), 2) if slope_stats else 8.5
            max_slope = round(max_slope_stats.get('slope', mean_slope * 3), 2) if max_slope_stats else mean_slope * 3
            aspect_deg = round(aspect_stats.get('aspect', 180.0), 1) if aspect_stats else 180.0
            directions = ['N','NE','E','SE','S','SW','W','NW','N']
            aspect_dir = directions[int((aspect_deg + 22.5) / 45.0) % 8]

            return {
                'mean_elevation': mean_elev,
                'max_elevation': max_elev,
                'min_elevation': min_elev,
                'mean_slope': mean_slope,
                'max_slope': max_slope,
                'aspect_dominant': aspect_dir,
                'data_source': 'SRTM 30m (GEE)'
            }
        except GEEDataUnavailableError:
            raise
        except Exception as e:
            logger.error(f"Error fetching DEM data from GEE: {e}")
            raise GEEDataUnavailableError(f"DEM fetch failed: {e}")

    
    async def get_land_cover_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get land cover classification from ESA WorldCover (10m) via GEE.
        """
        try:
            if not (self.gee_initialized and GEE_AVAILABLE):
                raise GEEDataUnavailableError("GEE not initialized for land cover")
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)
            worldcover = ee.ImageCollection('ESA/WorldCover/v200').first()

            class_names = {
                10: 'tree_cover', 20: 'shrubland', 30: 'grassland',
                40: 'cropland', 50: 'built_up', 60: 'bare_sparse',
                70: 'snow_ice', 80: 'water', 90: 'wetlands',
                95: 'mangroves', 100: 'moss_lichen'
            }

            def _fetch():
                area_img = ee.Image.pixelArea().addBands(worldcover.rename('class'))
                stats = area_img.reduceRegion(
                    reducer=ee.Reducer.sum().group(groupField=1, groupName='class'),
                    geometry=ee_geometry, scale=10, maxPixels=1e13
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            groups = stats.get('groups', [])
            total_area = sum(g.get('sum', 0) for g in groups)

            if total_area > 0:
                class_pcts = {}
                for g in groups:
                    cls_val = int(g.get('class', 0))
                    pct = round(g.get('sum', 0) / total_area * 100, 1)
                    name = class_names.get(cls_val, f'class_{cls_val}')
                    class_pcts[name] = pct

                dominant = max(class_pcts, key=class_pcts.get) if class_pcts else 'unknown'
                return {
                    'dominant_class': dominant.replace('_', ' '),
                    'forest_percentage': class_pcts.get('tree_cover', 0.0),
                    'urban_percentage': class_pcts.get('built_up', 0.0),
                    'agriculture_percentage': class_pcts.get('cropland', 0.0),
                    'water_percentage': class_pcts.get('water', 0.0),
                    'bare_soil_percentage': class_pcts.get('bare_sparse', 0.0),
                    'class_breakdown': class_pcts,
                    'data_source': 'ESA WorldCover v2 2021 (GEE)',
                    'year': 2021
                }
            raise GEEDataUnavailableError("Land cover query returned no area data")
        except GEEDataUnavailableError:
            raise
        except Exception as e:
            logger.error(f"Error fetching land cover data from GEE: {e}")
            raise GEEDataUnavailableError(f"Land cover fetch failed: {e}")

    
    async def get_soil_moisture_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Get soil moisture from NASA SMAP (SPL3SMP_E) via GEE.
        Note: SMAP has 9km resolution and near-daily revisit.
        """
        try:
            if not (self.gee_initialized and GEE_AVAILABLE):
                raise GEEDataUnavailableError("GEE not initialized for soil moisture")
            coords = aoi.coordinates[0]
            ee_geometry = ee.Geometry.Polygon(coords)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)

            smap = (ee.ImageCollection('NASA/SMAP/SPL3SMP_E/006')
                   .filterBounds(ee_geometry)
                   .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                   .select(['soil_moisture_am', 'soil_moisture_pm']))

            def _fetch():
                mean_img = smap.mean()
                stats = mean_img.reduceRegion(
                    ee.Reducer.mean(), geometry=ee_geometry, scale=9000, maxPixels=1e9
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            sm_am = stats.get('soil_moisture_am') if stats else None
            sm_pm = stats.get('soil_moisture_pm') if stats else None
            surface_sm = round((sm_am + sm_pm) / 2, 3) if (sm_am and sm_pm) else (sm_am or sm_pm or 0.35)
            root_zone_sm = round(surface_sm * 1.2, 3) if surface_sm else 0.42
            anomaly = round(surface_sm - 0.43, 3) if surface_sm else -0.08

            return {
                'surface_soil_moisture': surface_sm,
                'root_zone_moisture': root_zone_sm,
                'moisture_anomaly': anomaly,
                'data_source': 'NASA SMAP SPL3SMP_E (GEE)',
                'acquisition_date': end_date.strftime('%Y-%m-%d')
            }
        except GEEDataUnavailableError:
            raise
        except Exception as e:
            logger.error(f"Error fetching soil moisture data from GEE: {e}")
            raise GEEDataUnavailableError(f"Soil moisture fetch failed: {e}")


    # ------------------------------------------------------------------
    # New GEE dataset methods (Phase 2)
    # ------------------------------------------------------------------

    async def get_hansen_forest_change(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Hansen Global Forest Change v1.11 (UMD).
        Returns forest loss area (ha) since 2020, loss year distribution, tree cover 2000.
        """
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("Hansen Forest Change requires GEE credentials")
        try:
            import asyncio
            coords = aoi.coordinates[0]
            ee_geom = ee.Geometry.Polygon(coords)

            def _fetch():
                hansen = ee.Image("UMD/hansen/global_forest_change_2023_v1_11")
                loss_year = hansen.select("lossyear")
                tree_2000 = hansen.select("treecover2000")

                # Forest loss area since 2020 (lossyear > 20 means year 2020+)
                loss_recent = loss_year.gt(20).multiply(ee.Image.pixelArea())
                loss_total  = loss_year.gt(0 ).multiply(ee.Image.pixelArea())

                stats = ee.Image.cat([
                    loss_recent.rename("loss_2020_m2"),
                    loss_total.rename("loss_all_m2"),
                    tree_2000.rename("treecover_2000"),
                ]).reduceRegion(
                    reducer=ee.Reducer.sum().combine(ee.Reducer.mean(), sharedInputs=False),
                    geometry=ee_geom,
                    scale=30,
                    maxPixels=1e10,
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            loss_2020_ha = round((stats.get("loss_2020_m2_sum", 0) or 0) / 10_000, 2)
            loss_all_ha  = round((stats.get("loss_all_m2_sum", 0) or 0) / 10_000, 2)
            tree_2000    = round(stats.get("treecover_2000_mean", 0) or 0, 1)

            return {
                "forest_loss_ha_since_2020": loss_2020_ha,
                "forest_loss_ha_total": loss_all_ha,
                "tree_cover_2000_pct": tree_2000,
                "data_source": "Hansen GFC v1.11 (UMD via GEE)",
                "resolution_m": 30,
            }
        except Exception as e:
            logger.error(f"Hansen GFC fetch error: {e}")
            raise

    async def get_firms_fire_data(self, aoi: Polygon, days: int = 7) -> Dict[str, Any]:
        """
        NASA FIRMS active fires (MODIS + VIIRS) via GEE.
        Returns fire point count, total FRP, mean confidence.
        """
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("FIRMS requires GEE credentials")
        try:
            import asyncio
            coords = aoi.coordinates[0]
            ee_geom = ee.Geometry.Polygon(coords)
            end_date   = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            def _fetch():
                firms = (ee.ImageCollection("FIRMS")
                         .filterBounds(ee_geom)
                         .filterDate(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")))
                count = firms.size().getInfo()
                if count == 0:
                    return {"count": 0, "frp": 0.0, "confidence": None}
                mean_img = firms.select(["T21", "confidence"]).mean()
                stats = mean_img.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geom,
                    scale=375,
                    maxPixels=1e9,
                ).getInfo()
                return {
                    "count": count,
                    "frp": stats.get("T21"),       # Fire Radiative Power proxy
                    "confidence": stats.get("confidence"),
                }

            result = await asyncio.to_thread(_fetch)
            return {
                "active_fire_count": result["count"],
                "mean_frp_mw": round(result["frp"] or 0, 2),
                "mean_confidence": round(result["confidence"] or 0, 1),
                "period_days": days,
                "data_source": "NASA FIRMS MODIS/VIIRS (GEE)",
            }
        except Exception as e:
            logger.error(f"FIRMS fetch error: {e}")
            raise

    async def get_era5_wind(self, aoi: Polygon) -> Dict[str, Any]:
        """ERA5 daily mean 10m wind speed and direction (ECMWF/ERA5/DAILY)."""
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("ERA5 requires GEE credentials")
        try:
            import asyncio
            coords = aoi.coordinates[0]
            ee_geom = ee.Geometry.Polygon(coords)
            end_date   = datetime.utcnow()
            start_date = end_date - timedelta(days=7)

            def _fetch():
                era5 = (ee.ImageCollection("ECMWF/ERA5/DAILY")
                        .filterBounds(ee_geom)
                        .filterDate(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
                        .select(["u_component_of_wind_10m", "v_component_of_wind_10m",
                                 "maximum_2m_air_temperature", "minimum_2m_air_temperature"]))
                mean_img = era5.mean()
                stats = mean_img.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geom,
                    scale=27_750,
                    maxPixels=1e9,
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            u = stats.get("u_component_of_wind_10m") or 0.0
            v = stats.get("v_component_of_wind_10m") or 0.0
            speed     = float(np.sqrt(u**2 + v**2))
            direction = float(np.degrees(np.arctan2(-u, -v)) % 360)
            t_max_k   = stats.get("maximum_2m_air_temperature") or 298.0
            t_min_k   = stats.get("minimum_2m_air_temperature") or 288.0

            return {
                "wind_speed_ms": round(speed, 2),
                "wind_direction_deg": round(direction, 1),
                "air_temp_max_c": round(t_max_k - 273.15, 2),
                "air_temp_min_c": round(t_min_k - 273.15, 2),
                "data_source": "ERA5 ECMWF/ERA5/DAILY (GEE)",
                "resolution_km": 27.75,
            }
        except Exception as e:
            logger.error(f"ERA5 wind fetch error: {e}")
            raise

    async def get_jrc_surface_water(self, aoi: Polygon) -> Dict[str, Any]:
        """JRC Global Surface Water 1.4 — water occurrence, seasonality, transitions."""
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("JRC Surface Water requires GEE credentials")
        try:
            import asyncio
            coords = aoi.coordinates[0]
            ee_geom = ee.Geometry.Polygon(coords)

            def _fetch():
                jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
                stats = jrc.select(["occurrence", "seasonality", "transition"]).reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geom,
                    scale=30,
                    maxPixels=1e10,
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            return {
                "water_occurrence_pct": round(stats.get("occurrence") or 0, 2),
                "water_seasonality_months": round(stats.get("seasonality") or 0, 1),
                "transition_class": round(stats.get("transition") or 0, 1),
                "data_source": "JRC Global Surface Water v1.4 (GEE)",
                "resolution_m": 30,
            }
        except Exception as e:
            logger.error(f"JRC surface water fetch error: {e}")
            raise

    async def get_viirs_nightlights(self, aoi: Polygon) -> Dict[str, Any]:
        """VIIRS DNB monthly nighttime light radiance — settlement density proxy."""
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("VIIRS nightlights requires GEE credentials")
        try:
            import asyncio
            coords = aoi.coordinates[0]
            ee_geom = ee.Geometry.Polygon(coords)
            # Use latest available month
            end_date   = datetime.utcnow().replace(day=1) - timedelta(days=1)
            start_date = end_date.replace(day=1)

            def _fetch():
                viirs = (ee.ImageCollection("NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG")
                         .filterBounds(ee_geom)
                         .filterDate(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
                         .select("avg_rad"))
                if viirs.size().getInfo() == 0:
                    # Try previous 2 months
                    start_date2 = (start_date.replace(day=1) - timedelta(days=45)).replace(day=1)
                    viirs = (ee.ImageCollection("NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG")
                             .filterBounds(ee_geom)
                             .filterDate(start_date2.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
                             .select("avg_rad"))
                stats = viirs.mean().reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geom,
                    scale=500,
                    maxPixels=1e9,
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            radiance = stats.get("avg_rad") or 0.0
            # Settlement density proxy: radiance > 5 nW/cm²/sr suggests urban/peri-urban
            settlement_density = min(1.0, radiance / 50.0)
            return {
                "avg_radiance_nw": round(radiance, 4),
                "settlement_density_index": round(settlement_density, 4),
                "settlement_classification": (
                    "urban" if radiance > 20 else
                    "peri-urban" if radiance > 5 else
                    "rural" if radiance > 0.5 else "remote"
                ),
                "data_source": "VIIRS DNB Monthly V1 VCMCFG (GEE)",
                "resolution_m": 500,
            }
        except Exception as e:
            logger.error(f"VIIRS nightlights fetch error: {e}")
            raise

    async def get_sentinel1_flood_extent(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Sentinel-1 SAR IW GRD — flood extent via backscatter threshold.
        Water areas return very low VV backscatter (<-15dB).
        """
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("Sentinel-1 SAR requires GEE credentials")
        try:
            import asyncio
            coords = aoi.coordinates[0]
            ee_geom = ee.Geometry.Polygon(coords)
            end_date   = datetime.utcnow()
            start_date = end_date - timedelta(days=30)

            def _fetch():
                s1 = (ee.ImageCollection("COPERNICUS/S1_GRD")
                      .filterBounds(ee_geom)
                      .filterDate(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
                      .filter(ee.Filter.eq("instrumentMode", "IW"))
                      .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
                      .select("VV"))
                if s1.size().getInfo() == 0:
                    return None
                mean_vv = s1.mean()
                # Water mask: VV < -15 dB (typical threshold)
                water_mask = mean_vv.lt(-15)
                stats = ee.Image.cat([
                    mean_vv.rename("mean_vv"),
                    water_mask.multiply(ee.Image.pixelArea()).rename("water_area_m2"),
                ]).reduceRegion(
                    reducer=ee.Reducer.mean().combine(ee.Reducer.sum(), sharedInputs=False),
                    geometry=ee_geom,
                    scale=10,
                    maxPixels=1e10,
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            if not stats:
                return {
                    "flood_area_ha": 0.0,
                    "mean_vv_db": None,
                    "data_availability": "no_scenes",
                    "data_source": "Sentinel-1 SAR IW GRD (GEE)",
                }
            mean_vv   = stats.get("mean_vv_mean")
            water_m2  = stats.get("water_area_m2_sum") or 0.0
            flood_ha  = round(water_m2 / 10_000, 2)
            return {
                "flood_area_ha": flood_ha,
                "mean_vv_db": round(mean_vv, 2) if mean_vv is not None else None,
                "data_availability": "available",
                "data_source": "Sentinel-1 SAR IW GRD (GEE)",
                "resolution_m": 10,
            }
        except Exception as e:
            logger.error(f"Sentinel-1 SAR fetch error: {e}")
            raise

    async def get_modis_et(self, aoi: Polygon) -> Dict[str, Any]:
        """MODIS MOD16A2 8-day evapotranspiration — drought / water stress indicator."""
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("MODIS ET requires GEE credentials")
        try:
            import asyncio
            coords = aoi.coordinates[0]
            ee_geom = ee.Geometry.Polygon(coords)
            end_date   = datetime.utcnow()
            start_date = end_date - timedelta(days=30)

            def _fetch():
                mod16 = (ee.ImageCollection("MODIS/006/MOD16A2")
                         .filterBounds(ee_geom)
                         .filterDate(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
                         .select(["ET", "LE", "PET"]))
                mean_img = mod16.mean()
                stats = mean_img.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=ee_geom,
                    scale=500,
                    maxPixels=1e9,
                ).getInfo()
                return stats

            stats = await asyncio.to_thread(_fetch)
            # MODIS ET scale factor: 0.1 kg/m²/8day
            et_raw  = stats.get("ET")  or 0
            pet_raw = stats.get("PET") or 0
            et_mm   = round(et_raw  * 0.1, 2)
            pet_mm  = round(pet_raw * 0.1, 2)
            evaporative_fraction = round(et_mm / pet_mm, 3) if pet_mm > 0 else 0.0
            return {
                "et_mm_30day":  et_mm,
                "pet_mm_30day": pet_mm,
                "evaporative_fraction": evaporative_fraction,
                "water_stress": evaporative_fraction < 0.4,
                "data_source": "MODIS MOD16A2 (GEE)",
                "resolution_m": 500,
            }
        except Exception as e:
            logger.error(f"MODIS ET fetch error: {e}")
            raise

    async def get_aoi_extended_data(self, aoi: Polygon) -> Dict[str, Any]:
        """
        Fetch all GEE datasets concurrently and merge into a single comprehensive dict.
        Raises GEEDataUnavailableError if GEE is not initialized.
        """
        if not self.gee_initialized or not GEE_AVAILABLE:
            from app.core.exceptions import GEEDataUnavailableError
            raise GEEDataUnavailableError("GEE credentials required for extended data")

        import asyncio

        # Core AOI data + new datasets concurrently
        (core, hansen, firms, era5, jrc, viirs, sentinel1, et) = await asyncio.gather(
            self.get_aoi_data(aoi),
            self.get_hansen_forest_change(aoi),
            self.get_firms_fire_data(aoi),
            self.get_era5_wind(aoi),
            self.get_jrc_surface_water(aoi),
            self.get_viirs_nightlights(aoi),
            self.get_sentinel1_flood_extent(aoi),
            self.get_modis_et(aoi),
            return_exceptions=True,
        )

        merged = dict(core) if isinstance(core, dict) else {}

        def _safe_update(key: str, result):
            if isinstance(result, Exception):
                logger.warning(f"Extended data source '{key}' failed: {result}")
            elif isinstance(result, dict):
                merged[key] = result

        _safe_update("hansen_forest_change", hansen)
        _safe_update("firms_fires", firms)
        _safe_update("era5_wind", era5)
        _safe_update("jrc_surface_water", jrc)
        _safe_update("viirs_nightlights", viirs)
        _safe_update("sentinel1_flood", sentinel1)
        _safe_update("modis_et", et)

        # Promote commonly-used fields to top level for backward compat
        if isinstance(era5, dict):
            merged.setdefault("wind_speed", era5.get("wind_speed_ms"))
            merged.setdefault("wind_direction", era5.get("wind_direction_deg"))
            merged.setdefault("air_temp_max", era5.get("air_temp_max_c"))
        if isinstance(viirs, dict):
            merged.setdefault("settlement_distance", 1.0 / max(viirs.get("settlement_density_index", 0.01), 0.01))
        if isinstance(firms, dict):
            merged["active_fire_count"] = firms.get("active_fire_count", 0)

        return merged


