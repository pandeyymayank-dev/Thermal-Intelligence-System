from fastapi import APIRouter

from app.api.v1.endpoints import spatial, thermal, inference

api_router = APIRouter()

# Core Step 1 Spatial & OSM Facility Layer
api_router.include_router(spatial.router, prefix="/osm", tags=["OSM Facilities"])
api_router.include_router(spatial.router, prefix="/spatial", tags=["Spatial & Facilities"])
# Backwards-compatible alias for /map
api_router.include_router(spatial.router, prefix="/map", tags=["Spatial & Facilities (Legacy)"])

# Phase 2 Placeholders
api_router.include_router(thermal.router, prefix="/thermal", tags=["Thermal Anomalies (FIRMS)"])
api_router.include_router(inference.router, prefix="/inference", tags=["AI Classification Engine"])
