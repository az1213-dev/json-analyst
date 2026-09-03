'use strict';

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render an AnalystTree into a standalone interactive HTML viewer.
 * @param {import('../types/ast').AnalystTree} tree
 * @param {Required<import('../types/config').AnalystConfig>} config
 * @returns {string}
 */
function renderHtml(tree, config) {
  const serializedTree = JSON.stringify(tree).replace(/</g, '\\u003c');
  const serializedConfig = JSON.stringify(config).replace(/</g, '\\u003c');
  const title = escapeHtml(config.title || 'JSON Analyst Viewer');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    :root {
      --bg: #0d1117;
      --panel: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-muted: #8b949e;
      --accent: #58a6ff;
      --type-object: #79c0ff;
      --type-array: #ffa657;
      --type-string: #7ee787;
      --type-number: #d2a8ff;
      --type-boolean: #ff7b72;
      --type-null: #8b949e;
      --type-circular: #f85149;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand {
      font-size: 16px;
      font-weight: 600;
      color: #f0f6fc;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-icon {
      background: #1f6feb;
      color: #fff;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .metrics-bar {
      display: flex;
      gap: 10px;
      font-size: 12px;
    }
    .metric-badge {
      background: rgba(110, 118, 129, 0.1);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 6px;
      color: var(--text-muted);
    }
    .metric-badge b { color: var(--text); }
    .breadcrumb-bar {
      background: #090d13;
      border-bottom: 1px solid var(--border);
      padding: 8px 20px;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;
      color: var(--text-muted);
      overflow-x: auto;
      white-space: nowrap;
    }
    .breadcrumb-bar a {
      color: var(--accent);
      text-decoration: none;
      cursor: pointer;
    }
    .breadcrumb-bar a:hover { text-decoration: underline; }
    .main-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .tree-pane {
      width: 45%;
      min-width: 320px;
      max-width: 600px;
      border-right: 1px solid var(--border);
      background: var(--bg);
      display: flex;
      flex-direction: column;
    }
    .tree-toolbar {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 8px;
    }
    .search-input {
      flex: 1;
      background: var(--panel);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      outline: none;
    }
    .search-input:focus { border-color: var(--accent); }
    .btn {
      background: var(--panel);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }
    .btn:hover { background: #21262d; }
    .tree-view {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
    }
    .tree-item {
      padding: 2px 4px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      user-select: none;
    }
    .tree-item:hover { background: #161b22; }
    .tree-item.selected { background: #1f6feb33; border: 1px solid #1f6feb88; }
    .toggle {
      width: 16px;
      display: inline-block;
      text-align: center;
      color: var(--text-muted);
      cursor: pointer;
    }
    .type-pill {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 4px;
      margin-left: 6px;
      font-weight: 500;
    }
    .pill-object { background: rgba(121, 192, 255, 0.15); color: var(--type-object); }
    .pill-array { background: rgba(255, 166, 87, 0.15); color: var(--type-array); }
    .pill-string { background: rgba(126, 231, 135, 0.15); color: var(--type-string); }
    .pill-number { background: rgba(210, 168, 255, 0.15); color: var(--type-number); }
    .pill-boolean { background: rgba(255, 123, 114, 0.15); color: var(--type-boolean); }
    .pill-null { background: rgba(139, 148, 158, 0.15); color: var(--type-null); }
    .pill-circular { background: rgba(248, 81, 73, 0.2); color: var(--type-circular); border: 1px dashed var(--type-circular); }
    .inspector-pane {
      flex: 1;
      background: var(--panel);
      padding: 24px;
      overflow-y: auto;
    }
    .card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #f0f6fc;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .prop-row {
      display: flex;
      padding: 6px 0;
      border-bottom: 1px solid rgba(48, 54, 61, 0.5);
      font-size: 12px;
    }
    .prop-label {
      width: 140px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .prop-value {
      flex: 1;
      font-family: ui-monospace, monospace;
      word-break: break-all;
    }
    .family-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .family-chip {
      background: var(--panel);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      color: var(--accent);
      font-family: ui-monospace, monospace;
    }
    .family-chip:hover { background: #21262d; }
    .archetype-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }
    .archetype-table th, .archetype-table td {
      border: 1px solid var(--border);
      padding: 6px 10px;
      text-align: left;
    }
    .archetype-table th { background: var(--bg); color: var(--text-muted); }
  </style>
</head>
<body>
  <header>
    <div class="header-left">
      <div class="brand"><span class="brand-icon">X-RAY</span> ${title}</div>
    </div>
    <div class="metrics-bar" id="metrics-bar"></div>
  </header>
  <div class="breadcrumb-bar" id="breadcrumb-bar">Family Tree: Click any node in the tree to explore</div>
  <div class="main-layout">
    <div class="tree-pane">
      <div class="tree-toolbar">
        <input type="text" id="search-box" class="search-input" placeholder="Filter keys or types..." />
        <button id="btn-expand" class="btn">Expand All</button>
        <button id="btn-collapse" class="btn">Collapse All</button>
      </div>
      <div class="tree-view" id="tree-container"></div>
    </div>
    <div class="inspector-pane" id="inspector-container">
      <div style="color: var(--text-muted); text-align: center; margin-top: 60px;">
        Select any node from the tree on the left to inspect its family tree, variables, and properties.
      </div>
    </div>
  </div>

  <script type="application/json" id="analyst-tree-data">${serializedTree}</script>
  <script type="application/json" id="analyst-config-data">${serializedConfig}</script>
  <script>
    (function() {
      const tree = JSON.parse(document.getElementById('analyst-tree-data').textContent);
      const config = JSON.parse(document.getElementById('analyst-config-data').textContent);

      // Render metrics
      const metricsBar = document.getElementById('metrics-bar');
      if (tree.metrics) {
        metricsBar.innerHTML = [
          '<span class="metric-badge">Nodes: <b>' + tree.metrics.totalNodes + '</b></span>',
          '<span class="metric-badge">Max Depth: <b>' + tree.metrics.maxDepth + '</b></span>',
          '<span class="metric-badge">Containers: <b>' + tree.metrics.containerCount + '</b></span>',
          '<span class="metric-badge">Leaves: <b>' + tree.metrics.leafCount + '</b></span>',
          '<span class="metric-badge">Est. Size: <b>' + tree.metrics.estimatedBytes + ' B</b></span>'
        ].join('');
      }

      const nodeMap = new Map();
      const parentMap = new Map();

      function indexNodes(node, parent) {
        nodeMap.set(node.path, node);
        if (parent) parentMap.set(node.path, parent);
        if (node.children) {
          node.children.forEach(c => indexNodes(c, node));
        }
      }
      indexNodes(tree.root, null);

      const treeContainer = document.getElementById('tree-container');
      const breadcrumbBar = document.getElementById('breadcrumb-bar');
      const inspectorContainer = document.getElementById('inspector-container');

      function renderTree(node, container, depth) {
        const item = document.createElement('div');
        item.className = 'tree-row';
        item.dataset.path = node.path;
        item.dataset.key = (node.key === null ? 'root' : String(node.key)).toLowerCase();
        item.dataset.type = node.type;

        const row = document.createElement('div');
        row.className = 'tree-item';
        row.style.paddingLeft = (depth * 16) + 'px';

        const hasChildren = node.children && node.children.length > 0;
        const toggle = document.createElement('span');
        toggle.className = 'toggle';
        toggle.textContent = hasChildren ? '▼' : '•';
        row.appendChild(toggle);

        const keyLabel = document.createElement('span');
        keyLabel.textContent = node.key === null ? 'root' : String(node.key);
        keyLabel.style.fontWeight = '500';
        row.appendChild(keyLabel);

        const pill = document.createElement('span');
        pill.className = 'type-pill pill-' + (node.isCircular ? 'circular' : node.type);
        if (node.isCircular) {
          pill.textContent = '↺ cycle';
        } else if (node.type === 'object') {
          pill.textContent = '{' + node.keyCount + '}';
        } else if (node.type === 'array') {
          pill.textContent = '[' + node.length + ']' + (node.itemType ? ' <' + node.itemType + '>' : '');
        } else {
          pill.textContent = node.type;
        }
        row.appendChild(pill);

        if (node.type !== 'object' && node.type !== 'array' && !node.isCircular) {
          const val = document.createElement('span');
          val.style.marginLeft = '8px';
          val.style.color = 'var(--text-muted)';
          val.textContent = node.type === 'string' ? '"' + node.value + '"' : String(node.value);
          row.appendChild(val);
        }

        item.appendChild(row);

        let childrenContainer = null;
        if (hasChildren) {
          childrenContainer = document.createElement('div');
          childrenContainer.className = 'tree-children';
          node.children.forEach(child => renderTree(child, childrenContainer, depth + 1));
          item.appendChild(childrenContainer);

          toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isClosed = childrenContainer.style.display === 'none';
            childrenContainer.style.display = isClosed ? 'block' : 'none';
            toggle.textContent = isClosed ? '▼' : '▶';
          });
        }

        row.addEventListener('click', () => {
          document.querySelectorAll('.tree-item.selected').forEach(el => el.classList.remove('selected'));
          row.classList.add('selected');
          selectNode(node);
        });

        container.appendChild(item);
      }

      renderTree(tree.root, treeContainer, 0);

      function selectNode(node) {
        // Update breadcrumbs (Family Tree ancestors)
        const ancestors = [];
        let curr = node;
        while (curr) {
          ancestors.unshift(curr);
          curr = parentMap.get(curr.path);
        }

        breadcrumbBar.innerHTML = 'Family Tree: ' + ancestors.map((anc, idx) => {
          const label = anc.key === null ? '$ (root)' : String(anc.key);
          return '<a data-path="' + escapeHtml(anc.path) + '">' + escapeHtml(label) + '</a>';
        }).join(' &gt; ');

        breadcrumbBar.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => {
            const target = nodeMap.get(a.dataset.path);
            if (target) selectNode(target);
          });
        });

        // Inspector content
        let html = '';
        html += '<div class="card">';
        html += '<div class="card-title">Node Inspector <span class="type-pill pill-' + (node.isCircular ? 'circular' : node.type) + '">' + escapeHtml(node.type) + '</span></div>';
        html += '<div class="prop-row"><div class="prop-label">Path</div><div class="prop-value">' + escapeHtml(node.path) + '</div></div>';
        html += '<div class="prop-row"><div class="prop-label">Key</div><div class="prop-value">' + escapeHtml(node.key === null ? 'null (root)' : node.key) + '</div></div>';
        html += '<div class="prop-row"><div class="prop-label">Depth</div><div class="prop-value">' + node.depth + '</div></div>';

        if (node.isCircular) {
          html += '<div class="prop-row"><div class="prop-label">Circular Target</div><div class="prop-value" style="color:var(--type-circular)">' + escapeHtml(node.circularTarget) + '</div></div>';
        }

        if (node.type === 'object') {
          html += '<div class="prop-row"><div class="prop-label">Keys Count</div><div class="prop-value">' + node.keyCount + '</div></div>';
        } else if (node.type === 'array') {
          html += '<div class="prop-row"><div class="prop-label">Array Length</div><div class="prop-value">' + node.length + (node.sampled ? ' (Sampled: ' + node.children.length + ')' : '') + '</div></div>';
          if (node.itemType) {
            html += '<div class="prop-row"><div class="prop-label">Item Type</div><div class="prop-value">' + escapeHtml(node.itemType) + '</div></div>';
          }
        } else {
          html += '<div class="prop-row"><div class="prop-label">Value</div><div class="prop-value">' + escapeHtml(node.type === 'string' ? '"' + node.value + '"' : String(node.value)) + '</div></div>';
        }

        if (node.anomalies && node.anomalies.length > 0) {
          html += '<div class="prop-row"><div class="prop-label">Anomalies</div><div class="prop-value" style="color:var(--type-boolean)">';
          node.anomalies.forEach(a => {
            html += '<div>[! ' + escapeHtml(a.type) + ']: ' + escapeHtml(a.message) + '</div>';
          });
          html += '</div></div>';
        }
        html += '</div>';

        // Family Tree section
        html += '<div class="card">';
        html += '<div class="card-title">Family Tree (Lineage & Relations)</div>';
        const parent = parentMap.get(node.path);
        html += '<div class="prop-row"><div class="prop-label">Parent</div><div class="prop-value">';
        if (parent) {
          html += '<span class="family-chip" data-path="' + escapeHtml(parent.path) + '">' + escapeHtml(parent.key === null ? '$ (root)' : parent.key) + ' (' + escapeHtml(parent.type) + ')</span>';
        } else {
          html += '<span style="color:var(--text-muted)">None (Root Node)</span>';
        }
        html += '</div></div>';

        const children = node.children || [];
        html += '<div class="prop-row"><div class="prop-label">Children (' + children.length + ')</div><div class="prop-value"><div class="family-links">';
        if (children.length > 0) {
          children.forEach(c => {
            html += '<span class="family-chip" data-path="' + escapeHtml(c.path) + '">' + escapeHtml(c.key) + ' (' + escapeHtml(c.type) + ')</span>';
          });
        } else {
          html += '<span style="color:var(--text-muted)">Leaf Node (No children)</span>';
        }
        html += '</div></div></div>';
        html += '</div>';

        // Archetype section
        if (node.archetype && Object.keys(node.archetype.properties).length > 0) {
          html += '<div class="card">';
          html += '<div class="card-title">Array Schema Archetype <span style="font-size:11px;color:var(--text-muted)">Sampled ' + node.archetype.sampleCount + '/' + node.archetype.totalCount + '</span></div>';
          html += '<table class="archetype-table"><thead><tr><th>Property</th><th>Types</th><th>Required</th><th>Coverage</th></tr></thead><tbody>';
          Object.values(node.archetype.properties).forEach(p => {
            html += '<tr><td><code>' + escapeHtml(p.key) + '</code></td><td>' + escapeHtml(p.types.join(', ')) + '</td><td>' + (p.optional ? 'Optional' : '<b>Required</b>') + '</td><td>' + Math.round(p.frequency * 100) + '%</td></tr>';
          });
          html += '</tbody></table></div>';
        }

        inspectorContainer.innerHTML = html;
        inspectorContainer.querySelectorAll('.family-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            const target = nodeMap.get(chip.dataset.path);
            if (target) selectNode(target);
          });
        });
      }

      // Toolbar search
      document.getElementById('search-box').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.tree-row').forEach(row => {
          if (!query) {
            row.style.display = 'block';
            return;
          }
          const key = row.dataset.key || '';
          const type = row.dataset.type || '';
          const matches = key.includes(query) || type.includes(query);
          row.style.display = matches ? 'block' : 'none';
        });
      });

      // Expand / Collapse
      document.getElementById('btn-expand').addEventListener('click', () => {
        document.querySelectorAll('.tree-children').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.toggle').forEach(el => { if (el.textContent === '▶') el.textContent = '▼'; });
      });
      document.getElementById('btn-collapse').addEventListener('click', () => {
        document.querySelectorAll('.tree-children').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.toggle').forEach(el => { if (el.textContent === '▼') el.textContent = '▶'; });
      });

      // Initial selection
      selectNode(tree.root);
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderHtml };

