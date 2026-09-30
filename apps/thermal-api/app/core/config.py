from pathlib import Path
from typing import List

# Base directory for the thermal-api application (apps/thermal-api)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Root-level storage directory (../../storage)
STORAGE_DIR = (BASE_DIR.parent.parent / "storage").resolve()
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Cache file paths in root storage/
# Cache file paths in root storage/
FACILITY_CACHE_PATH = STORAGE_DIR / "facility_cache.json"
THERMAL_CACHE_PATH = STORAGE_DIR / "thermal_cache.json"
FIRMS_CSV_CACHE_PATH = STORAGE_DIR / "SUOMI_VIIRS_C2_South_Asia_24h.csv"
FIRMS_NOAA20_CSV_CACHE_PATH = STORAGE_DIR / "J1_VIIRS_C2_South_Asia_24h.csv"
FIRMS_UNIFIED_CSV_PATH = STORAGE_DIR / "NASA_FIRMS_VIIRS_India_Unified_24h.csv"

# User NASA FIRMS MAP_KEY
NASA_FIRMS_MAP_KEY = "3acfb11beac89bf419b61c3faf16e1f6"
INDIA_API_BBOX = "68,6,98,37"

# Method 1: Key-Free Public Near-Real-Time CSV URLs
FIRMS_SOUTH_ASIA_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_24h.csv"
FIRMS_NOAA20_SOUTH_ASIA_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_24h.csv"

# Method 2: NASA Custom Area REST API URLs (Multi-Sensor 2-Day Temporal Window)
FIRMS_API_SUOMI_URL = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{NASA_FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/{INDIA_API_BBOX}/2"
FIRMS_API_NOAA20_URL = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{NASA_FIRMS_MAP_KEY}/VIIRS_NOAA20_NRT/{INDIA_API_BBOX}/2"
FIRMS_API_MODIS_URL = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{NASA_FIRMS_MAP_KEY}/MODIS_NRT/{INDIA_API_BBOX}/2"

# Bounding box covering strategic Indian industrial, energy, and refinery corridors
DEFAULT_BBOX: List[float] = [20.0000, 69.0000, 29.8000, 88.0000]

# Primary and fallback Overpass API endpoints for maximum operational uptime
OVERPASS_ENDPOINTS: List[str] = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]

# Comprehensive Overpass Query for Heat-Producing Heavy Industrial Infra
OVERPASS_QUERY = f"""
[out:json][timeout:30];
(
  node["industrial"~"refinery|steel_works|metallurgy|chemical"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
  way["industrial"~"refinery|steel_works|metallurgy|chemical"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
  node["power"="plant"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
  way["power"="plant"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
  node["landuse"="quarry"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
  way["landuse"="quarry"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
  node["industrial"="mine"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
  way["industrial"="mine"]({DEFAULT_BBOX[0]}, {DEFAULT_BBOX[1]}, {DEFAULT_BBOX[2]}, {DEFAULT_BBOX[3]});
);
out center;
"""

# API Metadata
PROJECT_NAME = "NTRO Thermal Intelligence Platform"
API_V1_STR = "/api/v1"
CORS_ORIGINS = ["*"]
