import sys
from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from app.core.config import STORAGE_DIR

# Ensure thermal pipeline can be imported
thermal_dir = (STORAGE_DIR.parent / "thermal").resolve()
if str(thermal_dir) not in sys.path:
    sys.path.insert(0, str(thermal_dir))

try:
    from app.ml.train_pipeline import get_cached_history, get_cached_model, predict
except ImportError:
    try:
        from pipeline import get_cached_history, get_cached_model, predict
    except ImportError:
        get_cached_history = None
        get_cached_model = None
        predict = None

router = APIRouter()


@router.post("/classify")
async def classify_thermal_hotspots(payload: Optional[Dict[str, Any]] = None):
    """
    POST /api/v1/inference/classify (optional body: {"date": "YYYY-MM-DD", "format": "geojson"})
    Returns the classified hotspots for that date as JSON (class, confidence_pct, trend, severity, why, lat, lon).
    If format="geojson" or type="FeatureCollection", returns enriched GeoJSON FeatureCollection.
    """
    if predict is None:
        return {"error": "ML pipeline could not be loaded."}

    target_date = payload.get("date") if payload else None

    # Run LightGBM prediction on cached history features
    df = predict(date=target_date)
    if df.empty:
        if payload and (payload.get("format") == "geojson" or payload.get("type") == "FeatureCollection"):
            return {"type": "FeatureCollection", "features": [], "metadata": {"count": 0}}
        return []

    # If payload requested geojson or was a FeatureCollection, return GeoJSON FeatureCollection
    if payload and (payload.get("format") == "geojson" or payload.get("type") == "FeatureCollection"):
        features = []
        for _, row in df.iterrows():
            dist_m = float(row.get("dist_fac", 0.0))
            fac_name_val = "Regional Industrial Zone" if dist_m > 25000.0 else str(row.get("fac_name", ""))
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row["longitude"]), float(row["latitude"])],
                },
                "properties": {
                    "class": str(row.get("cls", "")),
                    "cls": str(row.get("cls", "")),
                    "predicted_category": str(row.get("cls", "")),
                    "confidence_pct": float(row.get("confidence_pct", 0.0)),
                    "confidence": float(row.get("confidence_pct", 0.0)),
                    "trend": str(row.get("trend", "")),
                    "severity": str(row.get("severity", "")),
                    "threat_level": str(row.get("severity", "")),
                    "why": str(row.get("why", "")),
                    "ai_explanation": str(row.get("why", "")),
                    "fac_name": fac_name_val,
                    "nearest_facility_name": fac_name_val,
                    "dist_fac": dist_m,
                    "nearest_facility_dist_m": round(dist_m, 1),
                    "frp": float(row.get("frp", 0.0)),
                    "bright_ti4": float(row.get("bright_ti4", 0.0)),
                    "brightness": float(row.get("bright_ti4", 0.0)),
                    "frp_hist": float(row.get("frp_hist", 0.0)),
                    "top_features": str(row.get("top_features", "")),
                    "acq_date": str(row.get("acq_date", "")),
                },
            })
        return {
            "type": "FeatureCollection",
            "metadata": {
                "count": len(features),
                "model": "LightGBM Multi-Class Classifier (GroupKFold)",
                "system": "NTRO Thermal Intelligence GIS",
            },
            "features": features,
        }

    records = []
    for _, row in df.iterrows():
        dist_m = float(row.get("dist_fac", 0.0))
        fac_name_val = "Regional Industrial Zone" if dist_m > 25000.0 else str(row.get("fac_name", ""))
        records.append({
            "class": str(row.get("cls", "")),
            "confidence_pct": float(row.get("confidence_pct", 0.0)),
            "trend": str(row.get("trend", "")),
            "severity": str(row.get("severity", "")),
            "why": str(row.get("why", "")),
            "lat": float(row.get("latitude", 0.0)),
            "lon": float(row.get("longitude", 0.0)),
            "fac_name": fac_name_val,
            "dist_fac": dist_m,
            "frp": float(row.get("frp", 0.0)),
            "bright_ti4": float(row.get("bright_ti4", 0.0)),
            "frp_hist": float(row.get("frp_hist", 0.0)),
            "top_features": str(row.get("top_features", "")),
            "acq_date": str(row.get("acq_date", "")),
        })
    return records


@router.post("/predict")
async def predict_single_anomaly(payload: Dict[str, Any]):
    """
    Predicts single anomaly feature.
    """
    from app.services.classifier_service import classifier_engine
    return classifier_engine.classify_hotspot_feature(payload)
