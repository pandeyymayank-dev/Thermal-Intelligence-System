# NTRO Thermal Intelligence GIS Platform

> **Smart India Hackathon (SIH) — PS 26162**  
> Operational Geospatial Artificial Intelligence for Defense Thermal Anomaly Detection, Classification & Strategic Asset Proximity Analytics.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.0+-green?style=flat-square)](https://lightgbm.readthedocs.io)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9+-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Render](https://img.shields.io/badge/Deployment-Render_Blueprint-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)

---

## 🛰️ Mission Overview

The **NTRO Thermal Intelligence GIS Platform** is a defense-grade thermal anomaly intelligence system that ingests near-real-time multispectral infrared satellite telemetry from **NASA FIRMS** (VIIRS 375m and MODIS C6.1) and performs automated classification and strategic asset proximity scoring using a high-throughput **LightGBM** classification engine.

### Core Capabilities

- **Automated Anomaly Classification**: Accurately classifies thermal hotspots into six operational categories:
  - ⚡ **FLARE**: Refinery flare stacks & gas flaring.
  - 🏭 **INDUSTRIAL_HEAT**: Steel plants, blast furnaces, thermal power stations, and smelters.
  - 🌾 **STUBBLE**: Agricultural crop residue burning.
  - 🧱 **BRICK_KILN**: Bull's Trench and Hoffman brick kilns.
  - 🌲 **WILDFIRE**: Forest fires and wildland biomass burning.
  - ❓ **OTHER**: Uncharacterized transient heat events.
- **Strategic Asset Proximity Engine**: Real-time KD-Tree spatial correlation against a curated gazetteer of **134 strategic Indian facilities** (NTPC thermal stations, SAIL/Tata steel plants, IOCL/Reliance refineries, smelters, and chemical hubs).
- **Tactical Defense Cartography**: Interactive dark-mode satellite GIS canvas with dynamic Fire Radiative Power (FRP) heat scales and 3-tier glowing severity markers (🔴 Red, 🟠 Orange, 🟡 Yellow).
- **Operational AI Drawer**: Instant slide-out inspection showing Fire Radiative Power (MW), Brightness Temperature ($T_{i4}$), baseline comparisons, dynamic growth trends (`GROWING`, `PERSISTENT`, `NEW`), and top model feature contributions.

---

## 🏗️ Monorepo Architecture

```text
SIH/
├── apps/
│   ├── web-dashboard/              # React (Vite) Tactical GIS Web Application
│   │   ├── src/
│   │   │   ├── components/         # MapCanvas, Sidebar, Header, Drawer, Modals
│   │   │   ├── data/               # High-availability seed telemetry cache
│   │   │   ├── pages/              # Dedicated routes (/map, /methodology, /contact)
│   │   │   ├── services/           # Resilient API client with cold-start retry
│   │   │   └── App.jsx
│   │   └── package.json
│   │
│   └── thermal-api/                # FastAPI High-Performance Backend Service
│       ├── app/
│       │   ├── api/v1/             # Endpoints (/spatial, /thermal, /inference)
│       │   ├── core/               # Configuration, paths, and CORS middleware
│       │   ├── services/           # KD-Tree proximity & NASA FIRMS ingestion
│       │   └── main.py             # Uvicorn ASGI entrypoint
│       └── requirements.txt
│
├── docs/                           # Technical specifications and presentation guides
├── storage/                        # All-India facility gazetteer and FIRMS telemetry cache
├── thermal/                        # LightGBM model training pipeline and feature engine
├── render.yaml                     # Zero-config Render Blueprint deployment specification
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend Service (`apps/thermal-api`)

```bash
cd apps/thermal-api
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be accessible at `http://localhost:8000/docs`.

### 2. Frontend Dashboard (`apps/web-dashboard`)

```bash
cd apps/web-dashboard
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Cloud Deployment (Render Blueprint)

The repository includes a root [`render.yaml`](./render.yaml) blueprint enabling zero-config dual deployment:
1. **`ntro-thermal-api`**: Python Web Service hosting the FastAPI backend and LightGBM model.
2. **`ntro-thermal-dashboard`**: React Vite Static Site hosting the tactical GIS interface.
