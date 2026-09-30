import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        color: '#f8fafc',
        zIndex: 100,
        height: '56px',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
            color: '#f8fafc',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          TI
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '-0.2px', color: '#f8fafc' }}>
              NTRO Thermal Intelligence System
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              PS 26162
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
            Satellite Infrared Radiometry &amp; LightGBM Multi-Class Anomaly Classification
          </p>
        </div>
      </div>

      {/* 2. Top Navigation Links (Dedicated Route Pages) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#f8fafc' : '#94a3b8',
            background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: isActive ? '1px solid rgba(148, 163, 184, 0.35)' : '1px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          })}
        >
          <span>🗺️</span>
          <span>Live Map</span>
        </NavLink>

        <NavLink
          to="/methodology"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#f8fafc' : '#94a3b8',
            background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: isActive ? '1px solid rgba(148, 163, 184, 0.35)' : '1px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          })}
        >
          <span>📘</span>
          <span>Methodology &amp; Classification</span>
        </NavLink>

        <NavLink
          to="/contact"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#f8fafc' : '#94a3b8',
            background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: isActive ? '1px solid rgba(148, 163, 184, 0.35)' : '1px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          })}
        >
          <span>✉️</span>
          <span>Contact Us</span>
        </NavLink>
      </nav>

      {/* 3. Live Telemetry Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#34d399',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981',
            }}
          />
          <span>VIIRS / MODIS NRT Stream</span>
        </div>
      </div>
    </header>
  );
}
