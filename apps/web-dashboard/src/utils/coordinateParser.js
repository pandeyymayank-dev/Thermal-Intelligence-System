/**
 * NTRO Thermal GIS Platform - Flexible Geographic Coordinate Parser
 * 
 * Supports:
 *  1. Decimal Degrees (DD): e.g. "26.8467, 80.9462", "-26.8467, -80.9462", "26.8467 N, 80.9462 E", "N 26.8467, E 80.9462", "26N 80E"
 *  2. Degrees Minutes Seconds (DMS): e.g. "26° 50' 48\" N, 80° 56' 46\" E", "26:50:48 N, 80:56:46 E", "26 50 48 N, 80 56 46 E"
 *  3. Degrees Decimal Minutes (DDM): e.g. "26° 50.8' N, 80° 56.76' E", "26 50.8 N, 80 56.76 E"
 *  4. Mixed delimiters, extra spacing, unicode symbols (°, º, ', '', ", ″, ′, ’, ”)
 */

/**
 * Normalizes unicode characters for degrees, minutes, and seconds.
 */
function normalizeSymbols(str) {
  return str
    .replace(/[\u00BA\u02DA\u00B0]/g, '°') // degree symbols
    .replace(/[\u2032\u2019\u2018\u0027\u00B4]/g, "'") // single quotes / prime
    .replace(/[\u2033\u201D\u201C\u0022]/g, '"') // double quotes / double prime
    .replace(/''/g, '"') // double single-quotes to double quote
    .replace(/[,;]+/g, ',') // normalize multi-commas
    .trim();
}

/**
 * Converts a decimal coordinate into formatted DMS string representation.
 */
export function decimalToDms(val, isLat = true) {
  const absolute = Math.abs(val);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  let direction = '';
  if (isLat) {
    direction = val >= 0 ? 'N' : 'S';
  } else {
    direction = val >= 0 ? 'E' : 'W';
  }

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Converts decimal coordinates into standard formatted string.
 */
export function formatCoordinates(lat, lon) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return {
    dd: `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lon).toFixed(5)}° ${lonDir}`,
    signedDd: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    dms: `${decimalToDms(lat, true)}, ${decimalToDms(lon, false)}`,
  };
}

/**
 * Parses a single coordinate component (Latitude or Longitude) in DMS, DDM, or DD format.
 * Returns decimal number or null if parsing fails.
 */
function parseSingleComponent(compStr) {
  if (!compStr) return null;
  const s = compStr.trim();

  // 1. Detect Cardinal Direction
  let multiplier = 1;
  let cleanStr = s;

  const cardMatch = cleanStr.match(/[NSEWnsew]/);
  if (cardMatch) {
    const card = cardMatch[0].toUpperCase();
    if (card === 'S' || card === 'W') {
      multiplier = -1;
    }
    cleanStr = cleanStr.replace(/[NSEWnsew]/g, '').trim();
  }

  // Detect leading sign
  if (cleanStr.startsWith('-')) {
    multiplier = -1;
    cleanStr = cleanStr.substring(1).trim();
  } else if (cleanStr.startsWith('+')) {
    cleanStr = cleanStr.substring(1).trim();
  }

  // 2. Try DMS with symbols: e.g. 26° 50' 48.5" or 26°50'48"
  const dmsSymbolMatch = cleanStr.match(/^(\d+(?:\.\d+)?)\s*°\s*(?:(\d+(?:\.\d+)?)\s*'\s*)?(?:(\d+(?:\.\d+)?)\s*"\s*)?$/);
  if (dmsSymbolMatch) {
    const deg = parseFloat(dmsSymbolMatch[1]) || 0;
    const min = parseFloat(dmsSymbolMatch[2]) || 0;
    const sec = parseFloat(dmsSymbolMatch[3]) || 0;
    return multiplier * (deg + min / 60 + sec / 3600);
  }

  // 3. Try Colon delimited: e.g. 26:50:48 or 26:50:48.5
  if (cleanStr.includes(':')) {
    const parts = cleanStr.split(':').map((p) => parseFloat(p.trim()));
    if (parts.length >= 2 && !parts.some(isNaN)) {
      const deg = parts[0] || 0;
      const min = parts[1] || 0;
      const sec = parts[2] || 0;
      return multiplier * (deg + min / 60 + sec / 3600);
    }
  }

  // 4. Try Space delimited DMS/DDM: e.g. "26 50 48" or "26 50.8"
  const spaceParts = cleanStr.split(/\s+/).filter(Boolean);
  if (spaceParts.length === 3 && spaceParts.every((p) => !isNaN(parseFloat(p)))) {
    const deg = parseFloat(spaceParts[0]);
    const min = parseFloat(spaceParts[1]);
    const sec = parseFloat(spaceParts[2]);
    return multiplier * (deg + min / 60 + sec / 3600);
  } else if (spaceParts.length === 2 && spaceParts.every((p) => !isNaN(parseFloat(p)))) {
    const deg = parseFloat(spaceParts[0]);
    const min = parseFloat(spaceParts[1]);
    return multiplier * (deg + min / 60);
  }

  // 5. Try Decimal Degrees: e.g. "26.8467" or "26"
  const pureNum = parseFloat(cleanStr.replace(/°/g, ''));
  if (!isNaN(pureNum)) {
    return multiplier * pureNum;
  }

  return null;
}

/**
 * Main Flexible Coordinate Parser
 * 
 * @param {string} input - Raw input string from search box
 * @returns {object} { isCoordinate: boolean, success: boolean, lat?: number, lon?: number, formatted?: string, dms?: string, error?: string }
 */
export function parseCoordinates(input) {
  if (!input || typeof input !== 'string') {
    return { isCoordinate: false, success: false, error: 'Empty input' };
  }

  const raw = normalizeSymbols(input);

  // Quick heuristic: Check if input looks like coordinates rather than a place name
  // Must contain at least one digit and coordinate tokens (numbers, signs, cardinals, degrees)
  const hasDigits = /\d/.test(raw);
  if (!hasDigits) {
    return { isCoordinate: false, success: false, error: 'No numeric coordinate values found' };
  }

  // Check if this is exclusively letters/words (e.g. "Jamnagar Refinery")
  const nonCoordWords = raw.split(/[,\s]+/).filter((w) => /^[a-zA-Z]{3,}$/.test(w) && !/^(north|south|east|west)$/i.test(w));
  if (nonCoordWords.length >= 2) {
    return { isCoordinate: false, success: false, error: 'Input appears to be a location name' };
  }

  let lat = null;
  let lon = null;

  // Split Strategy 1: Explicit comma / semicolon delimiter
  if (raw.includes(',')) {
    const halves = raw.split(',');
    if (halves.length === 2) {
      lat = parseSingleComponent(halves[0]);
      lon = parseSingleComponent(halves[1]);
    }
  }

  // Split Strategy 2: Cardinal letter boundaries (e.g. "26.8467N 80.9462E" or "26°50'48\"N 80°56'46\"E")
  if (lat === null || lon === null) {
    const cardinalSplit = raw.match(/^(.*?[NSns])\s*(.*?[EWew])$/);
    if (cardinalSplit) {
      lat = parseSingleComponent(cardinalSplit[1]);
      lon = parseSingleComponent(cardinalSplit[2]);
    }
  }

  // Split Strategy 3: Standard signed/unsigned Decimal Degrees with space (e.g. "26.8467 80.9462" or "-26.8467 -80.9462")
  if (lat === null || lon === null) {
    const ddPairMatch = raw.match(/^([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)$/);
    if (ddPairMatch) {
      lat = parseFloat(ddPairMatch[1]);
      lon = parseFloat(ddPairMatch[2]);
    }
  }

  // Split Strategy 4: Space-separated 6-token DMS (e.g. "26 50 48 80 56 46" or "26 50 48 N 80 56 46 E")
  if (lat === null || lon === null) {
    const tokens = raw.split(/\s+/);
    if (tokens.length >= 6) {
      const mid = Math.floor(tokens.length / 2);
      lat = parseSingleComponent(tokens.slice(0, mid).join(' '));
      lon = parseSingleComponent(tokens.slice(mid).join(' '));
    }
  }

  // If we couldn't parse components into numbers
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
    return {
      isCoordinate: true,
      success: false,
      error: 'Malformed coordinate format. Accepted formats: "27.32, 77.70", "27°19\'12\\"N 77°42\'00\\"E", "-27.32, +77.70"',
    };
  }

  // Boundary Validation Checks
  if (lat < -90 || lat > 90) {
    return {
      isCoordinate: true,
      success: false,
      error: `Invalid Latitude (${lat.toFixed(4)}°): Must be between -90.0° and +90.0°`,
    };
  }

  if (lon < -180 || lon > 180) {
    return {
      isCoordinate: true,
      success: false,
      error: `Invalid Longitude (${lon.toFixed(4)}°): Must be between -180.0° and +180.0°`,
    };
  }

  const formats = formatCoordinates(lat, lon);

  return {
    isCoordinate: true,
    success: true,
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    formatted: formats.dd,
    signedDd: formats.signedDd,
    dms: formats.dms,
  };
}
