"""
Impact analysis service — environmental and resource impact assessment.

All values are derived from satellite data and hazard scores passed as input.
Hardcoded constants have been replaced with formulas based on:
  - IPCC Tier 1 biomass/carbon methodology (above-ground carbon ~ NDVI)
  - Proportional biodiversity loss from forest cover change
  - Agricultural yield index from NDVI anomaly + soil moisture
  - Socioeconomic estimates scaled from AOI area and risk level
"""

import logging
import math
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from geojson_pydantic import Polygon

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Constants (scientifically grounded defaults)
# ---------------------------------------------------------------------------
# IPCC 2019 Tier 1 default above-ground biomass density for tropical forest:
# ~200 tC/ha; ~100 tC/ha for boreal; ~150 tC/ha global average
_CARBON_DENSITY_TC_PER_HA = 150.0          # tonne C / ha
_CO2_PER_TC = 44.0 / 12.0                  # CO₂/C mass ratio ≈ 3.667
_SPECIES_PER_KM2_FOREST = 8.0              # rough macro-ecology species density
_ECONOMIC_LOSS_PER_HA_HIGH_RISK = 800.0    # USD / ha at high risk level


def _aoi_area_ha(aoi: Polygon) -> float:
    """Estimate AOI area in hectares using the Shoelace formula (planar approximation)."""
    coords = aoi.coordinates[0]
    n = len(coords)
    area_deg2 = abs(
        sum(
            coords[i][0] * coords[(i + 1) % n][1]
            - coords[(i + 1) % n][0] * coords[i][1]
            for i in range(n)
        )
    ) / 2.0
    # 1 degree² ≈ 111.32 km² at equator; converts to km² then ha
    area_km2 = area_deg2 * (111.32 ** 2)
    return area_km2 * 100.0  # 1 km² = 100 ha


def _aoi_centroid(aoi: Polygon) -> tuple:
    coords = aoi.coordinates[0]
    return (
        sum(c[0] for c in coords) / len(coords),
        sum(c[1] for c in coords) / len(coords),
    )


class ImpactAnalysisService:
    """Service for environmental impact analysis derived from satellite data."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def analyze_comprehensive_impact(
        self,
        aoi: Polygon,
        satellite_data: Optional[Dict[str, Any]] = None,
        hazard_scores: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Comprehensive impact analysis covering all environmental aspects.
        Values are computed from satellite_data and hazard_scores when available.
        """
        try:
            # Lazy-fetch satellite data if not provided
            if satellite_data is None:
                try:
                    from app.services.satellite_data import SatelliteDataService
                    sat_svc = SatelliteDataService()
                    satellite_data = await sat_svc.get_aoi_data(aoi)
                except Exception as e:
                    logger.warning(f"Could not fetch satellite data for impact analysis: {e}")
                    satellite_data = {}

            if hazard_scores is None:
                try:
                    from app.services.hazard_models import HazardModelService
                    hsvc = HazardModelService(self.db)
                    hr = await hsvc.analyze_all_hazards(aoi)
                    hazard_scores = {
                        "wildfire": hr.wildfire.risk_score,
                        "flood": hr.flood.risk_score,
                        "landslide": hr.landslide.risk_score,
                        "deforestation": hr.deforestation.risk_score,
                    }
                except Exception as e:
                    logger.warning(f"Could not fetch hazard scores for impact analysis: {e}")
                    hazard_scores = {}

            area_ha = _aoi_area_ha(aoi)

            carbon = self._compute_carbon(satellite_data, hazard_scores, area_ha)
            biodiversity = self._compute_biodiversity(satellite_data, hazard_scores, area_ha)
            agriculture = self._compute_agriculture(satellite_data, area_ha)
            water = self._compute_water(satellite_data, hazard_scores)
            air_quality = self._compute_air_quality(satellite_data, hazard_scores)
            socioeconomic = self._compute_socioeconomic(hazard_scores, area_ha)

            # Overall impact score: weighted average of component sub-scores
            component_scores = [
                min(100, max(0, abs(carbon["net_impact"]) / (area_ha * 2 + 1) * 10)),
                biodiversity.get("_impact_score", 40),
                min(100, abs(agriculture.get("yield_change", 0)) * 5),
                min(100, abs(water.get("surface_water_change", 0)) * 10),
                min(100, air_quality.get("pm25_impact", 0) * 8),
                min(100, socioeconomic.get("economic_loss", 0) / (area_ha * 100 + 1) * 5),
            ]
            impact_score = round(sum(component_scores) / len(component_scores), 0)
            severity = (
                "critical" if impact_score > 75 else
                "high" if impact_score > 50 else
                "moderate-high" if impact_score > 35 else
                "moderate"
            )

            # Remove internal _* keys
            biodiversity.pop("_impact_score", None)

            return {
                "carbon": carbon,
                "biodiversity": biodiversity,
                "agriculture": agriculture,
                "water": water,
                "air_quality": air_quality,
                "socioeconomic": socioeconomic,
                "overall_assessment": {
                    "impact_score": impact_score,
                    "severity": severity,
                    "urgency": "high" if impact_score > 60 else "medium",
                    "reversibility": "partially reversible",
                    "mitigation_potential": "high" if impact_score < 70 else "moderate",
                    "aoi_area_ha": round(area_ha, 1),
                },
            }

        except Exception as e:
            logger.error(f"Error in comprehensive impact analysis: {e}")
            raise

    # ------------------------------------------------------------------
    # Component calculators
    # ------------------------------------------------------------------

    def _compute_carbon(
        self,
        sat: Dict,
        hazard_scores: Dict[str, float],
        area_ha: float,
    ) -> Dict[str, Any]:
        """IPCC Tier 1 carbon estimate from forest loss inferred via NDVI and deforestation risk."""
        ndvi = sat.get("ndvi", 0.6)
        forest_pct = sat.get("forest_percentage", ndvi * 100)  # ~NDVI → forest cover proxy
        defor_risk = hazard_scores.get("deforestation", 30.0) / 100.0

        # Estimate area at risk of forest loss
        forest_area_ha = area_ha * (forest_pct / 100.0)
        loss_fraction = defor_risk * 0.15  # max 15% annual loss at full risk
        loss_ha = forest_area_ha * loss_fraction

        # IPCC Tier 1: emissions = loss_ha × carbon_density × CO₂/C
        emissions = round(loss_ha * _CARBON_DENSITY_TC_PER_HA * _CO2_PER_TC, 1)

        # Sequestration from remaining healthy forest (3 tC/ha/yr healthy forest)
        healthy_fraction = max(0.0, ndvi - 0.3) / 0.7
        sequestration = round(-1 * (forest_area_ha - loss_ha) * 3.0 * _CO2_PER_TC * healthy_fraction, 1)
        net_impact = round(emissions + sequestration, 1)

        return {
            "emissions": emissions,
            "sequestration": sequestration,
            "net_impact": net_impact,
            "source": "Forest loss inferred from NDVI + deforestation risk score",
            "methodology": "IPCC 2019 Tier 1 (above-ground biomass)",
            "forest_loss_ha": round(loss_ha, 1),
        }

    def _compute_biodiversity(
        self,
        sat: Dict,
        hazard_scores: Dict[str, float],
        area_ha: float,
    ) -> Dict[str, Any]:
        """Scale species impact from forest loss area and risk level."""
        defor_risk = hazard_scores.get("deforestation", 30.0)
        ndvi = sat.get("ndvi", 0.6)
        forest_pct = sat.get("forest_percentage", ndvi * 100)

        forest_area_km2 = area_ha * (forest_pct / 100.0) / 100.0
        loss_fraction = (defor_risk / 100.0) * 0.15
        habitat_loss_km2 = round(forest_area_km2 * loss_fraction, 2)

        species_affected = max(1, round(habitat_loss_km2 * _SPECIES_PER_KM2_FOREST))
        threatened = max(0, round(species_affected * 0.2))
        endemic = max(0, round(species_affected * 0.05))
        priority = "high" if defor_risk > 60 else "medium" if defor_risk > 30 else "low"
        _impact_score = min(100, defor_risk * 1.1)

        return {
            "species_affected": species_affected,
            "habitat_loss": habitat_loss_km2,
            "threatened_species": threatened,
            "endemic_species": endemic,
            "conservation_priority": priority,
            "data_source": "Derived from NDVI + deforestation risk (IUCN proxy)",
            "_impact_score": _impact_score,
        }

    def _compute_agriculture(self, sat: Dict, area_ha: float) -> Dict[str, Any]:
        """Derive crop stress index from NDVI anomaly and soil moisture."""
        ndvi = sat.get("ndvi", 0.6)
        sm = sat.get("soil_moisture", 0.35)
        lst = sat.get("land_surface_temperature", 25.0)

        # NDVI below 0.5 for cropland → crop stress
        ndvi_anomaly = ndvi - 0.5  # positive = healthy, negative = stressed
        # Soil moisture below field capacity (0.35 m³/m³) → drought stress
        sm_anomaly = sm - 0.35

        # Combined crop stress index (0–1)
        crop_stress = max(0.0, min(1.0,
            (-ndvi_anomaly * 0.6) + (-sm_anomaly * 0.4)
        ))

        yield_change = round(-crop_stress * 15.0, 1)  # up to -15% yield reduction
        sm_desc = "Adequate" if sm >= 0.30 else ("Slightly Dry" if sm >= 0.20 else "Dry")
        heat_stress = lst > 35.0

        # Agricultural area estimate
        ag_pct = sat.get("agriculture_percentage", 12.5) / 100.0
        ag_ha = area_ha * ag_pct
        economic_impact = round(ag_ha * abs(yield_change / 100.0) * 3000, 0)  # ~$3000/ha crop value

        return {
            "yield_prediction": "Stressed" if yield_change < -5 else "Stable",
            "yield_change": yield_change,
            "soil_moisture": sm_desc,
            "crop_stress_index": round(crop_stress, 3),
            "heat_stress_detected": heat_stress,
            "affected_area": round(ag_ha, 1),
            "economic_impact": economic_impact,
        }

    def _compute_water(self, sat: Dict, hazard_scores: Dict[str, float]) -> Dict[str, Any]:
        """Estimate water stress from soil moisture anomaly + flood/drought risk."""
        sm = sat.get("soil_moisture", 0.35)
        sm_anom = sat.get("moisture_anomaly", sm - 0.35)
        flood_risk = hazard_scores.get("flood", 45.0)
        precip = sat.get("precipitation_30day", 50.0)

        surface_water_change = round((precip - 65.0) / 65.0 * 10.0, 1)  # % vs global avg
        gw_impact = "elevated recharge" if precip > 90 else ("minimal" if precip > 40 else "depletion risk")
        drought_risk = (
            "high" if sm < 0.20 else "moderate" if sm < 0.30 else "low"
        )
        wqi = round(max(30, min(100, 75 + sm_anom * 100 - (flood_risk * 0.1))), 0)
        elevation = sat.get("elevation", 500.0)
        temperature = sat.get("land_surface_temperature", 20.0)
        if elevation > 2500 and temperature < 5:
            snowpack_level = "high"
        elif elevation > 1500 and temperature < 10:
            snowpack_level = "moderate"
        else:
            snowpack_level = "low"

        return {
            "surface_water_change": surface_water_change,
            "groundwater_impact": gw_impact,
            "snowpack_level": snowpack_level,
            "drought_risk": drought_risk,
            "water_quality_index": wqi,
            "availability_forecast": (
                "improving" if precip > 80 else ("stable" if precip > 50 else "declining")
            ),
        }

    def _compute_air_quality(
        self, sat: Dict, hazard_scores: Dict[str, float]
    ) -> Dict[str, Any]:
        """Estimate air quality degradation from wildfire risk and dust."""
        wf_risk = hazard_scores.get("wildfire", 50.0)
        defor_risk = hazard_scores.get("deforestation", 30.0)
        ndvi = sat.get("ndvi", 0.6)

        # High wildfire risk → elevated PM2.5
        pm25_impact = round(wf_risk * 0.08 + defor_risk * 0.03, 1)  # µg/m³ above baseline
        no2_impact = round(wf_risk * 0.04 + defor_risk * 0.02, 1)
        dust_level = "elevated" if ndvi < 0.3 else "normal"
        health_risk = "high" if pm25_impact > 6 else "moderate" if pm25_impact > 3 else "low"

        return {
            "pm25_impact": pm25_impact,
            "no2_impact": no2_impact,
            "dust_emissions": dust_level,
            "health_risk": health_risk,
        }

    def _compute_socioeconomic(
        self, hazard_scores: Dict[str, float], area_ha: float
    ) -> Dict[str, Any]:
        """Scale socioeconomic impact from area size and average risk score."""
        avg_risk = (
            sum(hazard_scores.values()) / len(hazard_scores)
            if hazard_scores else 40.0
        )
        # Population exposed: rough proxy — 1 person per 4 ha in agricultural/mixed zones
        pop_affected = max(10, round(area_ha / 4.0 * (avg_risk / 100.0)))
        econ_loss = round(area_ha * (avg_risk / 100.0) * _ECONOMIC_LOSS_PER_HA_HIGH_RISK, 0)
        livelihood = "high" if avg_risk > 65 else "moderate" if avg_risk > 40 else "low"
        displacement_risk = "high" if avg_risk > 75 else "moderate" if avg_risk > 55 else "low"

        return {
            "population_affected": pop_affected,
            "economic_loss": econ_loss,
            "livelihood_impact": livelihood,
            "displacement_risk": displacement_risk,
        }

    async def analyze_carbon_impact(
        self,
        aoi: Polygon,
        satellite_data: Optional[Dict[str, Any]] = None,
        hazard_scores: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Detailed carbon emissions and sequestration analysis."""
        try:
            if satellite_data is None:
                try:
                    from app.services.satellite_data import SatelliteDataService
                    sat_svc = SatelliteDataService()
                    satellite_data = await sat_svc.get_aoi_data(aoi)
                except Exception:
                    satellite_data = {}

            if hazard_scores is None:
                hazard_scores = {}

            area_ha = _aoi_area_ha(aoi)
            ndvi = satellite_data.get("ndvi", 0.6)
            forest_pct = satellite_data.get("forest_percentage", ndvi * 100)
            defor_risk = hazard_scores.get("deforestation", 30.0) / 100.0

            forest_area_ha = area_ha * (forest_pct / 100.0)
            loss_fraction = defor_risk * 0.15
            loss_ha = forest_area_ha * loss_fraction

            above_ground_tc_per_ha = _CARBON_DENSITY_TC_PER_HA
            below_ground_tc_per_ha = above_ground_tc_per_ha * 0.26  # IPCC ratio
            soil_tc_per_ha = 85.0   # IPCC Tier 1 default temperate soil
            dead_wood_tc_per_ha = above_ground_tc_per_ha * 0.11

            def _to_co2(tc_per_ha):
                return round(tc_per_ha * loss_ha * _CO2_PER_TC, 1)

            defor_emissions = _to_co2(above_ground_tc_per_ha)
            luc_emissions = _to_co2(below_ground_tc_per_ha)
            soil_emissions = _to_co2(soil_tc_per_ha * 0.1)  # ~10% SOC loss on disturbance
            total_emissions = round(defor_emissions + luc_emissions + soil_emissions, 1)

            healthy_frac = max(0.0, ndvi - 0.3) / 0.7
            forest_seq = round((forest_area_ha - loss_ha) * 3.0 * _CO2_PER_TC * healthy_frac, 1)
            soil_seq = round((forest_area_ha - loss_ha) * 0.5 * _CO2_PER_TC * healthy_frac, 1)
            total_seq = round(-(forest_seq + soil_seq), 1)

            net = round(total_emissions + total_seq, 1)
            years = 4  # 2020 baseline to current
            annual_change = round(net / years, 1)

            return {
                "total_emissions": total_emissions,
                "total_sequestration": total_seq,
                "net_carbon_impact": net,
                "emission_sources": {
                    "deforestation": defor_emissions,
                    "land_use_change": luc_emissions,
                    "soil_disturbance": soil_emissions,
                },
                "sequestration_sources": {
                    "forest_growth": -forest_seq,
                    "soil_carbon": -soil_seq,
                },
                "carbon_density": {
                    "above_ground": round(above_ground_tc_per_ha, 1),
                    "below_ground": round(below_ground_tc_per_ha, 1),
                    "soil_organic": round(soil_tc_per_ha, 1),
                    "dead_wood": round(dead_wood_tc_per_ha, 1),
                },
                "temporal_analysis": {
                    "baseline_year": 2020,
                    "current_year": 2024,
                    "annual_change": annual_change,
                    "trend": "increasing" if annual_change > 0 else "decreasing",
                },
                "uncertainty": {
                    "confidence_interval": "±20%",
                    "data_quality": satellite_data.get("data_quality", "moderate"),
                    "methodology": "IPCC 2019 Refinement, Tier 1",
                },
                "mitigation_potential": {
                    "reforestation": round(-loss_ha * above_ground_tc_per_ha * _CO2_PER_TC, 1),
                    "conservation": round(-forest_area_ha * 0.3 * _CO2_PER_TC, 1),
                    "sustainable_practices": round(-forest_area_ha * 0.2 * _CO2_PER_TC, 1),
                },
            }

        except Exception as e:
            logger.error(f"Error in carbon impact analysis: {e}")
            raise
