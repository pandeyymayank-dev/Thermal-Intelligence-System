"""
NTRO Thermal Feature Engine & Industrial Spatial-Persistence Processor.
Fuses all-India industrial coordinates, temporal persistence (hot_30, hot_90, hot_365),
and continuous heat anomaly detection to eliminate false 'OTHER' classifications.
"""
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
try:
    from sklearn.neighbors import BallTree
    HAVE_SKLEARN = True
except ImportError:
    HAVE_SKLEARN = False
    BallTree = None

logger = logging.getLogger("feature_engine")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_DIR = (BASE_DIR.parent.parent / "storage").resolve()
INDIA_FACILITIES_JSON = STORAGE_DIR / "india_industrial_facilities.json"
FACILITY_CACHE_JSON = STORAGE_DIR / "facility_cache.json"
THERMAL_DATA_DIR = (BASE_DIR.parent.parent / "thermal" / "data").resolve()
FACILITIES_CSV = THERMAL_DATA_DIR / "facilities.csv"

CLASSES = ["FLARE", "INDUSTRIAL_HEAT", "STUBBLE", "BRICK_KILN", "WILDFIRE", "OTHER"]
LANDCOVER = ["cropland", "forest", "urban", "other"]
FAC_CATS = ["Refinery", "Chemical", "Thermal Power", "Steel", "Other"]

# 5km operational heavy industrial buffer
BUFFER_M = 5000
# 25km regional industrial zone boundary
MAX_DISPLAY_DIST_M = 25000

FEATS = [
    "frp", "bright_ti4", "ti_delta", "conf", "is_night", "scan", "track", "hour_ist",
    "month", "hot_30", "hot_90", "hot_365", "days_since_first", "frp_hist",
    "n_day", "frp_day", "dist_fac", "fac_cat_code", "lc_code"
]

_FACILITIES_CACHE_DF: Optional[pd.DataFrame] = None
_FACILITY_TREE: Optional[BallTree] = None


def load_all_industrial_facilities() -> pd.DataFrame:
    """
    Loads all-India industrial facilities from storage/india_industrial_facilities.json,
    falling back to facility_cache.json or facilities.csv.
    """
    global _FACILITIES_CACHE_DF, _FACILITY_TREE
    if _FACILITIES_CACHE_DF is not None:
        return _FACILITIES_CACHE_DF

    records = []

    # 1. Try india_industrial_facilities.json
    if INDIA_FACILITIES_JSON.exists():
        try:
            with open(INDIA_FACILITIES_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
                for feat in data.get("features", []):
                    geom = feat.get("geometry", {})
                    coords = geom.get("coordinates", [])
                    props = feat.get("properties", {})
                    if len(coords) >= 2:
                        records.append({
                            "name": props.get("facility_name") or props.get("name") or "Industrial Facility",
                            "category": props.get("category", "Other"),
                            "lat": float(coords[1]),
                            "lon": float(coords[0]),
                        })
        except Exception as e:
            logger.warning(f"Error reading {INDIA_FACILITIES_JSON}: {e}")

    # 2. Try facilities.csv
    if not records and FACILITIES_CSV.exists():
        try:
            df = pd.read_csv(FACILITIES_CSV)
            _FACILITIES_CACHE_DF = df
            _FACILITY_TREE = BallTree(np.radians(_FACILITIES_CACHE_DF[["lat", "lon"]].values), metric="haversine")
            return _FACILITIES_CACHE_DF
        except Exception as e:
            logger.warning(f"Error reading {FACILITIES_CSV}: {e}")

    # 3. Fallback to facility_cache.json
    if not records and FACILITY_CACHE_JSON.exists():
        try:
            with open(FACILITY_CACHE_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
                for feat in data.get("features", []):
                    geom = feat.get("geometry", {})
                    coords = geom.get("coordinates", [])
                    props = feat.get("properties", {})
                    if len(coords) >= 2:
                        records.append({
                            "name": props.get("facility_name") or props.get("name") or "Industrial Facility",
                            "category": props.get("category", "Other"),
                            "lat": float(coords[1]),
                            "lon": float(coords[0]),
                        })
        except Exception as e:
            logger.warning(f"Error reading {FACILITY_CACHE_JSON}: {e}")

    if records:
        _FACILITIES_CACHE_DF = pd.DataFrame(records)
    else:
        # Minimal emergency fallback
        _FACILITIES_CACHE_DF = pd.DataFrame([
            {"name": "IOCL Panipat Mega Refinery", "category": "Refinery", "lat": 29.378, "lon": 76.878},
            {"name": "Reliance Jamnagar Complex", "category": "Refinery", "lat": 22.396, "lon": 70.042},
            {"name": "Tata Steel Jamshedpur", "category": "Steel", "lat": 22.794, "lon": 86.194},
            {"name": "NTPC Vindhyachal Super Thermal", "category": "Thermal Power", "lat": 24.104, "lon": 82.670},
            {"name": "Kolhapur Foundry & Engineering Zone", "category": "Steel", "lat": 16.652, "lon": 74.288},
        ])

    _FACILITY_TREE = BallTree(np.radians(_FACILITIES_CACHE_DF[["lat", "lon"]].values), metric="haversine")
    return _FACILITIES_CACHE_DF


def find_nearest_facility(lat: float, lon: float) -> Tuple[str, str, float, str]:
    """
    Finds nearest facility, returning (fac_name, fac_cat, dist_fac_m, display_fac_name).
    Clamps display_fac_name to 'Regional Industrial Zone' if dist_fac_m > 25000m.
    """
    fac = load_all_industrial_facilities()
    global _FACILITY_TREE
    if _FACILITY_TREE is None:
        _FACILITY_TREE = BallTree(np.radians(fac[["lat", "lon"]].values), metric="haversine")

    dist, idx = _FACILITY_TREE.query(np.radians([[lat, lon]]), k=1)
    dist_m = float(dist[0, 0] * 6371000.0)
    match_idx = idx[0, 0]
    fac_name = str(fac.iloc[match_idx]["name"])
    fac_cat = str(fac.iloc[match_idx]["category"])

    if dist_m > MAX_DISPLAY_DIST_M:
        display_name = "Regional Industrial Zone"
    else:
        display_name = fac_name

    return fac_name, fac_cat, dist_m, display_name


def map_facility_category_code(c: str) -> int:
    s = str(c).lower()
    if "refinery" in s:
        return 0
    if "chemical" in s:
        return 1
    if "power" in s or "thermal" in s or "boiler" in s:
        return 2
    if "steel" in s or "metallurgy" in s or "smelt" in s or "coke" in s or "foundry" in s:
        return 3
    return 4


def build_features(df: pd.DataFrame, fac: Optional[pd.DataFrame] = None) -> pd.DataFrame:
    """
    Builds the 19-feature vector with continuous spatial-persistence logic.
    """
    if fac is None:
        fac = load_all_industrial_facilities()

    d = df.copy()
    d["acq_date"] = pd.to_datetime(d["acq_date"])
    d["day"] = (d["acq_date"] - pd.Timestamp("2000-01-01")).dt.days
    hhmm = d["acq_time"].astype(int)
    d["hour_ist"] = ((hhmm // 100 + (hhmm % 100) / 60) + 5.5) % 24
    d["month"] = d["acq_date"].dt.month
    d["is_night"] = (d["daynight"] == "N").astype(int)
    d["conf"] = d["confidence"].astype(str).str.lower().str[0].map({"l": 0, "n": 1, "h": 2}).fillna(1)
    d["ti_delta"] = d["bright_ti4"] - d["bright_ti5"]

    d["ci"] = np.floor(d.latitude / 0.01).astype(int)
    d["cj"] = np.floor(d.longitude / 0.01).astype(int)
    d["ccell"] = (
        np.floor(d.latitude / 0.05).astype(int).astype(str) + "_" +
        np.floor(d.longitude / 0.05).astype(int).astype(str)
    )
    d = d.reset_index(drop=True)

    days, frps = d["day"].values, d["frp"].values
    ij = d.groupby(["ci", "cj"]).indices
    recs = {k: (days[i], frps[i]) for k, i in ij.items()}
    hot = {w: np.zeros(len(d)) for w in (30, 90, 365)}
    first, hist = np.zeros(len(d)), np.zeros(len(d))
    for (ci, cj), idx in ij.items():
        parts = [recs[(ci + a, cj + b)] for a in (-1, 0, 1) for b in (-1, 0, 1) if (ci + a, cj + b) in recs]
        nd = np.concatenate([p[0] for p in parts])
        nf = np.concatenate([p[1] for p in parts])
        o = np.argsort(nd, kind="stable")
        nd, nf = nd[o], nf[o]
        ud, cs, cd = np.unique(nd), np.concatenate([[0], np.cumsum(nf)]), days[idx]
        for w in hot:
            hot[w][idx] = np.searchsorted(ud, cd, "left") - np.searchsorted(ud, cd - w, "left")
        pos = np.searchsorted(nd, cd, "left")
        hist[idx] = np.where(pos > 0, cs[pos] / np.maximum(pos, 1), 0)
        first[idx] = cd - nd[0]
    for w in hot:
        d[f"hot_{w}"] = hot[w]
    d["days_since_first"], d["frp_hist"] = first, hist

    gd = d.groupby(["ccell", "day"])
    d["n_day"] = gd["frp"].transform("size")
    d["frp_day"] = gd["frp"].transform("sum")

    t = gd.agg(n=("frp", "size"), f=("frp", "sum")).reset_index().sort_values(["ccell", "day"])
    tg = t.groupby("ccell")
    t["gap"] = t["day"] - tg["day"].shift()
    t["rn"] = t["n"] / tg["n"].shift()
    t["rf"] = t["f"] / tg["f"].shift()
    t["trend"] = np.select(
        [t["gap"].isna() | (t["gap"] > 3), (t["rn"] >= 1.3) | (t["rf"] >= 1.5),
         (t["rn"] <= 0.7) | (t["rf"] <= 0.6)],
        ["NEW", "GROWING", "SHRINKING"], default="STABLE"
    )
    d = d.merge(t[["ccell", "day", "trend", "rf"]], on=["ccell", "day"], how="left")
    steady = d["hot_30"] >= 15
    d.loc[steady, "trend"] = np.where(d.loc[steady, "rf"] >= 1.5, "GROWING", "PERSISTENT")

    # Spatial facility indexing using all-India database
    tree = BallTree(np.radians(fac[["lat", "lon"]].values), metric="haversine")
    dist, idx = tree.query(np.radians(d[["latitude", "longitude"]].values), k=1)
    d["dist_fac"] = dist[:, 0] * 6371000.0
    d["fac_name"] = fac["name"].values[idx[:, 0]]
    d["fac_cat"] = fac["category"].values[idx[:, 0]]
    d["fac_cat_code"] = d["fac_cat"].apply(map_facility_category_code).astype(int)

    # Clamped facility display name: if > 25km, display 'Regional Industrial Zone'
    d["display_fac_name"] = np.where(d["dist_fac"] > MAX_DISPLAY_DIST_M, "Regional Industrial Zone", d["fac_name"])

    lc = d["landcover"] if "landcover" in d else pd.Series("unknown", index=d.index)
    d["landcover"] = lc
    d["lc_code"] = lc.map({c: i for i, c in enumerate(LANDCOVER)}).fillna(-1)
    return d


def weak_labels(d: pd.DataFrame) -> np.ndarray:
    """
    Continuous Spatial-Persistence Weak Labeling Logic:
    1. If dist_fac < 5000m (5 km) OR hot_90 >= 10, heavily bias towards INDUSTRIAL_HEAT.
    2. Continuous year-round heat sources (hot_90 >= 10 or hot_365 >= 25) must natively be
       predicted as INDUSTRIAL_HEAT rather than falling back to OTHER.
    3. Flares isolated to active flaring at refineries/chemicals with high thermal output.
    """
    dist_m = d.dist_fac.values
    near_5k = dist_m <= BUFFER_M  # 5,000 meters
    near_1500 = dist_m <= 1500
    fcat = pd.Series(d.fac_cat.values).astype(str).str.lower()
    hot90, hot365, frp, month = d.hot_90.values, d.hot_365.values, d.frp.values, d.month.values
    lc = d.landcover.values
    stub_season = np.isin(month, [4, 5, 10, 11])
    kiln_season = np.isin(month, [11, 12, 1, 2, 3, 4, 5, 6])

    if (lc == "unknown").all():
        crop = ~near_5k & (frp < 20)
        forest = ~near_5k & (frp >= 20) & (d.n_day.values >= 4)
    else:
        crop, forest = (lc == "cropland") & ~near_5k, (lc == "forest") & ~near_5k

    is_refinery = fcat.str.contains("refinery|chemical", na=False).values
    is_steel = fcat.str.contains("steel|metallurgy|smelt|coke|foundry", na=False).values
    is_power = fcat.str.contains("power|thermal|boiler", na=False).values
    is_industrial_target = is_steel | is_power | (fcat == "other").values

    # Continuous year-round heat persistence condition (active >= 10 days in 90 days or >= 25 in 365)
    persistent_heat = (hot90 >= 10) | (hot365 >= 25)

    lab = np.full(len(d), "OTHER", dtype=object)

    # Agriculture & Forest fires (only outside industrial buffers and not continuous)
    lab[crop & stub_season & (hot90 <= 3) & ~persistent_heat] = "STUBBLE"
    lab[forest & (hot90 <= 5) & ~persistent_heat] = "WILDFIRE"
    lab[crop & kiln_season & (hot90 >= 6) & (hot90 <= 60) & (frp < 15) & ~near_5k] = "BRICK_KILN"

    # --- INDUSTRIAL CLASSIFICATIONS ---
    # 1. Flares at refineries/chemicals
    lab[near_1500 & is_refinery & (hot90 >= 5) & (frp >= 20.0)] = "FLARE"

    # 2. Native INDUSTRIAL_HEAT:
    # a. Proximity < 5000m to any heavy industrial asset
    lab[near_5k & (is_industrial_target | is_refinery)] = "INDUSTRIAL_HEAT"

    # b. Continuous year-round heat sources anywhere across India (even if unmapped or > 5km)
    lab[persistent_heat] = "INDUSTRIAL_HEAT"

    # c. Refinery low-temp continuous process heat
    lab[near_5k & is_refinery & (d.bright_ti4.values < 330)] = "INDUSTRIAL_HEAT"

    return lab


def severity(cls: str, r: pd.Series) -> Tuple[str, str]:
    """
    Calculates operational severity with clamped distance presentation.
    If dist_fac > 25,000m, uses 'Regional Industrial Zone' to avoid absurd output.
    """
    near_5k = r.dist_fac <= BUFFER_M
    near_1500 = r.dist_fac <= 1500
    abnormal = r.frp_hist > 0 and r.frp > 2 * r.frp_hist
    growing = r.trend == "GROWING"
    fac_display = "Regional Industrial Zone" if r.dist_fac > MAX_DISPLAY_DIST_M else str(r.fac_name)
    dist_display = "> 25 km" if r.dist_fac > MAX_DISPLAY_DIST_M else f"{r.dist_fac / 1000:.1f} km" if r.dist_fac >= 1000 else f"{int(r.dist_fac)} m"

    if cls in ("FLARE", "INDUSTRIAL_HEAT"):
        if near_1500 and abnormal:
            return "CRITICAL", f"{cls}: FRP {r.frp:.0f} MW is >2x site normal ({r.frp_hist:.0f} MW)"
        return "HARMLESS", f"{cls}: normal baseline at {fac_display} ({dist_display})"

    if near_1500:
        return "CRITICAL", f"{cls} detected {dist_display} from {fac_display} (inside active perimeter)"

    if growing and near_5k:
        return "HARMFUL", f"growing {cls} {dist_display} from {fac_display}"

    if cls == "WILDFIRE":
        return "HARMFUL", "wildfire"

    if cls == "STUBBLE":
        if r.n_day >= 5 or growing:
            return "HARMFUL", f"stubble burning cluster ({int(r.n_day)} pixels) / growing"
        return "HARMLESS", "isolated small stubble fire"

    if cls == "OTHER" and growing:
        return "HARMFUL", "unclassified but growing heat source"

    return "HARMLESS", cls.lower().replace("_", " ")
