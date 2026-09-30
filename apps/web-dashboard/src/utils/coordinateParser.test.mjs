import { parseCoordinates, formatCoordinates } from './coordinateParser.js';

const testCases = [
  { input: '26.8467, 80.9462', expectedValid: true, desc: 'Standard Decimal Degrees' },
  { input: '26.8467 80.9462', expectedValid: true, desc: 'Space-separated DD' },
  { input: '-33.8688, 151.2093', expectedValid: true, desc: 'Negative Latitude (Sydney)' },
  { input: '-23.5505, -46.6333', expectedValid: true, desc: 'Double Negative (São Paulo)' },
  { input: '26.8467 N, 80.9462 E', expectedValid: true, desc: 'Cardinal Suffix DD' },
  { input: 'N 26.8467, E 80.9462', expectedValid: true, desc: 'Cardinal Prefix DD' },
  { input: '26.8467N 80.9462E', expectedValid: true, desc: 'Cardinal No-Space DD' },
  { input: '28, 77', expectedValid: true, desc: 'Integer Coordinates (missing decimals)' },
  { input: '26° 50\' 48" N, 80° 56\' 46" E', expectedValid: true, desc: 'Standard DMS with symbols' },
  { input: '26°50\'48"N 80°56\'46"E', expectedValid: true, desc: 'Compact DMS' },
  { input: '26:50:48 N, 80:56:46 E', expectedValid: true, desc: 'Colon-separated DMS' },
  { input: '26 50 48 N, 80 56 46 E', expectedValid: true, desc: 'Space DMS with cardinals' },
  { input: '26° 50.8\' N, 80° 56.76\' E', expectedValid: true, desc: 'Degrees Decimal Minutes (DDM)' },
  { input: '95.0000, 80.0000', expectedValid: false, desc: 'Out of bounds Latitude (>90)' },
  { input: '26.0000, -195.0000', expectedValid: false, desc: 'Out of bounds Longitude (<-180)' },
  { input: 'Jamnagar Refinery', expectedValid: false, desc: 'Plain Location Name' }
];

let passed = 0;
testCases.forEach((tc) => {
  const res = parseCoordinates(tc.input);
  const isValid = res.success === tc.expectedValid;
  if (isValid) {
    passed++;
    console.log(`✅ [PASS] ${tc.desc}: "${tc.input}" -> Lat: ${res.lat}, Lon: ${res.lon} | ${res.formatted || res.error}`);
  } else {
    console.error(`❌ [FAIL] ${tc.desc}: "${tc.input}" -> Expected valid: ${tc.expectedValid}, got: ${JSON.stringify(res)}`);
  }
});

console.log(`\nSummary: ${passed}/${testCases.length} tests passed.`);
if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
