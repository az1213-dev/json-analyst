/**
 * JSON Analyst — Interactive Horizontal Curved Chart View
 * Renders smooth cubic Bézier curves, cyan anchor dots, and lavender labels
 * matching the user's reference design. Supports pan, zoom, collapse, and selection.
 */

export class ChartViewer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    const colors = this.getThemeColors();
    this.options = {
      rowHeight: 34,
      colSpacing: 260,
      curveColor: colors.curveColor,
      dotColor: colors.dotColor,
      dotRadius: 4.5,
      textColor: colors.textColor,
      textSelectedColor: colors.textSelectedColor,
      fontFamily: 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace',
      fontSize: 12.5,
      onNodeSelect: null,
      ...options
    };

    this.rootNode = null;
    this.layoutNodes = [];
    this.layoutLinks = [];
    this.collapsedPaths = new Set();
    this.selectedPath = '$';
    this.searchQuery = '';

    // Transform state
    this.panX = 80;
    this.panY = 60;
    this.scale = 1.0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.initDom();
    this.attachEvents();
  }

  getThemeColors() {
    const isDark = !document.documentElement.classList.contains('light');
    const theme = document.documentElement.getAttribute('data-theme');
    const isLightMode = theme === 'light' || (theme !== 'dark' && !isDark);

    if (isLightMode) {
      // Light mode: High contrast for readability on light background
      return {
        curveColor: '#2563eb',        // Vivid blue for curves
        dotColor: '#1d4ed8',          // Darker blue for dots
        textColor: '#001a4d',         // Very dark blue/navy for labels - high contrast
        textSelectedColor: '#0d47a1'  // Deep blue for selected text
      };
    } else {
      // Dark mode: Bright colors for visibility on dark background
      return {
        curveColor: '#1f6feb',
        dotColor: '#60a5fa',
        textColor: '#93c5fd',
        textSelectedColor: '#e0f2fe'
      };
    }
  }

  initDom() {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.userSelect = 'none';

    // SVG Canvas
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.display = 'block';
    this.svg.style.cursor = 'grab';

    // Defs for glowing filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
    this.svg.appendChild(defs);

    // Viewport Group (transformed via pan & zoom)
    this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    this.g.appendChild(this.linksGroup);
    this.g.appendChild(this.nodesGroup);
    this.svg.appendChild(this.g);
    this.container.appendChild(this.svg);

    // Floating Canvas Controls
    this.controls = document.createElement('div');
    this.controls.className = 'chart-floating-controls';
    this.controls.innerHTML = `
      <button class="chart-ctrl-btn" id="ctrl-zoom-in" title="Zoom In">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button class="chart-ctrl-btn" id="ctrl-zoom-out" title="Zoom Out">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button class="chart-ctrl-btn" id="ctrl-fit" title="Fit to View">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
      </button>
    `;
    this.container.appendChild(this.controls);
  }

  attachEvents() {
    // Pan via Mouse Drag
    this.svg.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
      this.svg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.svg.style.cursor = 'grab';
      }
    });

    // Zoom via Mouse Wheel
    this.svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = this.svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newScale = Math.min(Math.max(this.scale * factor, 0.2), 3.0);

      // Zoom toward cursor
      this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
      this.scale = newScale;
      this.updateTransform();
    }, { passive: false });

    // Controls Toolbar
    this.controls.querySelector('#ctrl-zoom-in').addEventListener('click', () => this.zoomStep(1.2));
    this.controls.querySelector('#ctrl-zoom-out').addEventListener('click', () => this.zoomStep(0.8));
    this.controls.querySelector('#ctrl-fit').addEventListener('click', () => this.fitToView());
  }

  zoomStep(multiplier) {
    const rect = this.container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newScale = Math.min(Math.max(this.scale * multiplier, 0.2), 3.0);
    this.panX = cx - (cx - this.panX) * (newScale / this.scale);
    this.panY = cy - (cy - this.panY) * (newScale / this.scale);
    this.scale = newScale;
    this.updateTransform();
  }

  updateTransform() {
    this.g.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.scale})`);
  }

  setData(treeRoot) {
    this.rootNode = treeRoot;
    this.render();
    this.fitToView();
  }

  setSearch(query) {
    this.searchQuery = (query || '').toLowerCase().trim();
    this.applySearchHighlight();
  }

  selectPath(path) {
    this.selectedPath = path;
    this.render();
  }

  /**
   * Layout Calculation: Horizontal Tidy Tree
   * Positions every node (x, y) with non-overlapping leaves and centered parents.
   */
  computeLayout() {
    if (!this.rootNode) return;

    this.layoutNodes = [];
    this.layoutLinks = [];
    let currentY = 0;

    const rowHeight = this.options.rowHeight;
    const colSpacing = this.options.colSpacing;

    const positionNode = (node, depth, parentLayoutNode) => {
      const isCollapsed = this.collapsedPaths.has(node.path);
      const hasChildren = !isCollapsed && node.children && node.children.length > 0;

      const layoutNode = {
        data: node,
        depth,
        x: depth * colSpacing,
        y: 0,
        hasChildren,
        isCollapsed,
        parent: parentLayoutNode
      };

      if (!hasChildren) {
        layoutNode.y = currentY;
        currentY += rowHeight;
      } else {
        const childLayouts = [];
        for (const child of node.children) {
          const childLayout = positionNode(child, depth + 1, layoutNode);
          childLayouts.push(childLayout);
          this.layoutLinks.push({
            source: layoutNode,
            target: childLayout
          });
        }
        // Parent is vertically centered across its immediate children
        const firstY = childLayouts[0].y;
        const lastY = childLayouts[childLayouts.length - 1].y;
        layoutNode.y = (firstY + lastY) / 2;
      }

      this.layoutNodes.push(layoutNode);
      return layoutNode;
    };

    positionNode(this.rootNode, 0, null);
  }

  render() {
    if (!this.rootNode) return;
    this.computeLayout();

    // 1. Render Links (Cubic Bézier curves)
    let linksHtml = '';
    for (const link of this.layoutLinks) {
      const s = link.source;
      const t = link.target;
      // Start link from the source dot, curve to target dot
      const sx = s.x;
      const sy = s.y;
      const tx = t.x;
      const ty = t.y;
      const midX = (sx + tx) / 2;

      const d = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
      linksHtml += `<path d="${d}" fill="none" stroke="${this.options.curveColor}" stroke-width="1.6" class="chart-link" />`;
    }
    this.linksGroup.innerHTML = linksHtml;

    // 2. Render Nodes
    this.nodesGroup.innerHTML = '';
    for (const n of this.layoutNodes) {
      const nodeEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeEl.setAttribute('class', 'chart-node-group');
      nodeEl.setAttribute('data-path', n.data.path);
      nodeEl.style.cursor = 'pointer';

      const isSelected = n.data.path === this.selectedPath;
      const isRoot = n.depth === 0;

      // Label text
      const keyLabel = isRoot ? 'ROOT' : String(n.data.key);
      const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textEl.textContent = keyLabel;
      textEl.setAttribute('y', n.y + 4.5);
      textEl.setAttribute('font-family', this.options.fontFamily);
      textEl.setAttribute('font-size', isRoot ? 13.5 : this.options.fontSize);
      textEl.setAttribute('font-weight', isRoot || n.hasChildren ? '600' : '400');
      textEl.setAttribute('fill', isSelected ? '#ffffff' : this.options.textColor);

      // Dynamic label alignment:
      // Nodes with outgoing children have text to the LEFT of their dot.
      // Leaves have their text to the RIGHT of their dot.
      if (n.hasChildren || isRoot) {
        textEl.setAttribute('x', n.x - 10);
        textEl.setAttribute('text-anchor', 'end');
      } else {
        textEl.setAttribute('x', n.x + 10);
        textEl.setAttribute('text-anchor', 'start');
      }

      // Anchor Dot
      const circleEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circleEl.setAttribute('cx', n.x);
      circleEl.setAttribute('cy', n.y);
      circleEl.setAttribute('r', isSelected ? 6 : this.options.dotRadius);
      circleEl.setAttribute('fill', n.data.isCircular ? '#f85149' : this.options.dotColor);
      circleEl.setAttribute('stroke', '#0c0e17');
      circleEl.setAttribute('stroke-width', '1.5');
      if (isSelected) {
        circleEl.setAttribute('filter', 'url(#glow)');
      }

      // Collapsed indicator ring
      if (n.isCollapsed) {
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('cx', n.x);
        ring.setAttribute('cy', n.y);
        ring.setAttribute('r', 8.5);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', '#00e5a3');
        ring.setAttribute('stroke-width', '1.2');
        ring.setAttribute('stroke-dasharray', '2 2');
        nodeEl.appendChild(ring);
      }

      nodeEl.appendChild(circleEl);
      nodeEl.appendChild(textEl);

      // Click to select
      nodeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedPath = n.data.path;
        this.render();
        if (this.options.onNodeSelect) {
          this.options.onNodeSelect(n.data);
        }
      });

      // Double-click or dot click to toggle collapse
      circleEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.toggleCollapse(n.data.path);
      });

      this.nodesGroup.appendChild(nodeEl);
    }

    this.updateTransform();
    this.applySearchHighlight();
  }

  toggleCollapse(path) {
    if (this.collapsedPaths.has(path)) {
      this.collapsedPaths.delete(path);
    } else {
      this.collapsedPaths.add(path);
    }
    this.render();
  }

  applySearchHighlight() {
    if (!this.searchQuery) {
      this.nodesGroup.querySelectorAll('.chart-node-group').forEach(el => {
        el.style.opacity = '1';
      });
      this.linksGroup.querySelectorAll('.chart-link').forEach(el => {
        el.style.opacity = '1';
      });
      return;
    }

    const q = this.searchQuery;
    this.nodesGroup.querySelectorAll('.chart-node-group').forEach(el => {
      const path = (el.getAttribute('data-path') || '').toLowerCase();
      const text = (el.querySelector('text')?.textContent || '').toLowerCase();
      const match = text.includes(q) || path.includes(q);
      el.style.opacity = match ? '1' : '0.2';
    });
  }

  fitToView() {
    if (this.layoutNodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const n of this.layoutNodes) {
      minX = Math.min(minX, n.x - 80);
      maxX = Math.max(maxX, n.x + 160);
      minY = Math.min(minY, n.y - 40);
      maxY = Math.max(maxY, n.y + 40);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const rect = this.container.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0 || width <= 0 || height <= 0) return;

    const scaleX = (rect.width - 60) / width;
    const scaleY = (rect.height - 60) / height;
    this.scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.25);

    this.panX = 50 - minX * this.scale;
    this.panY = (rect.height / 2) - ((minY + height / 2) * this.scale);

    this.updateTransform();
  }

  /**
   * Generates a clean standalone SVG string representing the full structure
   */
  getSvgString() {
    if (this.layoutNodes.length === 0) return null;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const n of this.layoutNodes) {
      minX = Math.min(minX, n.x - 120);
      maxX = Math.max(maxX, n.x + 220);
      minY = Math.min(minY, n.y - 60);
      maxY = Math.max(maxY, n.y + 60);
    }

    const padding = 40;
    const x = minX - padding;
    const y = minY - padding;
    const width = (maxX - minX) + (padding * 2);
    const height = (maxY - minY) + (padding * 2);

    // Get theme-appropriate background color
    const isDark = !document.documentElement.classList.contains('light');
    const bgColor = isDark ? '#06080f' : '#fafbfc';

    let linksSvg = '';
    for (const link of this.layoutLinks) {
      const s = link.source;
      const t = link.target;
      const midX = (s.x + t.x) / 2;
      const d = `M ${s.x} ${s.y} C ${midX} ${s.y}, ${midX} ${t.y}, ${t.x} ${t.y}`;
      linksSvg += `<path d="${d}" fill="none" stroke="${this.options.curveColor}" stroke-width="1.8" />`;
    }

    let nodesSvg = '';
    for (const n of this.layoutNodes) {
      const isRoot = n.depth === 0;
      const keyLabel = isRoot ? 'ROOT' : String(n.data.key).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const isLeft = n.hasChildren || isRoot;
      const textX = isLeft ? n.x - 10 : n.x + 10;
      const textAnchor = isLeft ? 'end' : 'start';

      nodesSvg += `<circle cx="${n.x}" cy="${n.y}" r="${this.options.dotRadius}" fill="${n.data.isCircular ? '#f85149' : this.options.dotColor}" stroke="${bgColor}" stroke-width="1.5" /><text x="${textX}" y="${n.y + 4.5}" text-anchor="${textAnchor}" fill="${this.options.textColor}" font-family="monospace" font-size="${this.options.fontSize}" font-weight="${isRoot || n.hasChildren ? '600' : '400'}">${keyLabel}</text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${bgColor}" /><g>${linksSvg}</g><g>${nodesSvg}</g></svg>`;
  }

  /**
   * Exports and downloads the JSON structure graph as a high-res PNG image
   */
  exportAsPng(filename = 'json-structure.png') {
    const svgString = this.getSvgString();
    if (!svgString) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.documentElement;
    const width = parseFloat(svgEl.getAttribute('width'));
    const height = parseFloat(svgEl.getAttribute('height'));

    const canvas = document.createElement('canvas');
    const pixelRatio = 2; // High-resolution retina export
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      ctx.fillStyle = '#090b12';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const dlUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = dlUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(dlUrl);
      }, 'image/png');
    };

    img.src = url;
  }

  /**
   * Exports and downloads the JSON structure graph as an SVG image
   */
  exportAsSvg(filename = 'json-structure.svg') {
    const svgString = this.getSvgString();
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

