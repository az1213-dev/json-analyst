'use strict';

/**
 * Detect the JSON type of an arbitrary JavaScript value.
 * @param {unknown} value
 * @returns {'object'|'array'|'string'|'number'|'boolean'|'null'}
 */
function detectType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') {
    return t;
  }
  if (t === 'object') {
    return 'object';
  }
  // Fallback for undefined, functions, symbols in non-standard JSON
  return 'null';
}

/**
 * Determine the item type of an array (uniform or mixed).
 * @param {unknown[]} arr
 * @returns {'mixed'|'object'|'array'|'string'|'number'|'boolean'|'null'|undefined}
 */
function detectItemType(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  let commonType;
  for (let i = 0; i < arr.length; i++) {
    const t = detectType(arr[i]);
    if (commonType === undefined) {
      commonType = t;
    } else if (commonType !== t) {
      return 'mixed';
    }
  }
  return commonType;
}

/**
 * Check if an array of objects has uniform keys across all elements.
 * @param {unknown[]} arr
 * @returns {boolean}
 */
function isUniformObjectArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  if (detectItemType(arr) !== 'object') return false;

  const firstKeys = Object.keys(/** @type {Record<string, unknown>} */ (arr[0])).sort().join(',');
  for (let i = 1; i < arr.length; i++) {
    const currentKeys = Object.keys(/** @type {Record<string, unknown>} */ (arr[i])).sort().join(',');
    if (currentKeys !== firstKeys) {
      return false;
    }
  }
  return true;
}

module.exports = {
  detectType,
  detectItemType,
  isUniformObjectArray,
};