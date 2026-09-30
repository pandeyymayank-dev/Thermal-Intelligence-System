# NTRO Thermal Intelligence Platform — Phase 2 Architecture Specification
**Document ID:** NTRO-TIP-PHASE2-ARCH-001  
**Classification:** Technical Architecture Reference / Developer Guide  
**System:** NTRO Thermal Intelligence GIS Platform (SIH PS 26162)  

---

## 1. System Overview & Two-Pass Non-Blocking Data Flow

The Phase 2 architecture separates **immediate geospatial visualization** from **compute-intensive multi-modal AI classification**. This guarantees 100% UI responsiveness: raw satellite thermal hotspots render immediately on the Leaflet canvas without blocking the user, while an asynchronous 3-Source AI Engine enriches the points in the background.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PASS 1: IMMEDIATE BASE PIPELINE                      │
│                                                                                        │
│  [NASA FIRMS Satellite]                                                                │
│  (VIIRS / MODIS Hotspots) ──> [FastAPI: /api/v1/thermal/hotspots] ──> [Leaflet Canvas] │
│                                      (Instant GeoJSON)              (Pulsing Red Pins) │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼ (Async Trigger)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PASS 2: 3-SOURCE ASYNC AI PIPELINE                   │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ [Source A: FIRMS]           [Source B: OSM Facilities]   [Source C: Optical]   │   │
│   │ FRP (MW), Brightness (K),   Nearest Facility Distance,   Sentinel-2 Crop BBox, │   │
│   │ Day/Night, Sensor Conf.     Category, Operator           Visual Feature Patch  │   │
│   └───────────────────────┬───────────────────────┬────────────────────────┬───────┘   │
│                           │                       │                        │           │
│                           ▼                       ▼                        ▼           │
│              [Spatial Buffer] ──> [Triple-Source Feature Vector]                       │
│                                                   │                                    │
│                                                   ▼                                    │
│                            [AI Classifier Engine (classifier_service.py)]              │
│                                                   │                                    │
│                                                   ▼                                    │
│                     [FastAPI: POST /api/v1/inference/classify]                         │
│                                                   │                                    │
│                                                   ▼                                    │
│                      [Leaflet Canvas: In-Place Marker & Popup Update]                  │
│                      (Classification Badges, Confidence Bars, Threat)                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Triple-Source AI Input Triplet Specification

The AI Classifier analyzes a multi-modal feature vector synthesized from three orthogonal intelligence feeds:

```
                  ┌──────────────────────────────────────────────┐
                  │          AI Hotspot Triplet Vector           │
                  └──────────────────────┬───────────────────────┘
                                         │
       ┌─────────────────────────────────┼─────────────────────────────────┐
       ▼                                 ▼                                 ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│ Source A: Radiation (FRP) │ │  Source B: OSM Spatial    │ │  Source C: Optical Crop   │
├───────────────────────────┤ ├───────────────────────────┤ ├───────────────────────────┤
│ • frp (MW)                │ │ • nearest_facility_dist_m │ │ • crop_bbox [min/max]     │
│ • brightness_k (Kelvin)   │ │ • nearest_facility_name   │ │ • patch_url / placeholder │
│ • day_night ('D' / 'N')   │ │ • facility_category       │ │ • cloud_cover_pct         │
│ • confidence (0 - 100)    │ │ • is_inside_buffer (bool) │ │ • swir_anomaly_index      │
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

### Source A: NASA FIRMS Radiation Payload
- **`frp` (Fire Radiative Power in Megawatts)**: Quantifies instantaneous thermal energy release. Flaring typically manifests $\ge 30\text{ MW}$, while biomass fires range $5 - 25\text{ MW}$.
- **`brightness` / `brightness_21` (Kelvin)**: Peak mid-infrared brightness temperature (3.9 µm band).
- **`day_night`**: Eliminates daytime solar reflectance false positives when set to `'N'`.
- **`confidence`**: Satellite instrument detection probability index.

### Source B: OSM Spatial Proximity Context (`spatial_buffer.py`)
- **`nearest_facility_dist_m`**: Haversine geodesic distance in meters from the anomaly centroid to the nearest OpenStreetMap strategic facility boundary.
- **`is_inside_facility_buffer`**: Boolean threshold ($\le 1,500\text{ m}$) identifying industrial colocation.
- **`facility_category`**: Target infrastructure type (`Refinery`, `Power Plant`, `Chemical Works`, `Steel Mill`).

### Source C: Optical Context & Visual Patch (`satellite_image_service.py`)
- **`optical_crop_bbox`**: Square bounding box $[min\_lon, min\_lat, max\_lon, max\_lat]$ (typically $2\text{ km} \times 2\text{ km}$) centered on the thermal anomaly.
- **`patch_url`**: Static optical/multispectral satellite patch URL or Sentinel-2 SWIR placeholder for human analyst verification and CNN vision encoder evaluation.

---

## 3. API Endpoint Specification

### 1. Raw Thermal Hotspots (Instant Base Layer)
- **Endpoint:** `GET /api/v1/thermal/hotspots`
- **Response Format:** Standard GeoJSON `FeatureCollection`
- **Latency SLA:** $< 50\text{ ms}$ (served directly from cache or live ingestion)
- **Example Response:**
  ```json
  {
    "type": "FeatureCollection",
    "metadata": {
      "count": 8,
      "source": "NASA FIRMS (VIIRS/MODIS)",
      "status": "Base Hotspot Stream"
    },
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [77.695, 27.315]
        },
        "properties": {
          "id": "hotspot-001",
          "latitude": 27.315,
          "longitude": 77.695,
          "frp": 68.4,
          "brightness": 368.2,
          "acq_date": "2026-09-30T01:30:00Z",
          "daynight": "N",
          "confidence": 92
        }
      }
    ]
  }
  ```

### 2. Triple-Source AI Classifier
- **Endpoint:** `POST /api/v1/inference/classify`
- **Request Body:** GeoJSON `FeatureCollection` or list of hotspot objects.
- **Output:** Enriched GeoJSON `FeatureCollection` with AI prediction properties:
  - `predicted_category`: e.g. `"Industrial Gas Flare"`, `"Refinery Process Heat"`, `"Thermal Power Generation"`, `"Agricultural Crop Burning"`.
  - `confidence_score`: float $0.0 \dots 1.0$ (e.g. `0.94`).
  - `threat_level`: `"CRITICAL"`, `"HIGH"`, `"MODERATE"`, `"LOW"`.
  - `nearest_facility_name`: e.g. `"Indian Oil (IOCL) Mathura Refinery Complex"`.
  - `nearest_facility_dist_m`: e.g. `145.2`.
  - `ai_explanation`: Natural-language justification.
  - `optical_crop_bbox`: $[min\_lon, min\_lat, max\_lon, max\_lat]$.

---

## 4. Phase 3 Model Weights Injection & Debugging Checklist

When deploying trained PyTorch (`.pt`) or ONNX (`.onnx`) deep learning models in Phase 3, follow this injection checklist:

- [ ] **Model Directory**: Place serialized weight files in `apps/thermal-api/app/models/` (e.g., `apps/thermal-api/app/models/thermal_classifier_v2.onnx`).
- [ ] **Inference Runtime Engine**:
  - For ONNX: `pip install onnxruntime` and initialize `ort.InferenceSession("app/models/thermal_classifier_v2.onnx")`.
  - For PyTorch: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu` and load via `torch.jit.load()` or `model.load_state_dict()`.
- [ ] **Feature Preprocessing**: Ensure input features (FRP, Brightness, Log-Distance, Sin/Cos Acquisition Hour) match training normalization scaling parameters stored in `app/models/scaler_params.json`.
- [ ] **Zero-Destruction Fallback**: Always wrap model `forward()` calls in a `try...except` block inside `classifier_service.py` to ensure unclassified fallback markers are returned without throwing 500 HTTP errors if CUDA/CPU out-of-memory occurs.
- [ ] **Batch Processing**: Use vectorized tensor operations for requests containing $> 100$ thermal points.
