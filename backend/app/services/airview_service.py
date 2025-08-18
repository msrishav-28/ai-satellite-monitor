from google.cloud import bigquery
import pandas as pd
from typing import Optional, Dict, Any


def get_airview_data() -> Optional[Dict[str, Any]]:
    """Fetches Google AirView data from a BigQuery table.

    NOTE: This function uses placeholder table reference. Replace the query with
    the actual GCP project.dataset.table containing AirView data.

    Returns a GeoJSON FeatureCollection dict or None on failure.
    """
    try:
        client = bigquery.Client()
        query = """
            SELECT latitude, longitude, aqi
            FROM `your-gcp-project.your_dataset.airview_table`
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            LIMIT 1000
        """
        df = client.query(query).to_dataframe()
        if df.empty:
            return {"type": "FeatureCollection", "features": []}

        features = [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [row.longitude, row.latitude]},
                "properties": {"aqi": row.aqi},
            }
            for _, row in df.iterrows()
        ]
        return {"type": "FeatureCollection", "features": features}
    except Exception as e:  # pragma: no cover - external service
        print(f"Error fetching AirView data: {e}")
        return None
