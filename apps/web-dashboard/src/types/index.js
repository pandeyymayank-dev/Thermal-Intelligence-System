/**
 * NTRO Thermal Intelligence Platform Type Definitions (JSDoc)
 */

/**
 * @typedef {Object} FacilityProperties
 * @property {number|string} osm_id
 * @property {string} facility_name
 * @property {string} category
 * @property {string} [operator]
 * @property {string} [last_updated]
 */

/**
 * @typedef {Object} GeoJSONFeature
 * @property {string} type
 * @property {Object} geometry
 * @property {string} geometry.type
 * @property {Array} geometry.coordinates
 * @property {FacilityProperties} properties
 */

/**
 * @typedef {Object} GeoJSONFeatureCollection
 * @property {string} type
 * @property {Object} [metadata]
 * @property {Array<GeoJSONFeature>} features
 */
export {};
