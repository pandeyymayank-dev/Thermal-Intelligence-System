import json
import numpy as np
import pandas as pd
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
STORAGE_DIR = PROJECT_DIR / "storage"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# 1. Export strategic facilities from storage/facility_cache.json
def export_facilities():
    with open(STORAGE_DIR / "facility_cache.json", "r") as f:
        fc = json.load(f)

    fac_rows = []
    for feat in fc.get("features", []):
        props = feat.get("properties", {})
        geom = feat.get("geometry", {})
        coords = geom.get("coordinates", [[]])[0]
        lats = [pt[1] for pt in coords]
        lons = [pt[0] for pt in coords]
        clat = round(sum(lats) / len(lats), 6) if lats else 0.0
        clon = round(sum(lons) / len(lons), 6) if lons else 0.0
        
        name = props.get("facility_name", "Unknown Facility")
        cat_raw = props.get("category", "Other")
        
        # category must be one of: Refinery, Chemical, Thermal Power, Steel, Other
        if "Refinery" in cat_raw:
            cat = "Refinery"
        elif "Power" in cat_raw:
            cat = "Thermal Power"
        elif "Steel" in cat_raw:
            cat = "Steel"
        elif "Chemical" in cat_raw:
            cat = "Chemical"
        else:
            cat = "Other"
            
        fac_rows.append({"name": name, "category": cat, "lat": clat, "lon": clon})

    fac_df = pd.DataFrame(fac_rows)
    fac_df.to_csv(DATA_DIR / "facilities.csv", index=False)
    print(f"Exported {len(fac_df)} facilities to {DATA_DIR / 'facilities.csv'}")
    return fac_df


# 2. Export and synthesize FIRMS data anchored to facilities and real 2026-09-29/30 observations
def export_and_synthesize_firms(fac_df):
    rng = np.random.default_rng(42)
    rows = []

    def add_row(lat, lon, date_str, frp, bright_ti4, bright_ti5, scan, track, acq_time, conf, daynight):
        rows.append({
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "bright_ti4": round(bright_ti4, 2),
            "bright_ti5": round(bright_ti5, 2),
            "scan": round(scan, 2),
            "track": round(track, 2),
            "acq_date": date_str,
            "acq_time": int(acq_time),
            "confidence": conf,
            "frp": round(frp, 2),
            "daynight": daynight
        })

    # A. 12-month synthetic history anchored to facilities and fire regimes: 2025-10-01 to 2026-09-28 (363 days)
    days = pd.date_range("2025-10-01", "2026-09-28")
    
    # Facilities: Flares and Industrial heat
    for dt in days:
        dt_str = dt.strftime("%Y-%m-%d")
        for _, f in fac_df.iterrows():
            is_refinery = f.category in ("Refinery", "Chemical")
            # 85% detection probability on any day for persistent thermal sources
            if rng.random() < (0.90 if is_refinery else 0.85):
                base_frp = 45 if is_refinery else 30
                num_pts = int(rng.integers(1, 3))
                for _ in range(num_pts):
                    # within ~200-400m radius of facility centroid (well inside 1500m BUFFER_M)
                    dlat = rng.normal(0, 0.002)
                    dlon = rng.normal(0, 0.002)
                    frp = float(rng.lognormal(np.log(base_frp), 0.25))
                    b4 = min(367.0, 315.0 + frp * 0.8 + rng.normal(0, 3))
                    b5 = 288.0 + rng.normal(0, 3)
                    night = rng.random() < 0.5
                    t = int(rng.integers(2000, 2130)) if night else int(rng.integers(730, 830))
                    c = rng.choice(["n", "h"], p=[0.25, 0.75])
                    add_row(f.lat + dlat, f.lon + dlon, dt_str, frp, b4, b5, 0.5, 0.6, t, c, "N" if night else "D")

    # Stubble burning (Punjab, Haryana, UP crop belt) in stubble season (Nov 2025 and Apr-May 2026)
    # Stubble season in pipeline.py: [4, 5, 10, 11]
    for yr in (2025, 2026):
        # Kharif post-harvest (Oct-Nov)
        if yr == 2025:
            stubble_start = pd.Timestamp(2025, 10, 10)
            n_events = 250
        else: # Rabi post-harvest (Apr-May 2026)
            stubble_start = pd.Timestamp(2026, 4, 15)
            n_events = 250
            
        for _ in range(n_events):
            event_date = stubble_start + pd.Timedelta(days=int(rng.integers(0, 35)))
            if event_date > pd.Timestamp("2026-09-28"):
                continue
            lat = rng.uniform(29.0, 31.8)
            lon = rng.uniform(74.5, 77.5)
            # Burning lasts 1 to 2 days, hot90 <= 3, frp < 20
            for day_offset in range(int(rng.integers(1, 3))):
                dt_str = (event_date + pd.Timedelta(days=day_offset)).strftime("%Y-%m-%d")
                for _ in range(int(rng.integers(1, 3))):
                    frp = rng.uniform(3.0, 18.0)
                    b4 = 310.0 + frp * 0.7 + rng.normal(0, 2)
                    b5 = 286.0 + rng.normal(0, 2)
                    add_row(lat + rng.normal(0, 0.003), lon + rng.normal(0, 0.003), dt_str, frp, b4, b5,
                            0.5, 0.6, int(rng.integers(740, 830)), "n", "D")

    # Brick Kilns (operational during dry season: Nov through Jun; hot90 in [6, 60], frp < 15)
    kiln_locs = [(rng.uniform(25.0, 27.5), rng.uniform(80.0, 84.5)) for _ in range(50)]
    for dt in days:
        if dt.month in (11, 12, 1, 2, 3, 4, 5, 6):
            dt_str = dt.strftime("%Y-%m-%d")
            for kla, klo in kiln_locs:
                if rng.random() < 0.28:
                    frp = rng.uniform(3.0, 12.0)
                    b4 = 310.0 + frp * 0.6 + rng.normal(0, 2)
                    b5 = 288.0 + rng.normal(0, 2)
                    add_row(kla + rng.normal(0, 0.001), klo + rng.normal(0, 0.001), dt_str, frp, b4, b5,
                            0.45, 0.55, int(rng.integers(730, 830)), "n", "D")

    # Wildfires (dry season forest fires in Central & Northern belts: Feb - May 2026, hot90 <= 5, frp >= 20, n_day >= 4)
    for _ in range(40):
        wf_start = pd.Timestamp(2026, 2, 15) + pd.Timedelta(days=int(rng.integers(0, 90)))
        wlat = rng.uniform(21.0, 24.5) # Central India forests (MP/Chhattisgarh/Odisha)
        wlon = rng.uniform(80.5, 84.5)
        duration = int(rng.integers(2, 5))
        for d in range(duration):
            dt_str = (wf_start + pd.Timedelta(days=d)).strftime("%Y-%m-%d")
            # cluster size >= 4 pixels to satisfy n_day >= 4
            num_px = int(rng.integers(4, 8))
            for _ in range(num_px):
                frp = rng.uniform(22.0, 65.0)
                b4 = min(367.0, 320.0 + frp * 0.5 + rng.normal(0, 3))
                b5 = 285.0 + rng.normal(0, 2)
                add_row(wlat + rng.normal(0, 0.006), wlon + rng.normal(0, 0.006), dt_str, frp, b4, b5,
                        0.55, 0.65, int(rng.integers(730, 830)), "h", "D")

    # Background Noise / OTHER: isolated, non-clustered, or off-season
    for _ in range(350):
        dt = days[int(rng.integers(0, len(days)))]
        add_row(rng.uniform(15.0, 30.0), rng.uniform(72.0, 86.0), dt.strftime("%Y-%m-%d"),
                rng.uniform(2.0, 15.0), 312.0, 288.0, 0.5, 0.6, 800, "n", "D")

    # B. Incorporate Real Project Hotspots from storage/NASA_FIRMS_VIIRS_India_Unified_24h.csv (2026-09-29 and 2026-09-30)
    real_csv = STORAGE_DIR / "NASA_FIRMS_VIIRS_India_Unified_24h.csv"
    if real_csv.exists():
        real_df = pd.read_csv(real_csv)
        print(f"Adding {len(real_df)} real FIRMS hotspots from {real_csv}")
        for _, r in real_df.iterrows():
            b4 = float(r.get("bright_ti4", 310.0)) if pd.notna(r.get("bright_ti4")) else 310.0
            b5 = float(r.get("bright_ti5", b4 - 15.0)) if pd.notna(r.get("bright_ti5")) else (b4 - 15.0)
            rows.append({
                "latitude": round(float(r["latitude"]), 5),
                "longitude": round(float(r["longitude"]), 5),
                "bright_ti4": round(b4, 2),
                "bright_ti5": round(b5, 2),
                "scan": round(float(r.get("scan", 0.5)), 2),
                "track": round(float(r.get("track", 0.6)), 2),
                "acq_date": str(r["acq_date"]),
                "acq_time": int(str(r["acq_time"]).replace(":", "")) if pd.notna(r.get("acq_time")) else 0,
                "confidence": str(r.get("confidence", "n")).lower()[:1],
                "frp": round(float(r.get("frp", 5.0)), 2),
                "daynight": str(r.get("daynight", "D")).upper()[:1]
            })

    firms_df = pd.DataFrame(rows)
    firms_df.to_csv(DATA_DIR / "firms.csv", index=False)
    print(f"Exported total {len(firms_df)} hotspots to {DATA_DIR / 'firms.csv'}")
    print(f"Date range: {firms_df['acq_date'].min()} to {firms_df['acq_date'].max()} ({firms_df['acq_date'].nunique()} unique dates)")
    return firms_df

if __name__ == "__main__":
    fac_df = export_facilities()
    export_and_synthesize_firms(fac_df)
