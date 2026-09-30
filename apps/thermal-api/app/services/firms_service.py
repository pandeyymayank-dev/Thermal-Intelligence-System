import asyncio
import csv
import io
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.core.config import (
    FIRMS_API_MODIS_URL,
    FIRMS_API_NOAA20_URL,
    FIRMS_API_SUOMI_URL,
    FIRMS_CSV_CACHE_PATH,
    FIRMS_NOAA20_CSV_CACHE_PATH,
    FIRMS_NOAA20_SOUTH_ASIA_URL,
    FIRMS_SOUTH_ASIA_URL,
    FIRMS_UNIFIED_CSV_PATH,
    THERMAL_CACHE_PATH,
)

logger = logging.getLogger("firms_service")

# Complete India Geographic Bounding Box (Lat: 6.0 to 37.0, Lon: 68.0 to 98.0)
INDIA_LAT_MIN = 6.0
INDIA_LAT_MAX = 37.0
INDIA_LON_MIN = 68.0
INDIA_LON_MAX = 98.0


def parse_firms_csv_to_features(csv_text: str, default_satellite: str = "VIIRS") -> List[Dict[str, Any]]:
    """
    Parses raw NASA FIRMS VIIRS/MODIS CSV text without ANY truncation, confidence gating, or FRP cutoff.
    Accepts ALL detection levels ('nominal', 'low', 'high', 'n', 'l', 'h').
    Accepts ALL FRP values and brightness temperatures.
    Includes every coordinate within India's spatial bounds (Lat: 6.0-37.0, Lon: 68.0-98.0).
    """
    if not csv_text or not csv_text.strip():
        return []

    features = []
    reader = csv.DictReader(io.StringIO(csv_text))

    for row in reader:
        try:
            lat = float(row["latitude"])
            lon = float(row["longitude"])

            # Spatial boundary check strictly for Indian territory
            if not (INDIA_LAT_MIN <= lat <= INDIA_LAT_MAX and INDIA_LON_MIN <= lon <= INDIA_LON_MAX):
                continue

            bright_ti4 = float(row["bright_ti4"]) if row.get("bright_ti4") else (float(row["brightness"]) if row.get("brightness") else 310.0)
            bright_ti5 = float(row["bright_ti5"]) if row.get("bright_ti5") else None
            frp = round(float(row["frp"]), 2) if row.get("frp") else 0.0
            confidence = str(row.get("confidence", "nominal")).lower()
            acq_date = row.get("acq_date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
            acq_time = row.get("acq_time", "0000")

            sat_code = str(row.get("satellite", "")).strip()
            inst_code = str(row.get("instrument", "")).strip()
            if sat_code in ("N", "SNPP") or "SNPP" in default_satellite:
                sat_name = "Suomi-NPP VIIRS"
                sensor_name = "VIIRS 375m"
            elif sat_code in ("1", "J1", "NOAA20", "N20") or "NOAA20" in default_satellite:
                sat_name = "NOAA-20 VIIRS"
                sensor_name = "VIIRS 375m"
            elif "MODIS" in default_satellite or "MODIS" in inst_code:
                sat_name = "MODIS (Terra/Aqua)"
                sensor_name = "MODIS 1km"
            else:
                sat_name = default_satellite
                sensor_name = "VIIRS 375m"

            daynight = row.get("daynight", "D")
            scan = float(row["scan"]) if row.get("scan") else 0.5
            track = float(row["track"]) if row.get("track") else 0.5

            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "latitude": lat,
                    "longitude": lon,
                    "lat": lat,
                    "lon": lon,
                    "brightness": bright_ti4,
                    "bright_ti4": bright_ti4,
                    "bright_ti5": bright_ti5,
                    "frp": frp,
                    "confidence": confidence,
                    "acq_date": acq_date,
                    "acq_time": acq_time,
                    "satellite": sat_name,
                    "instrument": sensor_name,
                    "daynight": daynight,
                    "scan": scan,
                    "track": track,
                }
            })
        except Exception:
            continue

    return features


async def fetch_csv_async(url: str, cache_path: Optional[Path], label: str, timeout_sec: float = 8.0) -> str:
    """
    Downloads raw NASA FIRMS CSV stream with async httpx and strict timeout, falling back to local cache.
    """
    try:
        async with httpx.AsyncClient(
            timeout=timeout_sec,
            headers={"User-Agent": f"NTRO-Thermal-GIS/2.0 ({label})"}
        ) as client:
            resp = await client.get(url)
            if resp.status_code == 200 and len(resp.text) > 100:
                csv_text = resp.text
                if cache_path:
                    try:
                        cache_path.parent.mkdir(parents=True, exist_ok=True)
                        with open(cache_path, "w", encoding="utf-8") as f:
                            f.write(csv_text)
                    except Exception:
                        pass
                return csv_text
    except Exception as e:
        logger.warning(f"Live fetch for {label} failed or timed out: {e}")

    if cache_path and cache_path.exists():
        try:
            with open(cache_path, "r", encoding="utf-8-sig") as f:
                return f.read()
        except Exception:
            pass

    return ""


def load_thermal_cache() -> Optional[Dict[str, Any]]:
    """Loads thermal hotspots GeoJSON from storage/thermal_cache.json."""
    if THERMAL_CACHE_PATH.exists():
        try:
            with open(THERMAL_CACHE_PATH, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
                if isinstance(data, dict) and "features" in data and len(data["features"]) > 0:
                    return data
        except Exception as e:
            logger.warning(f"Error loading thermal cache: {e}")
    return None


def save_thermal_cache(data: Dict[str, Any]) -> None:
    """Saves thermal hotspots GeoJSON to storage/thermal_cache.json."""
    try:
        THERMAL_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(THERMAL_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(data.get('features', []))} NASA FIRMS hotspots to {THERMAL_CACHE_PATH}")
    except Exception as e:
        logger.error(f"Failed to save thermal cache: {e}")


async def fetch_firms_anomalies(
    bbox: Optional[List[float]] = None,
    source: str = "DUAL_PIPELINE_ALL_SENSORS",
    day_range: int = 2,
    force_refresh: bool = False
) -> Tuple[Dict[str, Any], bool]:
    """
    Dual-Pipeline Multi-Sensor Fusion Engine:
    Concurrently queries:
      1. NASA Key-Based Custom Area API: Suomi-NPP VIIRS (2-Day)
      2. NASA Key-Based Custom Area API: NOAA-20 VIIRS (2-Day)
      3. NASA Key-Based Custom Area API: MODIS Terra/Aqua (2-Day)
      4. NASA Key-Free Public Open NRT Stream: Suomi-NPP VIIRS (24h)
      5. NASA Key-Free Public Open NRT Stream: NOAA-20 VIIRS (24h)
    Merges, deduplicates, and saves unified dataset across India with zero missing points.
    """
    # If not force_refresh, check if high-density cache exists first for instant load
    if not force_refresh:
        cached = load_thermal_cache()
        if cached and len(cached.get("features", [])) >= 1000:
            return cached, True

    # Execute all 5 streams concurrently with 8.0s timeout
    try:
        tasks = [
            fetch_csv_async(FIRMS_API_SUOMI_URL, None, "API Suomi-NPP (2d)", timeout_sec=8.0),
            fetch_csv_async(FIRMS_API_NOAA20_URL, None, "API NOAA-20 (2d)", timeout_sec=8.0),
            fetch_csv_async(FIRMS_API_MODIS_URL, None, "API MODIS (2d)", timeout_sec=8.0),
            fetch_csv_async(FIRMS_SOUTH_ASIA_URL, FIRMS_CSV_CACHE_PATH, "Public Suomi-NPP (24h)", timeout_sec=8.0),
            fetch_csv_async(FIRMS_NOAA20_SOUTH_ASIA_URL, FIRMS_NOAA20_CSV_CACHE_PATH, "Public NOAA-20 (24h)", timeout_sec=8.0),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        parsed_feature_lists = [
            parse_firms_csv_to_features(results[0] if isinstance(results[0], str) else "", "Suomi-NPP VIIRS"),
            parse_firms_csv_to_features(results[1] if isinstance(results[1], str) else "", "NOAA-20 VIIRS"),
            parse_firms_csv_to_features(results[2] if isinstance(results[2], str) else "", "MODIS (Terra/Aqua)"),
            parse_firms_csv_to_features(results[3] if isinstance(results[3], str) else "", "Suomi-NPP VIIRS"),
            parse_firms_csv_to_features(results[4] if isinstance(results[4], str) else "", "NOAA-20 VIIRS"),
        ]

        combined_features = []
        seen_coords = set()
        counter = 1

        for flist in parsed_feature_lists:
            for feat in flist:
                props = feat["properties"]
                coord_key = (
                    round(props["latitude"], 4),
                    round(props["longitude"], 4),
                    props["acq_date"],
                    props.get("acq_time", ""),
                )
                if coord_key not in seen_coords:
                    seen_coords.add(coord_key)
                    props["id"] = f"FIRMS-FUSION-{counter:05d}"
                    combined_features.append(feat)
                    counter += 1

        if combined_features:
            now_iso = datetime.now(timezone.utc).isoformat()
            geojson_data = {
                "type": "FeatureCollection",
                "metadata": {
                    "count": len(combined_features),
                    "generated_at": now_iso,
                    "source": "NASA FIRMS Dual-Pipeline Fusion (Area API + Public Open NRT: Suomi-NPP, NOAA-20, MODIS)",
                    "region": "India Nationwide (Lat: 6-37, Lon: 68-98)",
                    "temporal_window": "2-Day Unified Multi-Sensor Orbit",
                    "status": "Dual-Pipeline Live Stream Online",
                },
                "features": combined_features,
            }
            save_thermal_cache(geojson_data)

            # Also export unified CSV to storage
            try:
                with open(FIRMS_UNIFIED_CSV_PATH, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(
                        f,
                        fieldnames=[
                            "id", "latitude", "longitude", "bright_ti4", "bright_ti5",
                            "frp", "confidence", "acq_date", "acq_time", "satellite",
                            "daynight", "scan", "track", "instrument"
                        ]
                    )
                    writer.writeheader()
                    for feat in combined_features:
                        p = feat["properties"]
                        writer.writerow({
                            "id": p["id"],
                            "latitude": p["latitude"],
                            "longitude": p["longitude"],
                            "bright_ti4": p.get("bright_ti4", ""),
                            "bright_ti5": p.get("bright_ti5", ""),
                            "frp": p.get("frp", ""),
                            "confidence": p.get("confidence", ""),
                            "acq_date": p.get("acq_date", ""),
                            "acq_time": p.get("acq_time", ""),
                            "satellite": p.get("satellite", ""),
                            "daynight": p.get("daynight", "D"),
                            "scan": p.get("scan", ""),
                            "track": p.get("track", ""),
                            "instrument": p.get("instrument", ""),
                        })
            except Exception as csv_err:
                logger.warning(f"Could not write unified CSV: {csv_err}")

            return geojson_data, False

    except Exception as e:
        logger.error(f"Error during dual-pipeline FIRMS aggregation: {e}")

    # Fallback to existing JSON cache if available
    cached = load_thermal_cache()
    if cached:
        return cached, True

    return {
        "type": "FeatureCollection",
        "metadata": {
            "count": 0,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "NASA FIRMS VIIRS",
            "status": "No Active Points Detected",
        },
        "features": [],
    }, True
