'use strict';

/**
 * Escape string for Graphviz DOT labels.
 * @param {string} str
 * @returns {string}
 */
function escapeLabel(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

/**
 * Format primitive value for label.
 * @param {import('../types/ast').XrayPrimitiveNode} node
 * @returns {string}
 */
function formatValue(node) {
  if (node.type === 'string') return `"${node.value}"`;
  if (node.type === 'null') return 'null';
  return String(node.value);
}

/**
 * Build label for Graphviz node.
 * @param {import('../types/ast').XrayNode} node
 * @returns {string}
 */
function labelFor(node) {
  const keyLabel = node.key === null ? 'root' : String(node.key);

  if (node.isCircular) {
    return `${keyLabel}\\n↺ circular -> ${node.circularTarget}`;
  }

  if (node.type === 'object') {
    return `${keyLabel}\\nobject {${node.keyCount}}${node.truncatedAtDepth ? '\\n…' : ''}`;
  }
  if (node.type === 'array') {
    const suffix = node.sampled ? '\\n(sampled)' : '';
    return `${keyLabel}\\narray [${node.length}]${suffix}${node.truncatedAtDepth ? '\\n…' : ''}`;
  }
  return `${keyLabel}\\n${formatValue(node)} (${node.type})`;
}

const PALETTE = {
  object: '#4C6EF5',
  array: '#F76707',
  string: '#2F9E44',
  number: '#AE3EC9',
  boolean: '#E8590C',
  null: '#868E96',
  circular: '#FA5252',
};

/**
 * Get color for node type.
 * @param {import('../types/ast').XrayNode} node
 * @returns {string}
 */
function colorFor(node) {
  if (node.isCircular) return PALETTE.circular;
  return PALETTE[node.type] || '#333333';
}

/**
 * Render an XrayTree as a Graphviz DOT digraph.
 * @param {import('../types/ast').XrayTree} tree
 * @param {Required<import('../types/config').XrayConfig>} config
 * @returns {string}
 */
function renderDot(tree, config) {
  let counter = 0;
  const nextId = () => `node${counter++}`;
  const lines = [
    'digraph JsonXray {',
    '  rankdir=LR;',
    '  node [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=10];',
    '  edge [color="#adb5bd"];',
  ];

  /**
   * @param {import('../types/ast').XrayNode} node
   * @param {string|null} parentId
   */
  function walk(node, parentId) {
    const id = nextId();
    const label = escapeLabel(labelFor(node));

    if (config.colors) {
      const color = colorFor(node);
      const borderStyle = node.isCircular ? 'dashed' : 'solid';
      lines.push(
        `  ${id} [label="${label}", fillcolor="${color}22", color="${color}", style="rounded,filled,${borderStyle}"];`
      );
    } else {
      lines.push(`  ${id} [label="${label}"];`);
    }

    if (parentId) {
      if (node.isCircular) {
        lines.push(`  ${parentId} -> ${id} [style=dashed, color="#FA5252", label="cycle"];`);
      } else {
        lines.push(`  ${parentId} -> ${id};`);
      }
    }

    const children = (node.type === 'object' || node.type === 'array') ? (node.children || []) : [];
    children.forEach((child) => walk(child, id));
  }

  walk(tree.root, null);
  lines.push('}');
  return lines.join('\n');
}

module.exports = { renderDot };