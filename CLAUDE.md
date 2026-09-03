# JSON Analyst — Project Standards & Guidance

Loaded automatically at session start. Defines project invariants, coding standards, and architectural decisions for Claude Code.

---

## Project Essence

**JSON Analyst** is a professional-grade JSON analysis and transformation suite running 100% client-side in your browser.

- **Purpose**: Validate, format, repair, compact, and convert JSON; visualize structure with interactive charts and tree navigation
- **Type**: Hybrid (NPM library + web app)
- **Quality Bar**: v1.0.0 production-ready (16/16 tests, zero type errors, WCAG AA, zero emojis)
- **License**: MIT
- **Deployment**: 5 commits ready (no server needed—pure static hosting)

---

## Core Standards

### Code Quality
- **TypeScript Strict Mode**: All `.ts` files with `strict: true`
- **Testing**: 16 automated tests, 100% pass rate required before release
- **Type Safety**: Zero type errors, strict null checks enabled
- **Linting**: No ESLint violations; check with `npm run check`
- **ES Modules Only**: Import style `import { ... } from './module.js'`
- **Test Command**: `npm run check` (typecheck + all 16 tests)

### Security First (Critical)
- **XSS Prevention**: ALL user inputs → `escapeHtml()` before `innerHTML`
  - Three confirmed XSS vulnerabilities were fixed in v1.0.0
  - Never interpolate node.path, node.key, node.value directly into HTML
  - Use `escapeHtml()` helper in app.js, tree-view.js, html.js
- **JSON Safety**: Safe traversal with cycle detection (prevents stack overflow)
- **File Upload**: 5MB limit, `.json` extension + MIME validation only
- **No Dynamic Code**: Never use `eval()`, `Function()` constructor, or `new Function`
- **Circular References**: Handled safely—won't crash on circular JSON

### UI/UX Standards
- **Zero Emojis**: Professional design system with custom SVG icons only
- **Dark/Light Mode**: CSS variables + `prefers-color-scheme` media query
- **Theme Persistence**: localStorage key `json-analyst-theme` (light/dark)
- **Responsive Design**: Mobile-first, tested on all breakpoints (320px, 768px, 1200px+)
- **Button Styling**: Professional hover effects, active states, smooth transitions (0.2s ease)
- **Accessibility**: WCAG AA compliance required
- **Breadcrumb Navigation**: Click-through hierarchy navigation with path escaping

### Naming Conventions
- **Tools**: Validate, Format, Repair, Compact (not "Minify"), CSV, Chart, Tree, All Tools
- **Brand**: JSON Analyst (not "JSON X-Ray")
- **Files**: kebab-case for HTML/CSS/JS assets; PascalCase for TypeScript classes
- **Functions**: camelCase for methods and functions
- **CSS Classes**: kebab-case (e.g., `.breadcrumb-item`, `.tab-pane`)

---

## File Organization & Architecture

```
json-analyst/
├── index.html                    # Main web app (8 tool sections)
├── about.html                    # Product information
├── privacy-policy.html           # GDPR-compliant (100% client-side)
├── 404.html                      # Error page with branding
├── CLAUDE.md                     # This file (loaded at session start)
├── LICENSE                       # MIT License
├── README.md                     # Public documentation (no emojis)
├── package.json                  # v1.0.0, "json-analyst"
├── tsconfig.json                 # strict: true
│
├── assets/                       # Web app assets
│   ├── css/
│   │   └── style.css             # Design system, dark/light themes, 1200+ lines
│   ├── js/
│   │   ├── app.js                # App controller (pane switching, tool handlers)
│   │   ├── tree-view.js          # Tree inspector component
│   │   ├── chart.js              # Chart visualization & export
│   │   ├── engine.js             # JSON parser wrapper
│   │   ├── icons.js              # 24 SVG icons (zero emojis)
│   │   └── package.json          # {"type": "module"}
│   └── img/
│       └── logo.svg              # Brand prism logo
│
├── src/                          # NPM library (TypeScript, builds to dist/)
│   ├── engine/
│   │   ├── detector.js           # Type detection (string/number/object/array/etc)
│   │   ├── traverser.js          # AST builder with cycle detection
│   │   ├── archetype.js          # Schema inference for arrays
│   │   └── metrics.js            # Branching factor, depth, node count
│   ├── formatters/
│   │   ├── ascii.js              # ASCII tree output
│   │   ├── mermaid.js            # Mermaid diagram export
│   │   ├── dot.js                # Graphviz DOT export
│   │   └── html.js               # Standalone HTML viewer with escapeHtml()
│   ├── types/
│   │   ├── ast.ts                # XrayTree, Node interfaces
│   │   ├── config.ts             # Configuration types
│   │   └── formatters.ts         # Formatter interfaces
│   └── index.ts                  # Library entry point
│
├── tests/
│   ├── traverser.test.js         # Engine tests (11 tests)
│   └── web.test.mjs              # Web integration tests (5 tests)
│
├── .claude/
│   ├── CLAUDE.md                 # This file
│   ├── DEPLOYMENT_READINESS.md   # v1.0.0 pre-flight checklist
│   ├── SECURITY.MD               # Vulnerability analysis & hardening
│   ├── README.md                 # Documentation index
│   ├── ORGANIZATION.md           # Project notes
│   └── docs/
│       ├── DESIGN_SYSTEM.md      # Color palette, typography, components
│       ├── CODE_AUDIT.md         # Code review findings
│       ├── BUTTON_VERIFICATION.md # Navigation testing notes
│       └── ... (additional docs)
│
├── .github/workflows/            # CI/CD automation (GitHub Actions)
├── .gitignore                    # Enhanced with security categories
├── .env.example                  # Environment template
└── README.md                     # Public documentation
```

---

## Tool Specifications

Each tool is a separate HTML section (`id="pane-<tool>"`):

### **Validate**
- Checks JSON syntax, reports errors with line info
- Status banner: green on success, red on error
- Export: Copy to clipboard, Download as .json

### **Format**
- Pretty-prints JSON with 2-space indentation
- Output shows formatted result
- Export: Copy output, Download as formatted.json

### **Repair**
- Auto-fixes common errors (trailing commas, single quotes, brackets)
- Output shows corrected JSON
- Export: Copy repaired, Download as repaired.json

### **Compact**
- Removes all whitespace, produces single-line JSON
- Ideal for production payloads
- Export: Copy compact, Download as compact.json

### **CSV**
- Converts JSON arrays to CSV with headers
- Handles escaping, multi-line values
- Export: Copy CSV, Download as .csv file

### **Chart**
- Interactive tree diagram visualization
- Pan, zoom, node inspection
- Export: PNG (high-res), SVG (vector)

### **Tree**
- Hierarchical navigation with breadcrumbs
- Search by key/type
- Parent-child relationships, lineage tracking

### **All Tools**
- Gallery of 8 tool cards
- Title + 1-sentence description per tool
- Click to navigate to each tool

---

## Before Publishing v1.0.0

✅ **Verify (must all pass):**
- All 16 tests passing: `npm run check`
- Zero TypeScript errors
- All XSS vulnerabilities fixed (3 high-confidence findings from v1.0.0 audit)
- License consistent: MIT across LICENSE, package.json, README
- All documentation up to date
- GitHub links functional in all HTML pages
- File upload validation: 5MB limit, .json only
- Dark/light theme with localStorage persistence
- Breadcrumb navigation working
- Copy/download buttons in every section
- Zero emojis in web code (icons are SVG only)
- WCAG AA accessibility verified
- Responsive design tested on mobile, tablet, desktop

---

## Key Commands

```bash
npm run check     # Run typecheck + all 16 tests (required before release)
npm run build     # Build CJS, ESM, .d.ts to dist/ (for npm distribution)
npm run preview   # Serve at http://localhost:3000
npm test          # Run 16 tests only
npm run typecheck # TypeScript validation only
```

---

## Deployment Checklist

Before `git push` and public release:

1. ✅ All changes committed (`git status` clean)
2. ✅ Tests passing (`npm run check`)
3. ✅ Documentation current (README, .claude/*, about.html)
4. ✅ Security review complete (no unescaped HTML, cycle-safe traversal)
5. ✅ License consistent across all files (MIT)
6. ✅ Git tag created: `git tag v1.0.0`
7. ✅ Pushed to origin: `git push origin main && git push origin v1.0.0`
8. ✅ Ready for static hosting (GitHub Pages, Netlify, Vercel)

See `.claude/DEPLOYMENT_READINESS.md` for full pre-flight checklist.

---

## Important Patterns

### XSS Prevention (Critical)
```javascript
// WRONG - DOM-based XSS vulnerability
element.innerHTML = `<div>${node.key}</div>`;

// RIGHT - Always escape user input before innerHTML
element.innerHTML = `<div>${escapeHtml(node.key)}</div>`;

// Helper function (defined in app.js, tree-view.js, html.js)
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### File Upload Validation
```javascript
// Must check both size AND file type
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
if (file.size > MAX_UPLOAD_BYTES) throw new Error('File too large');
if (!file.name.endsWith('.json')) throw new Error('JSON only');
if (file.type !== 'application/json') throw new Error('Invalid MIME type');
```

### Theme Management
```javascript
// Read and persist theme preference
const saved = localStorage.getItem('json-analyst-theme');
const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

// Save on toggle
localStorage.setItem('json-analyst-theme', newTheme);
```

### Safe JSON Parsing
```javascript
try {
  const data = JSON.parse(jsonString);
  // Traversal uses buildTree() which safely detects cycles
  const tree = buildTree(data);
} catch (error) {
  // Handle parse error gracefully
  showError(error.message);
}
```

---

## CSS Custom Properties (Design System)

All colors defined as CSS variables for dark/light mode support:

```css
:root {
  --bg-page: #0a0e1a;           /* Page background */
  --bg-surface: #141824;         /* Card/surface background */
  --bg-surface-elevated: #1e2736; /* Elevated surfaces */
  --bg-canvas: #06080f;          /* Code editor background */
  --text-primary: #f0f5fc;       /* Main text */
  --text-secondary: #cbd5e1;     /* Secondary text */
  --text-muted: #8b96a5;         /* Muted text */
  --accent-blue: #2563eb;        /* Primary accent */
  --accent-blue-hover: #1d4ed8;  /* Hover state */
  --accent-purple: #7c3aed;      /* Secondary accent */
  --success-green: #22863a;      /* Success color */
  --error-red: #dc3545;          /* Error color */
}

/* Light mode overrides */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --bg-page: #ffffff;
    --bg-surface: #f5f7fa;
    /* ... */
  }
}

/* Explicit dark theme toggle */
:root[data-theme="dark"] {
  --bg-page: #0d1117;
  /* ... */
}
```

---

## Security Considerations

### Scope
- **100% client-side**: No backend, no data transmission
- **Zero tracking**: No analytics, cookies, or telemetry
- **User input**: Only JSON files (validated size + extension)
- **DOM operations**: All innerHTML uses escapeHtml() first

### Threats Mitigated
- **DOM-based XSS**: Escaping on node.key, node.path, node.value
- **Circular references**: Safe AST traversal prevents stack overflow
- **Malformed JSON**: Try/catch with user-friendly error messages
- **File upload abuse**: Size limit (5MB) + extension validation

### Not in Scope
- Server-side injection (no server)
- Authentication/authorization (client-side tool)
- Network security (100% offline)
- Credential management (browser storage only)

---

## Release Cadence

- **Version**: 1.0.0 (production release)
- **Stability**: All tests passing, no known issues
- **Support**: Open-source (GitHub issues)
- **License**: MIT (commercial use permitted)

---

## Questions & Answers

**Q: Where do I add a new tool?**
A: Add a new section in index.html with `id="pane-<tool>"`, update navigation array in app.js, add button handlers, and register in switchPane() function.

**Q: How do I export a new format?**
A: Create a new file in src/formatters/ (e.g., yaml.js), implement the formatter interface, and export from src/index.ts. Then add to web app if needed.

**Q: How do I fix an XSS vulnerability?**
A: Locate the innerHTML assignment, wrap the interpolated value in escapeHtml(), and verify in tests that output is properly escaped.

**Q: Can I add external dependencies?**
A: For web app: NO (zero dependencies is a core feature). For SDK (src/): Avoid if possible; discussion required. Check package.json for current deps.

**Q: Where's the color palette?**
A: See `.claude/docs/DESIGN_SYSTEM.md` for complete palette with light/dark mode specifications.

---

## Before Asking for Help

1. Check `npm run check` passes (16/16 tests)
2. Read `.claude/SECURITY.MD` for XSS patterns
3. Review `.claude/DESIGN_SYSTEM.md` for styling questions
4. Check `.claude/DEPLOYMENT_READINESS.md` for release blockers
5. Search existing code for similar patterns (tree-view.js, app.js examples)

---

**Last Updated**: September 3, 2026  
**Version**: 1.0.0 (production-ready)  
**Status**: Shipped – All systems operational  
**Tests**: 16/16 passing | Type errors: 0 | WCAG AA: ✅
