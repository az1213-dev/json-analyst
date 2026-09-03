'use strict';

const { detectType, detectItemType } = require('./detector');
const { inferArchetype } = require('./archetype');
const { computeMetrics } = require('./metrics');

/**
 * Pick a representative sample from an array.
 * @param {unknown[]} arr
 * @param {number} sampleSize
 * @returns {{ sample: { value: unknown, index: number }[], sampled: boolean }}
 */
function sampleArray(arr, sampleSize) {
  if (!Array.isArray(arr)) {
    return { sample: [], sampled: false };
  }

  if (!Number.isFinite(sampleSize) || arr.length <= sampleSize) {
    return {
      sample: arr.map((value, index) => ({ value, index })),
      sampled: false,
    };
  }

  if (sampleSize <= 0) {
    return { sample: [], sampled: arr.length > 0 };
  }

  if (sampleSize === 1) {
    return { sample: [{ value: arr[0], index: 0 }], sampled: arr.length > 1 };
  }

  const indices = new Set();
  indices.add(0);
  indices.add(arr.length - 1);

  const middleSlots = sampleSize - indices.size;
  if (middleSlots > 0) {
    const step = (arr.length - 1) / (middleSlots + 1);
    for (let i = 1; i <= middleSlots && indices.size < sampleSize; i++) {
      indices.add(Math.round(step * i));
    }
  }

  const sortedIndices = [...indices].sort((a, b) => a - b);
  return {
    sample: sortedIndices.map((index) => ({ value: arr[index], index })),
    sampled: true,
  };
}

/**
 * Recursively build AST nodes while protecting against circular references.
 * @param {unknown} value
 * @param {string|number|null} key
 * @param {string} path
 * @param {number} depth
 * @param {Required<import('../types/config').XrayConfig>} config
 * @param {{ totalNodes: number, maxDepthReached: number, truncated: boolean, anomalies: import('../types/ast').XrayAnomaly[] }} context
 * @param {Map<object, string>} ancestorMap
 * @returns {import('../types/ast').XrayNode}
 */
function buildNode(value, key, path, depth, config, context, ancestorMap) {
  context.totalNodes++;
  context.maxDepthReached = Math.max(context.maxDepthReached, depth);
  const type = detectType(value);

  // Check for circular reference in objects and arrays
  if (value !== null && (type === 'object' || type === 'array')) {
    const objVal = /** @type {object} */ (value);
    if (ancestorMap.has(objVal)) {
      const targetPath = ancestorMap.get(objVal) || '$';
      const anomaly = {
        type: /** @type {const} */ ('circular_reference'),
        path,
        message: `Circular reference detected: points to ancestor at "${targetPath}"`,
      };
      context.anomalies.push(anomaly);
      if (type === 'object') {
        return {
          type: 'object',
          key,
          path,
          depth,
          isCircular: true,
          circularTarget: targetPath,
          anomalies: [anomaly],
          children: [],
          keyCount: Object.keys(objVal).length,
        };
      } else {
        return {
          type: 'array',
          key,
          path,
          depth,
          isCircular: true,
          circularTarget: targetPath,
          anomalies: [anomaly],
          children: [],
          length: (/** @type {unknown[]} */ (value)).length,
          sampled: false,
        };
      }
    }
    // Track current object in ancestorMap for children
    ancestorMap.set(objVal, path);
  }

  // Max depth cutoff
  const atDepthLimit = depth >= config.maxDepth && (type === 'object' || type === 'array');
  if (atDepthLimit) {
    context.truncated = true;
    if (value !== null && typeof value === 'object') {
      ancestorMap.delete(/** @type {object} */ (value));
    }
    if (type === 'object') {
      return {
        type: 'object',
        key,
        path,
        depth,
        children: [],
        truncatedAtDepth: true,
        keyCount: Object.keys(/** @type {object} */ (value)).length,
      };
    } else {
      return {
        type: 'array',
        key,
        path,
        depth,
        children: [],
        truncatedAtDepth: true,
        length: (/** @type {unknown[]} */ (value)).length,
        sampled: false,
        itemType: detectItemType(/** @type {unknown[]} */ (value)),
      };
    }
  }

  // Traverse Object
  if (type === 'object') {
    const objVal = /** @type {Record<string, unknown>} */ (value);
    const keys = Object.keys(objVal);

    /** @type {import('../types/ast').XrayAnomaly[]} */
    const nodeAnomalies = [];
    if (keys.length === 0) {
      const emptyAnomaly = {
        type: /** @type {const} */ ('empty_container'),
        path,
        message: 'Empty object with 0 keys',
      };
      context.anomalies.push(emptyAnomaly);
      nodeAnomalies.push(emptyAnomaly);
    }

    const children = keys.map((k) =>
      buildNode(objVal[k], k, `${path}.${k}`, depth + 1, config, context, ancestorMap)
    );

    ancestorMap.delete(objVal);
    return {
      type: 'object',
      key,
      path,
      depth,
      children,
      keyCount: keys.length,
      ...(nodeAnomalies.length > 0 ? { anomalies: nodeAnomalies } : {}),
    };
  }

  // Traverse Array
  if (type === 'array') {
    const arrVal = /** @type {unknown[]} */ (value);
    const itemType = detectItemType(arrVal);

    /** @type {import('../types/ast').XrayAnomaly[]} */
    const nodeAnomalies = [];

    if (arrVal.length === 0) {
      const emptyAnomaly = {
        type: /** @type {const} */ ('empty_container'),
        path,
        message: 'Empty array with length 0',
      };
      context.anomalies.push(emptyAnomaly);
      nodeAnomalies.push(emptyAnomaly);
    }

    if (itemType === 'mixed') {
      const mixedAnomaly = {
        type: /** @type {const} */ ('mixed_array_types'),
        path,
        message: 'Array contains heterogeneous element types',
      };
      context.anomalies.push(mixedAnomaly);
      nodeAnomalies.push(mixedAnomaly);
    }

    let archetype = null;
    if (config.archetype) {
      archetype = inferArchetype(arrVal, config.maxArraySample);
      if (archetype && !archetype.uniformKeys) {
        const divergentAnomaly = {
          type: /** @type {const} */ ('divergent_keys'),
          path,
          message: 'Array elements have inconsistent object schema / optional fields',
        };
        context.anomalies.push(divergentAnomaly);
        nodeAnomalies.push(divergentAnomaly);
      }
    }

    const { sample, sampled } = sampleArray(arrVal, config.maxArraySample);
    if (sampled) context.truncated = true;

    const children = sample.map(({ value: item, index }) =>
      buildNode(item, index, `${path}[${index}]`, depth + 1, config, context, ancestorMap)
    );

    ancestorMap.delete(arrVal);
    return {
      type: 'array',
      key,
      path,
      depth,
      children,
      length: arrVal.length,
      sampled,
      itemType,
      ...(archetype ? { archetype } : {}),
      ...(nodeAnomalies.length > 0 ? { anomalies: nodeAnomalies } : {}),
    };
  }

  // Primitive Leaf (string, number, boolean, null)
  return {
    type,
    key,
    path,
    depth,
    value: /** @type {string|number|boolean|null} */ (value),
  };
}

const DEFAULT_CONFIG = {
  maxDepth: Infinity,
  maxArraySample: 5,
  format: 'ascii',
  showTypes: true,
  showCounts: true,
  collapseArrays: true,
  archetype: true,
  colors: true,
  showMetrics: false,
  showAnomalies: true,
  title: 'JSON X-Ray',
};

/**
 * Resolve user config with default fallbacks.
 * @param {any} [config]
 * @returns {Required<import('../types/config').XrayConfig>}
 */
function resolveConfig(config) {
  const merged = { ...DEFAULT_CONFIG, ...config };
  if (merged.collapseArrays === false) {
    merged.maxArraySample = Infinity;
  }
  return /** @type {Required<import('../types/config').XrayConfig>} */ (merged);
}

/**
 * Build an XrayTree AST from any JSON-compatible value.
 * @param {unknown} value
 * @param {any} [userConfig]
 * @returns {import('../types/ast').XrayTree}
 */
function buildTree(value, userConfig) {
  const config = resolveConfig(userConfig);
  const context = {
    totalNodes: 0,
    maxDepthReached: 0,
    truncated: false,
    anomalies: [],
  };

  const ancestorMap = new Map();
  const root = buildNode(value, null, '$', 0, config, context, ancestorMap);
  const metrics = computeMetrics(root, context.totalNodes, context.maxDepthReached, value);

  return {
    root,
    totalNodes: context.totalNodes,
    maxDepthReached: context.maxDepthReached,
    truncated: context.truncated,
    metrics,
    anomalies: context.anomalies,
  };
}

module.exports = {
  buildTree,
  buildNode,
  resolveConfig,
  DEFAULT_CONFIG,
};