from fastapi import APIRouter, HTTPException
from app.services import arcgis_service, airview_service

router = APIRouter()


@router.get("/arcgis", summary="Get Air Quality Data from ArcGIS")
def get_arcgis_air_quality():
    data = arcgis_service.get_air_quality_data()
    if data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch data from ArcGIS.")
    return data


@router.get("/airview", summary="Get Air Quality Data from Google AirView")
def get_google_airview_data():
    data = airview_service.get_airview_data()
    if data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch data from Google AirView.")
    return data
