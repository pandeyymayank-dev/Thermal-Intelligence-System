import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  fetchFacilities,
  fetchThermalHotspots,
  classifyThermalHotspots,
} from '../services/api';
import SearchBar from './SearchBar';
import { formatCoordinates } from '../utils/coordinateParser';

// Center of India view
const INDIA_CENTER = [20.5937, 78.9629];
const INDIA_ZOOM = 5;

// Visual styling for facility polygons/ways
const FACILITY_STYLE = {
  color: '#00e5ff',
  weight: 2,
  opacity: 0.95,
  fillColor: '#00bcd4',
  fillOpacity: 0.4,
};

// Create a high-tech search pin marker icon
const createSearchPinIcon = () => {
  return L.divIcon({
    className: 'custom-search-pin',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 14px; height: 14px; background: rgba(239, 68, 68, 0.4); border-radius: 50%; animation: pulse-pin 1.5s infinite;"></div>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 28],
    popupAnchor: [0, -28],
  });
};

/**
 * Retrieve distinctive tactical colors by industrial category.
 */
const getFacilityColor = (category = '') => {
  const cat = String(category).toLowerCase();
  if (cat.includes('steel') || cat.includes('metallurgy')) {
    return { color: '#ff9100', fill: '#ff6d00' }; // Amber/Orange for Steel Plants
  }
  if (cat.includes('power') || cat.includes('thermal') || cat.includes('electricity')) {
    return { color: '#d500f9', fill: '#aa00ff' }; // Vivid Purple for Power Plants
  }
  if (cat.includes('mine') || cat.includes('quarry') || cat.includes('colliery')) {
    return { color: '#ffd600', fill: '#ffab00' }; // Warm Gold for Mines & Quarries
  }
  return { color: '#00e5ff', fill: '#00bcd4' };   // Electric Cyan for Refineries & Chemicals
};

/**
 * Helper to get tactical emoji symbol for each hotspot classification.
 */
export const getCategoryIcon = (category = '') => {
  const cat = String(category).toUpperCase();
  if (cat.includes('FLARE')) return '⚡';
  if (cat.includes('STEEL') || cat.includes('INDUSTRIAL') || cat.includes('HEAT')) return '🏭';
  if (cat.includes('STUBBLE') || cat.includes('AGRICULTURE')) return '🌾';
  if (cat.includes('BRICK') || cat.includes('KILN')) return '🧱';
  if (cat.includes('WILDFIRE') || cat.includes('FOREST')) return '🌲';
  return '❓';
};

/**
 * Create tactical hotspot icon with a clean, single-color 3-tier visual scheme based on severity/FRP:
 * - 🔴 Red (#ef4444): High / Critical (or FRP >= 35 MW)
 * - 🟠 Orange (#f97316): Moderate / Harmful (or FRP >= 15 MW)
 * - 🟡 Yellow (#facc15): Low / Harmless
 * Uniform stroke and fill matching the selected tier color, with matching glow (no cyan border).
 */
const createHotspotTacticalIcon = (feature) => {
  const p = feature.properties || {};
  const frp = parseFloat(p.frp || 0);
  const severity = (p.severity || p.threat_level || 'HARMLESS').toUpperCase();

  // Clean 3-tier color and sizing logic
  let tierColor = '#facc15'; // Default Yellow / Harmless
  let radius = 5;
  let fillOpacity = 0.85;
  let animClass = '';

  if (severity === 'CRITICAL' || frp >= 35) {
    tierColor = '#ef4444'; // Red
    radius = frp >= 75 ? 10 : 8;
    fillOpacity = 0.95;
    animClass = 'pulse-critical';
  } else if (severity === 'HARMFUL' || frp >= 15) {
    tierColor = '#f97316'; // Orange
    radius = 6;
    fillOpacity = 0.9;
    animClass = 'glow-harmful';
  } else {
    tierColor = '#facc15'; // Yellow
    radius = 4.5;
    fillOpacity = 0.85;
  }

  const diameter = radius * 2;
  const borderColor = tierColor;
  // Uniform box-shadow glow matching the tier color:
  const ringBoxShadow = `0 0 6px ${tierColor}bb, 0 0 0 2px ${tierColor}44`;

  // Padding ensures box-shadow glow is not clipped by parent container
  const pad = 12;
  const totalDim = diameter + pad * 2;

  return L.divIcon({
    className: 'hotspot-tactical-div-icon',
    html: `
      <div style="width: ${totalDim}px; height: ${totalDim}px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <div class="${animClass}" style="
          width: ${diameter}px;
          height: ${diameter}px;
          border-radius: 50%;
          background-color: ${tierColor};
          border: 1.5px solid ${borderColor};
          opacity: ${fillOpacity};
          box-shadow: ${ringBoxShadow};
          pointer-events: auto;
          cursor: pointer;
          transition: transform 0.15s ease;
        "></div>
      </div>
    `,
    iconSize: [totalDim, totalDim],
    iconAnchor: [totalDim / 2, totalDim / 2],
    popupAnchor: [0, -totalDim / 2],
  });
};

export default function MapCanvas({
  facilitiesData: propFacilitiesData = null,
  hotspotsData: propHotspotsData = null,
  showFacilities = true,
  showHotspots = true,
  onSelectHotspot = null,
  aiEngineStatus = 'LightGBM Active',
  isLeftPanelOpen = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const hotspotsLayerRef = useRef(null);
  const searchMarkerRef = useRef(null);

  // Internal fallback state (used if MapCanvas is rendered standalone without props)
  const [internalFacilities, setInternalFacilities] = useState(null);
  const [internalHotspots, setInternalHotspots] = useState(null);

  const activeFacilities = propFacilitiesData !== null ? propFacilitiesData : internalFacilities;
  const activeHotspots = propHotspotsData !== null ? propHotspotsData : internalHotspots;

  /**
   * 1. Initialize Leaflet Map on Mount
   */
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      zoomControl: true,
    });

    // High-Resolution Space Satellite Base Layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19,
    }).addTo(map);

    // Transparent Road Network Overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Roads &copy; Esri',
      maxZoom: 19,
    }).addTo(map);

    // Transparent Placename / Border Overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Labels &copy; Esri',
      maxZoom: 19,
      pane: 'markerPane',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Standalone fallback: If no props were supplied, fetch initial datasets
    if (propFacilitiesData === null && propHotspotsData === null) {
      fetchFacilities()
        .then((fac) => setInternalFacilities(fac))
        .catch((err) => console.warn('Standalone facilities fetch fallback:', err));

      classifyThermalHotspots({ format: 'geojson' })
        .then((classified) => {
          if (classified && classified.features) {
            setInternalHotspots(classified);
          } else {
            return fetchThermalHotspots();
          }
        })
        .then((raw) => {
          if (raw) setInternalHotspots(raw);
        })
        .catch((err) => console.warn('Standalone hotspots fetch fallback:', err));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /**
   * 2. Render / Update Strategic Facilities Map Layer
   */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (!showFacilities || !activeFacilities || !activeFacilities.features) return;

    const newLayer = L.geoJSON(activeFacilities, {
      style: FACILITY_STYLE,
      pointToLayer: (feature, latlng) => {
        const cat = feature.properties?.category || 'Strategic Infrastructure';
        const name = feature.properties?.name || feature.properties?.facility_name || 'Industrial Facility';
        const { color, fill } = getFacilityColor(cat);

        const marker = L.circleMarker(latlng, {
          radius: 6,
          color: color,
          weight: 2,
          fillColor: fill,
          fillOpacity: 0.85,
        });

        // Dynamic Strategic Facility Marker visible text label
        marker.bindTooltip(
          `<b>${name}</b><br/><span style="color:#a855f7;">${cat}</span>`,
          {
            permanent: false,
            direction: 'top',
            className: 'osm-tactical-label',
          }
        );

        return marker;
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const name = props.name || props.facility_name || 'Strategic Infrastructure';
        const category = props.category || 'Strategic Industrial Facility';
        const operator = props.operator || 'N/A';
        const { color } = getFacilityColor(category);

        // Bind tooltip on polygons / ways if not already a point marker
        if (layer.bindTooltip && !(layer instanceof L.CircleMarker || layer instanceof L.Marker)) {
          layer.bindTooltip(
            `<b>${name}</b><br/><span style="color:#a855f7;">${category}</span>`,
            {
              permanent: false,
              direction: 'top',
              className: 'osm-tactical-label',
            }
          );
        }

        // Detailed popup on click
        const popupContent = `
          <div style="font-family: 'Inter', system-ui, sans-serif; min-width: 220px; padding: 4px;">
            <h4 style="margin: 0 0 6px 0; color: #f8fafc; font-size: 13.5px; font-weight: 700; border-bottom: 2px solid ${color}; padding-bottom: 4px;">
              🏢 ${name}
            </h4>
            <div style="font-size: 11.5px; margin-bottom: 5px; color: #cbd5e1;">
              <strong>Category:</strong> 
              <span style="background: rgba(255, 255, 255, 0.08); color: #00e5ff; border-left: 3px solid ${color}; padding: 2px 6px; border-radius: 3px; font-weight: 600; font-size: 11px;">
                ${category}
              </span>
            </div>
            ${
              operator !== 'N/A'
                ? `<div style="font-size: 11px; margin-bottom: 4px; color: #94a3b8;">
                    <strong>Operator:</strong> ${operator}
                   </div>`
                : ''
            }
            <div style="font-size: 10.5px; margin-bottom: 4px; color: #64748b;">
              <strong>OSM ID:</strong> <code>${props.osm_id || 'N/A'}</code>
            </div>
          </div>
        `;
        layer.bindPopup(popupContent);

        // Hover highlight
        layer.on({
          mouseover: (e) => {
            if (e.target.setStyle) {
              e.target.setStyle({ weight: 3.5, color: '#ffffff', fillOpacity: 0.95 });
            }
          },
          mouseout: (e) => {
            if (geoJsonLayerRef.current && e.target.setStyle) {
              if (e.target instanceof L.CircleMarker) {
                const { color: c, fill: f } = getFacilityColor(category);
                e.target.setStyle({ radius: 6, color: c, weight: 2, fillColor: f, fillOpacity: 0.85 });
              } else {
                geoJsonLayerRef.current.resetStyle(e.target);
              }
            }
          },
        });
      },
    });

    geoJsonLayerRef.current = newLayer;
    newLayer.addTo(map);
  }, [activeFacilities, showFacilities]);

  /**
   * 3. Render / Update Thermal Hotspots Layer with FRP Engine & Severity Glowing Rings
   */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hotspotsLayerRef.current) {
      map.removeLayer(hotspotsLayerRef.current);
      hotspotsLayerRef.current = null;
    }

    if (!showHotspots || !activeHotspots || !activeHotspots.features) return;

    const newLayer = L.geoJSON(activeHotspots, {
      pointToLayer: (feature, latlng) => {
        const icon = createHotspotTacticalIcon(feature);
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};

        // On Click: Open AI Intelligence Drawer in parent Dashboard
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (onSelectHotspot) {
            onSelectHotspot(p);
          }
        });

        // Hover / Quick Click popup
        const sev = (p.severity || p.threat_level || 'HARMLESS').toUpperCase();
        const cls = p.class || p.cls || p.predicted_category || 'Hotspot';
        const frp = p.frp ? `${p.frp} MW` : 'N/A';
        const temp = p.bright_ti4 || p.brightness ? `${p.bright_ti4 || p.brightness} K` : 'N/A';
        const conf = p.confidence_pct || p.confidence || '95';

        let badgeColor = '#facc15';
        if (sev === 'CRITICAL') badgeColor = '#ef4444';
        if (sev === 'HARMFUL') badgeColor = '#f97316';

        const catIcon = getCategoryIcon(cls);

        const popupHtml = `
          <div style="font-family: 'Inter', system-ui, sans-serif; min-width: 220px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid ${badgeColor}; padding-bottom: 4px; margin-bottom: 6px;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 15px;">${catIcon}</span>
                <strong style="color: #f8fafc; font-size: 13px;">${cls}</strong>
              </span>
              <span style="background: ${badgeColor}; color: #0f172a; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 800;">
                ${sev}
              </span>
            </div>
            <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 3px;">
              <strong>Heat (FRP):</strong> <span style="color: ${badgeColor}; font-weight: 700;">${frp}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 3px;">
              <strong>Temp:</strong> ${temp} | <strong>Confidence:</strong> ${conf}%
            </div>
            ${
              p.fac_name || p.nearest_facility_name
                ? `
              <div style="font-size: 11px; color: #38bdf8; margin-top: 4px; background: rgba(56, 189, 248, 0.1); padding: 3px 6px; border-radius: 4px;">
                🏢 ${
                  p.dist_fac && p.dist_fac > 25000
                    ? 'Regional Industrial Zone'
                    : `${p.fac_name || p.nearest_facility_name} ${p.dist_fac ? `(${p.dist_fac >= 1000 ? `${(p.dist_fac / 1000).toFixed(1)}km` : `${Math.round(p.dist_fac)}m`})` : ''}`
                }
              </div>
            `
                : ''
            }
            <div style="font-size: 10px; color: #64748b; margin-top: 6px; text-align: right;">
              Click marker for tactical intelligence →
            </div>
          </div>
        `;

        layer.bindPopup(popupHtml, { maxWidth: 260 });
      },
    });

    hotspotsLayerRef.current = newLayer;
    newLayer.addTo(map);
  }, [activeHotspots, showHotspots, onSelectHotspot]);

  /**
   * Programmatic Map Navigation (used by SearchBar)
   */
  const handleNavigateToLocation = useCallback((lat, lon, label, zoom = 14) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const numLat = parseFloat(lat);
    const numLon = parseFloat(lon);
    if (isNaN(numLat) || isNaN(numLon)) return;

    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    map.flyTo([numLat, numLon], zoom, { animate: true, duration: 1.5 });

    const coordsFormatted = formatCoordinates(numLat, numLon);
    const marker = L.marker([numLat, numLon], { icon: createSearchPinIcon() }).addTo(map);
    marker
      .bindPopup(
        `
        <div style="font-family: 'Inter', system-ui, sans-serif; min-width: 220px; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; color: #ef4444; font-size: 13px; font-weight: 700; border-bottom: 1.5px solid rgba(239, 68, 68, 0.3); padding-bottom: 4px;">
            📍 Target Coordinate
          </h4>
          <div style="font-size: 12px; color: #f8fafc; font-weight: 600; line-height: 1.35; margin-bottom: 4px;">
            ${label}
          </div>
          <div style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 3px 6px; border-radius: 4px; margin-top: 4px; font-family: monospace;">
            DD: ${coordsFormatted.dd}
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 3px; font-family: monospace;">
            DMS: ${coordsFormatted.dms}
          </div>
        </div>
      `
      )
      .openPopup();

    searchMarkerRef.current = marker;
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Top Coordinate & Location Search Bar (Dynamic Offset based on Left Panel) */}
      <SearchBar
        onNavigate={handleNavigateToLocation}
        style={{
          left: isLeftPanelOpen ? '352px' : '155px',
          transition: 'left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Global CSS for Animations and Tactical Markers */}
      <style>{`
        @keyframes pulse-pin {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .hotspot-tactical-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-search-pin {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
