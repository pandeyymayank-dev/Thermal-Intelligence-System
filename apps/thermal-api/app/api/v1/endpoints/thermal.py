from typing import Optional
from fastapi import APIRouter, Query, Response
from app.services.firms_service import fetch_firms_anomalies

router = APIRouter()


@router.get("/hotspots")
async def get_thermal_hotspots(
    response: Response,
    day_range: int = 1,
    source: str = "ALL_VIIRS_NRT",
    refresh: bool = Query(False, description="Force refresh from live NASA FIRMS API")
):
    """
    Pass 1 Endpoint: Returns raw NASA FIRMS satellite thermal hotspot detections
    instantly for non-blocking Leaflet base rendering.
    Supports refresh=true with strict 8-second timeout and instant fallback cache.
    """
    data, is_cache = await fetch_firms_anomalies(source=source, day_range=day_range, force_refresh=refresh)
    if is_cache:
        response.headers["X-Data-Source"] = "cache"
    else:
        response.headers["X-Data-Source"] = "live-firms"
    return data


@router.get("/anomalies")
async def get_thermal_anomalies(
    response: Response,
    day_range: int = 1,
    source: str = "ALL_VIIRS_NRT",
    refresh: bool = Query(False, description="Force refresh from live NASA FIRMS API")
):
    """
    Alias for /hotspots.
    """
    return await get_thermal_hotspots(response=response, day_range=day_range, source=source, refresh=refresh)
