# NTRO Thermal Intelligence Platform (SIH PS 26162)

Enterprise modular monorepo for the **NTRO Thermal Intelligence GIS Dashboard**, featuring Overpass NWR spatial boundary resolution, hybrid satellite mapping, permanent facility labels, dual-mode coordinate & location search, and quick preset navigation.

---

## 📁 Monorepo Structure

```text
SIH/
├── apps/
│   ├── web-dashboard/              # React + Vite GIS Frontend
│   │   ├── src/
│   │   │   ├── components/         # MapCanvas.jsx, SearchBar.jsx, PresetNav.jsx, GISMap.jsx
│   │   │   ├── hooks/              # useFacilities.js
│   │   │   ├── services/           # api.js client (http://localhost:8000/api/v1)
│   │   │   ├── types/              # GeoJSON JSDoc definitions
│   │   │   ├── App.jsx             # Shell & top banner
│   │   │   ├── index.css           # Styling & tooltip definitions
│   │   │   └── main.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── thermal-api/                # FastAPI Backend Service
│       ├── app/
│       │   ├── api/v1/
│       │   │   ├── endpoints/
│       │   │   │   ├── spatial.py      # Overpass OSM & Strategic Facilities API
│       │   │   │   ├── thermal.py      # Phase 2 NASA FIRMS placeholder
│       │   │   │   └── inference.py    # Phase 2 AI Model Inference placeholder
│       │   │   └── router.py           # v1 API aggregator
│       │   │
│       │   ├── core/                   # config.py (Storage paths, CORS, Overpass settings)
│       │   ├── models/                 # AI Model files (.onnx / .pt)
│       │   ├── schemas/                # spatial.py (GeoJSON Pydantic schemas)
│       │   │
│       │   ├── services/
│       │   │   ├── osm_service.py         # Overpass NWR logic & MultiPolygon assembler
│       │   │   ├── firms_service.py       # Phase 2 NASA FIRMS service placeholder
│       │   │   ├── sentinel_service.py    # Phase 2 Sentinel SWIR service placeholder
│       │   │   └── classifier_service.py  # Phase 2 AI Inference Engine placeholder
│       │   │
│       │   └── main.py                 # FastAPI application entry point
│       │
│       └── requirements.txt
│
└── storage/                        # Root-level persistent cache directory
    ├── facility_cache.json         # Cached strategic facilities & refineries
    └── thermal_cache.json          # Phase 2 thermal detections cache
```

---

## 🚀 How to Run

### 1. Backend (`apps/thermal-api`)

1. Open a terminal and navigate to `apps/thermal-api/`:
   ```bash
   cd apps/thermal-api
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Root: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### 2. Frontend (`apps/web-dashboard`)

1. Open a second terminal and navigate to `apps/web-dashboard/`:
   ```bash
   cd apps/web-dashboard
   ```
2. Install Node dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Open browser: `http://localhost:5173`

---

## 🎯 Key Features Verified

1. **Hybrid Satellite Base Layer**: Esri World Imagery + Esri World Transportation (Roads) + Esri World Boundaries & Places (Floating labels).
2. **Overpass NWR Spatial Parser**: Captures full Multi-Polygon complexes (Mathura, Jamnagar, Panipat, Barauni, Dadri).
3. **Permanent Layer Tooltips**: Badges directly visible on the map (`🏢 <facility_name>`).
4. **Dual-Mode Search**:
   - Coordinates (`27.3200, 77.7000` or `27.3200 77.7000`) $\rightarrow$ Smooth `flyTo` animation + animated search pin (`📍`).
   - Location text autocomplete powered by OSM Nominatim API.
5. **Quick Preset Navigation**: Floating bottom bar with one-click navigation to strategic refineries and thermal power plants.
