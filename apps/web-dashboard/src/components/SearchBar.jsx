import React, { useState, useEffect, useRef } from 'react';
import { parseCoordinates } from '../utils/coordinateParser';

export default function SearchBar({ onNavigate, style = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [coordPreview, setCoordPreview] = useState(null);
  const containerRef = useRef(null);

  // 1. Debounced Autocomplete & Real-time Coordinate Detection
  useEffect(() => {
    const trimmed = searchQuery.trim();
    setErrorMessage('');

    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      setCoordPreview(null);
      return;
    }

    // Check if user is typing coordinates (DD, DMS, DDM, Signed, Cardinal)
    const parsed = parseCoordinates(trimmed);
    if (parsed.isCoordinate) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      if (parsed.success) {
        setCoordPreview(parsed);
      } else {
        setCoordPreview(null);
      }
      return;
    }

    setCoordPreview(null);

    // Otherwise, perform location name autocomplete (OSM Nominatim API)
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed
          )}&countrycodes=in&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data || []);
          setShowDropdown(data && data.length > 0);
        }
      } catch (err) {
        console.error('Nominatim autocomplete error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const input = searchQuery.trim();
    if (!input) return;

    setErrorMessage('');

    // A. Parse Flexible Geographic Coordinates (Decimal Degrees, DMS, DDM, Cardinals, Signed)
    const coordResult = parseCoordinates(input);
    if (coordResult.isCoordinate) {
      if (coordResult.success) {
        onNavigate(
          coordResult.lat,
          coordResult.lon,
          `${coordResult.formatted} (${coordResult.dms})`,
          15
        );
        setShowDropdown(false);
        setCoordPreview(null);
        return;
      } else {
        setErrorMessage(coordResult.error || 'Invalid coordinate syntax');
        return;
      }
    }

    // B. If suggestions dropdown is open, pick first suggestion
    if (suggestions.length > 0) {
      const first = suggestions[0];
      onNavigate(parseFloat(first.lat), parseFloat(first.lon), first.display_name, 14);
      setShowDropdown(false);
      return;
    }

    // C. Direct lookup fallback for place names
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          input
        )}&countrycodes=in&limit=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          onNavigate(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name, 14);
          setShowDropdown(false);
        } else {
          setErrorMessage('Location not found. Enter valid coordinates (DD/DMS) or a major place name.');
        }
      }
    } catch (err) {
      console.error('Direct search error:', err);
      setErrorMessage('Search request failed. Please check your network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyCoordinate = () => {
    if (coordPreview && coordPreview.success) {
      onNavigate(
        coordPreview.lat,
        coordPreview.lon,
        `${coordPreview.formatted} (${coordPreview.dms})`,
        15
      );
      setCoordPreview(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '16px',
        left: '60px',
        zIndex: 1000,
        width: '380px',
        maxWidth: 'calc(100vw - 80px)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        ...style,
      }}
    >
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          border: errorMessage ? '1.5px solid #ef4444' : '1px solid rgba(0, 188, 212, 0.4)',
          overflow: 'hidden',
          padding: '4px 6px',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{ padding: '0 8px', color: errorMessage ? '#ef4444' : '#00838f', display: 'flex', alignItems: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder='e.g. 26.84, 80.94 or 26°50&#39;48"N 80°56&#39;46"E...'
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: '#0f172a',
            backgroundColor: 'transparent',
            padding: '6px 4px',
          }}
        />

        {isSearching ? (
          <div
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid #94a3b8',
              borderTop: '2px solid #00bcd4',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginRight: '6px',
            }}
          />
        ) : searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSuggestions([]);
              setShowDropdown(false);
              setErrorMessage('');
              setCoordPreview(null);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px 6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ✕
          </button>
        ) : null}

        <button
          type="submit"
          style={{
            backgroundColor: '#00bcd4',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: '4px',
            boxShadow: '0 1px 3px rgba(0, 188, 212, 0.4)',
            transition: 'background-color 0.2s',
          }}
        >
          Go
        </button>
      </form>

      {/* Real-time Parsed Coordinate Quick Action Pill */}
      {coordPreview && (
        <div
          onClick={handleApplyCoordinate}
          style={{
            marginTop: '6px',
            backgroundColor: 'rgba(224, 247, 250, 0.98)',
            border: '1px solid #00bcd4',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            fontSize: '11.5px',
            color: '#006064',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            <span>🎯</span>
            <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {coordPreview.formatted}
            </span>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#00838f', background: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
            Jump to Pin ➔
          </span>
        </div>
      )}

      {/* Inline Error Alert Box */}
      {errorMessage && (
        <div
          style={{
            marginTop: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
            fontSize: '11.5px',
            color: '#b91c1c',
            lineHeight: '1.35',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#b91c1c',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(0, 188, 212, 0.3)',
            margin: 0,
            padding: '4px 0',
            listStyle: 'none',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 1001,
          }}
        >
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                setSearchQuery(item.display_name.split(',')[0]);
                onNavigate(parseFloat(item.lat), parseFloat(item.lon), item.display_name, 14);
                setShowDropdown(false);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                color: '#1e293b',
                cursor: 'pointer',
                borderBottom: idx < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f7fa')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ color: '#00838f', fontSize: '13px' }}>📍</span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
                title={item.display_name}
              >
                {item.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
