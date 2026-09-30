import math
from typing import Any, Dict, List, Optional, Tuple

from app.services.osm_service import load_cache


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def get_feature_centroid(geometry: Dict[str, Any]) -> Optional[Tuple[float, float]]:
    """
    Extracts or computes the approximate centroid [lat, lon] of a GeoJSON geometry.
    """
    g_type = geometry.get("type", "")
    coords = geometry.get("coordinates", [])

    if g_type == "Point" and len(coords) >= 2:
        return float(coords[1]), float(coords[0])  # lat, lon

    if g_type == "Polygon" and coords and len(coords[0]) > 0:
        ring = coords[0]
        avg_lon = sum(pt[0] for pt in ring) / len(ring)
        avg_lat = sum(pt[1] for pt in ring) / len(ring)
        return avg_lat, avg_lon

    if g_type == "MultiPolygon" and coords and len(coords[0]) > 0 and len(coords[0][0]) > 0:
        ring = coords[0][0]
        avg_lon = sum(pt[0] for pt in ring) / len(ring)
        avg_lat = sum(pt[1] for pt in ring) / len(ring)
        return avg_lat, avg_lon

    if g_type == "LineString" and coords:
        avg_lon = sum(pt[0] for pt in coords) / len(coords)
        avg_lat = sum(pt[1] for pt in coords) / len(coords)
        return avg_lat, avg_lon

    return None


def find_nearest_facility(lat: float, lon: float) -> Dict[str, Any]:
    """
    Scans loaded OpenStreetMap facility polygons and finds the nearest strategic infrastructure.
    Returns nearest facility metadata and distance in meters.
    """
    facilities_geojson = load_cache()
    if not facilities_geojson or not facilities_geojson.get("features"):
        return {
            "nearest_facility_name": "Unknown / Unmapped Zone",
            "nearest_facility_category": "Unmapped",
            "nearest_facility_dist_m": 999999.0,
            "is_inside_facility_buffer": False,
            "operator": "N/A",
        }

    nearest_feature = None
    min_distance = float("inf")

    for feature in facilities_geojson["features"]:
        geom = feature.get("geometry", {})
        centroid = get_feature_centroid(geom)
        if centroid:
            f_lat, f_lon = centroid
            dist = haversine_distance_meters(lat, lon, f_lat, f_lon)
            if dist < min_distance:
                min_distance = dist
                nearest_feature = feature

    if nearest_feature:
        props = nearest_feature.get("properties", {})
        raw_name = props.get("facility_name") or props.get("name") or "Industrial Facility"
        name = "Regional Industrial Zone" if min_distance > 25000.0 else raw_name
        category = props.get("category") or "Strategic Facility"
        operator = props.get("operator") or "N/A"
        is_inside_buffer = min_distance <= 5000.0  # 5 km operational industrial buffer zone

        return {
            "nearest_facility_name": name,
            "nearest_facility_category": category,
            "nearest_facility_dist_m": round(min_distance, 1),
            "is_inside_facility_buffer": is_inside_buffer,
            "operator": operator,
        }

    return {
        "nearest_facility_name": "Regional Industrial Zone",
        "nearest_facility_category": "Unmapped",
        "nearest_facility_dist_m": 999999.0,
        "is_inside_facility_buffer": False,
        "operator": "N/A",
    }
