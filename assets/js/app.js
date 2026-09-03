/**
 * JSON X-Ray — Application Orchestrator
 * Handles view switching, data processing, and component coordination
 */
import { buildTree } from './engine.js';
import { ChartViewer } from './chart.js';
import { TreeView } from './tree-view.js';
import { Icons, icon } from './icons.js';

// Upload constraints
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const NAV_ACTION_VIEW = { validate: 'editor', format: 'editor', minify: 'editor', chart: 'chart', tree: 'tree' };

// Escape HTML special characters to prevent XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// PRESET SAMPLE DATASETS
export const SAMPLES = {
  referenceStore: JSON.stringify({
    version: "1.0.0",
    generatedAt: "2026-09-02T22:45:00Z",
    generatedBy: "System",
    state: {
      "rb-rwt-devices-store": {
        customDevices: "default"
      },
      "rb-rwt-workspace-store": {
        workspaces: ["workspace-alpha", "workspace-beta"],
        selectedWorkspaceId: "ws-01",
        selectedScreenId: "scr-main",
        _hasHydrated: true
      },
      "rb-rwt-settings": {
        downloadDirectory: "/downloads",
        imageFormat: "png",
        fileNameSuffix: "_export"
      },
      "rb-rwt-feature-toggle": {
        activeFeatures: ["auto-sync"],
        _hasHydrated: true
      },
      "rb-rwt-ui-config": {
        version: 2,
        scale: 1.0,
        fitToScreenScale: true,
        zoomLevel: "100%",
        _hasHydrated: true,
        onBoardingInfo: {
          onboardedAt: "2026-01-01",
          onBoardedVersion: "1.0.0"
        }
      }
    }
  }, null, 2),

  familyTree: JSON.stringify({
    familyTree: {
      generation1: {
        patriarch: "John Doe (Grandfather)",
        matriarch: "Jane Doe (Grandmother)",
        generation2: {
          father: {
            name: "Robert Doe",
            occupation: "Engineer",
            children: [
              { name: "Alice Doe", age: 14, relationship: "Daughter" },
              { name: "Charlie Doe", age: 9, relationship: "Son" }
            ]
          },
          aunt: {
            name: "Sarah Doe",
            occupation: "Architect",
            children: [
              { name: "Daisy Smith", age: 5, relationship: "Cousin" }
            ]
          }
        }
      }
    }
  }, null, 2),

  users: JSON.stringify({
    organization: "Acme Cloud Corp",
    users: [
      { id: 101, name: "Alice", email: "alice@acme.com", role: "admin", active: true },
      { id: 102, name: "Bob", email: "bob@acme.com", role: "member", active: true },
      { id: 103, name: "Charlie", email: "charlie@acme.com", role: "member", active: false },
      { id: 104, name: "Dana", email: "dana@acme.com", role: "viewer", title: "Contractor" }
    ],
    config: {
      ssoEnabled: true,
      sessionTimeoutHours: 12
    }
  }, null, 2),

  circular: JSON.stringify({
    network: "Mesh Network",
    nodeA: { name: "Node Alpha", link: "nodeB" },
    nodeB: { name: "Node Beta", link: "nodeA" },
    note: "Cycle tracked without crashing"
  }, null, 2)
};

export class App {
  constructor() {
    this.currentView = 'editor'; // 'editor' | 'chart' | 'tree'
    this.currentTree = null;

    this.cacheDom();
    this.initComponents();
    this.attachEvents();
    this.loadInitialData();
  }

  cacheDom() {
    // Nav Pills
    this.navPills = document.querySelectorAll('.nav-pill');
    this.panes = document.querySelectorAll('.tab-pane');

    // Editor elements
    this.editorTextarea = document.getElementById('json-code-input');
    this.editorGutter = document.getElementById('line-numbers-gutter');
    this.editorCounter = document.getElementById('editor-counter');
    this.presetSelect = document.getElementById('preset-select');
    this.btnValidate = document.getElementById('btn-validate');
    this.btnFormat = document.getElementById('btn-format');
    this.btnMinify = document.getElementById('btn-minify');
    this.btnClear = document.getElementById('btn-clear');
    this.btnOpenChart = document.getElementById('btn-open-chart');

    // File Upload
    this.fileUploadInput = document.getElementById('file-upload-input');
    this.btnUploadFile = document.getElementById('btn-upload-file');
    this.editorCoreArea = document.getElementById('editor-core-area');

    // Main Top Navigation Bar (functional tool links)
    this.mainNavLinks = document.querySelectorAll('.nav-tool-link[data-nav-action]');

    // Status Banner
    this.statusBanner = document.getElementById('status-banner');
    this.statusTitle = document.getElementById('status-title');
    this.statusDesc = document.getElementById('status-desc');
    this.statusChips = document.getElementById('status-chips');
    this.btnBannerChart = document.getElementById('btn-banner-chart');
    this.btnBannerPng = document.getElementById('btn-banner-png');

    // Chart View Elements
    this.chartCanvas = document.getElementById('chart-canvas');
    this.btnExportPng = document.getElementById('btn-export-png');
    this.btnExportSvg = document.getElementById('btn-export-svg');
    this.chartInspectorDrawer = document.getElementById('chart-inspector-drawer');
    this.chartInspectorContent = document.getElementById('chart-inspector-content');
    this.closeChartDrawerBtn = document.getElementById('close-chart-drawer-btn');

    // Tree View Elements
    this.treeList = document.getElementById('tree-list');
    this.treeInspector = document.getElementById('tree-inspector');
    this.treeBreadcrumbs = document.getElementById('tree-breadcrumbs');
    this.treeSearchInput = document.getElementById('tree-search-input');
    this.btnTreeExpand = document.getElementById('btn-tree-expand');
    this.btnTreeCollapse = document.getElementById('btn-tree-collapse');

    // Theme Toggle
    this.themeToggle = document.getElementById('theme-toggle');

    // GitHub Link
    this.githubLink = document.getElementById('github-link');

    // Logo Link (for scroll-to-top)
    this.logoLink = document.getElementById('logo-link');
  }

  initComponents() {
    // Inject vector icons via map
    const iconMap = [
      [this.btnValidate, Icons.check],
      [this.btnFormat, Icons.format],
      [this.btnMinify, Icons.minify],
      [this.btnClear, Icons.clear],
      [this.btnOpenChart, Icons.chart],
      [this.btnUploadFile, Icons.upload],
      [this.btnExportPng, Icons.image],
      [this.btnExportSvg, Icons.download],
      [this.btnBannerChart, Icons.chart],
      [this.btnBannerPng, Icons.download]
    ];
    iconMap.forEach(([btn, iconSvg]) => {
      if (btn) btn.insertAdjacentHTML('afterbegin', iconSvg);
    });

    // Initialize Chart Viewer (horizontal curved tree)
    this.chartViewer = new ChartViewer(this.chartCanvas, {
      onNodeSelect: (node) => {
        this.treeView.select(node.path);
        this.showChartInspector(node);
      }
    });

    // Initialize Tree View
    this.treeView = new TreeView(
      this.treeList,
      this.treeInspector,
      this.treeBreadcrumbs,
      {
        onSelect: (node) => {
          this.chartViewer.selectPath(node.path);
        }
      }
    );
  }

  attachEvents() {
    // Logo Link - Scroll to top
    if (this.logoLink) {
      this.logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Navigation Pills
    this.navPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const targetView = pill.dataset.view;
        this.switchView(targetView);
      });
    });

    // Quick open buttons to Chart view
    if (this.btnOpenChart) {
      this.btnOpenChart.addEventListener('click', () => {
        this.processData();
        this.switchView('chart');
      });
    }
    if (this.btnBannerChart) {
      this.btnBannerChart.addEventListener('click', () => {
        this.switchView('chart');
      });
    }

    // Direct Image Download Buttons (PNG & SVG)
    if (this.btnExportPng) {
      this.btnExportPng.addEventListener('click', () => {
        this.chartViewer.exportAsPng('json-structure.png');
      });
    }
    if (this.btnBannerPng) {
      this.btnBannerPng.addEventListener('click', () => {
        this.chartViewer.exportAsPng('json-structure.png');
      });
    }
    if (this.btnExportSvg) {
      this.btnExportSvg.addEventListener('click', () => {
        this.chartViewer.exportAsSvg('json-structure.svg');
      });
    }

    // Editor Actions
    this.btnValidate.addEventListener('click', () => this.processData());
    this.btnFormat.addEventListener('click', () => this.doFormat());
    this.btnMinify.addEventListener('click', () => this.doMinify());

    this.btnClear.addEventListener('click', () => {
      this.editorTextarea.value = '';
      this.updateGutter();
      this.processData();
    });

    // File Upload (click-to-browse)
    if (this.btnUploadFile && this.fileUploadInput) {
      this.btnUploadFile.addEventListener('click', () => this.fileUploadInput.click());
      this.fileUploadInput.addEventListener('change', () => {
        const file = this.fileUploadInput.files && this.fileUploadInput.files[0];
        this.handleFileUpload(file);
        this.fileUploadInput.value = '';
      });
    }

    // File Upload (drag-and-drop onto the editor)
    if (this.editorCoreArea) {
      let dragDepth = 0;
      this.editorCoreArea.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      this.editorCoreArea.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragDepth++;
        this.editorCoreArea.classList.add('drag-over');
      });
      this.editorCoreArea.addEventListener('dragleave', () => {
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) this.editorCoreArea.classList.remove('drag-over');
      });
      this.editorCoreArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDepth = 0;
        this.editorCoreArea.classList.remove('drag-over');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        this.handleFileUpload(file);
      });
    }

    // Main Top Navigation Bar - functional tool links
    this.mainNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNavAction(link.dataset.navAction);
      });
    });

    // Preset selector
    this.presetSelect.addEventListener('change', (e) => {
      const key = e.target.value;
      if (SAMPLES[key]) {
        this.editorTextarea.value = SAMPLES[key];
        this.updateGutter();
        this.processData();
      }
    });

    // Textarea input & gutter synchronization
    this.editorTextarea.addEventListener('input', () => this.updateGutter());
    this.editorTextarea.addEventListener('scroll', () => {
      this.editorGutter.scrollTop = this.editorTextarea.scrollTop;
    });

    // Tree controls
    if (this.treeSearchInput) {
      this.treeSearchInput.addEventListener('input', (e) => {
        const q = e.target.value;
        this.treeView.filter(q);
        this.chartViewer.setSearch(q);
      });
    }
    if (this.btnTreeExpand) {
      this.btnTreeExpand.addEventListener('click', () => this.treeView.expandAll());
    }
    if (this.btnTreeCollapse) {
      this.btnTreeCollapse.addEventListener('click', () => this.treeView.collapseAll());
    }

    // Chart Inspector Drawer Close
    if (this.closeChartDrawerBtn) {
      this.closeChartDrawerBtn.addEventListener('click', () => {
        this.chartInspectorDrawer.classList.remove('open');
      });
    }

    // Theme toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const isLight = html.classList.contains('light');
        const newTheme = isLight ? 'dark' : 'light';

        // Update class
        html.classList.toggle('light', !isLight);

        // Update data-theme attribute for CSS specificity
        html.setAttribute('data-theme', newTheme);

        // Persist preference
        try {
          localStorage.setItem('json-xray-theme', newTheme);
        } catch (e) {
          // Silently fail if localStorage unavailable
        }
      });

      // Restore persisted theme on load
      try {
        const saved = localStorage.getItem('json-xray-theme');
        if (saved === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.setAttribute('data-theme', 'light');
        } else if (saved === 'dark') {
          document.documentElement.classList.remove('light');
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      } catch (e) {
        // Silently fail if localStorage unavailable
      }
    }
  }

  loadInitialData() {
    this.editorTextarea.value = SAMPLES.referenceStore;
    this.updateGutter();
    this.processData();

    // Deep-link support: index.html#chart, #tree, #format, #minify, #validate
    const hashAction = window.location.hash.replace('#', '');
    if (NAV_ACTION_VIEW[hashAction]) {
      this.handleNavAction(hashAction);
    }
  }

  doFormat() {
    try {
      const p = JSON.parse(this.editorTextarea.value);
      this.editorTextarea.value = JSON.stringify(p, null, 2);
      this.updateGutter();
    } catch (err) {
      // Fall through to processData(), which surfaces the parse error in the status banner
    }
    this.processData();
  }

  doMinify() {
    try {
      const p = JSON.parse(this.editorTextarea.value);
      this.editorTextarea.value = JSON.stringify(p);
      this.updateGutter();
    } catch (err) {
      // Fall through to processData(), which surfaces the parse error in the status banner
    }
    this.processData();
  }

  handleFileUpload(file) {
    if (!file) return;

    const isJsonFile = file.type === 'application/json' || /\.json$/i.test(file.name);
    if (!isJsonFile) {
      this.showStatusError('Invalid File Type', 'Only .json files can be uploaded. Please choose a file ending in .json.');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      this.showStatusError('File Too Large', `"${file.name}" is ${sizeMb} MB, which exceeds the 5 MB upload limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.editorTextarea.value = e.target.result;
      this.updateGutter();
      this.switchView('editor');
      this.updateMainNavActive('validate');
      this.processData();
    };
    reader.onerror = () => {
      this.showStatusError('Upload Failed', `"${file.name}" could not be read. Please try again.`);
    };
    reader.readAsText(file);
  }

  handleNavAction(action) {
    switch (action) {
      case 'validate':
        this.switchView('editor');
        this.processData();
        break;
      case 'format':
        this.switchView('editor');
        this.doFormat();
        break;
      case 'minify':
        this.switchView('editor');
        this.doMinify();
        break;
      case 'chart':
        this.switchView('chart');
        break;
      case 'tree':
        this.switchView('tree');
        break;
      default:
        return;
    }
    this.updateMainNavActive(action);
    document.querySelector('.app-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateMainNavActive(action) {
    this.mainNavLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.navAction === action);
    });
  }

  updateGutter() {
    const lines = this.editorTextarea.value.split('\n').length;
    let gutterHtml = '';
    for (let i = 1; i <= lines; i++) {
      gutterHtml += `${i}<br>`;
    }
    this.editorGutter.innerHTML = gutterHtml;
    this.editorCounter.textContent = `${lines} lines | ${this.editorTextarea.value.length} chars`;
  }

  processData() {
    const raw = this.editorTextarea.value.trim();
    if (!raw) {
      this.showStatusError('Empty Input', 'Please enter or paste JSON into the editor above.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      this.showStatusError('Invalid JSON', err.message);
      return;
    }

    this.currentTree = buildTree(parsed);
    this.showStatusSuccess(this.currentTree);

    // Sync Chart & Tree models
    this.chartViewer.setData(this.currentTree.root);
    this.treeView.setData(this.currentTree.root);
  }

  showStatusSuccess(tree) {
    if (!this.statusBanner) return;
    this.statusBanner.className = 'status-banner success';
    this.statusTitle.innerHTML = `${Icons.check}<span>Valid JSON</span>`;
    this.statusDesc.textContent = 'Correct JSON syntax. Structure and variable family trees analyzed.';

    const m = tree.metrics;
    let chips = `
      <span class="metric-pill">Nodes: <b>${m.totalNodes}</b></span>
      <span class="metric-pill">Depth: <b>${m.maxDepth}</b></span>
      <span class="metric-pill">Containers: <b>${m.containerCount}</b></span>
      <span class="metric-pill">Leaves: <b>${m.leafCount}</b></span>
      <span class="metric-pill">Branching: <b>${m.avgBranchingFactor}</b></span>
      <span class="metric-pill">Est. Size: <b>${m.estimatedBytes} B</b></span>
    `;
    if (tree.anomalies.length > 0) {
      chips += `<span class="metric-pill alert">${Icons.warning}<span>${tree.anomalies.length} Anomalies</span></span>`;
    }
    this.statusChips.innerHTML = chips;

    if (this.btnBannerChart) this.btnBannerChart.style.display = 'inline-flex';
    if (this.btnBannerPng) this.btnBannerPng.style.display = 'inline-flex';
  }

  showStatusError(title, msg) {
    if (!this.statusBanner) return;
    this.statusBanner.className = 'status-banner error';
    this.statusTitle.innerHTML = `${Icons.close}<span>${title}</span>`;
    this.statusDesc.textContent = msg;
    this.statusChips.innerHTML = '';
    if (this.btnBannerChart) this.btnBannerChart.style.display = 'none';
    if (this.btnBannerPng) this.btnBannerPng.style.display = 'none';
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update pill buttons
    this.navPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.view === viewName);
    });

    // Update view panels
    this.panes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${viewName}`);
    });

    if (viewName === 'chart') {
      setTimeout(() => this.chartViewer.fitToView(), 50);
    }
  }

  showChartInspector(node) {
    if (!this.chartInspectorDrawer) return;
    this.chartInspectorDrawer.classList.add('open');

    const parent = this.treeView.parentMap.get(node.path);
    const children = node.children || [];

    let html = `
      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-title">Variable Details</span>
          <span class="type-badge type-${node.isCircular ? 'cycle' : node.type}">${node.type}</span>
        </div>
        <div class="inspector-table">
          <div class="table-row"><span class="table-label">Path</span><span class="table-value"><code>${escapeHtml(node.path)}</code></span></div>
          <div class="table-row"><span class="table-label">Key</span><span class="table-value"><code>${escapeHtml(node.key === null ? 'ROOT' : node.key)}</code></span></div>
          <div class="table-row"><span class="table-label">Depth</span><span class="table-value">${node.depth}</span></div>
          ${node.value !== undefined ? `<div class="table-row"><span class="table-label">Value</span><span class="table-value"><code>${escapeHtml(node.type === 'string' ? `"${node.value}"` : node.value)}</code></span></div>` : ''}
          ${node.keyCount !== undefined ? `<div class="table-row"><span class="table-label">Properties</span><span class="table-value">${node.keyCount}</span></div>` : ''}
          ${node.length !== undefined ? `<div class="table-row"><span class="table-label">Length</span><span class="table-value">${node.length}</span></div>` : ''}
        </div>
      </div>

      <div class="inspector-card">
        <div class="inspector-card-header"><span class="inspector-title">Family Relations</span></div>
        <div class="inspector-table">
          <div class="table-row">
            <span class="table-label">Parent Node</span>
            <span class="table-value">${parent ? `<span class="nav-chip" data-path="${escapeHtml(parent.path)}">${escapeHtml(parent.key === null ? 'ROOT' : parent.key)} (${parent.type})</span>` : '<span style="color:var(--text-muted)">None (Root)</span>'}</span>
          </div>
          <div class="table-row">
            <span class="table-label">Immediate Children</span>
            <span class="table-value">
              <div class="chips-flex">
                ${children.length > 0 ? children.map(c => `<span class="nav-chip" data-path="${escapeHtml(c.path)}">${escapeHtml(c.key)} (${c.type})</span>`).join('') : '<span style="color:var(--text-muted)">Leaf (No children)</span>'}
              </div>
            </span>
          </div>
        </div>
      </div>
    `;

    this.chartInspectorContent.innerHTML = html;
    this.chartInspectorContent.querySelectorAll('.nav-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const p = chip.dataset.path;
        this.chartViewer.selectPath(p);
        const targetNode = this.treeView.nodeMap.get(p);
        if (targetNode) this.showChartInspector(targetNode);
      });
    });
  }
}

// Bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.xrayApp = new App();
  });
}
