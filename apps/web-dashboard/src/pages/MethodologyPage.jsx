import React from 'react';

export default function MethodologyPage() {
  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '32px 24px 64px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Page Hero Header */}
        <div style={{ marginBottom: '36px', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: "'JetBrains Mono', monospace" }}>
              Technical Specifications &bull; SIH PS 26162
            </span>
          </div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.4px', color: '#f8fafc' }}>
            Methodology &amp; AI Classification Architecture
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '860px' }}>
            A comprehensive, leak-protected machine learning architecture designed for automated categorization, operational risk tiering, and historical baseline trend monitoring of thermal infrared anomalies across the Indian subcontinent.
          </p>
        </div>

        {/* Section 1: Ingestion Pipeline */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              SECTION 01
            </span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Multi-Constellation Satellite Telemetry Ingestion
            </h2>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '8px',
              padding: '20px',
              lineHeight: '1.6',
            }}
          >
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#cbd5e1' }}>
              The ingestion engine connects to the NASA Land, Atmosphere Near real-time Capability for EOS (LANCE) FIRMS API, synchronizing active orbital fire observations across the Indian landmass (bounding box: <code>68°E, 6°N</code> to <code>98°E, 37°N</code>).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Feed 1 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#f8fafc' }}>Suomi-NPP VIIRS (375m NRT)</strong>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>Primary 375m</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  High-spatial-resolution 375-meter I-band sensor. Captures small, low-intensity flaring and localized agricultural fires with minimal saturation.
                </p>
              </div>

              {/* Feed 2 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#f8fafc' }}>NOAA-20 VIIRS (375m NRT)</strong>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>Secondary 375m</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Flies 50 minutes ahead of Suomi-NPP in the same orbit, delivering rapid temporal revisit and cross-verification of active combustion signatures.
                </p>
              </div>

              {/* Feed 3 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#f8fafc' }}>MODIS C6.1 (1km Terra/Aqua)</strong>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>Baseline 1000m</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Longitudinal 20+ year baseline sensor. Used for validating multi-decadal historical hotspots and persistent industrial thermal signatures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: 19-Feature Engineering Engine */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              SECTION 02
            </span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              19-Dimensional Feature Engineering Engine
            </h2>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
              To distinguish genuine flaring or furnace operations from seasonal stubble burning and wildfires, the raw point observation is enriched into a 19-dimensional feature vector with <strong>strict temporal leakage protection</strong> (only prior calendar days are accessed for historical features):
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
              {/* Feature 1 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
                  FRP (MW)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '3px' }}>
                  Fire Radiative Power
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                  Direct pixel-level radiant energy flux in MegaWatts (MW).
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
                  T_i4 / T_i5 (K)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '3px' }}>
                  Brightness Temperatures
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                  VIIRS Channel 4 (3.9µm MWIR) and Channel 5 (11.45µm LWIR).
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
                  Delta Ti (K)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '3px' }}>
                  Thermal Differential
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                  T_i4 - T_i5; separates pure high-temperature gas flares from smoke.
                </div>
              </div>

              {/* Feature 4 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
                  IST Hour &amp; Month
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '3px' }}>
                  Temporal Diurnal Cycle
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                  Captures afternoon peak agricultural passes vs night industrial ops.
                </div>
              </div>

              {/* Feature 5 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
                  Hot_30, Hot_90, Hot_365
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '3px' }}>
                  Historical Pixel Persistence
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                  Days with active anomalies within 1km over 30, 90, and 365 days.
                </div>
              </div>

              {/* Feature 6 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", marginBottom: '4px' }}>
                  dist_fac (meters)
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '3px' }}>
                  Strategic Facility Proximity
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.4' }}>
                  Centroid geodesic distance to nearest known refinery, power, or steel plant.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: LightGBM Model Architecture */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              SECTION 03
            </span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              LightGBM Gradient Boosted Multi-Class Inference
            </h2>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '8px',
              padding: '20px',
              lineHeight: '1.6',
            }}
          >
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#cbd5e1' }}>
              The classification pipeline employs a multi-class LightGBM gradient-boosted decision tree ensemble trained with <strong>GroupKFold region-based cross-validation</strong> (splitting by spatial clusters) to guarantee that the model does not memorize local geography:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#f8fafc' }}>
                  1. Multi-Class Probability Calibration
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Outputs soft probability distributions over the 6 classes. The top-scoring class is assigned along with an explicit confidence percentage score.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#f8fafc' }}>
                  2. Dynamic Trend Evaluation
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Compares current FRP against historical baseline (<code>frp_hist</code>) to establish trend vectors: <code>NEW</code>, <code>GROWING</code>, <code>STABLE</code>, <code>PERSISTENT</code>, or <code>SHRINKING</code>.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '6px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#f8fafc' }}>
                  3. Tree SHAP Explainability Engine
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Extracts top driving feature contributions per inference (e.g. <code>frp=142MW, hot_90=82d, dist_fac=85m</code>) for operational accountability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Operational Risk Matrix */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              SECTION 04
            </span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Operational Defense Risk Matrix
            </h2>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
              Every anomaly is evaluated against operational defense heuristics to assign a tactical severity grade:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* CRITICAL */}
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <strong style={{ fontSize: '14px', color: '#ef4444' }}>CRITICAL HAZARD</strong>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  Severe uncharacteristic flaring or wildfires located within 500m of registered critical energy assets (Refineries, LNG storage, Thermal Power Stations). Demands immediate automated operator alert.
                </p>
              </div>

              {/* HARMFUL */}
              <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                  <strong style={{ fontSize: '14px', color: '#f97316' }}>HARMFUL EMISSION</strong>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  Large clusters of crop stubble burning or anomalous non-permitted industrial process spikes resulting in regional air quality degradation or perimeter hazard.
                </p>
              </div>

              {/* HARMLESS */}
              <div style={{ background: 'rgba(250, 204, 21, 0.08)', border: '1px solid rgba(250, 204, 21, 0.3)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#facc15' }} />
                  <strong style={{ fontSize: '14px', color: '#facc15' }}>PERMITTED / HARMLESS</strong>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  Routine, verified baseline operations (e.g. steady-state blast furnaces, permitted power plant stacks, seasonal operational brick kilns within environmental quotas).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Classification Category Profiles */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              SECTION 05
            </span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Classification Category Profiles
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Profile 1: FLARE */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>⚡</span>
                <strong style={{ fontSize: '15px', color: '#00e5ff' }}>FLARE</strong>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                Elevated or ground flaring stacks at petroleum refineries, petrochemical crackers, and LNG terminals.
              </p>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace" }}>
                <div>&bull; Signature: T_i4 &gt; 340 K, Delta_Ti &gt; 25 K</div>
                <div>&bull; Proximity: &lt; 500m to registered facility</div>
                <div>&bull; Risk: CRITICAL when FRP &gt; baseline; otherwise HARMLESS</div>
              </div>
            </div>

            {/* Profile 2: INDUSTRIAL_HEAT */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>🏭</span>
                <strong style={{ fontSize: '15px', color: '#c084fc' }}>INDUSTRIAL_HEAT</strong>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                Continuous thermal output from blast furnaces, steel works, smelters, and power boiler exhaust.
              </p>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace" }}>
                <div>&bull; Signature: Hot_90 &ge; 60 days (stationary pixel)</div>
                <div>&bull; Cluster: Clustered around industrial estates</div>
                <div>&bull; Risk: HARMLESS (baseline) / HARMFUL (growing)</div>
              </div>
            </div>

            {/* Profile 3: STUBBLE */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(132, 204, 22, 0.3)', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>🌾</span>
                <strong style={{ fontSize: '15px', color: '#a3e635' }}>STUBBLE</strong>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                Post-harvest agricultural crop residue burning in Punjab, Haryana, UP, and agricultural belts.
              </p>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace" }}>
                <div>&bull; Signature: Diurnal 12:00-16:00 IST peak</div>
                <div>&bull; Seasonality: Oct-Nov (Kharif), Apr-May (Rabi)</div>
                <div>&bull; Risk: HARMFUL (high smoke &amp; AQI hazard)</div>
              </div>
            </div>

            {/* Profile 4: BRICK_KILN */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>🧱</span>
                <strong style={{ fontSize: '15px', color: '#fde047' }}>BRICK_KILN</strong>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                Fixed-chimney bull trench (FCBTK) and Zig-Zag operational brick baking kilns.
              </p>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace" }}>
                <div>&bull; Signature: Modest FRP (&lt; 25 MW), cluster dense</div>
                <div>&bull; Seasonality: Dec-May peri-urban operation</div>
                <div>&bull; Risk: HARMLESS (regulated) / HARMFUL (unregulated)</div>
              </div>
            </div>

            {/* Profile 5: WILDFIRE */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>🌲</span>
                <strong style={{ fontSize: '15px', color: '#f87171' }}>WILDFIRE</strong>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                Forest canopy, brush, and wilderness fires in reserved forest ecosystems.
              </p>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace" }}>
                <div>&bull; Signature: Rapid multi-pixel expansion, high FRP</div>
                <div>&bull; Proximity: &gt; 15 km from industrial facilities</div>
                <div>&bull; Risk: CRITICAL / HARMFUL environmental emergency</div>
              </div>
            </div>

            {/* Profile 6: OTHER */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>❓</span>
                <strong style={{ fontSize: '15px', color: '#cbd5e1' }}>OTHER</strong>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                Low-confidence anomalies, ephemeral municipal burning, or sub-pixel signatures.
              </p>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace" }}>
                <div>&bull; Signature: Solar glint or transient low FRP</div>
                <div>&bull; Action: Secondary orbital pass verification</div>
                <div>&bull; Risk: HARMLESS pending orbital confirmation</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
