from typing import Any, Dict, List


def generate_optical_crop_bbox(lat: float, lon: float, delta_deg: float = 0.01) -> List[float]:
    """
    Constructs an optical satellite image crop bounding box [min_lon, min_lat, max_lon, max_lat]
    centered on the thermal anomaly (delta_deg = 0.01 is approximately 1.1km x 1.1km).
    """
    min_lat = round(lat - delta_deg, 5)
    max_lat = round(lat + delta_deg, 5)
    min_lon = round(lon - delta_deg, 5)
    max_lon = round(lon + delta_deg, 5)
    return [min_lon, min_lat, max_lon, max_lat]


def get_visual_context_metadata(lat: float, lon: float) -> Dict[str, Any]:
    """
    Returns visual optical crop metadata for unmapped/strategic thermal point analysis.
    """
    crop_bbox = generate_optical_crop_bbox(lat, lon)
    # Placeholder Sentinel-2 L2A / Esri static high-res optical patch reference
    patch_url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox={crop_bbox[0]},{crop_bbox[1]},{crop_bbox[2]},{crop_bbox[3]}&bboxSR=4326&imageSR=4326&size=256,256&f=image"

    return {
        "crop_bbox": crop_bbox,
        "patch_url": patch_url,
        "optical_resolution_m": 10.0,
        "spectral_bands": ["B04_Red", "B03_Green", "B02_Blue", "B12_SWIR"],
        "visual_analyst_status": "Automated Crop Extracted",
    }
