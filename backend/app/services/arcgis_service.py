from arcgis.gis import GIS


def get_air_quality_data():
    """
    Fetches air quality data from ArcGIS Online Living Atlas.
    Uses the USA Air Quality Index (AQI) layer.
    Returns GeoJSON dict or None on failure.
    """
    try:
        gis = GIS()  # anonymous public access
        # Item ID for USA - Air Quality Index (AQI)
        aqi_item = gis.content.get("4a521a2b84744214890696a018f3a82f")
        if aqi_item and aqi_item.layers:
            flayer = aqi_item.layers[0]
            # GeoJSON output
            return flayer.query(where="1=1", out_fields="*", return_geometry=True, as_geojson=True)
        return None
    except Exception as e:  # pragma: no cover - network/external dependency
        print(f"Error fetching ArcGIS data: {e}")
        return None
