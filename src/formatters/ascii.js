'use strict';

/**
 * Format primitive value for ASCII display.
 * @param {import('../types/ast').XrayPrimitiveNode} node
 * @returns {string}
 */
function formatValue(node) {
  if (node.type === 'string') return `"${node.value}"`;
  if (node.type === 'null') return 'null';
  return String(node.value);
}

/**
 * Build label for a node based on config options.
 * @param {import('../types/ast').XrayNode} node
 * @param {Required<import('../types/config').XrayConfig>} config
 * @returns {string}
 */
function labelFor(node, config) {
  const keyLabel = node.key === null ? 'root' : String(node.key);

  if (node.isCircular) {
    let label = `${keyLabel}: ↺ [circular -> ${node.circularTarget}]`;
    if (config.showTypes) label += ` (${node.type})`;
    return label;
  }

  let anomaliesBadge = '';
  if (config.showAnomalies && node.anomalies && node.anomalies.length > 0) {
    const types = node.anomalies.map((a) => a.type).join(', ');
    anomaliesBadge = ` [! ${types}]`;
  }

  if (node.type === 'object') {
    let label = keyLabel;
    if (config.showTypes) label += ' (object)';
    if (config.showCounts) label += ` {${node.keyCount}}`;
    if (node.truncatedAtDepth) label += ' …';
    return label + anomaliesBadge;
  }

  if (node.type === 'array') {
    let label = keyLabel;
    if (config.showTypes) label += ' (array)';
    if (config.showCounts) label += ` [${node.length}]`;
    if (node.itemType) label += ` <${node.itemType}>`;
    if (node.sampled) label += ' *sampled*';
    if (node.truncatedAtDepth) label += ' …';
    return label + anomaliesBadge;
  }

  let label = `${keyLabel}: ${formatValue(node)}`;
  if (config.showTypes) label += ` (${node.type})`;
  return label + anomaliesBadge;
}

/**
 * Format archetype summary schema into a single readable string.
 * @param {import('../types/ast').XrayArchetype} archetype
 * @returns {string}
 */
function formatArchetype(archetype) {
  const props = Object.values(archetype.properties).map((prop) => {
    const opt = prop.optional ? '?' : '';
    const typeStr = prop.types.join('|');
    return `${prop.key}${opt}: ${typeStr}`;
  });
  return `~archetype: { ${props.join(', ')} }`;
}

/**
 * Render an XrayTree as an indented box-drawing ASCII tree.
 * @param {import('../types/ast').XrayTree} tree
 * @param {Required<import('../types/config').XrayConfig>} config
 * @returns {string}
 */
function renderAscii(tree, config) {
  const lines = [];

  /**
   * @param {import('../types/ast').XrayNode} node
   * @param {string} prefix
   * @param {boolean} isLast
   * @param {boolean} isRoot
   */
  function walk(node, prefix, isLast, isRoot) {
    const connector = isRoot ? '' : isLast ? '└── ' : '├── ';
    lines.push(prefix + connector + labelFor(node, config));

    if (node.type === 'array' && config.archetype && node.archetype && Object.keys(node.archetype.properties).length > 0) {
      const childPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');
      const archConnector = (node.children && node.children.length > 0) ? '├── ' : '└── ';
      lines.push(childPrefix + archConnector + formatArchetype(node.archetype));
    }

    const children = (node.type === 'object' || node.type === 'array') ? (node.children || []) : [];
    const childPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');
    children.forEach((child, i) => {
      walk(child, childPrefix, i === children.length - 1, false);
    });
  }

  walk(tree.root, '', true, true);

  if (config.showMetrics && tree.metrics) {
    lines.push('');
    lines.push('─── Metrics ───');
    lines.push(`Total Nodes: ${tree.metrics.totalNodes} | Max Depth: ${tree.metrics.maxDepth} | Containers: ${tree.metrics.containerCount} | Leaves: ${tree.metrics.leafCount}`);
    lines.push(`Branching Factor: ${tree.metrics.avgBranchingFactor} | Est. Size: ${tree.metrics.estimatedBytes} bytes | Primitive Ratio: ${Math.round(tree.metrics.primitiveRatio * 100)}%`);
  }

  if (tree.truncated) {
    lines.push('');
    lines.push(
      `* (truncated: ${tree.totalNodes} nodes visited, max depth ${tree.maxDepthReached})`
    );
  }

  return lines.join('\n');
}

module.exports = { renderAscii };