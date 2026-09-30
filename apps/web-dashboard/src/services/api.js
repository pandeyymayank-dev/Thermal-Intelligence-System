// NTRO Thermal Intelligence Platform - API Client
const RAW_URL = import.meta.env.VITE_API_BASE_URL || 'https://ntro-thermal-api.onrender.com';
const CLEAN_BASE = RAW_URL.replace(/\/+$/, '');
export const API_BASE_URL = CLEAN_BASE.endsWith('/api/v1') ? CLEAN_BASE : `${CLEAN_BASE}/api/v1`;

/**
 * Helper to execute fetch with custom timeout via AbortController.
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 25000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Fetch cached/live strategic industrial facilities GeoJSON from backend.
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export async function fetchFacilities(timeout = 15000) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/osm/facilities`, { timeout });
    if (!response.ok) {
      const fallbackResp = await fetchWithTimeout(`${API_BASE_URL}/spatial/facilities`, { timeout: 8000 });
      if (!fallbackResp.ok) {
        throw new Error(`Failed to fetch facilities: ${response.status}`);
      }
      return await fallbackResp.json();
    }
    return await response.json();
  } catch (err) {
    console.error('API fetchFacilities error:', err);
    throw err;
  }
}

/**
 * Trigger backend to re-query OSM Overpass API with NWR, overwrite storage cache, and return updated GeoJSON.
 * @returns {Promise<Object>} Updated GeoJSON FeatureCollection
 */
export async function refreshMapData(timeout = 25000) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/spatial/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout,
    });
    if (!response.ok) {
      const fallbackResp = await fetchWithTimeout(`${API_BASE_URL}/map/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      if (!fallbackResp.ok) {
        throw new Error(`Failed to refresh map data: ${response.status}`);
      }
      return await fallbackResp.json();
    }
    return await response.json();
  } catch (err) {
    console.error('API refreshMapData error:', err);
    throw err;
  }
}

/**
 * Pass 1: Fetch raw NASA FIRMS satellite thermal hotspot detections instantly.
 * Supports refresh=true and strict timeout limits with fallback.
 * @param {number} dayRange
 * @param {boolean} refresh
 * @param {number} timeout
 * @returns {Promise<Object>} GeoJSON FeatureCollection
 */
export async function fetchThermalHotspots(dayRange = 1, refresh = false, timeout = 25000) {
  try {
    const refreshParam = refresh ? '&refresh=true' : '';
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/thermal/hotspots?day_range=${dayRange}${refreshParam}`,
      { timeout }
    );
    if (!response.ok) {
      const fallbackResp = await fetchWithTimeout(
        `${API_BASE_URL}/thermal/anomalies?day_range=${dayRange}`,
        { timeout: 10000 }
      );
      if (!fallbackResp.ok) {
        throw new Error(`Failed to fetch thermal hotspots: ${response.status}`);
      }
      return await fallbackResp.json();
    }
    return await response.json();
  } catch (err) {
    console.error('API fetchThermalHotspots error:', err);
    throw err;
  }
}

/**
 * Pass 2: Asynchronously classify and enrich thermal hotspots using the 3-Source AI Fusion Engine.
 * @param {Object} rawHotspotsGeoJSON
 * @param {number} timeout
 * @returns {Promise<Object>} Enriched GeoJSON FeatureCollection
 */
export async function classifyThermalHotspots(rawHotspotsGeoJSON, timeout = 25000) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/inference/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawHotspotsGeoJSON),
      timeout,
    });
    if (!response.ok) {
      throw new Error(`Failed to classify thermal hotspots: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('API classifyThermalHotspots error:', err);
    // Return original unclassified dataset as graceful fallback
    return rawHotspotsGeoJSON;
  }
}
