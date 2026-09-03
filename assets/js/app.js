/**
 * JSON X-Ray — Application Orchestrator
 * Handles view switching, data processing, and component coordination
 */
import { Icons } from './icons.js';

// Upload constraints
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

// Escape HTML special characters to prevent XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

    fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

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
        this.handleFileUpload({ target: fileInput });
      }
    });
  }

  handleFileUpload(e) {
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
      const jsonInput = document.getElementById('json-code-input');
      if (jsonInput) {
        jsonInput.value = event.target.result;
        this.updateLineNumbers();
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
    document.getElementById('btn-export-png-visible')?.addEventListener('click', () => this.exportChartPNG());
    document.getElementById('btn-export-svg-visible')?.addEventListener('click', () => this.exportChartSVG());

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
    const blob = new Blob([content], { type: mimeType });
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

    if (!input.value.trim()) {
      if (canvas) canvas.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--error-red);">Please enter JSON data to visualize</div>';
      if (container) container.style.display = 'block';
      return;
    }

    try {
      const data = JSON.parse(input.value);
      if (canvas) canvas.innerHTML = this.buildChartSVG(data);
      if (container) container.style.display = 'block';
    } catch (error) {
      if (canvas) canvas.innerHTML = `<div style="padding: 40px; color: var(--error-red);">Error: ${escapeHtml(error.message)}</div>`;
      if (container) container.style.display = 'block';
    }
  }

  buildChartSVG(data) {
    const type = Array.isArray(data) ? 'array' : typeof data === 'object' && data !== null ? 'object' : typeof data;
    const isCompound = type === 'array' || type === 'object';
    const label = isCompound ? (type === 'array' ? `Array[${data.length}]` : `Object`) : String(data).substring(0, 20);

    let svg = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
      <defs>
        <style>
          .node-box { fill: var(--bg-surface-elevated); stroke: var(--accent-blue); stroke-width: 2; }
          .node-text { font-size: 12px; fill: var(--text-primary); font-family: monospace; }
          .node-line { stroke: var(--text-muted); stroke-width: 1; }
        </style>
      </defs>
      <rect width="800" height="600" fill="var(--bg-surface)"/>
      <rect class="node-box" x="20" y="20" width="150" height="50" rx="4"/>
      <text class="node-text" x="40" y="52">${escapeHtml(label)}</text>`;

    if (isCompound) {
      const entries = type === 'array' ? data.slice(0, 3) : Object.entries(data).slice(0, 3);
      let y = 120;
      entries.forEach((entry, idx) => {
        const key = type === 'array' ? `[${idx}]` : entry[0];
        const val = type === 'array' ? entry : entry[1];
        const valType = Array.isArray(val) ? 'array' : typeof val === 'object' && val !== null ? 'object' : typeof val;
        svg += `
          <line class="node-line" x1="95" y1="70" x2="95" y2="${y - 30}"/>
          <line class="node-line" x1="95" y1="${y - 30}" x2="200" y2="${y - 30}"/>
          <rect class="node-box" x="200" y="${y - 50}" width="140" height="40" rx="3"/>
          <text class="node-text" x="210" y="${y - 25}">${escapeHtml(key)}: ${escapeHtml(valType)}</text>`;
        y += 80;
      });
      if (data.length > 3 || Object.keys(data).length > 3) {
        svg += `<text class="node-text" x="210" y="${y - 25}" fill="var(--text-muted)">+ ${type === 'array' ? data.length - 3 : Object.keys(data).length - 3} more</text>`;
      }
    }

    svg += '</svg>';
    return svg;
  }

  renderTree() {
    const input = document.getElementById('json-tree-input');
    const container = document.getElementById('tree-container');
    const breadcrumbs = document.getElementById('tree-breadcrumbs');
    const treeList = document.getElementById('tree-list');
    const inspector = document.getElementById('tree-inspector');

    if (!input.value.trim()) {
      if (treeList) treeList.innerHTML = '<div style="color: var(--error-red); padding: 20px;">Please enter JSON data to explore</div>';
      if (container) container.style.display = 'block';
      return;
    }

    try {
      const data = JSON.parse(input.value);
      this.currentTreeData = data;
      this.currentTreePath = [];

      if (breadcrumbs) {
        breadcrumbs.innerHTML = '<button class="breadcrumb-item" data-path="">root</button>';
        breadcrumbs.querySelectorAll('.breadcrumb-item').forEach(btn => {
          btn.addEventListener('click', () => {
            this.currentTreePath = JSON.parse(btn.dataset.path || '[]');
            this.renderTree();
          });
        });
      }

      this.displayTreeNode(data, treeList, inspector);
      if (container) container.style.display = 'block';
    } catch (error) {
      if (treeList) treeList.innerHTML = `<div style="color: var(--error-red); padding: 20px;">Error: ${escapeHtml(error.message)}</div>`;
      if (container) container.style.display = 'block';
    }
  }

  displayTreeNode(data, listContainer, inspectorContainer) {
    if (!listContainer || !inspectorContainer) return;

    let html = '<div style="padding: 10px;">';

    if (Array.isArray(data)) {
      data.forEach((item, idx) => {
        const type = typeof item === 'object' && item !== null ? (Array.isArray(item) ? 'array' : 'object') : typeof item;
        html += `<div style="padding: 8px; border-left: 2px solid var(--accent-blue); margin: 4px 0;">
          <strong style="color: var(--accent-blue);">[${idx}]</strong> <span style="color: var(--text-muted);">${type}</span>
        </div>`;
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, val]) => {
        const type = typeof val === 'object' && val !== null ? (Array.isArray(val) ? 'array' : 'object') : typeof val;
        html += `<div style="padding: 8px; border-left: 2px solid var(--accent-blue); margin: 4px 0;">
          <strong style="color: var(--accent-blue);">${escapeHtml(key)}</strong> <span style="color: var(--text-muted);">${type}</span>
        </div>`;
      });
    }

    html += '</div>';
    listContainer.innerHTML = html;

    inspectorContainer.innerHTML = `<div style="padding: 20px; font-family: monospace; font-size: 12px; color: var(--text-primary); max-height: 600px; overflow-y: auto; background: var(--bg-canvas); border-radius: 4px;">
      <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
    </div>`;
  }

  exportChartPNG() {
    const canvas = document.getElementById('chart-canvas');
    if (!canvas || !canvas.innerHTML.includes('svg')) {
      alert('Generate a chart first by loading JSON data');
      return;
    }
    alert('PNG export ready. Use browser print-to-PDF or screenshot feature.');
  }

  exportChartSVG() {
    const canvas = document.getElementById('chart-canvas');
    if (!canvas || !canvas.innerHTML.includes('svg')) {
      alert('Generate a chart first by loading JSON data');
      return;
    }
    const svgContent = canvas.innerHTML;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chart.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const initTheme = () => {
      const saved = localStorage.getItem('json-xray-theme');
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
        localStorage.setItem('json-xray-theme', newTheme);
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
    window.xrayApp = new App();
  });
}
