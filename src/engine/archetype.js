'use strict';

const { detectType } = require('./detector');

/**
 * Infer a merged schema archetype from an array of items.
 * @param {unknown[]} arr
 * @param {number} [maxSample]
 * @returns {import('../types/ast').XrayArchetype | null}
 */
function inferArchetype(arr, maxSample = 50) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return null;
  }

  // Filter for objects (excluding null, which detectType resolves to 'null')
  const objectItems = arr.filter((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
  if (objectItems.length === 0) {
    return null;
  }

  const sampleSize = Math.min(objectItems.length, maxSample);
  const sample = objectItems.slice(0, sampleSize);

  /** @type {Record<string, { typesSet: Set<import('../types/ast').JsonNodeType>, count: number }>} */
  const propertyMap = {};

  let firstKeysSig = null;
  let uniformKeys = true;

  for (let i = 0; i < sample.length; i++) {
    const item = /** @type {Record<string, unknown>} */ (sample[i]);
    const keys = Object.keys(item).sort();
    const sig = keys.join(',');

    if (firstKeysSig === null) {
      firstKeysSig = sig;
    } else if (firstKeysSig !== sig) {
      uniformKeys = false;
    }

    for (const key of keys) {
      if (!propertyMap[key]) {
        propertyMap[key] = { typesSet: new Set(), count: 0 };
      }
      propertyMap[key].count++;
      propertyMap[key].typesSet.add(detectType(item[key]));
    }
  }

  /** @type {Record<string, import('../types/ast').ArchetypeProperty>} */
  const properties = {};
  for (const [key, info] of Object.entries(propertyMap)) {
    const frequency = info.count / sampleSize;
    properties[key] = {
      key,
      types: Array.from(info.typesSet),
      optional: frequency < 1.0,
      frequency: Math.round(frequency * 100) / 100,
    };
  }

  return {
    sampleCount: sampleSize,
    totalCount: arr.length,
    properties,
    uniformKeys,
  };
}

module.exports = {
  inferArchetype,
};
