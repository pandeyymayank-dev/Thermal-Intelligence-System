# Technical Documentation & Specifications

This directory contains technical specifications, architecture blueprints, and AI pipeline documentation for the **NTRO Thermal Intelligence Platform** (Smart India Hackathon Problem Statement 26162).

---

## 📑 Contents

- **[`SIH_TECHNICAL_SPECIFICATION.md`](./SIH_TECHNICAL_SPECIFICATION.md)**:
  - Comprehensive end-to-end technical architecture.
  - Multi-satellite telemetry ingestion pipeline (VIIRS 375m & MODIS C6.1).
  - 19-feature engineering matrix ($T_{i4}, T_{i5}$, $\Delta T$, FRP ratios, temporal persistence, spatial proximity).
  - LightGBM classification engine, training methodology, hyperparameter configurations, and SHAP explainability.
  - Tactical frontend design system, glassmorphic UI architecture, and defense GIS cartography.
  - Zero-config cloud deployment specifications for Render dual-service topology.

---

## 🏛️ System Architecture Summary

```
NASA FIRMS Satellite Telemetry (VIIRS 375m / MODIS)
                     │
                     ▼
       FastAPI High-Performance Backend
       ├── Overpass API Gazetteer Integration (134 Industrial Facilities)
       ├── 19-Feature Spatial-Temporal Extraction
       └── LightGBM Gradient Boosted Decision Forest Classifier
                     │
                     ▼
       Tactical Defense Web Dashboard (React + Vite + Leaflet)
       ├── Real-Time FRP Intensity Heat Scaling
       ├── 3-Tier Dynamic Severity Glow Rings (Red, Orange, Yellow)
       └── Slide-Out Operational AI Intelligence Drawer
```
