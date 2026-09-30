import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import (
    DEFAULT_BBOX,
    FACILITY_CACHE_PATH,
    OVERPASS_ENDPOINTS,
    OVERPASS_QUERY,
)

logger = logging.getLogger("osm_service")
logging.basicConfig(level=logging.INFO)

# High-fidelity strategic Indian heat-producing seed facilities across the 4 key categories
STRATEGIC_SEED_FACILITIES = [
    # 1. Refineries & Chemical Hubs
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [77.7040, 27.3140],
        },
        "properties": {
            "name": "Indian Oil (IOCL) Mathura Refinery",
            "facility_name": "Indian Oil (IOCL) Mathura Refinery",
            "category": "Refinery / Chemical",
            "operator": "Indian Oil Corporation Limited",
            "osm_id": 900101,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [76.8780, 29.3780],
        },
        "properties": {
            "name": "IOCL Panipat Mega Refinery & Petrochemical Complex",
            "facility_name": "IOCL Panipat Mega Refinery & Petrochemical Complex",
            "category": "Refinery / Chemical",
            "operator": "Indian Oil Corporation Limited",
            "osm_id": 900102,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [70.0420, 22.3960],
        },
        "properties": {
            "name": "Reliance Jamnagar Mega Refinery & Petrochemicals",
            "facility_name": "Reliance Jamnagar Mega Refinery & Petrochemicals",
            "category": "Refinery / Chemical",
            "operator": "Reliance Industries Limited",
            "osm_id": 900103,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [69.7220, 22.3280],
        },
        "properties": {
            "name": "Nayara Energy Vadinar Refinery Complex",
            "facility_name": "Nayara Energy Vadinar Refinery Complex",
            "category": "Refinery / Chemical",
            "operator": "Nayara Energy",
            "osm_id": 900104,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [85.9740, 25.4240],
        },
        "properties": {
            "name": "Indian Oil Barauni Refinery Complex",
            "facility_name": "Indian Oil Barauni Refinery Complex",
            "category": "Refinery / Chemical",
            "operator": "Indian Oil Corporation Limited",
            "osm_id": 900105,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [72.6580, 21.1580],
        },
        "properties": {
            "name": "Hazira Heavy Engineering & Petrochemical Zone",
            "facility_name": "Hazira Heavy Engineering & Petrochemical Zone",
            "category": "Refinery / Chemical",
            "operator": "L&T / ONGC / Reliance",
            "osm_id": 900110,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },

    # 2. Steel & Metallurgy Plants
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [86.1940, 22.7940],
        },
        "properties": {
            "name": "Tata Steel Integrated Works Jamshedpur",
            "facility_name": "Tata Steel Integrated Works Jamshedpur",
            "category": "Steel Plant",
            "operator": "Tata Steel",
            "osm_id": 900109,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [81.3860, 21.1850],
        },
        "properties": {
            "name": "SAIL Bhilai Steel Plant (Blast Furnaces)",
            "facility_name": "SAIL Bhilai Steel Plant (Blast Furnaces)",
            "category": "Steel Plant",
            "operator": "Steel Authority of India Limited (SAIL)",
            "osm_id": 900111,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [86.1360, 23.6690],
        },
        "properties": {
            "name": "SAIL Bokaro Steel Plant",
            "facility_name": "SAIL Bokaro Steel Plant",
            "category": "Steel Plant",
            "operator": "Steel Authority of India Limited (SAIL)",
            "osm_id": 900112,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [84.8620, 22.2210],
        },
        "properties": {
            "name": "SAIL Rourkela Steel Plant",
            "facility_name": "SAIL Rourkela Steel Plant",
            "category": "Steel Plant",
            "operator": "Steel Authority of India Limited (SAIL)",
            "osm_id": 900113,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },

    # 3. Coal & Thermal Power Plants
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [77.5460, 28.6000],
        },
        "properties": {
            "name": "NTPC Dadri Super Thermal Power Station",
            "facility_name": "NTPC Dadri Super Thermal Power Station",
            "category": "Coal/Thermal Power Plant",
            "operator": "NTPC Limited",
            "osm_id": 900106,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [69.5280, 22.8280],
        },
        "properties": {
            "name": "Mundra Ultra Mega Thermal Power Complex (4,620 MW)",
            "facility_name": "Mundra Ultra Mega Thermal Power Complex (4,620 MW)",
            "category": "Coal/Thermal Power Plant",
            "operator": "Adani Power / Tata Power",
            "osm_id": 900107,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [82.6700, 24.1040],
        },
        "properties": {
            "name": "Vindhyachal Super Thermal Power Station (4,760 MW)",
            "facility_name": "Vindhyachal Super Thermal Power Station (4,760 MW)",
            "category": "Coal/Thermal Power Plant",
            "operator": "NTPC Limited",
            "osm_id": 900108,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [82.6880, 22.3780],
        },
        "properties": {
            "name": "NTPC Korba Super Thermal Power Plant",
            "facility_name": "NTPC Korba Super Thermal Power Plant",
            "category": "Coal/Thermal Power Plant",
            "operator": "NTPC Limited",
            "osm_id": 900114,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },

    # 4. Coal Mines & Heavy Mineral Quarries
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [86.4170, 23.7540],
        },
        "properties": {
            "name": "BCCL Jharia Coalfield & Open Cast Mines",
            "facility_name": "BCCL Jharia Coalfield & Open Cast Mines",
            "category": "Coal Mine / Quarry",
            "operator": "Bharat Coking Coal Limited (BCCL)",
            "osm_id": 900115,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [82.6320, 24.1560],
        },
        "properties": {
            "name": "NCL Singrauli Mega Coalfields & Colliery",
            "facility_name": "NCL Singrauli Mega Coalfields & Colliery",
            "category": "Coal Mine / Quarry",
            "operator": "Northern Coalfields Limited (NCL)",
            "osm_id": 900116,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [85.1840, 20.9520],
        },
        "properties": {
            "name": "MCL Talcher Open Cast Mega Coal Mine",
            "facility_name": "MCL Talcher Open Cast Mega Coal Mine",
            "category": "Coal Mine / Quarry",
            "operator": "Mahanadi Coalfields Limited (MCL)",
            "osm_id": 900117,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [82.5930, 22.3420],
        },
        "properties": {
            "name": "SECL Gevra Mega Open Cast Mine (Asia's Largest)",
            "facility_name": "SECL Gevra Mega Open Cast Mine (Asia's Largest)",
            "category": "Coal Mine / Quarry",
            "operator": "South Eastern Coalfields Limited (SECL)",
            "osm_id": 900118,
            "last_updated": "2026-09-30T00:00:00Z",
        },
    },
]


def classify_osm_category(tags: Dict[str, Any]) -> str:
    """
    Classifies an OSM element into one of the 4 heavy heat-producing industrial categories:
    - Steel Plant
    - Coal/Thermal Power Plant
    - Coal Mine / Quarry
    - Refinery / Chemical
    """
    ind = str(tags.get("industrial", "")).lower()
    power = str(tags.get("power", "")).lower()
    source = str(tags.get("plant:source", tags.get("generator:source", ""))).lower()
    landuse = str(tags.get("landuse", "")).lower()
    name = str(tags.get("name", "")).lower()
    operator = str(tags.get("operator", "")).lower()
    substance = str(tags.get("substance", "")).lower()
    resource = str(tags.get("resource", "")).lower()
    all_text = f"{name} {operator} {tags.get('description', '')}".lower()

    # 1. Steel & Metallurgy
    if (
        any(k in ind for k in ["steel", "metallurgy", "iron", "smelter"])
        or any(k in all_text for k in ["steel", "ispat", "iron & steel", "blast furnace", "rolling mill", "metallurgy", "smelter", "jindal", "tata steel", "sail"])
    ):
        return "Steel Plant"

    # 2. Power Plants (Thermal / Coal / Gas / Nuclear / Cogeneration)
    if (
        power == "plant" or "plant" in power
        or any(k in source for k in ["coal", "gas", "thermal", "lignite", "oil", "nuclear"])
        or any(k in all_text for k in ["thermal power", "power plant", "power station", "ntpc", "super thermal", "vidyut", "bijli", "tps"])
    ):
        return "Coal/Thermal Power Plant"

    # 3. Coal Mines & Mineral Quarries
    if (
        ind == "mine" or "mine" in ind
        or landuse == "quarry" or "quarry" in landuse
        or any(k in resource for k in ["coal", "lignite", "stone", "iron_ore", "limestone", "sand"])
        or any(k in all_text for k in ["coal mine", "colliery", "quarry", "crusher", "khadan", "ccl", "secl", "wcl", "ecl", "mcl", "bccl", "singareni"])
    ):
        return "Coal Mine / Quarry"

    # 4. Refineries & Chemical Infrastructure
    if (
        any(k in ind for k in ["refinery", "chemical", "petrochemical", "gas"])
        or substance in ["oil", "petroleum", "gas"]
        or any(k in all_text for k in ["refinery", "petrochem", "iocl", "hpcl", "bpcl", "reliance", "nayara", "ongc", "oil india", "fertilizer", "chemicals", "lng", "lpg"])
    ):
        return "Refinery / Chemical"

    # Fallbacks based on explicit tags
    if landuse == "quarry" or ind == "mine":
        return "Coal Mine / Quarry"
    if power == "plant":
        return "Coal/Thermal Power Plant"

    return "Refinery / Chemical"


def extract_facility_name(tags: Dict[str, Any], element_id: int, category: str) -> str:
    """
    Extracts tags.name (or fallback to tags.operator or tags.industrial/tags.power type if unnamed).
    """
    raw_name = tags.get("name") or tags.get("name:en")
    if raw_name:
        return str(raw_name).strip()

    operator = tags.get("operator")
    if operator and str(operator).strip().lower() not in ("yes", "no", "true"):
        return f"{operator.strip()} ({category})"

    ind = tags.get("industrial")
    if ind and str(ind).strip().lower() not in ("yes", "no", "true"):
        label = str(ind).replace("_", " ").title()
        return f"{label} Facility #{element_id}"

    power_source = tags.get("plant:source", tags.get("power"))
    if power_source and str(power_source).strip().lower() not in ("yes", "no", "true"):
        label = str(power_source).replace("_", " ").title()
        return f"{label} Power Station #{element_id}"

    landuse = tags.get("landuse")
    if landuse and str(landuse).strip().lower() not in ("yes", "no", "true"):
        label = str(landuse).replace("_", " ").title()
        return f"{label} Site #{element_id}"

    return f"{category} #{element_id}"


def parse_osm_elements_to_geojson(elements: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parses OpenStreetMap elements (nodes, ways) into standard GeoJSON FeatureCollection.
    Extracts tags.name (or fallback to tags.operator or tags.industrial/tags.power type).
    Classifies into 4 categories: Steel Plant, Coal/Thermal Power Plant, Coal Mine / Quarry, Refinery / Chemical.
    """
    features = []
    now_iso = datetime.now(timezone.utc).isoformat()

    # Filter out non-industrial amenities (e.g., hotels/restaurants with solar panels)
    filtered = []
    for el in elements:
        tags = el.get("tags", {})
        amenity = str(tags.get("amenity", "")).lower()
        tourism = str(tags.get("tourism", "")).lower()
        if amenity in ("restaurant", "hotel", "cafe", "fast_food", "guesthouse") or tourism in ("hotel", "guest_house"):
            continue
        filtered.append(el)

    # Separate named vs unnamed elements to prioritize high-value named assets
    named_elements = []
    unnamed_elements = []
    for el in filtered:
        tags = el.get("tags", {})
        if tags.get("name") or tags.get("operator") or tags.get("name:en"):
            named_elements.append(el)
        else:
            unnamed_elements.append(el)

    # Include all named elements, plus representative unnamed ways/nodes (up to 800 total)
    selected = named_elements + unnamed_elements[: max(0, 800 - len(named_elements))]

    for el in selected:
        tags = el.get("tags", {})
        el_type = el.get("type", "node")
        osm_id = el.get("id")

        # 1. Determine Category
        category = classify_osm_category(tags)

        # 2. Extract Facility Name
        facility_name = extract_facility_name(tags, osm_id, category)

        # 3. Last Updated
        last_updated = el.get("timestamp") or now_iso

        # 4. Extract Point coordinates (from node lat/lon, way center, or geometry centroid)
        lon = None
        lat = None

        if el_type == "node" and "lon" in el and "lat" in el:
            lon = float(el["lon"])
            lat = float(el["lat"])
        elif "center" in el and "lon" in el["center"] and "lat" in el["center"]:
            lon = float(el["center"]["lon"])
            lat = float(el["center"]["lat"])
        elif "lat" in el and "lon" in el:
            lon = float(el["lon"])
            lat = float(el["lat"])
        elif "geometry" in el and isinstance(el["geometry"], list) and len(el["geometry"]) > 0:
            lons = [float(p["lon"]) for p in el["geometry"] if "lon" in p]
            lats = [float(p["lat"]) for p in el["geometry"] if "lat" in p]
            if lons and lats:
                lon = sum(lons) / len(lons)
                lat = sum(lats) / len(lats)

        if lon is not None and lat is not None:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(lon, 6), round(lat, 6)],
                },
                "properties": {
                    "osm_id": osm_id,
                    "name": facility_name,
                    "facility_name": facility_name,
                    "category": category,
                    "operator": tags.get("operator", "N/A"),
                    "osm_type": el_type,
                    "last_updated": last_updated,
                },
            })

    return {
        "type": "FeatureCollection",
        "metadata": {
            "count": len(features),
            "generated_at": now_iso,
            "bbox": DEFAULT_BBOX,
            "system": "NTRO Thermal Intelligence GIS",
        },
        "features": features,
    }


def save_cache(geojson_data: Dict[str, Any]) -> None:
    """Saves GeoJSON data to storage/facility_cache.json."""
    FACILITY_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(FACILITY_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(geojson_data.get('features', []))} strategic features to {FACILITY_CACHE_PATH}")


def load_cache() -> Optional[Dict[str, Any]]:
    """Loads GeoJSON data from storage/facility_cache.json if available."""
    if FACILITY_CACHE_PATH.exists():
        try:
            with open(FACILITY_CACHE_PATH, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
                if isinstance(data, dict) and "features" in data and len(data["features"]) > 0:
                    for feat in data["features"]:
                        p = feat.setdefault("properties", {})
                        if "name" not in p and "facility_name" in p:
                            p["name"] = p["facility_name"]
                        elif "facility_name" not in p and "name" in p:
                            p["facility_name"] = p["name"]
                        if not p.get("name"):
                            p["name"] = "Industrial Facility"
                    return data
        except Exception as e:
            logger.warning(f"Error reading cache file {FACILITY_CACHE_PATH}: {e}")
    return None


async def fetch_and_cache_facilities(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Asynchronously queries Overpass API for all heavy heat-producing industrial categories
    (Steel, Coal, Power, Mines, Refineries).
    Classifies and returns a clean GeoJSON FeatureCollection with coordinates and metadata.
    """
    # Reuse cache if available and force_refresh is not requested
    existing_cache = load_cache()
    if existing_cache and not force_refresh:
        logger.info("Serving existing facility cache from storage/facility_cache.json.")
        return existing_cache

    logger.info("Executing comprehensive Overpass API query for heat-producing heavy industries...")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NTRO-Thermal-GIS/2.0",
        "Accept": "application/json",
    }

    fetched_elements = []

    async with httpx.AsyncClient(headers=headers, timeout=25.0) as client:
        for ep in OVERPASS_ENDPOINTS:
            try:
                logger.info(f"Querying Overpass endpoint: {ep}")
                resp = await client.post(ep, data={"data": OVERPASS_QUERY})
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                    if elements:
                        logger.info(f"Successfully retrieved {len(elements)} strategic elements from {ep}")
                        fetched_elements = elements
                        break
            except Exception as e:
                logger.warning(f"Overpass endpoint {ep} attempt failed: {e}")

    if fetched_elements:
        geojson_data = parse_osm_elements_to_geojson(fetched_elements)
        if geojson_data["features"]:
            save_cache(geojson_data)
            return geojson_data

    # If Overpass call timed out or failed, serve cache if available
    if existing_cache:
        logger.info("Serving existing cache after Overpass query attempt.")
        return existing_cache

    # Fallback to high-fidelity strategic seed facilities
    logger.info("Falling back to strategic Indian heavy industry seed dataset.")
    now_iso = datetime.now(timezone.utc).isoformat()
    seed_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "count": len(STRATEGIC_SEED_FACILITIES),
            "generated_at": now_iso,
            "bbox": DEFAULT_BBOX,
            "source": "Strategic Heavy Industrial Seed Dataset (India)",
            "system": "NTRO Thermal Intelligence GIS",
        },
        "features": STRATEGIC_SEED_FACILITIES,
    }
    save_cache(seed_geojson)
    return seed_geojson
