"""
Database models for impact analysis
"""

from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.core.database import Base


class ImpactAnalysis(Base):
    """Model for storing comprehensive impact analysis results"""
    __tablename__ = "impact_analysis"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)  # GeoJSON polygon
    
    # Overall assessment
    impact_score = Column(Float, nullable=False)  # 0-100 scale
    severity = Column(String(20))  # low, moderate, moderate-high, high
    urgency = Column(String(20))   # low, medium, high
    reversibility = Column(String(30))  # reversible, partially reversible, irreversible
    mitigation_potential = Column(String(20))  # low, medium, high
    
    # Carbon impact
    carbon_emissions = Column(Float)  # metric tons CO2
    carbon_sequestration = Column(Float)  # metric tons CO2
    net_carbon_impact = Column(Float)  # metric tons CO2
    
    # Biodiversity impact
    species_affected = Column(Integer)
    habitat_loss = Column(Float)  # square kilometers
    threatened_species = Column(Integer)
    endemic_species = Column(Integer)
    conservation_priority = Column(String(20))
    
    # Agricultural impact
    yield_change = Column(Float)  # percentage
    crop_stress_index = Column(Float)
    affected_agricultural_area = Column(Float)  # hectares
    economic_impact = Column(Float)  # USD
    
    # Water impact
    surface_water_change = Column(Float)  # percentage
    water_quality_index = Column(Float)
    drought_risk = Column(String(20))
    
    # Air quality impact
    pm25_impact = Column(Float)  # µg/m³ change
    no2_impact = Column(Float)   # µg/m³ change
    health_risk = Column(String(20))
    
    # Socioeconomic impact
    population_affected = Column(Integer)
    economic_loss = Column(Float)  # USD
    livelihood_impact = Column(String(20))
    displacement_risk = Column(String(20))
    
    # Analysis metadata
    analysis_date = Column(DateTime, default=datetime.utcnow)
    model_version = Column(String(20))
    data_sources = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CarbonAnalysis(Base):
    """Model for detailed carbon impact analysis"""
    __tablename__ = "carbon_analysis"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Total carbon impact
    total_emissions = Column(Float, nullable=False)  # metric tons CO2
    total_sequestration = Column(Float, nullable=False)  # metric tons CO2
    net_carbon_impact = Column(Float, nullable=False)  # metric tons CO2
    
    # Emission sources
    deforestation_emissions = Column(Float)
    land_use_change_emissions = Column(Float)
    soil_disturbance_emissions = Column(Float)
    
    # Sequestration sources
    forest_growth_sequestration = Column(Float)
    soil_carbon_sequestration = Column(Float)
    
    # Carbon density data
    above_ground_carbon = Column(Float)  # tons C/ha
    below_ground_carbon = Column(Float)  # tons C/ha
    soil_organic_carbon = Column(Float)  # tons C/ha
    dead_wood_carbon = Column(Float)     # tons C/ha
    
    # Temporal analysis
    baseline_year = Column(Integer)
    current_year = Column(Integer)
    annual_change = Column(Float)  # tons CO2/year
    trend = Column(String(20))     # increasing, decreasing, stable
    
    # Uncertainty and quality
    confidence_interval = Column(String(20))  # e.g., "±15%"
    data_quality = Column(String(20))         # excellent, good, fair, poor
    methodology = Column(String(100))
    
    # Mitigation potential
    reforestation_potential = Column(Float)      # potential sequestration
    conservation_potential = Column(Float)       # potential sequestration
    sustainable_practices_potential = Column(Float)  # potential sequestration
    total_mitigation_potential = Column(Float)   # potential sequestration
    
    created_at = Column(DateTime, default=datetime.utcnow)


class BiodiversityImpact(Base):
    """Model for biodiversity impact assessment"""
    __tablename__ = "biodiversity_impact"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Species impact
    total_species_affected = Column(Integer)
    threatened_species_affected = Column(Integer)
    endemic_species_affected = Column(Integer)
    critically_endangered_species = Column(Integer)
    
    # Habitat impact
    total_habitat_loss = Column(Float)  # square kilometers
    forest_habitat_loss = Column(Float)
    wetland_habitat_loss = Column(Float)
    grassland_habitat_loss = Column(Float)
    
    # Conservation status
    protected_area_impact = Column(Float)  # square kilometers
    conservation_priority = Column(String(20))  # low, medium, high, critical
    
    # Ecosystem services impact
    pollination_services_impact = Column(Float)
    water_regulation_impact = Column(Float)
    carbon_storage_impact = Column(Float)
    
    # Species details
    affected_species_list = Column(JSON)  # List of species with details
    habitat_connectivity_impact = Column(Float)
    
    # Data sources
    iucn_data_used = Column(Boolean, default=False)
    map_of_life_data_used = Column(Boolean, default=False)
    local_surveys_used = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class AgricultureImpact(Base):
    """Model for agricultural impact assessment"""
    __tablename__ = "agriculture_impact"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Yield impact
    overall_yield_change = Column(Float)  # percentage
    crop_specific_impacts = Column(JSON)  # Dict of crop types and impacts
    
    # Soil health
    soil_moisture_change = Column(Float)
    soil_erosion_risk = Column(Float)
    soil_fertility_impact = Column(Float)
    
    # Crop stress indicators
    crop_stress_index = Column(Float)
    drought_stress = Column(Float)
    heat_stress = Column(Float)
    pest_disease_risk = Column(Float)
    
    # Economic impact
    total_economic_impact = Column(Float)  # USD
    affected_agricultural_area = Column(Float)  # hectares
    farmers_affected = Column(Integer)
    
    # Food security
    food_production_change = Column(Float)  # percentage
    local_food_security_impact = Column(String(20))  # low, medium, high
    
    # Adaptation measures
    irrigation_needs = Column(Float)
    crop_diversification_potential = Column(Float)
    climate_resilient_varieties_needed = Column(Boolean)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class WaterResourceImpact(Base):
    """Model for water resource impact assessment"""
    __tablename__ = "water_resource_impact"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aoi_geometry = Column(JSON, nullable=False)
    
    # Surface water impact
    surface_water_change = Column(Float)  # percentage
    river_flow_change = Column(Float)     # percentage
    lake_level_change = Column(Float)     # meters
    
    # Groundwater impact
    groundwater_level_change = Column(Float)  # meters
    groundwater_quality_impact = Column(String(20))  # minimal, moderate, severe
    
    # Water quality
    water_quality_index = Column(Float)
    turbidity_change = Column(Float)
    pollution_level_change = Column(Float)
    
    # Availability and demand
    water_availability_change = Column(Float)  # percentage
    water_demand_change = Column(Float)        # percentage
    water_stress_level = Column(String(20))    # low, moderate, high, extreme
    
    # Drought and flood risk
    drought_risk_change = Column(String(20))   # decreased, stable, increased
    flood_risk_change = Column(String(20))     # decreased, stable, increased
    
    # Ecosystem impact
    wetland_impact = Column(Float)  # square kilometers
    aquatic_ecosystem_health = Column(Float)  # index 0-100
    
    # Human impact
    population_water_access_impact = Column(Integer)
    agricultural_water_impact = Column(Float)  # percentage
    industrial_water_impact = Column(Float)    # percentage
    
    created_at = Column(DateTime, default=datetime.utcnow)
