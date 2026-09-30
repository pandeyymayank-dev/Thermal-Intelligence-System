"""
NTRO Thermal Hotspot Classifier - LightGBM Pipeline & Training Engine.
Trains direct classification weights for:
  - FLARE (Refineries & Chemical Flaring)
  - INDUSTRIAL_HEAT (Steel Plants, Heavy Metallurgy, Thermal Power Plants, Boiler Stacks, Smelters, Coke Ovens)
  - STUBBLE (Agricultural Crop Residue Burns)
  - BRICK_KILN (Seasonal Brick Kilns)
  - WILDFIRE (Forest Canopy & Brush Fires)
  - OTHER (Background / Unclassified Anomalies)
"""
import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import GroupKFold
from sklearn.neighbors import BallTree

try:
    import lightgbm as lgb
    HAVE_LGBM = True
except ImportError:
    HAVE_LGBM = False

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parents[3]
THERMAL_DIR = PROJECT_DIR / "thermal"
DATA = THERMAL_DIR / "data"
OUT = THERMAL_DIR / "outputs"
MODEL = THERMAL_DIR / "models"

from app.services.feature_engine import (
    CLASSES,
    FEATS,
    BUFFER_M,
    MAX_DISPLAY_DIST_M,
    load_all_industrial_facilities,
    build_features,
    weak_labels,
    severity,
)


def make_model():
    if HAVE_LGBM:
        return lgb.LGBMClassifier(
            n_estimators=300, learning_rate=0.05, num_leaves=31,
            class_weight="balanced", verbose=-1
        )
    return HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, class_weight="balanced")


def train():
    fac, df = pd.read_csv(DATA / "facilities.csv"), pd.read_csv(DATA / "firms.csv")
    d = build_features(df, fac)
    d = d[d.day >= d.day.min() + 90].copy()
    d["label"] = weak_labels(d)
    print("weak label counts:\n", d.label.value_counts(), "\n")
    X, y = d[FEATS], d.label.map({c: i for i, c in enumerate(CLASSES)}).values
    groups = (np.floor(d.latitude * 2) * 1000 + np.floor(d.longitude * 2)).astype(int).values
    n_splits = min(5, len(np.unique(groups)))
    oof = np.zeros(len(d), dtype=int)
    for tr, va in GroupKFold(n_splits=n_splits).split(X, y, groups):
        m = make_model().fit(X.iloc[tr], y[tr])
        oof[va] = m.predict(X.iloc[va])
    present = sorted(set(y))
    print(classification_report(y, oof, labels=present,
                                target_names=[CLASSES[i] for i in present], zero_division=0))
    m = make_model().fit(X, y)
    MODEL.mkdir(exist_ok=True)
    joblib.dump({"model": m}, MODEL / "model.joblib")
    print("saved models/model.joblib   (LightGBM)" if HAVE_LGBM else
          "saved models/model.joblib   (sklearn HistGradientBoosting fallback)")


_MODEL_CACHE = None
_HISTORY_CACHE = None


def get_cached_model():
    global _MODEL_CACHE
    if _MODEL_CACHE is None:
        _MODEL_CACHE = joblib.load(MODEL / "model.joblib")["model"]
    return _MODEL_CACHE


def get_cached_history():
    global _HISTORY_CACHE
    if _HISTORY_CACHE is None:
        fac = pd.read_csv(DATA / "facilities.csv")
        df = pd.read_csv(DATA / "firms.csv")
        _HISTORY_CACHE = build_features(df, fac)
    return _HISTORY_CACHE


def predict(date=None, d=None, m=None):
    if m is None:
        m = get_cached_model()
    if d is None:
        d = get_cached_history()
    day = pd.Timestamp(date) if date else d.acq_date.max()
    t = d[d.acq_date == day].copy()
    if t.empty:
        return pd.DataFrame()
    proba = m.predict_proba(t[FEATS])
    ci = proba.argmax(1)
    t["cls"] = [CLASSES[m.classes_[i]] for i in ci]
    t["confidence_pct"] = (proba.max(1) * 100).round(1)
    sev = [severity(c, r) for c, (_, r) in zip(t["cls"], t.iterrows())]
    t["severity"], t["why"] = [s[0] for s in sev], [s[1] for s in sev]
    if HAVE_LGBM:
        contrib = m.booster_.predict(t[FEATS], pred_contrib=True).reshape(len(t), len(m.classes_), -1)
        t["top_features"] = [
            ", ".join(f"{FEATS[j]}={t.iloc[i][FEATS[j]]:.3g}"
                      for j in np.argsort(-contrib[i, c, :-1])[:3])
            for i, c in enumerate(ci)
        ]
    OUT.mkdir(exist_ok=True)
    cols = ["latitude", "longitude", "acq_date", "cls", "confidence_pct", "trend", "severity",
            "why", "fac_name", "dist_fac", "frp", "bright_ti4", "frp_hist"] + (["top_features"] if HAVE_LGBM else [])
    res = t[cols].sort_values("severity")
    res.to_csv(OUT / "classified.csv", index=False)
    return res


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["train", "predict"], default="train", nargs="?")
    ap.add_argument("--date")
    a = ap.parse_args()
    if a.cmd == "train":
        train()
    elif a.cmd == "predict":
        res = predict(a.date)
        print(res.head(15).to_string(index=False))
