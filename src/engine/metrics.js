'use strict';

/**
 * Calculate structural metrics for the AST.
 * @param {import('../types/ast').XrayNode} root
 * @param {number} totalNodes
 * @param {number} maxDepthReached
 * @param {unknown} [rawInput]
 * @returns {import('../types/ast').XrayMetrics}
 */
function computeMetrics(root, totalNodes, maxDepthReached, rawInput) {
  let leafCount = 0;
  let containerCount = 0;
  let totalChildrenAcrossContainers = 0;

  /**
   * @param {import('../types/ast').XrayNode} node
   */
  function visit(node) {
    if (node.type === 'object' || node.type === 'array') {
      containerCount++;
      const childCount = (node.children && node.children.length) || 0;
      totalChildrenAcrossContainers += childCount;
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          visit(node.children[i]);
        }
      }
    } else {
      leafCount++;
    }
  }

  visit(root);

  let estimatedBytes = 0;
  if (rawInput !== undefined) {
    try {
      const jsonStr = JSON.stringify(rawInput) || '';
      if (typeof Buffer !== 'undefined' && Buffer.byteLength) {
        estimatedBytes = Buffer.byteLength(jsonStr, 'utf8');
      } else if (typeof TextEncoder !== 'undefined') {
        estimatedBytes = new TextEncoder().encode(jsonStr).length;
      } else {
        estimatedBytes = jsonStr.length;
      }
    } catch {
      // If circular or fails to stringify, approximate based on node count
      estimatedBytes = totalNodes * 20;
    }
  }

  const avgBranchingFactor = containerCount > 0
    ? Math.round((totalChildrenAcrossContainers / containerCount) * 100) / 100
    : 0;

  const primitiveRatio = totalNodes > 0
    ? Math.round((leafCount / totalNodes) * 100) / 100
    : 0;

  return {
    totalNodes,
    maxDepth: maxDepthReached,
    leafCount,
    containerCount,
    avgBranchingFactor,
    estimatedBytes,
    primitiveRatio,
  };
}

module.exports = {
  computeMetrics,
};
