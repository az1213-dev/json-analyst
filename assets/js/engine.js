/**
 * JSON Analyst — Core Traversal & Analysis Engine
 * Browser-compatible, zero external dependencies.
 */

export function detectType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return t;
  if (t === 'object') return 'object';
  return 'null';
}

export function detectItemType(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  let common;
  for (let i = 0; i < arr.length; i++) {
    const t = detectType(arr[i]);
    if (common === undefined) common = t;
    else if (common !== t) return 'mixed';
  }
  return common;
}

export function inferArchetype(arr, maxSample = 50) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const objectItems = arr.filter((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
  if (objectItems.length === 0) return null;

  const sampleSize = Math.min(objectItems.length, maxSample);
  const sample = objectItems.slice(0, sampleSize);
  const propertyMap = {};
  let firstKeysSig = null;
  let uniformKeys = true;

  for (let i = 0; i < sample.length; i++) {
    const item = sample[i];
    const keys = Object.keys(item).sort();
    const sig = keys.join(',');
    if (firstKeysSig === null) firstKeysSig = sig;
    else if (firstKeysSig !== sig) uniformKeys = false;

    for (const key of keys) {
      if (!propertyMap[key]) propertyMap[key] = { typesSet: new Set(), count: 0 };
      propertyMap[key].count++;
      propertyMap[key].typesSet.add(detectType(item[key]));
    }
  }

  const properties = {};
  for (const [key, info] of Object.entries(propertyMap)) {
    const freq = info.count / sampleSize;
    properties[key] = {
      key,
      types: Array.from(info.typesSet),
      optional: freq < 1.0,
      frequency: Math.round(freq * 100) / 100
    };
  }

  return { sampleCount: sampleSize, totalCount: arr.length, properties, uniformKeys };
}

export function sampleArray(arr, sampleSize) {
  if (!Array.isArray(arr)) return { sample: [], sampled: false };
  if (!Number.isFinite(sampleSize) || arr.length <= sampleSize) {
    return { sample: arr.map((value, index) => ({ value, index })), sampled: false };
  }
  if (sampleSize <= 0) return { sample: [], sampled: arr.length > 0 };
  if (sampleSize === 1) return { sample: [{ value: arr[0], index: 0 }], sampled: arr.length > 1 };

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
  const sorted = [...indices].sort((a, b) => a - b);
  return { sample: sorted.map((index) => ({ value: arr[index], index })), sampled: true };
}

export function computeMetrics(root, totalNodes, maxDepthReached, rawInput) {
  let leafCount = 0;
  let containerCount = 0;
  let totalChildren = 0;

  function visit(node) {
    if (node.type === 'object' || node.type === 'array') {
      containerCount++;
      const len = (node.children && node.children.length) || 0;
      totalChildren += len;
      if (node.children) node.children.forEach(visit);
    } else {
      leafCount++;
    }
  }
  visit(root);

  let estimatedBytes = 0;
  try {
    const str = JSON.stringify(rawInput) || '';
    if (typeof TextEncoder !== 'undefined') {
      estimatedBytes = new TextEncoder().encode(str).length;
    } else {
      estimatedBytes = str.length;
    }
  } catch {
    estimatedBytes = totalNodes * 20;
  }

  return {
    totalNodes,
    maxDepth: maxDepthReached,
    leafCount,
    containerCount,
    avgBranchingFactor: containerCount > 0 ? Math.round((totalChildren / containerCount) * 100) / 100 : 0,
    estimatedBytes,
    primitiveRatio: totalNodes > 0 ? Math.round((leafCount / totalNodes) * 100) / 100 : 0
  };
}

export function buildTree(value, config = {}) {
  const mergedConfig = {
    maxDepth: Infinity,
    maxArraySample: 5,
    collapseArrays: true,
    archetype: true,
    ...config
  };

  const context = { totalNodes: 0, maxDepthReached: 0, truncated: false, anomalies: [] };
  const ancestorMap = new Map();

  function walk(val, key, path, depth) {
    context.totalNodes++;
    context.maxDepthReached = Math.max(context.maxDepthReached, depth);
    const type = detectType(val);

    if (val !== null && (type === 'object' || type === 'array')) {
      if (ancestorMap.has(val)) {
        const targetPath = ancestorMap.get(val) || '$';
        const anomaly = { type: 'circular_reference', path, message: 'Circular reference to ' + targetPath };
        context.anomalies.push(anomaly);
        return {
          type, key, path, depth, isCircular: true, circularTarget: targetPath, anomalies: [anomaly],
          children: [], ...(type === 'object' ? { keyCount: Object.keys(val).length } : { length: val.length, sampled: false })
        };
      }
      ancestorMap.set(val, path);
    }

    if (depth >= mergedConfig.maxDepth && (type === 'object' || type === 'array')) {
      context.truncated = true;
      if (val !== null && typeof val === 'object') ancestorMap.delete(val);
      if (type === 'object') return { type: 'object', key, path, depth, children: [], truncatedAtDepth: true, keyCount: Object.keys(val).length };
      return { type: 'array', key, path, depth, children: [], truncatedAtDepth: true, length: val.length, sampled: false, itemType: detectItemType(val) };
    }

    if (type === 'object') {
      const keys = Object.keys(val);
      const nodeAnomalies = [];
      if (keys.length === 0) {
        const emptyAnom = { type: 'empty_container', path, message: 'Empty object' };
        context.anomalies.push(emptyAnom);
        nodeAnomalies.push(emptyAnom);
      }
      const children = keys.map((k) => walk(val[k], k, `${path}.${k}`, depth + 1));
      ancestorMap.delete(val);
      return { type: 'object', key, path, depth, children, keyCount: keys.length, ...(nodeAnomalies.length ? { anomalies: nodeAnomalies } : {}) };
    }

    if (type === 'array') {
      const itemType = detectItemType(val);
      const nodeAnomalies = [];
      if (val.length === 0) {
        const emptyAnom = { type: 'empty_container', path, message: 'Empty array' };
        context.anomalies.push(emptyAnom);
        nodeAnomalies.push(emptyAnom);
      }
      if (itemType === 'mixed') {
        const mixedAnom = { type: 'mixed_array_types', path, message: 'Mixed types' };
        context.anomalies.push(mixedAnom);
        nodeAnomalies.push(mixedAnom);
      }
      let arch = null;
      if (mergedConfig.archetype) {
        arch = inferArchetype(val, mergedConfig.maxArraySample);
        if (arch && !arch.uniformKeys) {
          const divAnom = { type: 'divergent_keys', path, message: 'Inconsistent keys' };
          context.anomalies.push(divAnom);
          nodeAnomalies.push(divAnom);
        }
      }
      const { sample, sampled } = sampleArray(val, mergedConfig.maxArraySample);
      if (sampled) context.truncated = true;
      const children = sample.map(({ value: item, index }) => walk(item, index, `${path}[${index}]`, depth + 1));
      ancestorMap.delete(val);
      return {
        type, key, path, depth, children, length: val.length, sampled, itemType,
        ...(arch ? { archetype: arch } : {}),
        ...(nodeAnomalies.length ? { anomalies: nodeAnomalies } : {})
      };
    }

    return { type, key, path, depth, value: val };
  }

  const root = walk(value, null, '$', 0);
  const metrics = computeMetrics(root, context.totalNodes, context.maxDepthReached, value);
  return {
    root,
    totalNodes: context.totalNodes,
    maxDepthReached: context.maxDepthReached,
    truncated: context.truncated,
    metrics,
    anomalies: context.anomalies
  };
}

