'use strict';

/**
 * Escape string for Mermaid node labels.
 * @param {string} str
 * @returns {string}
 */
function escapeLabel(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ')
    .replace(/[[\]{}()]/g, '');
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
 * Build label for Mermaid node.
 * @param {import('../types/ast').XrayNode} node
 * @returns {string}
 */
function labelFor(node) {
  const keyLabel = node.key === null ? 'root' : String(node.key);

  if (node.isCircular) {
    return `${keyLabel}: ↺ circular -> ${node.circularTarget}`;
  }

  if (node.type === 'object') {
    return `${keyLabel}: object {${node.keyCount}}${node.truncatedAtDepth ? ' …' : ''}`;
  }
  if (node.type === 'array') {
    const suffix = node.sampled ? ' (sampled)' : '';
    return `${keyLabel}: array [${node.length}]${suffix}${node.truncatedAtDepth ? ' …' : ''}`;
  }
  return `${keyLabel}: ${formatValue(node)} (${node.type})`;
}

/**
 * Choose shape notation for node.
 * @param {string} id
 * @param {import('../types/ast').XrayNode} node
 * @param {string} label
 * @returns {string}
 */
function shapeFor(id, node, label) {
  const safe = escapeLabel(label);
  if (node.isCircular) return `${id}{{"${safe}"}}`;
  if (node.type === 'object') return `${id}["${safe}"]`;
  if (node.type === 'array') return `${id}(["${safe}"])`;
  return `${id}[/"${safe}"/]`;
}

/**
 * CSS class name for node type.
 * @param {import('../types/ast').XrayNode} node
 * @returns {string}
 */
function classFor(node) {
  if (node.isCircular) return 'xray-circular';
  return `xray-${node.type}`;
}

/**
 * Render an XrayTree as a Mermaid flowchart definition.
 * @param {import('../types/ast').XrayTree} tree
 * @param {Required<import('../types/config').XrayConfig>} config
 * @returns {string}
 */
function renderMermaid(tree, config) {
  let counter = 0;
  const nextId = () => `n${counter++}`;
  const lines = ['graph TD'];
  /** @type {string[]} */
  const classAssignments = [];

  /**
   * @param {import('../types/ast').XrayNode} node
   * @param {string|null} parentId
   */
  function walk(node, parentId) {
    const id = nextId();
    const label = labelFor(node);
    lines.push(`  ${shapeFor(id, node, label)}`);
    classAssignments.push(`  class ${id} ${classFor(node)};`);
    if (parentId) {
      if (node.isCircular) {
        lines.push(`  ${parentId} -. cycle .-> ${id}`);
      } else {
        lines.push(`  ${parentId} --> ${id}`);
      }
    }

    const children = (node.type === 'object' || node.type === 'array') ? (node.children || []) : [];
    children.forEach((child) => walk(child, id));
  }

  walk(tree.root, null);

  if (config.colors) {
    lines.push(
      '  classDef xray-object fill:#4C6EF5,stroke:#364FC7,color:#fff;',
      '  classDef xray-array fill:#F76707,stroke:#D9480F,color:#fff;',
      '  classDef xray-string fill:#2F9E44,stroke:#2B8A3E,color:#fff;',
      '  classDef xray-number fill:#AE3EC9,stroke:#9C36B5,color:#fff;',
      '  classDef xray-boolean fill:#E8590C,stroke:#D9480F,color:#fff;',
      '  classDef xray-null fill:#868E96,stroke:#495057,color:#fff;',
      '  classDef xray-circular fill:#FA5252,stroke:#C92A2A,color:#fff,stroke-dasharray: 4 4;',
      ...classAssignments
    );
  }

  return lines.join('\n');
}

module.exports = { renderMermaid };