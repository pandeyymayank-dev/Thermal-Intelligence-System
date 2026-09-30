"""
NTRO thermal hotspot classifier - single-file pipeline.

  python pipeline.py demo        # make synthetic data (to test the pipeline end to end)
  python pipeline.py train       # features -> weak labels -> CV -> save model
  python pipeline.py predict     # classify latest day (or --date YYYY-MM-DD)

Inputs (data/):
  firms.csv       standard FIRMS VIIRS columns: latitude, longitude, bright_ti4, scan, track,
                  acq_date, acq_time, confidence, bright_ti5, frp, daynight
                  (+ optional column 'landcover': cropland/forest/urban/other)
  facilities.csv  name, category (Refinery/Chemical/Thermal Power/Steel/Other), lat, lon
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
DATA, OUT, MODEL = BASE_DIR / "data", BASE_DIR / "outputs", BASE_DIR / "models"
CLASSES = ["FLARE", "INDUSTRIAL_HEAT", "STUBBLE", "BRICK_KILN", "WILDFIRE", "OTHER"]
LANDCOVER = ["cropland", "forest", "urban", "other"]
FAC_CATS = ["Refinery", "Chemical", "Thermal Power", "Steel", "Other"]
BUFFER_M = 5000          # heavy industrial proximity buffer (5km)
MAX_DISPLAY_DIST_M = 25000  # regional industrial zone boundary
FEATS = ["frp", "bright_ti4", "ti_delta", "conf", "is_night", "scan", "track", "hour_ist",
         "month", "hot_30", "hot_90", "hot_365", "days_since_first", "frp_hist",
         "n_day", "frp_day", "dist_fac", "fac_cat_code", "lc_code"]


# ----------------------------------------------------------------------------------
# 1. FEATURES  (every history feature uses ONLY earlier days -> no future leakage)
# ----------------------------------------------------------------------------------
def build_features(df, fac):
    d = df.copy()
    d["acq_date"] = pd.to_datetime(d["acq_date"])
    d["day"] = (d["acq_date"] - pd.Timestamp("2000-01-01")).dt.days
    hhmm = d["acq_time"].astype(int)
    d["hour_ist"] = ((hhmm // 100 + (hhmm % 100) / 60) + 5.5) % 24     # UTC -> IST
    d["month"] = d["acq_date"].dt.month
    d["is_night"] = (d["daynight"] == "N").astype(int)
    d["conf"] = d["confidence"].astype(str).str.lower().str[0].map({"l": 0, "n": 1, "h": 2}).fillna(1)
    d["ti_delta"] = d["bright_ti4"] - d["bright_ti5"]

    # grid: ~1.1 km cells for persistence (3x3 neighbourhood absorbs VIIRS pixel jitter),
    # ~5 km cells for cluster/trend
    d["ci"] = np.floor(d.latitude / 0.01).astype(int)
    d["cj"] = np.floor(d.longitude / 0.01).astype(int)
    d["ccell"] = (np.floor(d.latitude / 0.05).astype(int).astype(str) + "_" +
                  np.floor(d.longitude / 0.05).astype(int).astype(str))
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
        for w in hot:   # distinct EARLIER days this neighbourhood was hot
            hot[w][idx] = np.searchsorted(ud, cd, "left") - np.searchsorted(ud, cd - w, "left")
        pos = np.searchsorted(nd, cd, "left")               # mean FRP of EARLIER detections
        hist[idx] = np.where(pos > 0, cs[pos] / np.maximum(pos, 1), 0)
        first[idx] = cd - nd[0]
    for w in hot:
        d[f"hot_{w}"] = hot[w]
    d["days_since_first"], d["frp_hist"] = first, hist

    # same-day cluster size around this hotspot
    gd = d.groupby(["ccell", "day"])
    d["n_day"] = gd["frp"].transform("size")
    d["frp_day"] = gd["frp"].transform("sum")

    # trend vs previous observation of this area (Head C)
    t = gd.agg(n=("frp", "size"), f=("frp", "sum")).reset_index().sort_values(["ccell", "day"])
    tg = t.groupby("ccell")
    t["gap"] = t["day"] - tg["day"].shift()
    t["rn"] = t["n"] / tg["n"].shift()
    t["rf"] = t["f"] / tg["f"].shift()
    t["trend"] = np.select(
        [t["gap"].isna() | (t["gap"] > 3), (t["rn"] >= 1.3) | (t["rf"] >= 1.5),
         (t["rn"] <= 0.7) | (t["rf"] <= 0.6)],
        ["NEW", "GROWING", "SHRINKING"], default="STABLE")
    d = d.merge(t[["ccell", "day", "trend", "rf"]], on=["ccell", "day"], how="left")
    steady = d["hot_30"] >= 15          # long-running source: only call it GROWING if FRP jumps
    d.loc[steady, "trend"] = np.where(d.loc[steady, "rf"] >= 1.5, "GROWING", "PERSISTENT")

    # nearest strategic facility
    tree = BallTree(np.radians(fac[["lat", "lon"]].values), metric="haversine")
    dist, idx = tree.query(np.radians(d[["latitude", "longitude"]].values), k=1)
    d["dist_fac"] = dist[:, 0] * 6371000
    d["fac_name"] = fac["name"].values[idx[:, 0]]
    d["fac_cat"] = fac["category"].values[idx[:, 0]]

    # Map facility categories directly (0: Refinery, 1: Chemical, 2: Thermal Power, 3: Steel, 4: Other)
    def map_fac_cat(c):
        s = str(c).lower()
        if "refinery" in s: return 0
        if "chemical" in s: return 1
        if "power" in s or "thermal" in s or "boiler" in s: return 2
        if "steel" in s or "metallurgy" in s or "smelt" in s or "coke" in s: return 3
        return 4
    d["fac_cat_code"] = d["fac_cat"].apply(map_fac_cat).astype(int)

    lc = d["landcover"] if "landcover" in d else pd.Series("unknown", index=d.index)
    d["landcover"] = lc
    d["lc_code"] = lc.map({c: i for i, c in enumerate(LANDCOVER)}).fillna(-1)
    return d


# ----------------------------------------------------------------------------------
# 2. WEAK LABELS  (rules -> training labels; model learns native weights)
# ----------------------------------------------------------------------------------
def weak_labels(d):
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

    # Continuous spatial-persistence condition:
    # Any heat source active >= 10 distinct days in 90 days or >= 25 in 365 days
    persistent_heat = (hot90 >= 10) | (hot365 >= 25)

    lab = np.full(len(d), "OTHER", dtype=object)
    lab[crop & stub_season & (hot90 <= 3) & ~persistent_heat] = "STUBBLE"
    lab[forest & (hot90 <= 5) & ~persistent_heat] = "WILDFIRE"
    lab[crop & kiln_season & (hot90 >= 6) & (hot90 <= 60) & (frp < 15) & ~near_5k] = "BRICK_KILN"

    # Facility Proximity Classification:
    # 1. Refinery / Petrochemical gas flaring
    lab[near_1500 & is_refinery & (hot90 >= 5) & (frp >= 20.0)] = "FLARE"

    # 2. Native INDUSTRIAL_HEAT:
    # a. Proximity < 5000m to any heavy industrial asset
    lab[near_5k & (is_industrial_target | is_refinery)] = "INDUSTRIAL_HEAT"

    # b. Continuous year-round heat sources anywhere across India (even if unmapped or > 5km)
    lab[persistent_heat] = "INDUSTRIAL_HEAT"

    # c. Refinery low-temp process heat
    lab[near_5k & is_refinery & (d.bright_ti4.values < 330)] = "INDUSTRIAL_HEAT"
    return lab


# ----------------------------------------------------------------------------------
# 3. SEVERITY (rules on top of the model; analysts can tune these numbers)
# ----------------------------------------------------------------------------------
def severity(cls, r):
    near_5k = r.dist_fac <= BUFFER_M
    near_1500 = r.dist_fac <= 1500
    abnormal = r.frp_hist > 0 and r.frp > 2 * r.frp_hist
    growing = r.trend == "GROWING"
    fac_display = "Regional Industrial Zone" if r.dist_fac > MAX_DISPLAY_DIST_M else str(r.fac_name)
    dist_display = "> 25 km" if r.dist_fac > MAX_DISPLAY_DIST_M else f"{r.dist_fac / 1000:.1f} km" if r.dist_fac >= 1000 else f"{int(r.dist_fac)} m"

    if cls in ("FLARE", "INDUSTRIAL_HEAT"):
        if near_1500 and abnormal:
            return "CRITICAL", f"{cls}: FRP {r.frp:.0f} MW is >2x this site's normal ({r.frp_hist:.0f} MW)"
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


def presence_status(days_since_last_detection):
    """For a known fire NOT seen in the latest pass: don't say 'extinguished' too early."""
    if days_since_last_detection < 2:
        return "UNKNOWN_GAP"          # could be cloud / between overpasses
    return "LIKELY_EXTINGUISHED"      # several passes without detection (add cloud mask for certainty)


# ----------------------------------------------------------------------------------
# 4. TRAIN / PREDICT
# ----------------------------------------------------------------------------------
def make_model():
    if HAVE_LGBM:
        return lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05, num_leaves=31,
                                  class_weight="balanced", verbose=-1)
    return HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, class_weight="balanced")


def train():
    fac, df = pd.read_csv(DATA / "facilities.csv"), pd.read_csv(DATA / "firms.csv")
    d = build_features(df, fac)
    d = d[d.day >= d.day.min() + 90].copy()          # first 90 days = no history yet
    d["label"] = weak_labels(d)
    print("weak label counts:\n", d.label.value_counts(), "\n")
    X, y = d[FEATS], d.label.map({c: i for i, c in enumerate(CLASSES)}).values
    groups = (np.floor(d.latitude * 2) * 1000 + np.floor(d.longitude * 2)).astype(int).values
    n_splits = min(5, len(np.unique(groups)))
    oof = np.zeros(len(d), dtype=int)
    for tr, va in GroupKFold(n_splits=n_splits).split(X, y, groups):   # region-wise split
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
    if HAVE_LGBM:      # per-hotspot top reasons from LightGBM contributions
        contrib = m.booster_.predict(t[FEATS], pred_contrib=True).reshape(len(t), len(m.classes_), -1)
        t["top_features"] = [", ".join(f"{FEATS[j]}={t.iloc[i][FEATS[j]]:.3g}"
                                       for j in np.argsort(-contrib[i, c, :-1])[:3])
                             for i, c in enumerate(ci)]
    t["fac_name"] = np.where(t["dist_fac"] > MAX_DISPLAY_DIST_M, "Regional Industrial Zone", t["fac_name"])
    OUT.mkdir(exist_ok=True)
    cols = ["latitude", "longitude", "acq_date", "cls", "confidence_pct", "trend", "severity",
            "why", "fac_name", "dist_fac", "frp", "bright_ti4", "frp_hist"] + (["top_features"] if HAVE_LGBM else [])
    res = t[cols].sort_values("severity")
    res.to_csv(OUT / "classified.csv", index=False)
    print(res.head(15).to_string(index=False))
    print(f"\n{len(t)} hotspots on {day.date()} -> outputs/classified.csv")
    return res



# ----------------------------------------------------------------------------------
# 5. DEMO DATA  (synthetic - ONLY to test the pipeline; accuracy on it means nothing)
# ----------------------------------------------------------------------------------
def make_demo():
    rng = np.random.default_rng(0)
    DATA.mkdir(exist_ok=True)
    fac = pd.DataFrame({"name": ["Refinery A", "Refinery B", "Power C", "Steel D", "Chem E"],
                        "category": ["Refinery", "Refinery", "Thermal Power", "Steel", "Chemical"],
                        "lat": [22.30, 26.20, 23.80, 22.80, 21.10],
                        "lon": [70.10, 80.30, 86.40, 86.20, 72.80]})
    rows = []

    def add(lat, lon, date, frp, lc, night=None):
        night = rng.random() < 0.5 if night is None else night
        rows.append(dict(latitude=lat, longitude=lon, bright_ti4=min(367, 310 + frp * 0.9 + rng.normal(0, 4)),
                         scan=rng.uniform(0.4, 0.7), track=rng.uniform(0.4, 0.7),
                         acq_date=date.strftime("%Y-%m-%d"),
                         acq_time=int(rng.integers(2000, 2130)) if night else int(rng.integers(730, 830)),
                         confidence=rng.choice(["n", "h"], p=[0.3, 0.7]),
                         bright_ti5=285 + rng.normal(0, 3), frp=frp,
                         daynight="N" if night else "D", landcover=lc))

    days = pd.date_range("2023-10-01", "2025-09-30")
    spikes = set(rng.choice(len(days), 6, replace=False))
    for i, dt in enumerate(days):
        for _, f in fac.iterrows():
            refinery = f.category in ("Refinery", "Chemical")
            if rng.random() < (0.9 if refinery else 0.8):
                base = 50 if refinery else 25
                for _ in range(int(rng.integers(1, 4))):
                    frp = rng.lognormal(np.log(base), 0.25) * (3 if (i in spikes and f["name"] == "Refinery A") else 1)
                    add(f.lat + rng.normal(0, 0.002), f.lon + rng.normal(0, 0.002), dt, frp, "other")
    for yr in (2023, 2024, 2025):
        for _ in range(400):                                   # stubble (Punjab), 1-2 day fires
            st = pd.Timestamp(yr, 10, 10) + pd.Timedelta(days=int(rng.integers(0, 40)))
            lat, lon = rng.uniform(29.5, 31.5), rng.uniform(74, 76.5)
            for k in range(int(rng.integers(1, 3))):
                for _ in range(int(rng.integers(1, 4))):
                    add(lat + rng.normal(0, .004), lon + rng.normal(0, .004), st + pd.Timedelta(days=k),
                        rng.uniform(2, 15), "cropland")
    kilns = [(rng.uniform(25, 27), rng.uniform(80, 83)) for _ in range(40)]
    for dt in days:                                            # brick kilns (Nov-Jun)
        if dt.month in (11, 12, 1, 2, 3, 4, 5, 6):
            for la, lo in kilns:
                if rng.random() < 0.35:
                    add(la + rng.normal(0, .001), lo + rng.normal(0, .001), dt, rng.uniform(3, 10), "cropland")
    for yr in (2024, 2025):                                    # wildfires: grow then shrink
        for _ in range(25):
            st = pd.Timestamp(yr, 3, 1) + pd.Timedelta(days=int(rng.integers(0, 110)))
            lat, lon, L = rng.uniform(29.5, 30.5), rng.uniform(78.5, 79.5), int(rng.integers(3, 9))
            for k in range(L):
                for _ in range(1 + int(6 * np.sin(np.pi * (k + .5) / L))):
                    add(lat + rng.normal(0, .004 * (k + 1)), lon + rng.normal(0, .004 * (k + 1)),
                        st + pd.Timedelta(days=k), rng.uniform(8, 30), "forest")
    for _ in range(300):                                       # noise
        add(rng.uniform(15, 30), rng.uniform(70, 88), days[int(rng.integers(0, len(days)))],
            rng.uniform(1, 8), rng.choice(["urban", "other"]))
    pd.DataFrame(rows).to_csv(DATA / "firms.csv", index=False)
    fac.to_csv(DATA / "facilities.csv", index=False)
    print(f"demo data written: {len(rows)} hotspots -> data/firms.csv, data/facilities.csv")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["demo", "train", "predict"])
    ap.add_argument("--date")
    a = ap.parse_args()
    {"demo": make_demo, "train": train, "predict": lambda: predict(a.date)}[a.cmd]()
