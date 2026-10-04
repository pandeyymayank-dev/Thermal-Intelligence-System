# Strategic Storage & Geospatial Telemetry Registry

This directory houses spatial facility registries, cached satellite observations, and near-real-time telemetry datasets.

---

## 🗂️ Registry Components

| File | Type | Description |
|---|---|---|
| `india_industrial_facilities.json` | GeoJSON | Canonical All-India spatial gazetteer of 134 major industrial complexes (Steel, Thermal Power, Refineries, Cement, Petrochemicals). |
| `facility_cache.json` | GeoJSON | Active operational cache used by FastAPI for low-latency KDTree proximity queries. |
| `NASA_FIRMS_VIIRS_India_Unified_24h.csv` | CSV | Unified 24-hour satellite active fire detections across the Indian subcontinent (VIIRS SNPP & NOAA-20). |
| `SUOMI_VIIRS_C2_South_Asia_24h.csv` | CSV | Raw Suomi-NPP VIIRS Collection 2 375m South Asia active fire stream. |
| `J1_VIIRS_C2_South_Asia_24h.csv` | CSV | Raw NOAA-20 (JPSS-1) VIIRS Collection 2 375m South Asia active fire stream. |

---

## 🛰️ Data Freshness & Caching Strategy

1. **Spatial Gazetteer**: Preloaded into spatial KD-Tree data structures on application startup for sub-millisecond distance computations (`dist_fac`).
2. **Satellite Telemetry**: Ingested via direct NASA FIRMS REST endpoints with local caching fallback for high availability.
