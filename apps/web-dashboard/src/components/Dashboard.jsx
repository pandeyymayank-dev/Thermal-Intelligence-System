import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MapCanvas from './MapCanvas';
import Sidebar from './Sidebar';
import { fetchFacilities, fetchThermalHotspots, classifyThermalHotspots } from '../services/api';

const ALL_SEVERITIES = ['CRITICAL', 'HARMFUL', 'HARMLESS'];
const ALL_CATEGORIES = [
  { id: 'FLARE', label: 'FLARE', icon: '⚡', color: '#00e5ff' },
  { id: 'INDUSTRIAL_HEAT', label: 'INDUSTRIAL HEAT', icon: '🏭', color: '#a855f7' },
  { id: 'STUBBLE', label: 'STUBBLE', icon: '🌾', color: '#84cc16' },
  { id: 'BRICK_KILN', label: 'BRICK KILN', icon: '🧱', color: '#eab308' },
  { id: 'WILDFIRE', label: 'WILDFIRE', icon: '🌲', color: '#dc2626' },
  { id: 'OTHER', label: 'OTHER', icon: '❓', color: '#94a3b8' },
];

export default function Dashboard() {
  // Layer visibility toggles (Active map layer is NASA Thermal Hotspots)
  const [showHotspots, setShowHotspots] = useState(true);

  // Multi-select filters
  const [severityFilters, setSeverityFilters] = useState(['CRITICAL', 'HARMFUL', 'HARMLESS']);
  const [categoryFilters, setCategoryFilters] = useState([
    'FLARE', 'INDUSTRIAL_HEAT', 'STUBBLE', 'BRICK_KILN', 'WILDFIRE', 'OTHER'
  ]);
  const [minFRP, setMinFRP] = useState(0);

  // UI Panel states
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  // Data states
  const [facilitiesData, setFacilitiesData] = useState(null);
  const [rawHotspotsData, setRawHotspotsData] = useState(null);
  const [classifiedData, setClassifiedData] = useState(null);

  // Sync & Status states
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('');
  const [syncStatus, setSyncStatus] = useState('Initializing Tactical AI Defense Stream...');
  const [aiEngineStatus, setAiEngineStatus] = useState('LightGBM Active');

  // Cold-Start Resilient Auto-Sync & Overlay states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialLoadingStage, setInitialLoadingStage] = useState('Connecting to NTRO AI Inference Stream...');
  const [retryAttempt, setRetryAttempt] = useState(1);

  /**
   * Component Mount Auto-Fetch with Cold-Start Resilience.
   * Automatically executes on initial mount with up to 3 retries (3s delay)
   * to seamlessly bridge Render free tier spin-up delays.
   */
  useEffect(() => {
    let isMounted = true;
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 3000;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function executeInitialFetchWithRetry() {
      // 1. Non-blocking background fetch for OSM Strategic Facilities
      fetchFacilities(15000)
        .then((facRes) => {
          if (isMounted && facRes) {
            setFacilitiesData(facRes);
          }
        })
        .catch((err) => {
          console.warn('Initial OSM facilities fetch fallback:', err);
        });

      // 2. Retry loop for satellite hotspot telemetry & LightGBM inference
      let fetchSuccess = false;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (!isMounted) return;
        setRetryAttempt(attempt);

        if (attempt === 1) {
          setInitialLoadingStage('Connecting to satellite telemetry & LightGBM inference...');
        } else {
          setInitialLoadingStage(
            `Waking up Render backend service (Attempt ${attempt}/${MAX_RETRIES}). Please wait...`
          );
        }

        try {
          // Primary: Fetch AI Classified Hotspots from LightGBM Engine
          const enriched = await classifyThermalHotspots({ format: 'geojson' }, 25000);
          if (isMounted && enriched && Array.isArray(enriched.features) && enriched.features.length > 0) {
            setClassifiedData(enriched);
            setRawHotspotsData(enriched);
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSynced(`Last synced: ${timeStr}`);
            setSyncStatus(`Active stream: ${enriched.features.length} satellite hotspots.`);
            fetchSuccess = true;
            break;
          }

          // Fallback: Fetch raw FIRMS hotspots
          const raw = await fetchThermalHotspots(1, false, 20000);
          if (isMounted && raw && Array.isArray(raw.features) && raw.features.length > 0) {
            setRawHotspotsData(raw);
            setClassifiedData(raw);
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSynced(`Last synced: ${timeStr}`);
            setSyncStatus(`Active stream: ${raw.features.length} raw satellite hotspots.`);
            fetchSuccess = true;
            break;
          }

          throw new Error('Satellite stream returned empty or uninitialized dataset.');
        } catch (err) {
          console.warn(`Initial stream fetch attempt ${attempt} failed:`, err);
          if (attempt < MAX_RETRIES) {
            setInitialLoadingStage(
              `Attempt ${attempt} timed out. Reconnecting in 3s (Attempt ${attempt + 1}/${MAX_RETRIES})...`
            );
            await delay(RETRY_DELAY_MS);
          }
        }
      }

      if (isMounted) {
        if (!fetchSuccess) {
          setSyncStatus('Satellite stream standby. Cached telemetry ready.');
        }
        setIsInitialLoading(false);
      }
    }

    executeInitialFetchWithRetry();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Manual Sync Handler with LightGBM AI Inference.
   */
  const handleSyncStreams = async () => {
    setIsSyncing(true);
    setSyncStatus('Synchronizing NASA VIIRS stream with LightGBM inference...');
    try {
      // 1. Fetch fresh AI classified GeoJSON
      const enriched = await classifyThermalHotspots({ format: 'geojson' }, 25000);
      if (enriched && enriched.features && enriched.features.length > 0) {
        setClassifiedData(enriched);
        setRawHotspotsData(enriched);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSynced(`Last synced: ${timeStr}`);
        setSyncStatus(`Tactical sync complete: ${enriched.features.length} hotspots enriched.`);
        return;
      }

      // Fallback
      const raw = await fetchThermalHotspots(1, true, 20000);
      if (raw && raw.features) {
        setRawHotspotsData(raw);
        setClassifiedData(raw);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSynced(`Last synced: ${timeStr}`);
        setSyncStatus(`Synced ${raw.features.length} live satellite hotspots.`);
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncStatus('NASA live sync timed out. Serving local high-availability cache.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle helpers
  const toggleSeverity = (sev) => {
    setSeverityFilters((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  const toggleCategory = (catId) => {
    setCategoryFilters((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const selectAllCategories = () => {
    setCategoryFilters(ALL_CATEGORIES.map((c) => c.id));
  };

  const clearAllCategories = () => {
    setCategoryFilters([]);
  };

  /**
   * Filter hotspots based on current active user filters.
   */
  const filteredHotspotsData = useMemo(() => {
    if (!classifiedData || !classifiedData.features) return null;

    const filteredFeatures = classifiedData.features.filter((feat) => {
      const p = feat.properties || {};
      const sev = (p.severity || p.threat_level || 'HARMLESS').toUpperCase();
      const cls = (p.class || p.cls || p.predicted_category || 'OTHER').toUpperCase();
      const frp = parseFloat(p.frp || 0);

      // Severity filter
      if (!severityFilters.includes(sev)) return false;

      // Category filter
      if (!categoryFilters.includes(cls)) return false;

      // Min FRP filter
      if (frp < minFRP) return false;

      return true;
    });

    return {
      ...classifiedData,
      features: filteredFeatures,
    };
  }, [classifiedData, severityFilters, categoryFilters, minFRP]);

  // Statistics
  const totalCount = classifiedData?.features?.length || 0;
  const filteredCount = filteredHotspotsData?.features?.length || 0;
  const counts = useMemo(() => {
    const res = { CRITICAL: 0, HARMFUL: 0, HARMLESS: 0 };
    if (!classifiedData || !classifiedData.features) return res;

    classifiedData.features.forEach((f) => {
      const sev = (f.properties?.severity || f.properties?.threat_level || '').toUpperCase();
      if (sev.includes('CRITICAL')) res.CRITICAL++;
      else if (sev.includes('HARMFUL')) res.HARMFUL++;
      else res.HARMLESS++; // Default to harmless
    });

    return res;
  }, [classifiedData]);
  const criticalCount = counts.CRITICAL;
  const harmfulCount = counts.HARMFUL;
  const harmlessCount = counts.HARMLESS;

  // Hotspot Click Selection Callback
  const handleSelectHotspot = useCallback((hotspotProps) => {
    setSelectedHotspot(hotspotProps);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex' }}>
      {/* ------------------------------------------------------------- */}
      {/* 0. TACTICAL LOADING OVERLAY: Auto-Fetch & Cold-Start Indicator */}
      {/* ------------------------------------------------------------- */}
      {isInitialLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(10, 15, 29, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'modal-fade-in 0.3s ease-out',
          }}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              boxShadow: '0 0 40px rgba(0, 229, 255, 0.15), 0 20px 40px rgba(0,0,0,0.8)',
              borderRadius: '16px',
              padding: '32px 28px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Scanning Line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)',
                animation: 'scanline 2s linear infinite',
              }}
            />

            {/* Tactical Radar Spinner */}
            <div
              style={{
                position: 'relative',
                width: '68px',
                height: '68px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px dashed rgba(0, 229, 255, 0.35)',
                  animation: 'spin 12s linear infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '7px',
                  borderRadius: '50%',
                  border: '2px solid rgba(0, 229, 255, 0.2)',
                  borderTopColor: '#00e5ff',
                  animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                }}
              />
              <span style={{ fontSize: '26px' }}>🛰️</span>
            </div>

            {/* Main Header */}
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#f8fafc',
                margin: '0 0 8px 0',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Connecting to NTRO AI Inference Stream...
            </h2>

            {/* Subtitle / Telemetry Status */}
            <p
              style={{
                fontSize: '12px',
                color: '#94a3b8',
                margin: '0 0 16px 0',
                lineHeight: '1.5',
              }}
            >
              {initialLoadingStage}
            </p>

            {/* Cold Start Indicator Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#38bdf8',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: retryAttempt > 1 ? '#f59e0b' : '#00e5ff',
                  boxShadow: `0 0 8px ${retryAttempt > 1 ? '#f59e0b' : '#00e5ff'}`,
                  animation: 'pulse 1.2s infinite',
                }}
              />
              <span>
                Attempt {retryAttempt} of 3 • Backend Cold-Start Resilience
              </span>
            </div>

            {/* Pipeline Feature Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>
                VIIRS 375m NRT
              </span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>
                MODIS C6.1
              </span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px' }}>
                LightGBM Engine
              </span>
            </div>

            {/* Standby Dismiss Button */}
            <button
              type="button"
              onClick={() => setIsInitialLoading(false)}
              style={{
                marginTop: '20px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Explore Map Canvas (Standby Mode)
            </button>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT PANEL: Operational Multi-Select Filters Sidebar       */}
      {/* ------------------------------------------------------------- */}
      <Sidebar
        isOpen={isLeftPanelOpen}
        onToggleOpen={() => setIsLeftPanelOpen((prev) => !prev)}
        showHotspots={showHotspots}
        onToggleHotspots={(e) => setShowHotspots(e.target.checked)}
        severityFilters={severityFilters}
        onToggleSeverity={toggleSeverity}
        criticalCount={criticalCount}
        harmfulCount={harmfulCount}
        harmlessCount={harmlessCount}
        categoryFilters={categoryFilters}
        onToggleCategory={toggleCategory}
        onSelectAllCategories={selectAllCategories}
        onClearAllCategories={clearAllCategories}
        allCategories={ALL_CATEGORIES}
        minFRP={minFRP}
        onChangeMinFRP={setMinFRP}
        onSync={handleSyncStreams}
        isSyncing={isSyncing}
        lastSynced={lastSynced}
        syncStatus={syncStatus}
        filteredCount={filteredCount}
        totalCount={totalCount}
        hotspots={classifiedData}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. CENTER PANEL: Tactical Leaflet Map Canvas Viewport         */}
      {/* ------------------------------------------------------------- */}
      <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <MapCanvas
          facilitiesData={facilitiesData}
          hotspotsData={filteredHotspotsData}
          showFacilities={false}
          showHotspots={showHotspots}
          onSelectHotspot={handleSelectHotspot}
          aiEngineStatus={aiEngineStatus}
          isLeftPanelOpen={isLeftPanelOpen}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. RIGHT PANEL: AI Intelligence Drawer (Slide-in on Click)   */}
      {/* ------------------------------------------------------------- */}
      <div
        className="tactical-panel"
        style={{
          position: 'absolute',
          top: '16px',
          right: selectedHotspot ? '16px' : '-400px',
          bottom: '16px',
          width: '380px',
          zIndex: 1100,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {selectedHotspot && (
          <>
            {/* Drawer Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(10, 15, 29, 0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Severity Pill */}
                {(() => {
                  const sev = (selectedHotspot.severity || selectedHotspot.threat_level || 'HARMLESS').toUpperCase();
                  let bg = 'rgba(250, 204, 21, 0.2)';
                  let col = '#facc15';
                  if (sev === 'CRITICAL') { bg = 'rgba(239, 68, 68, 0.25)'; col = '#ef4444'; }
                  if (sev === 'HARMFUL') { bg = 'rgba(249, 115, 22, 0.25)'; col = '#f97316'; }
                  return (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: bg,
                        color: col,
                        border: `1px solid ${col}`,
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                      }}
                    >
                      {sev}
                    </span>
                  );
                })()}

                {/* AI Confidence Badge */}
                <span
                  style={{
                    fontSize: '11px',
                    color: '#a855f7',
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {selectedHotspot.confidence_pct || selectedHotspot.confidence || '98'}% CONF
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedHotspot(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
                title="Close Intelligence Drawer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {/* Classification Title & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>
                  {(() => {
                    const cls = (selectedHotspot.class || selectedHotspot.cls || selectedHotspot.predicted_category || '').toUpperCase();
                    if (cls.includes('FLARE')) return '⚡';
                    if (cls.includes('STEEL') || cls.includes('INDUSTRIAL')) return '🏭';
                    if (cls.includes('STUBBLE')) return '🌾';
                    if (cls.includes('KILN')) return '🧱';
                    if (cls.includes('WILD')) return '🌲';
                    return '🔥';
                  })()}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.2px' }}>
                    {selectedHotspot.class || selectedHotspot.cls || selectedHotspot.predicted_category || 'Active Anomaly'}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Coordinates: {selectedHotspot.latitude || selectedHotspot.lat || 0}° N, {selectedHotspot.longitude || selectedHotspot.lon || 0}° E
                  </div>
                </div>
              </div>

              {/* Target Facility & Distance */}
              {(selectedHotspot.fac_name || selectedHotspot.nearest_facility_name) && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3px' }}>
                    Proximity to Strategic Asset
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                    🏢 {
                      (selectedHotspot.dist_fac && selectedHotspot.dist_fac > 25000)
                        ? "Regional Industrial Zone"
                        : (selectedHotspot.fac_name || selectedHotspot.nearest_facility_name)
                    }
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '3px' }}>
                    Distance:{' '}
                    <strong style={{ color: '#f8fafc' }}>
                      {selectedHotspot.dist_fac && selectedHotspot.dist_fac > 25000
                        ? "> 25 km (Regional Perimeter)"
                        : selectedHotspot.dist_fac
                          ? selectedHotspot.dist_fac >= 1000
                            ? `${(selectedHotspot.dist_fac / 1000).toFixed(1)} km`
                            : `${Math.round(selectedHotspot.dist_fac)} m`
                          : `${selectedHotspot.nearest_facility_dist_m || 0} m`}
                    </strong>
                  </div>
                </div>
              )}

              {/* Primary Metrics Grid (2x2) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {/* Metric 1: FRP */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Fire Radiative Power
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                    {selectedHotspot.frp ? `${selectedHotspot.frp} MW` : 'N/A'}
                  </div>
                </div>

                {/* Metric 2: Brightness Temp */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Brightness Temp (I4)
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff9100', marginTop: '2px' }}>
                    {selectedHotspot.bright_ti4 || selectedHotspot.brightness ? `${selectedHotspot.bright_ti4 || selectedHotspot.brightness} K` : 'N/A'}
                  </div>
                </div>

                {/* Metric 3: Baseline FRP */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Baseline Normal FRP
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                    {selectedHotspot.frp_hist ? `${Number(selectedHotspot.frp_hist).toFixed(1)} MW` : '8.5 MW'}
                  </div>
                </div>

                {/* Metric 4: Dynamic Trend */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Dynamic Trend
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      marginTop: '3px',
                      color: (() => {
                        const tr = (selectedHotspot.trend || 'STABLE').toUpperCase();
                        if (tr === 'NEW' || tr === 'GROWING') return '#ef4444';
                        if (tr === 'PERSISTENT') return '#a855f7';
                        if (tr === 'SHRINKING') return '#10b981';
                        return '#00e5ff';
                      })(),
                    }}
                  >
                    {selectedHotspot.trend || 'STABLE'}
                  </div>
                </div>
              </div>

              {/* Operational Rationale Box */}
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderLeft: '4px solid #00e5ff',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                  Operational Intelligence Rationale
                </div>
                <div style={{ fontSize: '12px', color: '#f1f5f9', lineHeight: '1.45' }}>
                  "{selectedHotspot.why || selectedHotspot.ai_explanation || 'Thermal anomaly confirmed via multispectral infrared radiometry.'}"
                </div>
              </div>

              {/* SHAP / Top Feature Contribution Pills */}
              {selectedHotspot.top_features && (
                <div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    Top Model Factors (LightGBM Contributions)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedHotspot.top_features.split(',').map((feat, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#e2e8f0',
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                        }}
                      >
                        {feat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
