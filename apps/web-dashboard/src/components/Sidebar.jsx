import React, { useMemo } from 'react';

export default function Sidebar({
  isOpen,
  onToggleOpen,
  showHotspots,
  onToggleHotspots,
  severityFilters,
  onToggleSeverity,
  criticalCount,
  harmfulCount,
  harmlessCount,
  categoryFilters,
  onToggleCategory,
  onSelectAllCategories,
  onClearAllCategories,
  allCategories,
  minFRP,
  onChangeMinFRP,
  onSync,
  isSyncing,
  lastSynced,
  syncStatus,
  filteredCount,
  totalCount,
  hotspots = null,
}) {
  // Robust case-insensitive counter aggregation
  const counts = useMemo(() => {
    const res = { CRITICAL: 0, HARMFUL: 0, HARMLESS: 0 };
    if (!hotspots || !hotspots.features) {
      return {
        CRITICAL: criticalCount || 0,
        HARMFUL: harmfulCount || 0,
        HARMLESS: harmlessCount || 0,
      };
    }

    hotspots.features.forEach((f) => {
      const sev = (f.properties?.severity || f.properties?.threat_level || '').toUpperCase();
      if (sev.includes('CRITICAL')) res.CRITICAL++;
      else if (sev.includes('HARMFUL')) res.HARMFUL++;
      else res.HARMLESS++; // Default to harmless
    });

    return res;
  }, [hotspots, criticalCount, harmfulCount, harmlessCount]);
  return (
    <>
      {/* Tactical Layer Controls & Multi-Select Filters Sidebar */}
      <div
        className="tactical-panel"
        style={{
          position: 'absolute',
          top: '16px',
          left: isOpen ? '16px' : '-330px',
          bottom: '16px',
          width: '320px',
          zIndex: 1100,
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 15, 29, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#38bdf8' }}>🛡️</span>
            <span style={{ fontWeight: 700, fontSize: '13.5px', letterSpacing: '0.4px', color: '#f8fafc' }}>
              TACTICAL FILTERS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10.5px',
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {filteredCount} / {totalCount}
            </span>
            <button
              type="button"
              onClick={onToggleOpen}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '15px',
                cursor: 'pointer',
                padding: '2px 4px',
              }}
              title="Collapse Panel"
            >
              ◀
            </button>
          </div>
        </div>

        {/* Scrollable Operational Filters Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Section 1: Active Satellite GIS Layer (NASA Hotspots Only) */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Active Satellite GIS Layer
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#f8fafc' }}>
                <input
                  type="checkbox"
                  checked={showHotspots}
                  onChange={onToggleHotspots}
                  style={{ accentColor: '#ef4444', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>NASA Thermal Hotspots</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'rgba(239, 68, 68, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {filteredCount}
              </span>
            </label>
          </div>

          {/* Section 2: Severity Toggles */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Operational Severity
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* CRITICAL */}
              <button
                type="button"
                onClick={() => onToggleSeverity('CRITICAL')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: severityFilters.includes('CRITICAL') ? '1px solid #ef4444' : '1px solid rgba(148, 163, 184, 0.15)',
                  background: severityFilters.includes('CRITICAL') ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                  color: severityFilters.includes('CRITICAL') ? '#ef4444' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span>CRITICAL HAZARD</span>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.25)', padding: '1px 6px', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {counts.CRITICAL}
                </span>
              </button>

              {/* HARMFUL */}
              <button
                type="button"
                onClick={() => onToggleSeverity('HARMFUL')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: severityFilters.includes('HARMFUL') ? '1px solid #f97316' : '1px solid rgba(148, 163, 184, 0.15)',
                  background: severityFilters.includes('HARMFUL') ? 'rgba(249, 115, 22, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                  color: severityFilters.includes('HARMFUL') ? '#f97316' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                  <span>HARMFUL EMISSION</span>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(249, 115, 22, 0.25)', padding: '1px 6px', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {counts.HARMFUL}
                </span>
              </button>

              {/* HARMLESS */}
              <button
                type="button"
                onClick={() => onToggleSeverity('HARMLESS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: severityFilters.includes('HARMLESS') ? '1px solid #facc15' : '1px solid rgba(148, 163, 184, 0.15)',
                  background: severityFilters.includes('HARMLESS') ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: severityFilters.includes('HARMLESS') ? '#facc15' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#facc15' }} />
                  <span>PERMITTED / HARMLESS</span>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(250, 204, 21, 0.22)', padding: '1px 6px', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {counts.HARMLESS}
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: Classification Categories Grid */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Classification
              </span>
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                <span onClick={onSelectAllCategories} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                  All
                </span>
                <span onClick={onClearAllCategories} style={{ color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}>
                  None
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {allCategories.map((cat) => {
                const isSelected = categoryFilters.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: isSelected ? `1px solid ${cat.color}` : '1px solid rgba(148, 163, 184, 0.12)',
                      background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? '#f8fafc' : '#64748b',
                      fontSize: '11px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? cat.color : 'transparent',
                        border: `1px solid ${cat.color}`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: FRP Heat Intensity Slider */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Min Heat Output (FRP)
              </span>
              <span style={{ fontSize: '11px', color: '#ff9100', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                {minFRP > 0 ? `≥ ${minFRP} MW` : 'All Intensities'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={minFRP}
              onChange={(e) => onChangeMinFRP(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#ff9100',
                cursor: 'pointer',
                marginBottom: '4px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
              <span>0 MW</span>
              <span>50 MW</span>
              <span>100 MW</span>
              <span>150+ MW</span>
            </div>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            style={{
              width: '100%',
              background: isSyncing ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              borderRadius: '6px',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              letterSpacing: '0.3px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => !isSyncing && (e.currentTarget.style.borderColor = '#38bdf8')}
            onMouseLeave={(e) => !isSyncing && (e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.35)')}
          >
            {isSyncing ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '11px',
                    height: '11px',
                    border: '2px solid #f8fafc',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Classifying Telemetry...</span>
              </>
            ) : (
              <>
                <span>↻</span>
                <span>SYNC &amp; RUN INFERENCE</span>
              </>
            )}
          </button>

          {/* Sync Status Badge */}
          {lastSynced && (
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#38bdf8', textAlign: 'center', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              ⏱️ {lastSynced}
            </div>
          )}

          {syncStatus && (
            <div style={{ marginTop: '6px', fontSize: '10.5px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.35' }}>
              {syncStatus}
            </div>
          )}
        </div>
      </div>

      {/* Floating Toggle Button when Left Panel is Collapsed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="tactical-panel"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 1100,
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>🛡️</span>
          <span>FILTERS ({filteredCount})</span>
        </button>
      )}
    </>
  );
}
