# Thermal AI Classification Engine (LightGBM)

This directory contains the machine learning training pipeline, feature engineering scripts, model artifacts, and inference engine for classifying thermal hotspot anomalies.

---

## 🧠 Model Architecture & Pipeline

- **Classifier Framework**: LightGBM (Gradient Boosted Decision Forest).
- **Inference Latency**: Under 15ms per batch of 500 hotspots.
- **Model Checkpoint**: `models/model.joblib`.
- **Pipeline Runner**: `pipeline.py`.
- **Feature Extraction**: `prepare_dataset.py`.

---

## 🎯 Target Classification Categories

| Category | Icon | Description | Key Predictive Factors |
|---|:---:|---|---|
| **FLARE** | ⚡ | Industrial flare stacks, offshore gas flares, refinery flaring | High nocturnal brightness, extreme FRP ratios, tight distance to petrochemical/refinery facilities. |
| **INDUSTRIAL_HEAT** | 🏭 | Steel mills, blast furnaces, thermal power stations, coke ovens | High temporal persistence (active $>10$ days in 90 days), spatial proximity $\le 5\text{ km}$ to registered heavy industry. |
| **STUBBLE** | 🌾 | Agricultural crop residue burning (Punjab, Haryana, UP) | Strong seasonal clustering (Oct-Nov, Apr-May), moderate FRP (10–50 MW), rural land cover. |
| **BRICK_KILN** | 🧱 | Bull's Trench & Zig-Zag brick kilns | Discrete spatial clustering, low-to-moderate FRP, high winter-spring prevalence. |
| **WILDFIRE** | 🌲 | Forest fires, shrubland, and biomass burning | Broad spatial extent, very high FRP, rapid progression trend. |
| **OTHER** | ❓ | Unclassified thermal anomalies | Low-confidence or uncharacterized transient signatures. |
