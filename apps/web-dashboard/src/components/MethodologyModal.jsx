import React, { useState, useEffect } from 'react';

export default function MethodologyModal({ activeModal, onClose, onSwitchModal }) {
  // Local form state for Contact Us tab
  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    inquiryType: 'Emergency Alert',
    message: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeModal) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.agencyName || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }

    const ticketId = `TI-${Math.floor(1000 + Math.random() * 9000)}`;
    setToastMessage(`Transmission Sent: Operational desk logged Ticket #${ticketId}. Defense team alerted.`);
    setShowToast(true);

    // Reset form after short delay
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 2800);
  };

  return (
    <>
      {/* High-Z Glassmorphism Backdrop Overlay */}
      <div
        className="tactical-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="tactical-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header & Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Top Navigation Tabs inside Modal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onSwitchModal('methodology')}
                style={{
                  background: activeModal === 'methodology' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${activeModal === 'methodology' ? '#00e5ff' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: activeModal === 'methodology' ? '#00e5ff' : '#94a3b8',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>📘</span>
                <span>Methodology & Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchModal('classification')}
                style={{
                  background: activeModal === 'classification' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${activeModal === 'classification' ? '#a855f7' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: activeModal === 'classification' ? '#c084fc' : '#94a3b8',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>🏷️</span>
                <span>Classification & Risk Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchModal('contact')}
                style={{
                  background: activeModal === 'contact' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${activeModal === 'contact' ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
                  color: activeModal === 'contact' ? '#34d399' : '#94a3b8',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>✉️</span>
                <span>System Contact & Support</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: METHODOLOGY & AI PIPELINE ARCHITECTURE                       */}
          {/* ------------------------------------------------------------------- */}
          {activeModal === 'methodology' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>🛡️</span>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                    AI Thermal Intelligence Pipeline Architecture
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  End-to-end telemetry pipeline orchestrating multi-constellation satellite feeds, 19-dimensional feature engineering, LightGBM multi-class classification, and tactical defense risk heuristics.
                </p>
              </div>

              {/* Pipeline Flow Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {/* Stage 1 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    borderLeft: '4px solid #00e5ff',
                    borderRadius: '8px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#00e5ff', color: '#0f172a', fontWeight: 800, fontSize: '11px', padding: '2px 7px', borderRadius: '4px' }}>
                        STAGE 01
                      </span>
                      <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                        Multi-Source Ingestion & Spatial Preprocessing
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>Rolling 24h Telemetry</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    Continuous ingestion of NASA FIRMS thermal anomaly streams across the Indian subcontinent:
                    <strong> Suomi-NPP VIIRS (375m)</strong>, <strong>NOAA-20 VIIRS (375m)</strong>, and <strong>MODIS C6.1 (1km)</strong>.
                    Anomalies are harmonized into standard GeoJSON schema with UTC timestamp normalization and spatial indexing.
                  </p>
                </div>

                {/* Stage 2 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderLeft: '4px solid #a855f7',
                    borderRadius: '8px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#a855f7', color: '#0f172a', fontWeight: 800, fontSize: '11px', padding: '2px 7px', borderRadius: '4px' }}>
                        STAGE 02
                      </span>
                      <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                        19-Feature Engineering Engine & Temporal History
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 600 }}>Strict Leakage Protection</span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    Transforms raw satellite sensor detections into 19 discriminative spatial, thermal, and persistence metrics:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                      🔥 <strong style={{ color: '#f8fafc' }}>Thermal:</strong> FRP, Bright_ti4, Bright_ti5, Delta Ti (ti4 - ti5)
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                      ⏱️ <strong style={{ color: '#f8fafc' }}>Temporal:</strong> IST Hour, Month, Day/Night orbital pass
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                      📍 <strong style={{ color: '#f8fafc' }}>Spatial:</strong> Cluster Size (5km radius), Scan/Track angle
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                      🏢 <strong style={{ color: '#f8fafc' }}>Strategic Infra:</strong> Centroid distance to OSM energy assets
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                      📈 <strong style={{ color: '#f8fafc' }}>Persistence:</strong> Hot_30, Hot_90, Hot_365 historical frequency
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                      📊 <strong style={{ color: '#f8fafc' }}>Baseline:</strong> FRP_hist mean normal heat output baseline
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    borderLeft: '4px solid #f97316',
                    borderRadius: '8px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#f97316', color: '#0f172a', fontWeight: 800, fontSize: '11px', padding: '2px 7px', borderRadius: '4px' }}>
                        STAGE 03
                      </span>
                      <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                        LightGBM Gradient Boosted Multi-Class Inference
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#fb923c', fontWeight: 600 }}>GroupKFold Validated</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    Trained with GroupKFold region cross-validation to prevent spatial overfitting. Computes calibrated probability distributions across 6 categories, identifies top SHAP feature contributions, and evaluates dynamic trend (<code>NEW</code>, <code>GROWING</code>, <code>STABLE</code>, <code>PERSISTENT</code>, <code>SHRINKING</code>) against historical baselines.
                  </p>
                </div>

                {/* Stage 4 */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderLeft: '4px solid #ef4444',
                    borderRadius: '8px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#ef4444', color: '#ffffff', fontWeight: 800, fontSize: '11px', padding: '2px 7px', borderRadius: '4px' }}>
                        STAGE 04
                      </span>
                      <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                        Operational Risk Tiering & Defense Decision Heuristics
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>Tactical Actionable Intel</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                    Automates operational triage:
                    <br />
                    • <strong style={{ color: '#ef4444' }}>CRITICAL:</strong> High FRP flares or anomalous wildfires within 500m of strategic energy infrastructure.
                    <br />
                    • <strong style={{ color: '#f97316' }}>HARMFUL:</strong> High-intensity agricultural stubble burning or growing industrial emissions.
                    <br />
                    • <strong style={{ color: '#00e5ff' }}>HARMLESS:</strong> Normal permitted steady-state industrial heating or verified seasonal brick kilns.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 2: CLASSIFICATION & RISK MATRIX                                 */}
          {/* ------------------------------------------------------------------- */}
          {activeModal === 'classification' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>🏷️</span>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                    Thermal Hotspot Classification Taxonomy
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Standardized multi-spectral category definitions distinguishing routine industrial energy operations from critical environmental and defense hazards.
                </p>
              </div>

              {/* 6 Category Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {/* 1. FLARE */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(0, 229, 255, 0.4)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>⚡</span>
                    <strong style={{ color: '#00e5ff', fontSize: '14px' }}>FLARE</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45' }}>
                    High-temperature elevated or ground flaring stacks at petroleum refineries, petrochemical crackers, and gas terminals. Characterized by high Brightness Temp (I4 &gt; 340 K) and close proximity to registered facilities.
                  </p>
                </div>

                {/* 2. INDUSTRIAL_HEAT */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>🏭</span>
                    <strong style={{ color: '#c084fc', fontSize: '14px' }}>INDUSTRIAL_HEAT</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45' }}>
                    Continuous furnace heating, hot-metal tapping, blast furnaces, and power plant boiler stacks. Identified by long-term high persistence (Hot_90 &ge; 60 days) and stationary spatial coordinates.
                  </p>
                </div>

                {/* 3. STUBBLE */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(132, 204, 22, 0.4)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>🌾</span>
                    <strong style={{ color: '#a3e635', fontSize: '14px' }}>STUBBLE</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45' }}>
                    Seasonal post-harvest agricultural crop residue burning. Displays transient cluster behavior, peak daytime passes (IST 12:00-16:00), high October-November / April-May seasonality, and low multi-month persistence.
                  </p>
                </div>

                {/* 4. BRICK_KILN */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>🧱</span>
                    <strong style={{ color: '#fde047', fontSize: '14px' }}>BRICK_KILN</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45' }}>
                    Seasonal fixed-chimney (FCBTK) or Zig-Zag kiln combustion for brick baking. Modest FRP (&lt; 25 MW), recurring winter-spring operations (Dec-May), and characteristic peri-urban clustering.
                  </p>
                </div>

                {/* 5. WILDFIRE */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>🌲</span>
                    <strong style={{ color: '#f87171', fontSize: '14px' }}>WILDFIRE</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45' }}>
                    Vegetation, brush, and forest canopy fires in wilderness zones. Characterized by high FRP, rapid multi-pixel cluster expansion, and remote location far (&gt; 15 km) from any mapped industrial facility.
                  </p>
                </div>

                {/* 6. OTHER */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.4)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>❓</span>
                    <strong style={{ color: '#cbd5e1', fontSize: '14px' }}>OTHER</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45' }}>
                    Unclassified or low-confidence thermal anomalies, solar glint reflections, ephemeral municipal burning, or sub-pixel signatures requiring supplementary multi-temporal orbital passes.
                  </p>
                </div>
              </div>

              {/* Dynamic Trend Classification */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '14px 16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Dynamic Thermal Trends
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '11.5px', color: '#cbd5e1', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    🔥 <strong>NEW:</strong> First detection at this coordinate within 30 days.
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#cbd5e1', background: 'rgba(249, 115, 22, 0.15)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                    📈 <strong>GROWING:</strong> Current FRP &gt; 1.5x of historical 30-day baseline.
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#cbd5e1', background: 'rgba(0, 229, 255, 0.15)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                    ⚖️ <strong>STABLE:</strong> Consistent heat output within expected operating bounds.
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#cbd5e1', background: 'rgba(168, 85, 247, 0.15)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                    🏛️ <strong>PERSISTENT:</strong> Active anomaly present for &gt; 60 of the past 90 days.
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#cbd5e1', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    📉 <strong>SHRINKING:</strong> Current FRP &lt; 0.6x of recent baseline, indicating flame suppression.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 3: DEFENSE CONTACT & SUPPORT FORM                               */}
          {/* ------------------------------------------------------------------- */}
          {activeModal === 'contact' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>✉️</span>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                    NTRO Operational Communications & Defense Inquiries
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  Secure liaison channel for strategic infrastructure alerts, API integrations, data access keys, and technical escalation.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* Agency / Designation */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Agency / Unit Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NTRO GIS Division / IOCL Mathura Refinery"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        color: '#f8fafc',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#00e5ff')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Official Operational Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="officer@agency.gov.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        color: '#f8fafc',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#00e5ff')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                    />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Communication Priority & Type
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '9px 12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Emergency Alert">🚨 Emergency Anomaly Escalation (Near Strategic Asset)</option>
                    <option value="System Integration">⚡ API Webhook & C2 System Integration</option>
                    <option value="Technical Support">🛠️ Model Calibration & Ground-Truth Verification</option>
                    <option value="General Inquiry">📋 General Operational Inquiry</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Operational Message & Coordinates *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify coordinates, facility name, or issue description..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      padding: '9px 12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00e5ff')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 18px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #047857)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 22px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Transmit Message</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="tactical-toast">
          <span style={{ fontSize: '16px' }}>✅</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
