import React from 'react';

const STRATEGIC_PRESETS = [
  { name: 'Mathura Refinery', lat: 27.3200, lon: 77.7000, zoom: 14, badge: 'IOCL' },
  { name: 'Jamnagar Refinery', lat: 22.4000, lon: 70.0400, zoom: 14, badge: 'Reliance' },
  { name: 'Panipat Refinery', lat: 29.3900, lon: 76.8850, zoom: 14, badge: 'IOCL' },
  { name: 'Barauni Refinery', lat: 25.4300, lon: 85.9800, zoom: 14, badge: 'IOCL' },
  { name: 'Dadri Power Plant', lat: 28.5900, lon: 77.5500, zoom: 14, badge: 'NTPC' },
];

export default function PresetNav({ onSelectPreset }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        padding: '6px 12px',
        borderRadius: '30px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(0, 188, 212, 0.35)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>
        ⚡ Presets:
      </span>
      {STRATEGIC_PRESETS.map((preset, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPreset(preset.lat, preset.lon, preset.zoom, preset.name)}
          style={{
            background: 'rgba(30, 41, 59, 0.85)',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '16px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 188, 212, 0.25)';
            e.currentTarget.style.borderColor = '#00e5ff';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.85)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>{preset.name}</span>
          <span style={{ fontSize: '9px', background: '#00838f', color: '#ffffff', padding: '1px 5px', borderRadius: '8px' }}>
            {preset.badge}
          </span>
        </button>
      ))}
    </div>
  );
}
