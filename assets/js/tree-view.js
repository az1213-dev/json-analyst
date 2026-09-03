/**
 * JSON X-Ray — Tree View & Variable Inspector
 * Provides structured list tree, lineage breadcrumbs, and node details panel.
 */
import { Icons, icon } from './icons.js';

// Escape HTML special characters to prevent XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class TreeView {
  constructor(listContainer, inspectorContainer, breadcrumbsContainer, options = {}) {
    this.listContainer = listContainer;
    this.inspectorContainer = inspectorContainer;
    this.breadcrumbsContainer = breadcrumbsContainer;
    this.options = {
      onSelect: null,
      ...options
    };

    this.root = null;
    this.nodeMap = new Map();
    this.parentMap = new Map();
    this.selectedPath = '$';
  }

  setData(treeRoot) {
    this.root = treeRoot;
    this.indexTree();
    this.renderList();
    const target = this.nodeMap.get(this.selectedPath) || this.root;
    this.inspect(target);
  }

  indexTree() {
    this.nodeMap.clear();
    this.parentMap.clear();

    const walk = (node, parent) => {
      this.nodeMap.set(node.path, node);
      if (parent) this.parentMap.set(node.path, parent);
      if (node.children) {
        node.children.forEach(c => walk(c, node));
      }
    };
    if (this.root) walk(this.root, null);
  }

  renderList() {
    if (!this.listContainer || !this.root) return;
    this.listContainer.innerHTML = '';

    const buildRow = (node, container, depth) => {
      const rowWrapper = document.createElement('div');
      rowWrapper.className = 'tree-item-row';
      rowWrapper.dataset.path = node.path;
      rowWrapper.dataset.key = (node.key === null ? 'root' : String(node.key)).toLowerCase();
      rowWrapper.dataset.type = node.type;

      const line = document.createElement('div');
      line.className = 'tree-node-bar' + (node.path === this.selectedPath ? ' selected' : '');
      line.style.paddingLeft = (depth * 16 + 8) + 'px';

      const hasKids = node.children && node.children.length > 0;
      const toggle = document.createElement('span');
      toggle.className = 'tree-toggle-arrow';
      toggle.innerHTML = hasKids ? Icons.chevronDown : Icons.dot;
      line.appendChild(toggle);

      const label = document.createElement('span');
      label.className = 'tree-node-label';
      label.textContent = node.key === null ? 'ROOT' : String(node.key);
      line.appendChild(label);

      // Type Badge
      const badge = document.createElement('span');
      badge.className = `type-badge type-${node.isCircular ? 'cycle' : node.type}`;
      badge.textContent = node.isCircular ? 'cycle' : (node.type === 'object' ? `{${node.keyCount}}` : (node.type === 'array' ? `[${node.length}]` : node.type));
      line.appendChild(badge);

      if (node.value !== undefined) {
        const valSpan = document.createElement('span');
        valSpan.className = 'tree-node-val';
        valSpan.textContent = node.type === 'string' ? `"${node.value}"` : String(node.value);
        line.appendChild(valSpan);
      }

      rowWrapper.appendChild(line);

      let kidsContainer = null;
      if (hasKids) {
        kidsContainer = document.createElement('div');
        kidsContainer.className = 'tree-subtree';
        node.children.forEach(c => buildRow(c, kidsContainer, depth + 1));
        rowWrapper.appendChild(kidsContainer);

        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const closed = kidsContainer.style.display === 'none';
          kidsContainer.style.display = closed ? 'block' : 'none';
          toggle.innerHTML = closed ? Icons.chevronDown : Icons.chevronRight;
        });
      }

      line.addEventListener('click', () => {
        this.select(node.path);
        if (this.options.onSelect) this.options.onSelect(node);
      });

      container.appendChild(rowWrapper);
    };

    buildRow(this.root, this.listContainer, 0);
  }

  select(path) {
    this.selectedPath = path;
    if (this.listContainer) {
      this.listContainer.querySelectorAll('.tree-node-bar.selected').forEach(el => el.classList.remove('selected'));
      const target = this.listContainer.querySelector(`.tree-item-row[data-path="${CSS.escape(path)}"] > .tree-node-bar`);
      if (target) {
        target.classList.add('selected');
        target.scrollIntoView({ block: 'nearest' });
      }
    }
    const node = this.nodeMap.get(path);
    if (node) this.inspect(node);
  }

  inspect(node) {
    this.updateBreadcrumbs(node);
    if (!this.inspectorContainer) return;

    const parent = this.parentMap.get(node.path);
    const children = node.children || [];

    let html = `
      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-title">Variable Details</span>
          <span class="type-badge type-${node.isCircular ? 'cycle' : node.type}">${node.type}</span>
        </div>
        <div class="inspector-table">
          <div class="table-row">
            <span class="table-label">Path</span>
            <span class="table-value"><code>${escapeHtml(node.path)}</code></span>
          </div>
          <div class="table-row">
            <span class="table-label">Variable Key</span>
            <span class="table-value"><code>${escapeHtml(node.key === null ? 'ROOT' : node.key)}</code></span>
          </div>
          <div class="table-row">
            <span class="table-label">Depth</span>
            <span class="table-value">${node.depth}</span>
          </div>
          ${node.value !== undefined ? `
            <div class="table-row">
              <span class="table-label">Value</span>
              <span class="table-value"><code>${escapeHtml(node.type === 'string' ? `"${node.value}"` : node.value)}</code></span>
            </div>
          ` : ''}
          ${node.keyCount !== undefined ? `
            <div class="table-row">
              <span class="table-label">Properties</span>
              <span class="table-value">${node.keyCount}</span>
            </div>
          ` : ''}
          ${node.length !== undefined ? `
            <div class="table-row">
              <span class="table-label">Length</span>
              <span class="table-value">${node.length} items</span>
            </div>
          ` : ''}
          ${node.isCircular ? `
            <div class="table-row">
              <span class="table-label">Cycle Target</span>
              <span class="table-value" style="color:#f85149;"><code>${escapeHtml(node.circularTarget)}</code></span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-title">Family Relations</span>
        </div>
        <div class="inspector-table">
          <div class="table-row">
            <span class="table-label">Parent Node</span>
            <span class="table-value">
              ${parent ? `
                <button class="nav-chip" data-path="${escapeHtml(parent.path)}">
                  ${icon('chevronRight', 'inline-icon')}
                  <span>${escapeHtml(parent.key === null ? 'ROOT' : parent.key)} (${parent.type})</span>
                </button>
              ` : '<span style="color:var(--text-muted)">None (Root Node)</span>'}
            </span>
          </div>
          <div class="table-row">
            <span class="table-label">Immediate Children</span>
            <span class="table-value">
              <div class="chips-flex">
                ${children.length > 0 ? children.map(c => `
                  <button class="nav-chip" data-path="${escapeHtml(c.path)}">
                    ${icon('chevronRight', 'inline-icon')}
                    <span>${escapeHtml(c.key)} (${c.type})</span>
                  </button>
                `).join('') : '<span style="color:var(--text-muted)">Leaf Node (No children)</span>'}
              </div>
            </span>
          </div>
        </div>
      </div>
    `;

    if (node.archetype && Object.keys(node.archetype.properties).length > 0) {
      html += `
        <div class="inspector-card">
          <div class="inspector-card-header">
            <span class="inspector-title">Array Schema Archetype</span>
            <span style="font-size:11.5px;color:var(--text-muted);">Sampled ${node.archetype.sampleCount}/${node.archetype.totalCount} items</span>
          </div>
          <table class="archetype-grid">
            <thead>
              <tr><th>Field</th><th>Types</th><th>Required</th><th>Coverage</th></tr>
            </thead>
            <tbody>
              ${Object.values(node.archetype.properties).map(p => `
                <tr>
                  <td><code>${escapeHtml(p.key)}</code></td>
                  <td><span class="type-pill">${p.types.join(', ')}</span></td>
                  <td>${p.optional ? '<span style="color:var(--text-muted);">Optional</span>' : '<b style="color:var(--accent-mint);">Required</b>'}</td>
                  <td>${Math.round(p.frequency * 100)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    this.inspectorContainer.innerHTML = html;

    // Attach click events on navigation chips
    this.inspectorContainer.querySelectorAll('.nav-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.path;
        this.select(p);
        if (this.options.onSelect) this.options.onSelect(this.nodeMap.get(p));
      });
    });
  }

  updateBreadcrumbs(node) {
    if (!this.breadcrumbsContainer) return;
    const ancestors = [];
    let curr = node;
    while (curr) {
      ancestors.unshift(curr);
      curr = this.parentMap.get(curr.path);
    }

    this.breadcrumbsContainer.innerHTML = ancestors.map((a, i) => {
      const isLast = i === ancestors.length - 1;
      const label = a.key === null ? 'ROOT' : String(a.key);
      if (isLast) {
        return `<span class="breadcrumb-item active">${escapeHtml(label)}</span>`;
      }
      return `<button class="breadcrumb-item" data-path="${escapeHtml(a.path)}">${escapeHtml(label)}</button><span class="breadcrumb-sep">${icon('chevronRight')}</span>`;
    }).join('');

    this.breadcrumbsContainer.querySelectorAll('button.breadcrumb-item').forEach(b => {
      b.addEventListener('click', () => {
        const p = b.dataset.path;
        this.select(p);
        if (this.options.onSelect) this.options.onSelect(this.nodeMap.get(p));
      });
    });
  }

  filter(query) {
    if (!this.listContainer) return;
    const q = (query || '').toLowerCase().trim();
    this.listContainer.querySelectorAll('.tree-item-row').forEach(row => {
      if (!q) {
        row.style.display = 'block';
        return;
      }
      const k = row.dataset.key || '';
      const t = row.dataset.type || '';
      row.style.display = (k.includes(q) || t.includes(q)) ? 'block' : 'none';
    });
  }

  expandAll() {
    if (!this.listContainer) return;
    this.listContainer.querySelectorAll('.tree-subtree').forEach(s => s.style.display = 'block');
    this.listContainer.querySelectorAll('.tree-toggle-arrow').forEach(t => {
      if (t.innerHTML.includes('polyline')) t.innerHTML = Icons.chevronDown;
    });
  }

  collapseAll() {
    if (!this.listContainer) return;
    this.listContainer.querySelectorAll('.tree-subtree').forEach(s => s.style.display = 'none');
    this.listContainer.querySelectorAll('.tree-toggle-arrow').forEach(t => {
      if (t.innerHTML.includes('polyline')) t.innerHTML = Icons.chevronRight;
    });
  }
}

