"""
Hazard prediction models service
Integrates with satellite data and ML models for multi-hazard analysis
"""

import logging
import asyncio
import numpy as np
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from geojson_pydantic import Polygon

from app.schemas.hazards import (
    HazardAnalysisResponse, WildfireRisk, FloodRisk, LandslideRisk,
    DeforestationRisk, HeatwaveRisk, CycloneRisk, HazardType, RiskLevel, TrendDirection
)
from app.services.satellite_data import SatelliteDataService
from app.services.ml_models import MLModelService

logger = logging.getLogger(__name__)


class HazardModelService:
    """Service for running hazard prediction models"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.satellite_service = SatelliteDataService()
        self.ml_service = MLModelService()
    
    async def analyze_all_hazards(self, aoi: Polygon) -> HazardAnalysisResponse:
        """
        Run all hazard prediction models for the given AOI
        """
        try:
            # Get satellite data for the AOI
            satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            # Run all hazard models concurrently
            wildfire_task = self.analyze_wildfire_risk(aoi, satellite_data)
            flood_task = self.analyze_flood_risk(aoi, satellite_data)
            landslide_task = self.analyze_landslide_risk(aoi, satellite_data)
            deforestation_task = self.analyze_deforestation_risk(aoi, satellite_data)
            heatwave_task = self.analyze_heatwave_risk(aoi, satellite_data)
            cyclone_task = self.analyze_cyclone_risk(aoi, satellite_data)
            
            # Wait for all analyses to complete
            results = await asyncio.gather(
                wildfire_task, flood_task, landslide_task,
                deforestation_task, heatwave_task, cyclone_task
            )
            
            wildfire, flood, landslide, deforestation, heatwave, cyclone = results
            
            # Calculate overall risk score
            overall_risk = self._calculate_overall_risk([
                wildfire.risk_score, flood.risk_score, landslide.risk_score,
                deforestation.risk_score, heatwave.risk_score, cyclone.risk_score
            ])
            
            # Identify priority hazards
            priority_hazards = self._identify_priority_hazards([
                wildfire, flood, landslide, deforestation, heatwave, cyclone
            ])
            
            return HazardAnalysisResponse(
                wildfire=wildfire,
                flood=flood,
                landslide=landslide,
                deforestation=deforestation,
                heatwave=heatwave,
                cyclone=cyclone,
                overall_risk_score=overall_risk,
                priority_hazards=priority_hazards
            )
            
        except Exception as e:
            logger.error(f"Error in hazard analysis: {e}")
            raise
    
    async def analyze_wildfire_risk(self, aoi: Polygon, satellite_data: Dict = None) -> WildfireRisk:
        """
        Analyze wildfire ignition and spread risk
        
        Input variables:
        - Land Surface Temperature (LST)
        - Fuel moisture content
        - Vegetation type/fuel load maps
        - Wind speed/direction
        - Topographic slope and aspect
        - Lightning strike data
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            # Extract relevant features for wildfire model
            features = {
                'lst': satellite_data.get('land_surface_temperature', 25.0),
                'ndvi': satellite_data.get('ndvi', 0.6),
                'wind_speed': satellite_data.get('wind_speed', 5.0),
                'humidity': satellite_data.get('humidity', 60.0),
                'slope': satellite_data.get('slope', 10.0),
                'fuel_load': satellite_data.get('fuel_load', 0.7),
                'precipitation': satellite_data.get('precipitation', satellite_data.get('precipitation_30day', 5.0)),
                'fuel_moisture': satellite_data.get('fuel_moisture', 20.0)
            }
            
            # Run wildfire prediction model
            prediction = await self.ml_service.predict_wildfire_risk(features)
            
            return WildfireRisk(
                hazard_type=HazardType.WILDFIRE,
                risk_score=prediction['risk_score'],
                risk_level=self._get_risk_level(prediction['risk_score']),
                trend=TrendDirection.UP if prediction['risk_score'] > 60 else TrendDirection.STABLE,
                confidence=prediction['confidence'],
                factors=prediction['contributing_factors'],
                recommendations=prediction['recommendations'],
                ignition_probability=prediction['ignition_probability'],
                spread_rate=prediction['spread_rate'],
                fuel_moisture=prediction['fuel_moisture'],
                fire_weather_index=prediction['fire_weather_index']
            )
            
        except Exception as e:
            logger.error(f"Error in wildfire analysis: {e}")
            raise
    
    async def analyze_flood_risk(self, aoi: Polygon, satellite_data: Dict = None) -> FloodRisk:
        """
        Analyze flood susceptibility
        
        Input variables:
        - Precipitation data (GPM)
        - Digital Elevation Models (DEM)
        - River network data
        - Land use/land cover type
        - Soil saturation models
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            features = {
                'precipitation': satellite_data.get('precipitation', satellite_data.get('precipitation_30day', 50.0)),
                'elevation': satellite_data.get('elevation', 100.0),
                'slope': satellite_data.get('slope', 5.0),
                'land_cover': satellite_data.get('land_cover', satellite_data.get('dominant_land_cover', 'urban')),
                'soil_moisture': satellite_data.get('soil_moisture', satellite_data.get('surface_soil_moisture', 0.3)),
                'drainage_density': satellite_data.get('drainage_density', max(0.1, satellite_data.get('water_percentage', 5.0) / 20.0)),
                'urban_percentage': satellite_data.get('urban_percentage', 15.0)
            }
            
            prediction = await self.ml_service.predict_flood_risk(features)
            
            return FloodRisk(
                hazard_type=HazardType.FLOOD,
                risk_score=prediction['risk_score'],
                risk_level=self._get_risk_level(prediction['risk_score']),
                trend=TrendDirection.DOWN,
                confidence=prediction['confidence'],
                factors=prediction['contributing_factors'],
                recommendations=prediction['recommendations'],
                return_period=prediction['return_period'],
                max_depth=prediction['max_depth'],
                affected_area=prediction['affected_area'],
                drainage_capacity=prediction['drainage_capacity']
            )
            
        except Exception as e:
            logger.error(f"Error in flood analysis: {e}")
            raise
    
    async def analyze_landslide_risk(self, aoi: Polygon, satellite_data: Dict = None) -> LandslideRisk:
        """
        Analyze landslide susceptibility
        
        Input variables:
        - Slope angle
        - Soil type data
        - Land cover
        - Precipitation intensity
        - Proximity to fault lines/roads
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)
            
            features = {
                'slope_angle': satellite_data.get('slope', 15.0),
                'soil_type': satellite_data.get('soil_type', 'clay'),
                'land_cover': satellite_data.get('land_cover', satellite_data.get('dominant_land_cover', 'forest')),
                'precipitation': satellite_data.get('precipitation', satellite_data.get('precipitation_30day', 100.0)),
                'fault_distance': satellite_data.get('fault_distance', 5.0),
                'road_distance': satellite_data.get('road_distance', 2.0)
            }
            
            prediction = await self.ml_service.predict_landslide_risk(features)
            
            return LandslideRisk(
                hazard_type=HazardType.LANDSLIDE,
                risk_score=prediction['risk_score'],
                risk_level=self._get_risk_level(prediction['risk_score']),
                trend=TrendDirection.STABLE,
                confidence=prediction['confidence'],
                factors=prediction['contributing_factors'],
                recommendations=prediction['recommendations'],
                slope_stability=prediction['slope_stability'],
                soil_saturation=prediction['soil_saturation'],
                trigger_threshold=prediction['trigger_threshold']
            )
            
        except Exception as e:
            logger.error(f"Error in landslide analysis: {e}")
            raise
    
    def _get_risk_level(self, risk_score: float) -> RiskLevel:
        """Convert risk score to risk level"""
        if risk_score < 25:
            return RiskLevel.LOW
        elif risk_score < 50:
            return RiskLevel.MODERATE
        elif risk_score < 75:
            return RiskLevel.HIGH
        else:
            return RiskLevel.EXTREME
    
    def _calculate_overall_risk(self, risk_scores: List[float]) -> float:
        """Calculate weighted overall risk score"""
        # Weight different hazards based on severity and likelihood
        weights = [0.2, 0.15, 0.15, 0.1, 0.2, 0.2]  # wildfire, flood, landslide, deforestation, heatwave, cyclone
        weighted_sum = sum(score * weight for score, weight in zip(risk_scores, weights))
        return min(100.0, weighted_sum)
    
    def _identify_priority_hazards(self, hazards: List) -> List[HazardType]:
        """Identify hazards requiring immediate attention"""
        priority = []
        for hazard in hazards:
            if hazard.risk_score >= 75:
                priority.append(hazard.hazard_type)
        return priority[:3]  # Return top 3 priority hazards

    async def analyze_deforestation_risk(self, aoi: Polygon, satellite_data: Dict = None) -> DeforestationRisk:
        """
        Deforestation risk computed from:
        - Hansen GFC: recent forest loss rate since 2020
        - NDVI trend: current vs baseline
        - VIIRS nightlights: road/settlement proximity proxy
        - ESA WorldCover: forest/non-forest fraction
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)

            # Pull extended data for Hansen GFC + VIIRS
            from app.core.exceptions import GEEDataUnavailableError
            hansen_data: Dict = {}
            viirs_data:  Dict = {}
            try:
                hansen_data = await self.satellite_service.get_hansen_forest_change(aoi)
            except (GEEDataUnavailableError, Exception) as e:
                logger.warning(f"Hansen GFC unavailable: {e}")
            try:
                viirs_data = await self.satellite_service.get_viirs_nightlights(aoi)
            except (GEEDataUnavailableError, Exception) as e:
                logger.warning(f"VIIRS nightlights unavailable: {e}")

            # --- Derived metrics ---
            forest_pct       = satellite_data.get("forest_percentage", 50.0)
            ndvi             = satellite_data.get("ndvi", 0.6)
            loss_ha_recent   = hansen_data.get("forest_loss_ha_since_2020", 0.0)
            loss_ha_total    = hansen_data.get("forest_loss_ha_total", 0.0)
            treecover_2000   = hansen_data.get("tree_cover_2000_pct", forest_pct)
            radiance         = viirs_data.get("avg_radiance_nw", 1.0)
            settle_class     = viirs_data.get("settlement_classification", "rural")

            # Clearing probability: recent loss as fraction of original cover
            orig_forest_ha   = max(treecover_2000, 1.0)
            clearing_prob    = min(1.0, loss_ha_recent / (orig_forest_ha * 100 + 1))

            # Road proximity proxy from VIIRS radiance (higher = closer to roads)
            road_proximity_km = max(0.5, 10.0 / max(radiance, 0.01) * 0.5)

            # Risk score (0-100)
            # Base: how much forest cover remains vs original
            cover_loss_risk  = min(100, max(0, (treecover_2000 - forest_pct) * 2))
            # Recent clearing rate amplifier
            clearing_risk    = min(100, clearing_prob * 500)  # 0.2 = 100
            # NDVI vegetation stress
            ndvi_risk        = min(100, max(0, (0.7 - ndvi) * 200))
            # Settlement pressure
            settle_risk      = {"urban": 80, "peri-urban": 50, "rural": 20, "remote": 5}.get(settle_class, 20)

            risk_score = min(100, (
                cover_loss_risk * 0.35 +
                clearing_risk  * 0.30 +
                ndvi_risk      * 0.20 +
                settle_risk    * 0.15
            ))

            factors = []
            if cover_loss_risk > 40: factors.append(f"Forest cover reduced from {treecover_2000:.0f}% to {forest_pct:.0f}%")
            if clearing_risk   > 30: factors.append(f"{loss_ha_recent:.0f} ha lost since 2020")
            if ndvi_risk       > 30: factors.append("Vegetation stress detected (low NDVI)")
            if settle_risk     > 40: factors.append(f"{settle_class.title()} development pressure")
            if not factors: factors = ["Low deforestation pressure observed"]

            recs = []
            if risk_score > 70: recs = ["Immediate forest monitoring programme", "Engage law enforcement for illegal clearing", "Community boundary demarcation"]
            elif risk_score > 40: recs = ["Enhanced NDVI monitoring", "Review land-use permits", "Establish buffer zones"]
            else: recs = ["Routine satellite monitoring", "Community forest stewardship"]

            return DeforestationRisk(
                hazard_type=HazardType.DEFORESTATION,
                risk_score=round(risk_score, 1),
                risk_level=self._get_risk_level(risk_score),
                trend=TrendDirection.UP if clearing_risk > 20 else TrendDirection.STABLE,
                confidence=80.0 if hansen_data else 65.0,
                factors=factors,
                recommendations=recs,
                clearing_probability=round(clearing_prob, 4),
                road_proximity=round(road_proximity_km, 2),
                protection_status=("Protected" if forest_pct > 70 else "Partially Protected" if forest_pct > 40 else "Unprotected")
            )
        except Exception as e:
            logger.error(f"Deforestation analysis error: {e}")
            raise

    async def analyze_heatwave_risk(self, aoi: Polygon, satellite_data: Dict = None) -> HeatwaveRisk:
        """
        Heatwave risk computed from:
        - MODIS LST: max temperature, 30-day hot-day count
        - ERA5: air temperature, wind speed (stagnation factor)
        - ESA WorldCover: urban heat island amplification
        - NWS Heat Index formula applied to LST + humidity
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)

            from app.core.exceptions import GEEDataUnavailableError
            era5_data: Dict = {}
            try:
                era5_data = await self.satellite_service.get_era5_wind(aoi)
            except (GEEDataUnavailableError, Exception) as e:
                logger.warning(f"ERA5 unavailable for heatwave: {e}")

            # --- Extract key variables ---
            lst_mean   = satellite_data.get("land_surface_temperature", 28.0)
            lst_max    = satellite_data.get("lst_max", lst_mean + 5.0)
            humidity   = satellite_data.get("humidity", satellite_data.get("relative_humidity", 55.0))
            urban_pct  = satellite_data.get("urban_percentage", 15.0)
            wind_spd   = era5_data.get("wind_speed_ms", satellite_data.get("wind_speed", 3.0))
            t_max_era5 = era5_data.get("air_temp_max_c", lst_max - 5.0)  # ERA5 2m < LST

            # NWS Steadman Heat Index (°C) — Rothfusz regression
            T  = lst_max  # °C (LST as surface proxy)
            RH = humidity
            HI = (-8.78469475556 +
                   1.61139411  * T +
                   2.33854883889 * RH +
                  -0.14611605 * T * RH +
                  -0.012308094 * T**2 +
                  -0.0164248277778 * RH**2 +
                   0.002211732 * T**2 * RH +
                   0.00072546 * T * RH**2 +
                  -0.000003582 * T**2 * RH**2)
            heat_index = round(float(HI), 1)

            # Urban heat island adds 2-8°C to surface temps
            uhi_offset    = (urban_pct / 100.0) * 6.0  # up to +6°C for fully urban
            effective_tmax = round(lst_max + uhi_offset, 1)

            # Duration: number of days LST > 35°C in 30-day window (proxy via anomaly)
            lst_anomaly = satellite_data.get("temperature_anomaly", 0.0)
            hot_day_count = max(0, int((effective_tmax - 33.0) * 2)) if effective_tmax > 33 else 0

            # Low wind → heat accumulates → stagnation penalty
            stagnation_risk = min(30, max(0, (5 - wind_spd) * 6))

            # Composite risk score
            temp_risk  = min(100, max(0, (effective_tmax - 30) * 5))
            hi_risk    = min(100, max(0, (heat_index - 35) * 4))
            risk_score = min(100, temp_risk * 0.50 + hi_risk * 0.30 + stagnation_risk * 0.20)

            factors = []
            if effective_tmax > 38: factors.append(f"Extreme surface temp {effective_tmax:.1f}°C (UHI adjusted)")
            if heat_index     > 40: factors.append(f"Dangerous heat index {heat_index:.1f}°C")
            if humidity       > 70: factors.append("High humidity amplifying heat stress")
            if wind_spd       < 2:  factors.append("Atmospheric stagnation — poor heat dispersion")
            if urban_pct      > 40: factors.append("Urban heat island effect")
            if not factors:         factors = ["Moderate thermal conditions"]

            recs = []
            if risk_score > 75: recs = ["Issue heat emergency alert", "Open cooling centres", "Restrict outdoor labour in peak hours", "Increase emergency medical standby"]
            elif risk_score > 50: recs = ["Public heat advisory", "Monitor vulnerable populations", "Increase water availability"]
            else: recs = ["Routine heat monitoring", "Standard public health advisory"]

            return HeatwaveRisk(
                hazard_type=HazardType.HEATWAVE,
                risk_score=round(risk_score, 1),
                risk_level=self._get_risk_level(risk_score),
                trend=TrendDirection.UP if lst_anomaly > 2 else TrendDirection.STABLE,
                confidence=85.0 if era5_data else 70.0,
                factors=factors,
                recommendations=recs,
                max_temperature=effective_tmax,
                duration_days=hot_day_count,
                heat_index=heat_index,
            )
        except Exception as e:
            logger.error(f"Heatwave analysis error: {e}")
            raise

    async def analyze_cyclone_risk(self, aoi: Polygon, satellite_data: Dict = None) -> CycloneRisk:
        """
        Cyclone risk computed from:
        - Latitude: cyclone genesis occurs 5°-20° from equator
        - MODIS LST over water bodies (JRC water mask) as SST proxy
        - ERA5 wind speed → Saffir-Simpson category
        - Historical basin frequency weighting
        """
        try:
            if satellite_data is None:
                satellite_data = await self.satellite_service.get_aoi_data(aoi)

            from app.core.exceptions import GEEDataUnavailableError
            era5_data: Dict = {}
            jrc_data:  Dict = {}
            try:
                era5_data = await self.satellite_service.get_era5_wind(aoi)
            except (GEEDataUnavailableError, Exception) as e:
                logger.warning(f"ERA5 unavailable for cyclone: {e}")
            try:
                jrc_data = await self.satellite_service.get_jrc_surface_water(aoi)
            except (GEEDataUnavailableError, Exception) as e:
                logger.warning(f"JRC unavailable for cyclone: {e}")

            # --- AOI centroid latitude for genesis probability ---
            coords = aoi.coordinates[0]
            lat = float(np.mean([c[1] for c in coords]))
            lon = float(np.mean([c[0] for c in coords]))

            # Latitude factor: peak probability 10°-15°, drops off toward equator and poles
            abs_lat = abs(lat)
            lat_factor = max(0.0, 1.0 - abs(abs_lat - 12.5) / 12.5) if abs_lat <= 25 else 0.0

            # Ocean basin historical frequency weighting
            # (storms/year per 5° grid roughly: W Pacific ~25, E Pacific ~15, N Atlantic ~12, etc.)
            basin_freq = (
                1.0  if (lon > 100 and lon < 180 and lat > 0)   else  # W Pacific
                0.8  if (lon > 180 or lon < -80 and lat > 0)    else  # E Pacific
                0.65 if (lon > -100 and lon < -20 and lat > 0)  else  # N Atlantic
                0.4  if (lon > 30 and lon < 100 and lat < 0)    else  # S Indian
                0.3
            )

            # SST proxy: use MODIS LST mean (not ideal, but best available without GHRSST in GEE)
            lst_mean = satellite_data.get("land_surface_temperature", 28.0)
            # SST typically 3-8°C lower than land LST; cyclones need SST > 26°C
            sst_est  = max(0.0, lst_mean - 5.0)
            sst_factor = min(1.0, max(0.0, (sst_est - 24.0) / 6.0))  # 0 at 24°C, 1 at 30°C

            # Wind shear from ERA5 (high shear suppresses cyclone development)
            wind_speed_10m = era5_data.get("wind_speed_ms", 5.0)
            # High wind shear at low levels correlates with strong surface winds
            wind_shear_factor = max(0.0, 1.0 - (wind_speed_10m - 8) / 20) if wind_speed_10m > 8 else 1.0

            # Track probability = product of all favorable conditions
            track_probability = round(lat_factor * sst_factor * basin_freq * wind_shear_factor, 4)

            # Saffir-Simpson intensity estimate from wind speed
            wind_kmh = wind_speed_10m * 3.6
            if wind_kmh >= 252:   cat, cat_wind = 5, wind_speed_10m
            elif wind_kmh >= 209: cat, cat_wind = 4, wind_speed_10m
            elif wind_kmh >= 178: cat, cat_wind = 3, wind_speed_10m
            elif wind_kmh >= 154: cat, cat_wind = 2, wind_speed_10m
            elif wind_kmh >= 119: cat, cat_wind = 1, wind_speed_10m
            else:                  cat, cat_wind = 0, wind_speed_10m

            # Storm surge estimate (NOAA empirical: ~0.3m/Saffur cat)
            storm_surge = round(cat * 0.8 + 0.2, 1)

            # Final risk score
            risk_score = float(np.clip(track_probability * 100 * 1.5, 0, 100))

            factors = []
            if lat_factor > 0.5:    factors.append(f"Latitude {lat:.1f}° in prime cyclone genesis zone")
            if sst_factor > 0.5:    factors.append(f"Estimated SST {sst_est:.1f}°C (favourable for intensification)")
            if basin_freq > 0.6:    factors.append("High historical cyclone basin frequency")
            if wind_shear_factor < 0.5: factors.append("Low wind shear favours development")
            if not factors:         factors = ["Low cyclone risk — unfavourable conditions"]

            recs = []
            if risk_score > 60: recs = ["Issue cyclone watch for coastal communities", "Pre-position emergency supplies", "Activate evacuation plans"]
            elif risk_score > 30: recs = ["Monitor tropical weather systems", "Prepare disaster response plans"]
            else: recs = ["Maintain standard tropical weather watch", "Seasonal preparedness review"]

            return CycloneRisk(
                hazard_type=HazardType.CYCLONE,
                risk_score=round(risk_score, 1),
                risk_level=self._get_risk_level(risk_score),
                trend=TrendDirection.UP if sst_factor > 0.7 else TrendDirection.STABLE,
                confidence=75.0 if era5_data else 55.0,
                factors=factors,
                recommendations=recs,
                intensity_category=cat,
                wind_speed=round(cat_wind, 1),
                storm_surge=storm_surge,
                track_probability=track_probability,
            )
        except Exception as e:
            logger.error(f"Cyclone analysis error: {e}")
            raise

    async def _extract_landslide_features(self, aoi: Polygon, satellite_data: Dict = None) -> Dict[str, Any]:
        """Extract features for landslide susceptibility analysis"""
        try:
            # Get AOI centroid for point-based analysis
            centroid = self._get_aoi_centroid(aoi)

            # Extract topographic features
            elevation = satellite_data.get('elevation', 500.0) if satellite_data else 500.0
            slope = satellite_data.get('slope', 15.0) if satellite_data else 15.0
            aspect = satellite_data.get('aspect', 180.0) if satellite_data else 180.0

            # Extract geological features
            geology_type = satellite_data.get('geology_type', 'sedimentary') if satellite_data else 'sedimentary'

            # Extract soil features
            soil_clay_content = satellite_data.get('soil_clay_content', 25.0) if satellite_data else 25.0
            soil_sand_content = satellite_data.get('soil_sand_content', 35.0) if satellite_data else 35.0

            # Extract land cover
            land_cover = satellite_data.get('land_cover', 'mixed') if satellite_data else 'mixed'

            # Extract precipitation data
            precipitation_annual = satellite_data.get('precipitation_annual', 1000.0) if satellite_data else 1000.0
            precipitation_intensity = satellite_data.get('precipitation_intensity', 50.0) if satellite_data else 50.0

            # Extract vegetation index
            ndvi = satellite_data.get('ndvi', 0.6) if satellite_data else 0.6

            # Distance features (simplified)
            distance_to_faults = 10.0  # km
            distance_to_roads = 2.0    # km

            # Additional topographic features
            drainage_density = 0.5
            contributing_area = 100.0  # m²
            slope_length = 100.0       # m
            slope_width = 50.0         # m

            features = {
                'elevation': elevation,
                'slope': slope,
                'aspect': aspect,
                'geology_type': geology_type,
                'soil_clay_content': soil_clay_content,
                'soil_sand_content': soil_sand_content,
                'land_cover': land_cover,
                'precipitation_annual': precipitation_annual,
                'precipitation_intensity': precipitation_intensity,
                'ndvi': ndvi,
                'distance_to_faults': distance_to_faults,
                'distance_to_roads': distance_to_roads,
                'drainage_density': drainage_density,
                'contributing_area': contributing_area,
                'slope_length': slope_length,
                'slope_width': slope_width,
                'soil_cohesion': 20.0,      # kPa
                'friction_angle': 30.0,     # degrees
                'soil_permeability': 10.0,  # mm/hr
                'max_elevation': elevation + 100,
                'min_elevation': elevation - 100,
                'basin_length': 1000.0      # m
            }

            return features

        except Exception as e:
            logger.error(f"Error extracting landslide features: {e}")
            # Return default features
            return {
                'elevation': 500.0,
                'slope': 15.0,
                'aspect': 180.0,
                'geology_type': 'sedimentary',
                'soil_clay_content': 25.0,
                'soil_sand_content': 35.0,
                'land_cover': 'mixed',
                'precipitation_annual': 1000.0,
                'precipitation_intensity': 50.0,
                'ndvi': 0.6,
                'distance_to_faults': 10.0,
                'distance_to_roads': 2.0,
                'drainage_density': 0.5,
                'contributing_area': 100.0,
                'slope_length': 100.0,
                'slope_width': 50.0,
                'soil_cohesion': 20.0,
                'friction_angle': 30.0,
                'soil_permeability': 10.0,
                'max_elevation': 600.0,
                'min_elevation': 400.0,
                'basin_length': 1000.0
            }

    def _get_aoi_centroid(self, aoi: Polygon) -> tuple[float, float]:
        """Return a simple centroid for helper methods that need point coordinates."""
        coords = aoi.coordinates[0]
        lon = sum(point[0] for point in coords) / len(coords)
        lat = sum(point[1] for point in coords) / len(coords)
        return lon, lat
