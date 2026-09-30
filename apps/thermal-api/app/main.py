import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import (
    API_V1_STR,
    CORS_ORIGINS,
    FACILITY_CACHE_PATH,
    PROJECT_NAME,
    STORAGE_DIR,
)

logger = logging.getLogger("main")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=PROJECT_NAME,
    description="Enterprise Backend API for NTRO Thermal Intelligence GIS Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend web-dashboard integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 API Router
app.include_router(api_router, prefix=API_V1_STR)


@app.on_event("startup")
def startup_load_model_and_history():
    """
    Load ML classification model and cache history data once at startup.
    """
    try:
        import sys
        thermal_dir = (STORAGE_DIR.parent / "thermal").resolve()
        if str(thermal_dir) not in sys.path:
            sys.path.insert(0, str(thermal_dir))
        from pipeline import get_cached_history, get_cached_model
        logger.info("Preloading ML classification model and caching history...")
        get_cached_model()
        get_cached_history()
        logger.info("ML model and history cache loaded successfully.")
    except Exception as e:
        logger.warning(f"Could not preload ML classification model at startup: {e}")


@app.get("/")
def root():
    return {
        "system": PROJECT_NAME,
        "status": "online",
        "storage_dir": str(STORAGE_DIR),
        "endpoints": {
            "spatial_facilities": f"{API_V1_STR}/spatial/facilities",
            "spatial_refresh": f"{API_V1_STR}/spatial/refresh",
            "docs": "/docs",
        },
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "facility_cache_exists": FACILITY_CACHE_PATH.exists(),
        "storage_directory": str(STORAGE_DIR),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
