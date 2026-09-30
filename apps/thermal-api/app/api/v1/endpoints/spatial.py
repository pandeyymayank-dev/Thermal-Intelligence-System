import logging
from fastapi import APIRouter, HTTPException

from app.services.osm_service import (
    fetch_and_cache_facilities,
    load_cache,
)

logger = logging.getLogger("api.spatial")
router = APIRouter()


@router.get("/facilities")
async def get_facilities():
    """
    Return GeoJSON FeatureCollection of strategic facilities from facility_cache.json.
    If the cache does not exist, runs the Overpass fetcher first.
    """
    cached_data = load_cache()
    if cached_data is not None:
        logger.info("Serving facilities directly from storage/facility_cache.json")
        return cached_data

    logger.info("Cache not found in storage. Triggering Overpass fetch...")
    data = await fetch_and_cache_facilities(force_refresh=False)
    return data


@router.post("/refresh")
async def refresh_facilities():
    """
    Re-query Overpass API with NWR, overwrite storage/facility_cache.json,
    and return updated GeoJSON.
    """
    try:
        logger.info("Manual refresh triggered via POST /api/v1/spatial/refresh")
        updated_data = await fetch_and_cache_facilities(force_refresh=True)
        return updated_data
    except Exception as e:
        logger.error(f"Failed to refresh facilities: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to refresh OSM facilities: {str(e)}"
        )
