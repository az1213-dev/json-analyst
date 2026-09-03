/**
 * JSON Analyst — Application Orchestrator
 * Handles view switching, data processing, and component coordination
 */
import { Icons } from './icons.js';

// Upload constraints
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

// Chart layout tuning. Vertical bands are sized per-subtree, so leafBand +
// siblingGap is the guaranteed minimum gap between any two nodes in a column.
const CHART = {
  columnGap: 320,
  leafBand: 44,
  siblingGap: 22,
  maxChildren: 12,
  maxDepth: 5,
  margin: 80
};

function chartChildEntries(data) {
  if (Array.isArray(data)) {
    return data.slice(0, CHART.maxChildren).map((v, i) => [String(i), v]);
  }
  if (data !== null && typeof data === 'object') {
    return Object.entries(data).slice(0, CHART.maxChildren);
  }
  return [];
}

// One hue per JSON type. Mid-saturation so every colour stays legible on both
// the light and the dark surface.
const CHART_COLORS = {
  object: '#4f9eff',
  array: '#a78bfa',
  string: '#34d399',
  number: '#fbbf24',
  boolean: '#f472b6',
  null: '#94a3b8',
  more: '#64748b'
};

function chartLabel(key, data) {
  const type = data === null
    ? 'null'
    : Array.isArray(data) ? 'array' : typeof data;

  let value;
  if (type === 'null') value = 'null';
  else if (type === 'array') value = `[${data.length}]`;
  else if (type === 'object') value = `{${Object.keys(data).length}}`;
  else if (type === 'string') value = `"${data.length > 18 ? data.slice(0, 18) + '…' : data}"`;
  else value = String(data);

  const keyText = key === null ? 'root' : (key.length > 20 ? key.slice(0, 20) + '…' : key);
  return { type, keyText, valueText: value, text: `${keyText}: ${value}` };
}

// Pass 1: bottom-up measure of the vertical space each subtree needs.
function measureChartSubtree(key, data, depth, path) {
  const entries = depth >= CHART.maxDepth ? [] : chartChildEntries(data);
  const node = { key, data, depth, path, ...chartLabel(key, data), children: [] };
  const isArray = Array.isArray(data);
  node.totalChildren = isArray
    ? data.length
    : data !== null && typeof data === 'object' ? Object.keys(data).length : 0;
  node.hiddenChildren = Math.max(0, node.totalChildren - entries.length);

  if (entries.length === 0) {
    node.height = CHART.leafBand;
    return node;
  }

  node.children = entries.map(([k, v]) =>
    measureChartSubtree(k, v, depth + 1, isArray ? `${path}[${k}]` : `${path}.${k}`)
  );

  // Capped children get a real node in the layout rather than a note tacked on
  // afterwards, so the "+N more" marker is allocated its own band like anything
  // else and cannot collide with a neighbouring subtree.
  if (node.hiddenChildren > 0) {
    node.children.push({
      key: null,
      data: null,
      depth: depth + 1,
      path: `${path}[…]`,
      type: 'more',
      keyText: `+${node.hiddenChildren} more`,
      valueText: '',
      text: `+${node.hiddenChildren} more`,
      children: [],
      totalChildren: 0,
      hiddenChildren: 0,
      isMore: true,
      height: CHART.leafBand
    });
  }

  const stacked = node.children.reduce((sum, c) => sum + c.height, 0)
    + CHART.siblingGap * (node.children.length - 1);
  node.height = Math.max(CHART.leafBand, stacked);
  return node;
}

// Pass 2: hand each subtree a disjoint vertical band, then centre each parent
// on its own children. Disjoint bands are what make overlap impossible.
function positionChartSubtree(node, x, bandTop, out) {
  node.x = x;

  if (node.children.length === 0) {
    node.y = bandTop + node.height / 2;
  } else {
    let cursor = bandTop;
    node.children.forEach((child) => {
      positionChartSubtree(child, x + CHART.columnGap, cursor, out);
      cursor += child.height + CHART.siblingGap;
    });
    const first = node.children[0];
    const last = node.children[node.children.length - 1];
    node.y = (first.y + last.y) / 2;
  }

  out.push(node);
  return node;
}

export function computeChartLayout(data) {
  const root = measureChartSubtree(null, data, 0, 'root');
  const nodes = [];
  positionChartSubtree(root, CHART.margin, CHART.margin, nodes);

  const maxX = nodes.reduce((max, n) => Math.max(max, n.x), 0);
  return {
    nodes,
    root,
    width: maxX + CHART.margin + 280,
    height: root.height + CHART.margin * 2
  };
}

// Escape HTML special characters to prevent XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TREE_MAX_CHILDREN = 200;
const TREE_MAX_ROWS = 3000;

function valueType(data) {
  if (data === null) return 'null';
  if (Array.isArray(data)) return 'array';
  return typeof data;
}

function childEntriesOf(data) {
  if (Array.isArray(data)) return data.map((v, i) => [String(i), v]);
  if (data !== null && typeof data === 'object') return Object.entries(data);
  return [];
}

function childPathOf(parentPath, parentData, key) {
  return Array.isArray(parentData) ? `${parentPath}[${key}]` : `${parentPath}.${key}`;
}

function valuePreview(data, max = 60) {
  const type = valueType(data);
  if (type === 'null') return 'null';
  if (type === 'array') return `Array(${data.length})`;
  if (type === 'object') return `Object(${Object.keys(data).length})`;
  if (type === 'string') return `"${data.length > max ? data.slice(0, max) + '…' : data}"`;
  return String(data);
}

// Flattens the visible portion of the tree into rows. When a filter is active
// a node survives if it matches or if any descendant does, so the path down to
// every match stays reachable.
export function buildTreeRows(data, { expanded = new Set(), filter = '' } = {}) {
  const needle = filter.trim().toLowerCase();
  const byPath = new Map();

  const walk = (key, value, path, parentPath, depth) => {
    const entries = childEntriesOf(value).slice(0, TREE_MAX_CHILDREN);
    const isCompound = entries.length > 0;
    const isExpanded = expanded.has(path) || Boolean(needle);

    const childRows = [];
    let descendantMatched = false;
    if (isCompound && isExpanded) {
      entries.forEach(([k, v]) => {
        const result = walk(k, v, childPathOf(path, value, k), path, depth + 1);
        if (result.matched) {
          descendantMatched = true;
          childRows.push(...result.rows);
        }
      });
    }

    const haystack = `${key ?? 'root'} ${valuePreview(value, 120)}`.toLowerCase();
    const selfMatched = !needle || haystack.includes(needle);
    if (!selfMatched && !descendantMatched) return { matched: false, rows: [] };

    const row = {
      key: key ?? 'root',
      path,
      parentPath,
      depth,
      type: valueType(value),
      data: value,
      isCompound,
      expanded: isCompound && isExpanded
    };
    byPath.set(path, row);
    return { matched: true, rows: [row, ...childRows] };
  };

  const rows = walk(null, data, 'root', null, 0).rows.slice(0, TREE_MAX_ROWS);
  return { rows, byPath };
}

// Shared inspector body for a selected node, used by both Chart and Tree.
function nodeDetailsHTML(path, data) {
  const type = valueType(data);
  const entries = childEntriesOf(data);
  const facts = [['Type', type], ['Path', path]];

  if (type === 'array') {
    const kinds = [...new Set(data.map(valueType))];
    facts.push(['Items', String(data.length)]);
    facts.push(['Element types', kinds.length ? kinds.join(', ') : '—']);
    facts.push(['Uniform', kinds.length <= 1 ? 'yes' : 'no']);
  } else if (type === 'object') {
    facts.push(['Keys', String(entries.length)]);
  } else if (type === 'string') {
    facts.push(['Length', `${data.length} characters`]);
  } else if (type === 'number') {
    facts.push(['Integer', Number.isInteger(data) ? 'yes' : 'no']);
  }

  const json = JSON.stringify(data, null, 2) ?? String(data);
  facts.push(['Serialized', `${json.length.toLocaleString()} chars`]);

  const factRows = facts.map(([label, value]) => `
    <div class="detail-fact">
      <span class="detail-fact-key">${escapeHtml(label)}</span>
      <span class="detail-fact-value">${escapeHtml(value)}</span>
    </div>`).join('');

  let childTable = '';
  if (entries.length > 0) {
    const shown = entries.slice(0, 50);
    const rows = shown.map(([key, value]) => `
      <tr>
        <td class="detail-child-key">${escapeHtml(key)}</td>
        <td class="detail-child-type">${escapeHtml(valueType(value))}</td>
        <td class="detail-child-preview">${escapeHtml(valuePreview(value, 40))}</td>
      </tr>`).join('');
    const more = entries.length > shown.length
      ? `<div class="detail-more">+ ${entries.length - shown.length} more not listed</div>`
      : '';
    childTable = `
      <div class="detail-section-title">${type === 'array' ? 'Items' : 'Keys'}</div>
      <div class="detail-table-wrap">
        <table class="detail-child-table">
          <thead><tr><th>${type === 'array' ? 'Index' : 'Key'}</th><th>Type</th><th>Value</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>${more}`;
  }

  const capped = json.length > 20000;
  const body = capped ? json.slice(0, 20000) + '\n… truncated' : json;

  return `
    <div class="node-details">
      <div class="detail-path">${escapeHtml(path)}</div>
      <div class="detail-facts">${factRows}</div>
      ${childTable}
      <div class="detail-section-title">Value</div>
      <pre class="detail-json">${escapeHtml(body)}</pre>
    </div>`;
}

class App {
  constructor() {
    this.setupNavigation();
    this.setupFileUpload();
    this.setupToolButtons();
    this.setupCopyDownloadButtons();
    this.setupTheme();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-tool-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const action = link.dataset.navAction;
        this.switchPane(action);
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  switchPane(action) {
    // Hide all panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    // Show selected pane
    const paneMap = {
      'validate': 'pane-validate',
      'format': 'pane-format',
      'repair': 'pane-repair',
      'compact': 'pane-compact',
      'csv': 'pane-csv',
      'all-tools': 'pane-all-tools',
      'chart': 'pane-chart',
      'tree': 'pane-tree'
    };

    const paneId = paneMap[action];
    if (paneId) {
      const pane = document.getElementById(paneId);
      if (pane) pane.classList.add('active');
    }
  }

  setupFileUpload() {
    const fileInput = document.getElementById('file-upload-input');
    const uploadBtn = document.getElementById('btn-upload-file');
    const jsonInput = document.getElementById('json-code-input');
    const dropOverlay = document.getElementById('drop-overlay');

    if (!uploadBtn || !fileInput) return;

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e, 'json-code-input'));

    // Drag and drop
    jsonInput?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropOverlay?.classList.add('active');
    });

    jsonInput?.addEventListener('dragleave', () => {
      dropOverlay?.classList.remove('active');
    });

    jsonInput?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropOverlay?.classList.remove('active');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        this.handleFileUpload({ target: fileInput }, 'json-code-input');
      }
    });

    // Setup file uploads for other tools
    this.setupToolFileUploads();
  }

  setupToolFileUploads() {
    const toolUploads = [
      { btn: 'btn-upload-format', input: 'file-upload-format', target: 'json-format-input' },
      { btn: 'btn-upload-repair', input: 'file-upload-repair', target: 'json-repair-input' },
      { btn: 'btn-upload-compact', input: 'file-upload-compact', target: 'json-compact-input' },
      { btn: 'btn-upload-csv', input: 'file-upload-csv', target: 'json-csv-input' },
      { btn: 'btn-upload-chart', input: 'file-upload-chart', target: 'json-chart-input' },
      { btn: 'btn-upload-tree', input: 'file-upload-tree', target: 'json-tree-input' }
    ];

    toolUploads.forEach(({ btn, input, target }) => {
      const uploadBtn = document.getElementById(btn);
      const fileInput = document.getElementById(input);

      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e, target));
      }
    });
  }

  handleFileUpload(e, targetId = 'json-code-input') {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      alert(`File too large. Maximum 5 MB allowed. Your file: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    if (!file.name.endsWith('.json')) {
      alert('Only .json files are accepted.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonInput = document.getElementById(targetId);
      if (jsonInput) {
        jsonInput.value = event.target.result;
        if (targetId === 'json-code-input') {
          this.updateLineNumbers();
        }
      }
    };
    reader.readAsText(file);
  }

  setupToolButtons() {
    // Validate
    document.getElementById('btn-validate')?.addEventListener('click', () => this.validateJSON());

    // Format
    document.getElementById('btn-format')?.addEventListener('click', () => this.formatJSON());

    // Repair
    document.getElementById('btn-repair')?.addEventListener('click', () => this.repairJSON());

    // Compact
    document.getElementById('btn-compact')?.addEventListener('click', () => this.compactJSON());

    // CSV Conversion
    document.getElementById('btn-to-csv')?.addEventListener('click', () => this.convertToCSV());

    // Chart Visualization
    document.getElementById('btn-show-chart')?.addEventListener('click', () => this.renderChart());
    document.getElementById('btn-export-png')?.addEventListener('click', () => this.exportChartPNG());
    document.getElementById('btn-export-svg')?.addEventListener('click', () => this.exportChartSVG());

    // Tree Visualization
    document.getElementById('btn-show-tree')?.addEventListener('click', () => this.renderTree());

    // Tool Card Buttons
    document.querySelectorAll('.tool-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.switchPane(action);
        const navLink = document.querySelector(`[data-nav-action="${action}"]`);
        if (navLink) {
          document.querySelectorAll('.nav-tool-link').forEach(l => l.classList.remove('active'));
          navLink.classList.add('active');
        }
      });
    });

    // Clear button
    document.getElementById('btn-clear')?.addEventListener('click', () => {
      document.getElementById('json-code-input').value = '';
      this.updateLineNumbers();
    });
  }

  setupCopyDownloadButtons() {
    // Copy buttons
    document.getElementById('btn-copy-validate')?.addEventListener('click', () => {
      const input = document.getElementById('json-code-input');
      this.copyToClipboard(input.value, 'Copied to clipboard!');
    });

    document.getElementById('btn-copy-format')?.addEventListener('click', () => {
      const output = document.getElementById('json-format-output');
      this.copyToClipboard(output.value, 'Formatted JSON copied!');
    });

    document.getElementById('btn-copy-repair')?.addEventListener('click', () => {
      const output = document.getElementById('json-repair-output');
      this.copyToClipboard(output.value, 'Repaired JSON copied!');
    });

    document.getElementById('btn-copy-compact')?.addEventListener('click', () => {
      const output = document.getElementById('json-compact-output');
      this.copyToClipboard(output.value, 'Compact JSON copied!');
    });

    document.getElementById('btn-copy-csv')?.addEventListener('click', () => {
      const output = document.getElementById('json-csv-output');
      this.copyToClipboard(output.value, 'CSV copied!');
    });

    // Download buttons
    document.getElementById('btn-download-validate')?.addEventListener('click', () => {
      const input = document.getElementById('json-code-input');
      this.downloadFile(input.value, 'data.json', 'application/json');
    });

    document.getElementById('btn-download-format')?.addEventListener('click', () => {
      const output = document.getElementById('json-format-output');
      this.downloadFile(output.value, 'data-formatted.json', 'application/json');
    });

    document.getElementById('btn-download-repair')?.addEventListener('click', () => {
      const output = document.getElementById('json-repair-output');
      this.downloadFile(output.value, 'data-repaired.json', 'application/json');
    });

    document.getElementById('btn-download-compact')?.addEventListener('click', () => {
      const output = document.getElementById('json-compact-output');
      this.downloadFile(output.value, 'data-compact.json', 'application/json');
    });

    document.getElementById('btn-download-csv')?.addEventListener('click', () => {
      const output = document.getElementById('json-csv-output');
      this.downloadFile(output.value, 'data.csv', 'text/csv');
    });
  }

  copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
      alert(message);
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  }

  downloadFile(content, filename, mimeType) {
    this.downloadBlob(new Blob([content], { type: mimeType }), filename);
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  validateJSON() {
    const input = document.getElementById('json-code-input');
    const banner = document.getElementById('status-banner');
    const title = document.getElementById('status-title');
    const desc = document.getElementById('status-desc');

    try {
      const data = JSON.parse(input.value);
      banner.className = 'status-banner success';
      title.textContent = 'Valid JSON';
      desc.textContent = 'Your JSON syntax is correct and well-formed.';
    } catch (error) {
      banner.className = 'status-banner error';
      title.textContent = 'Invalid JSON';
      desc.textContent = `Error: ${error.message}`;
    }
  }

  formatJSON() {
    const input = document.getElementById('json-format-input');
    const output = document.getElementById('json-format-output');

    try {
      const data = JSON.parse(input.value);
      output.value = JSON.stringify(data, null, 2);
    } catch (error) {
      output.value = `Error: ${error.message}`;
    }
  }

  repairJSON() {
    const input = document.getElementById('json-repair-input');
    const output = document.getElementById('json-repair-output');

    try {
      let repaired = input.value
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/:\s*'/g, ':"') // Fix single quotes after colons
        .replace(/'\s*,/g, '",') // Fix single quotes before commas
        .replace(/'\s*}/g, '"}') // Fix single quotes before }
        .replace(/'/g, '"');     // Replace remaining single quotes with double

      const data = JSON.parse(repaired);
      output.value = JSON.stringify(data, null, 2);
    } catch (error) {
      output.value = `Error: Could not repair JSON: ${error.message}`;
    }
  }

  compactJSON() {
    const input = document.getElementById('json-compact-input');
    const output = document.getElementById('json-compact-output');

    try {
      const data = JSON.parse(input.value);
      output.value = JSON.stringify(data);
    } catch (error) {
      output.value = `Error: ${error.message}`;
    }
  }

  convertToCSV() {
    const input = document.getElementById('json-csv-input');
    const output = document.getElementById('json-csv-output');

    try {
      const data = JSON.parse(input.value);

      if (!Array.isArray(data)) {
        output.value = 'Error: Input must be a JSON array';
        return;
      }

      if (data.length === 0) {
        output.value = 'Error: Array is empty';
        return;
      }

      // Get all unique keys from all objects
      const keys = [...new Set(data.flatMap(obj => Object.keys(obj)))];

      // Create CSV header
      const header = keys.map(k => `"${k}"`).join(',');

      // Create CSV rows
      const rows = data.map(obj => {
        return keys.map(key => {
          const value = obj[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          return value;
        }).join(',');
      });

      output.value = [header, ...rows].join('\n');
    } catch (error) {
      output.value = `Error: ${error.message}`;
    }
  }

  updateLineNumbers() {
    const textarea = document.getElementById('json-code-input');
    const gutter = document.getElementById('line-numbers-gutter');
    const counter = document.getElementById('editor-counter');

    if (textarea && gutter) {
      const lines = textarea.value.split('\n').length;
      gutter.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    }

    if (textarea && counter) {
      const lines = textarea.value.split('\n').length;
      const chars = textarea.value.length;
      counter.textContent = `${lines} lines | ${chars} chars`;
    }
  }

  renderChart() {
    const input = document.getElementById('json-chart-input');
    const canvas = document.getElementById('chart-canvas');
    const container = document.getElementById('chart-container');
    const inspector = document.getElementById('chart-inspector');

    if (container) container.style.display = 'block';
    this.chartNodes = [];

    const fail = (message) => {
      if (canvas) canvas.innerHTML = `<div class="tree-message error">${escapeHtml(message)}</div>`;
      if (inspector) inspector.innerHTML = '<div class="tree-message">Nothing to inspect yet.</div>';
    };

    if (!input.value.trim()) {
      fail('Please enter JSON data to visualize');
      return;
    }

    let data;
    try {
      data = JSON.parse(input.value);
    } catch (error) {
      fail(`Error: ${error.message}`);
      return;
    }

    if (canvas) {
      canvas.innerHTML = '';
      this.buildInteractiveChart(data, canvas);
    }
  }

  buildInteractiveChart(data, container) {
    const layout = computeChartLayout(data);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
    svg.setAttribute('style', 'width:100%; height:100%; background: var(--bg-surface);');

    // Theme colours are read once and baked in as literals: a detached SVG
    // (the PNG/SVG export) cannot resolve the page's CSS custom properties.
    const css = getComputedStyle(document.documentElement);
    const theme = {
      surface: css.getPropertyValue('--bg-surface').trim() || '#ffffff',
      keyText: css.getPropertyValue('--text-muted').trim() || '#8b96a5',
      guide: css.getPropertyValue('--border-subtle').trim() || '#e2e8f0'
    };
    const svgEl = (name) => document.createElementNS('http://www.w3.org/2000/svg', name);
    const colorOf = (type) => CHART_COLORS[type] || CHART_COLORS.null;

    const defs = svgEl('defs');
    const style = svgEl('style');
    style.textContent = `
      .node-text { font-family: monospace; font-size: 13px; pointer-events: none; }
      .node-key { font-weight: 600; }
      .node-value { opacity: 0.95; }
      .node-line { fill: none; stroke-width: 2; opacity: 0.55; transition: opacity .15s, stroke-width .15s; }
      .node-line.lit { opacity: 1; stroke-width: 3.5; }
      .node-hit { cursor: pointer; }
      .node-halo { opacity: 0.16; transition: opacity .15s; }
      .node-hit:hover + .node-halo, .node-halo.lit { opacity: 0.4; }
      .depth-guide { stroke-width: 1; opacity: 0.35; stroke-dasharray: 2 8; }
      .depth-label { font-family: monospace; font-size: 11px; letter-spacing: .08em; opacity: 0.5; }
      .legend-text { font-family: monospace; font-size: 12px; }
      .more-ring { stroke-dasharray: 3 3; fill: none; }
    `;
    defs.appendChild(style);
    svg.appendChild(defs);

    const linesGroup = svgEl('g');
    linesGroup.id = 'chart-lines';
    svg.appendChild(linesGroup);

    const g = svgEl('g');
    g.id = 'chart-group';
    svg.appendChild(g);

    // Faint dashed rule down each depth column, plus a level label up top, so
    // the depth of any node is readable at a glance.
    const columns = [...new Set(layout.nodes.map((n) => n.x))].sort((a, b) => a - b);
    columns.forEach((x, depth) => {
      const guide = svgEl('line');
      guide.setAttribute('class', 'depth-guide');
      guide.setAttribute('x1', x);
      guide.setAttribute('x2', x);
      guide.setAttribute('y1', 46);
      guide.setAttribute('y2', layout.height - 20);
      guide.setAttribute('stroke', theme.guide);
      linesGroup.appendChild(guide);

      const label = svgEl('text');
      label.setAttribute('class', 'depth-label');
      label.setAttribute('x', x);
      label.setAttribute('y', 34);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', theme.keyText);
      label.textContent = depth === 0 ? 'ROOT' : `LEVEL ${depth}`;
      linesGroup.appendChild(label);
    });

    // Edges, each fading from the parent's type colour to the child's.
    const edgeByPath = new Map();
    let gradientSeq = 0;
    layout.nodes.forEach((node) => {
      node.children.forEach((child) => {
        const id = `edge-grad-${gradientSeq++}`;
        const gradient = svgEl('linearGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        gradient.setAttribute('x1', node.x);
        gradient.setAttribute('x2', child.x);
        [[0, colorOf(node.type)], [1, colorOf(child.type)]].forEach(([offset, color]) => {
          const stop = svgEl('stop');
          stop.setAttribute('offset', String(offset));
          stop.setAttribute('stop-color', color);
          gradient.appendChild(stop);
        });
        defs.appendChild(gradient);

        const midX = (node.x + child.x) / 2;
        const path = svgEl('path');
        path.setAttribute('class', 'node-line');
        path.setAttribute('stroke', `url(#${id})`);
        path.setAttribute('d', `M ${node.x} ${node.y} C ${midX} ${node.y} ${midX} ${child.y} ${child.x} ${child.y}`);
        linesGroup.appendChild(path);
        edgeByPath.set(child.path, path);

        child.parent = node;
      });
    });

    const rendered = layout.nodes.map((node) => {
      const color = colorOf(node.type);
      const isContainer = node.children.length > 0;
      const radius = node.isMore ? 4 : isContainer ? 8 : 5.5;

      // Hit target sits under the halo so :hover can light the halo up.
      const hit = svgEl('circle');
      hit.setAttribute('class', 'node-hit');
      hit.setAttribute('cx', node.x);
      hit.setAttribute('cy', node.y);
      hit.setAttribute('r', '16');
      hit.setAttribute('fill', 'transparent');
      g.appendChild(hit);

      const halo = svgEl('circle');
      halo.setAttribute('class', 'node-halo');
      halo.setAttribute('cx', node.x);
      halo.setAttribute('cy', node.y);
      halo.setAttribute('r', radius + 7);
      halo.setAttribute('fill', color);
      g.appendChild(halo);

      // Containers get an outer ring; capped markers get a dashed one.
      if (isContainer || node.isMore) {
        const ring = svgEl('circle');
        ring.setAttribute('class', node.isMore ? 'more-ring' : '');
        ring.setAttribute('cx', node.x);
        ring.setAttribute('cy', node.y);
        ring.setAttribute('r', radius + 4);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', color);
        ring.setAttribute('stroke-width', '1.5');
        ring.setAttribute('opacity', node.isMore ? '0.7' : '0.5');
        g.appendChild(ring);
      }

      const circle = svgEl('circle');
      circle.setAttribute('class', 'node-circle');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', node.isMore ? theme.surface : color);
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);

      // Key and value are separate tspans so the type colour carries meaning.
      const text = svgEl('text');
      text.setAttribute('class', 'node-text');
      text.setAttribute('x', node.x + 16);
      text.setAttribute('y', node.y + 4);

      const keySpan = svgEl('tspan');
      keySpan.setAttribute('class', 'node-key');
      keySpan.setAttribute('fill', theme.keyText);
      keySpan.textContent = node.keyText;
      text.appendChild(keySpan);

      if (!node.isMore) {
        const valueSpan = svgEl('tspan');
        valueSpan.setAttribute('class', 'node-value');
        valueSpan.setAttribute('fill', color);
        valueSpan.textContent = `  ${node.valueText}`;
        text.appendChild(valueSpan);
      }
      g.appendChild(text);

      return { node, hit, halo, circle };
    });

    // Hovering a node lights its whole ancestor chain, so you can see which
    // branch a deep leaf actually belongs to.
    rendered.forEach(({ node, hit }) => {
      const chain = [];
      for (let cursor = node; cursor; cursor = cursor.parent) chain.push(cursor.path);
      hit.addEventListener('mouseenter', () => {
        chain.forEach((p) => edgeByPath.get(p)?.classList.add('lit'));
      });
      hit.addEventListener('mouseleave', () => {
        chain.forEach((p) => edgeByPath.get(p)?.classList.remove('lit'));
      });
    });

    this.chartNodes = rendered
      .filter(({ node }) => !node.isMore)
      .map(({ node, hit, circle }) => ({
        element: circle,
        hit,
        data: node.data,
        type: node.type,
        label: node.text,
        path: node.path
      }));

    this.drawChartLegend(svg, layout, theme, svgEl, colorOf);

    // Add zoom/pan controls
    let scale = 1;
    let panning = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    const updateTransform = () => {
      g.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
      linesGroup.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
    };

    // Wheel zoom
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      scale = Math.max(0.2, Math.min(3, scale * delta));
      updateTransform();
    });

    // Pan with mouse
    svg.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.button === 2) {
        panning = true;
        startX = e.clientX;
        startY = e.clientY;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (panning) {
        translateX += e.clientX - startX;
        translateY += e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        updateTransform();
      }
    });

    document.addEventListener('mouseup', () => {
      panning = false;
    });

    // Click handler for nodes
    this.chartNodes.forEach((node) => {
      node.hit.addEventListener('click', () => this.showChartNodeDetails(node));
    });

    container.appendChild(svg);

    // Add info text
    const info = document.createElement('div');
    info.style.cssText = 'position: absolute; top: 10px; left: 10px; color: var(--text-muted); font-size: 12px; background: var(--bg-surface-elevated); padding: 8px 12px; border-radius: 4px; max-width: 300px;';
    info.textContent = 'Scroll to zoom · Middle-click + drag to pan · Click a node for details';
    container.style.position = 'relative';
    container.appendChild(info);

    // Open on the root node, so the inspector is never blank on first render.
    const rootNode = this.chartNodes.find((n) => n.path === 'root');
    if (rootNode) this.showChartNodeDetails(rootNode);
  }

  // Legend sits outside the pan/zoom group so it stays put while you navigate,
  // and lists only the types actually present in this document.
  drawChartLegend(svg, layout, theme, svgEl, colorOf) {
    const present = [...new Set(layout.nodes.map((n) => n.type))]
      .filter((t) => t !== 'more')
      .sort();
    if (present.length === 0) return;

    const rowHeight = 22;
    const boxWidth = 150;
    const boxHeight = present.length * rowHeight + 20;
    const x = layout.width - boxWidth - 24;
    const y = 20;

    const legend = svgEl('g');

    const panel = svgEl('rect');
    panel.setAttribute('x', x);
    panel.setAttribute('y', y);
    panel.setAttribute('width', boxWidth);
    panel.setAttribute('height', boxHeight);
    panel.setAttribute('rx', '8');
    panel.setAttribute('fill', theme.surface);
    panel.setAttribute('stroke', theme.guide);
    panel.setAttribute('opacity', '0.95');
    legend.appendChild(panel);

    present.forEach((type, idx) => {
      const rowY = y + 22 + idx * rowHeight;

      const dot = svgEl('circle');
      dot.setAttribute('cx', x + 18);
      dot.setAttribute('cy', rowY - 4);
      dot.setAttribute('r', '5.5');
      dot.setAttribute('fill', colorOf(type));
      legend.appendChild(dot);

      const label = svgEl('text');
      label.setAttribute('class', 'legend-text');
      label.setAttribute('x', x + 34);
      label.setAttribute('y', rowY);
      label.setAttribute('fill', theme.keyText);
      label.textContent = type;
      legend.appendChild(label);
    });

    svg.appendChild(legend);
  }

  showChartNodeDetails(node) {
    this.chartNodes.forEach((n) => n.element.classList.toggle('selected', n === node));
    const inspector = document.getElementById('chart-inspector');
    if (inspector) inspector.innerHTML = nodeDetailsHTML(node.path, node.data);
  }

  renderTree() {
    const input = document.getElementById('json-tree-input');
    const container = document.getElementById('tree-container');
    const treeList = document.getElementById('tree-list');

    if (container) container.style.display = 'block';

    if (!input.value.trim()) {
      if (treeList) treeList.innerHTML = '<div class="tree-message error">Please enter JSON data to explore</div>';
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(input.value);
    } catch (error) {
      if (treeList) treeList.innerHTML = `<div class="tree-message error">Error: ${escapeHtml(error.message)}</div>`;
      return;
    }

    this.treeData = parsed;
    this.treeExpanded = new Set(['root']);
    this.treeSelected = 'root';
    this.treeFilter = '';

    const search = document.getElementById('tree-search-input');
    if (search) search.value = '';

    this.bindTreeControls();
    this.paintTree();
  }

  bindTreeControls() {
    if (this.treeControlsBound) return;
    this.treeControlsBound = true;

    const treeList = document.getElementById('tree-list');
    treeList?.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-toggle]');
      if (toggle) {
        const path = toggle.dataset.toggle;
        if (this.treeExpanded.has(path)) this.treeExpanded.delete(path);
        else this.treeExpanded.add(path);
        this.paintTree();
        return;
      }
      const bar = e.target.closest('.tree-node-bar');
      if (bar) {
        this.treeSelected = bar.dataset.path;
        this.paintTree();
      }
    });

    document.getElementById('tree-breadcrumbs')?.addEventListener('click', (e) => {
      const crumb = e.target.closest('.breadcrumb-item');
      if (!crumb) return;
      this.treeSelected = crumb.dataset.path;
      // Make sure the selected node is reachable in the list.
      let node = this.treeNodeByPath?.get(crumb.dataset.path);
      while (node?.parentPath) {
        this.treeExpanded.add(node.parentPath);
        node = this.treeNodeByPath.get(node.parentPath);
      }
      this.paintTree();
    });

    document.getElementById('tree-search-input')?.addEventListener('input', (e) => {
      this.treeFilter = e.target.value;
      this.paintTree();
    });

    document.getElementById('btn-tree-expand')?.addEventListener('click', () => {
      this.treeExpanded = new Set();
      const walk = (data, path) => {
        const entries = childEntriesOf(data);
        if (entries.length === 0) return;
        this.treeExpanded.add(path);
        entries.slice(0, TREE_MAX_CHILDREN).forEach(([k, v]) => walk(v, childPathOf(path, data, k)));
      };
      walk(this.treeData, 'root');
      this.paintTree();
    });

    document.getElementById('btn-tree-collapse')?.addEventListener('click', () => {
      this.treeExpanded = new Set(['root']);
      this.paintTree();
    });
  }

  paintTree() {
    const treeList = document.getElementById('tree-list');
    const breadcrumbs = document.getElementById('tree-breadcrumbs');
    const inspector = document.getElementById('tree-inspector');
    if (!treeList) return;

    const { rows, byPath } = buildTreeRows(this.treeData, {
      expanded: this.treeExpanded,
      filter: this.treeFilter || ''
    });
    this.treeNodeByPath = byPath;

    if (rows.length === 0) {
      treeList.innerHTML = '<div class="tree-message">No nodes match that search.</div>';
    } else {
      treeList.innerHTML = rows.map((row) => {
        const chevron = row.isCompound
          ? `<button class="tree-chevron" data-toggle="${escapeHtml(row.path)}" aria-label="${row.expanded ? 'Collapse' : 'Expand'}">${row.expanded ? '▾' : '▸'}</button>`
          : '<span class="tree-chevron placeholder"></span>';
        const preview = row.isCompound ? '' :
          `<span class="tree-node-preview">${escapeHtml(valuePreview(row.data, 40))}</span>`;
        return `
          <div class="tree-item-row">
            <div class="tree-node-bar${row.path === this.treeSelected ? ' selected' : ''}"
                 data-path="${escapeHtml(row.path)}"
                 style="padding-left:${8 + row.depth * 16}px">
              ${chevron}
              <span class="tree-node-label">${escapeHtml(row.key)}</span>
              <span class="tree-type-badge type-${escapeHtml(row.type)}">${escapeHtml(row.type)}</span>
              ${preview}
            </div>
          </div>`;
      }).join('');
    }

    // Selection may be filtered out; fall back to the root.
    if (!this.treeNodeByPath.has(this.treeSelected)) this.treeSelected = 'root';
    const selected = this.treeNodeByPath.get(this.treeSelected);

    if (breadcrumbs) {
      const chain = [];
      let cursor = selected;
      while (cursor) {
        chain.unshift(cursor);
        cursor = cursor.parentPath ? this.treeNodeByPath.get(cursor.parentPath) : null;
      }
      breadcrumbs.innerHTML = chain.map((node, idx) => {
        const isLast = idx === chain.length - 1;
        const crumb = `<button class="breadcrumb-item${isLast ? ' active' : ''}" data-path="${escapeHtml(node.path)}">${escapeHtml(node.key)}</button>`;
        return isLast ? crumb : `${crumb}<span class="breadcrumb-sep">/</span>`;
      }).join('');
    }

    if (inspector) {
      inspector.innerHTML = selected
        ? nodeDetailsHTML(selected.path, selected.data)
        : '<div class="tree-message">Select a node to inspect it.</div>';
    }
  }

  // Clones the live chart into a standalone SVG: pan/zoom reset so the whole
  // tree is captured, theme colours resolved to literals (a detached SVG can't
  // read the page's CSS custom properties), and an explicit pixel size.
  buildExportableSvg() {
    const live = document.getElementById('chart-canvas')?.querySelector('svg');
    if (!live) return null;

    const viewBox = (live.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    if (viewBox.length !== 4 || viewBox.some(Number.isNaN)) return null;
    const [, , width, height] = viewBox;

    const clone = live.cloneNode(true);
    clone.removeAttribute('style');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    clone.querySelectorAll('#chart-group, #chart-lines')
      .forEach((group) => group.removeAttribute('transform'));

    const surface = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-surface').trim() || '#ffffff';
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', String(width));
    background.setAttribute('height', String(height));
    background.setAttribute('fill', surface);
    clone.insertBefore(background, clone.firstChild);

    return { markup: new XMLSerializer().serializeToString(clone), width, height };
  }

  exportChartPNG() {
    const exportable = this.buildExportableSvg();
    if (!exportable) {
      alert('Generate a chart first by loading JSON data.');
      return;
    }

    const { markup, width, height } = exportable;
    const scale = 2; // render at 2x so the PNG stays crisp when zoomed
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Could not render the chart as a PNG.');
          return;
        }
        this.downloadBlob(blob, 'json-analyst-chart.png');
      }, 'image/png');
    };
    image.onerror = () => alert('Could not render the chart as a PNG.');

    // A data URI keeps the canvas untainted, so toBlob() stays allowed.
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  }

  exportChartSVG() {
    const exportable = this.buildExportableSvg();
    if (!exportable) {
      alert('Generate a chart first by loading JSON data.');
      return;
    }
    this.downloadBlob(
      new Blob([exportable.markup], { type: 'image/svg+xml;charset=utf-8' }),
      'json-analyst-chart.svg'
    );
  }

  setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const initTheme = () => {
      const saved = localStorage.getItem('json-analyst-theme');
      const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = isDark ? 'dark' : 'light';
      document.documentElement.classList.toggle('light', theme === 'light');
      document.documentElement.setAttribute('data-theme', theme);
    };

    initTheme();

    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('light');
      const newTheme = isDark ? 'dark' : 'light';
      document.documentElement.classList.toggle('light');
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('json-analyst-theme', newTheme);
      } catch (e) {
        console.warn('localStorage unavailable');
      }
    });

    // Set theme toggle icon
    if (Icons.moon && Icons.sun) {
      const updateIcon = () => {
        toggle.innerHTML = document.documentElement.classList.contains('light') ? Icons.moon : Icons.sun;
      };
      updateIcon();
      toggle.addEventListener('click', updateIcon);
    }
  }
}

// Sample datasets for testing
export const SAMPLES = {
  referenceStore: JSON.stringify({
    version: "1.0.0",
    generatedAt: "2026-09-02T22:45:00Z",
    state: {
      "store-devices": { customDevices: "default" },
      "workspace": { workspaces: ["alpha", "beta"], selectedId: "ws-01" }
    }
  }),
  familyTree: JSON.stringify({
    root: "John",
    children: [
      { name: "Jane", age: 30 },
      { name: "Jack", age: 28 }
    ]
  }),
  users: JSON.stringify([
    { id: 1, name: "Alice", role: "admin", active: true },
    { id: 2, name: "Bob", role: "user", active: true },
    { id: 3, name: "Charlie", role: "user", active: false }
  ]),
  circular: JSON.stringify({ a: "start", b: "middle" })
};

// Bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.analystApp = new App();
  });
}
