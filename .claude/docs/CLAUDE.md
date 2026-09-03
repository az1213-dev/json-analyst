# CLAUDE.md — Autonomous Agent Directives for json-xray

## Project Summary

**JSON Analyst** is a professional, open-source in-browser JSON developer tool with validation, formatting, interactive horizontal curved structure visualization (Bézier curves), variable family tree inspection, and high-resolution image export (`.png` / `.svg`). Independent product with unique prism-based branding and complete dark/light mode support.

- **Target Environment**: Modern web browser (100% client-side execution, zero backend server requirement).
- **Brand Identity**: Unique prism logo (layered data concept, not JSON angle brackets), professional blue palette (#2563eb, #1f6feb, #0d47a1), dark/light mode with theme-aware colors.
- **Strict Invariants**: Zero runtime external dependencies, strictly **ZERO emojis and ZERO special Unicode characters** (all text humanized plain text; all icons are vector SVGs), cycle-safe traversal, modular assets, and theme-aware styling throughout.

---

## Directory & Module Map

```text
json-xray/
├── index.html                     # Primary application (validator, chart, tree, export)
├── about.html                     # About JSON Analyst product page
├── privacy-policy.html            # Privacy policy & 100% client-side guarantee
├── 404.html                       # Error page (matches theme and navigation)
├── assets/                        # Client-side web application assets
│   ├── css/
│   │   └── style.css              # Professional dark/light mode styling with CSS variables
│   ├── js/
│   │   ├── package.json           # Declares {"type": "module"} for native Node test runner
│   │   ├── icons.js               # 24x24 SVG line icons (zero emojis)
│   │   ├── engine.js              # In-browser JSON AST parser, archetypes & metrics
│   │   ├── chart.js               # Interactive curved horizontal tree & PNG/SVG exporter (theme-aware)
│   │   ├── tree-view.js           # Structured collapsible list tree & variable inspector
│   │   └── app.js                 # App orchestrator, view switcher, and preset loader
│   └── img/
│       └── logo.svg               # Prism logo (layered data concept)
├── .claude/
│   └── docs/
│       └── CLAUDE.md              # This file (agent directives)
├── .github/                       # GitHub-specific files (workflows, etc.)
├── src/                           # Library / SDK layer (zero node dependencies)
│   ├── types/                     # AST, configuration, and formatter interfaces
│   ├── engine/                    # Detector, archetype, metrics, traverser
│   ├── formatters/                # ASCII, Mermaid, DOT, and HTML formatters
│   └── index.ts                   # Library exports
├── tests/                         # Automated tests (100% native Node test runner, <100ms)
│   ├── fixtures/                  # Edge-case JSON payloads
│   ├── traverser.test.js          # Library & engine tests
│   └── web.test.mjs               # Web assets, icons, humanization, footer tests
├── .gitignore                     # Enhanced security rules (228 lines, 9 categories)
├── .env.example                   # Environment template (3.5KB, 7 categories, security best practices)
├── README.md                      # Professional documentation with badges and features
├── package.json
└── tsconfig.json
```

---

## Standard Agent Commands

```bash
# 1. Full Verification (Run this before completing any task!)
npm run check          # Runs typecheck + all 18 automated tests in <100ms

# 2. Automated Test Suite Only
npm test               # Runs node --test tests/**/*.test.js tests/**/*.test.mjs

# 3. Type Checking Only
npm run typecheck      # Runs tsc --noEmit

# 4. Build Bundles
npm run build          # Builds CJS, ESM, and .d.ts files in dist/

# 5. Local Server Preview
npm run preview        # Serves web application at http://localhost:3000
```

> **Windows / PowerShell Execution**:
> If the Windows shell returns an execution policy error on `.ps1` files, always prefix commands with `cmd /c npm ...` or `cmd /c npx ...`.

---

## Invariant Rules for Autonomous Agents

1. **Strictly Humanized Text (CRITICAL)**:
   - **ZERO emojis** and **ZERO special Unicode pictographic characters** in ALL codebase text (HTML, CSS, JS, comments, documentation).
   - All text must be plain, humanized English text only (no copyright symbols ©, bullet points ·, hearts ❤, or any Extended_Pictographic characters).
   - Test suite enforces this with `/\p{Extended_Pictographic}/u` regex - all 16 tests MUST pass before completing ANY task.
   - Use the vector SVG icon system in [`assets/js/icons.js`](assets/js/icons.js) for all visual icons instead.
   - If a new icon is needed, define it in `assets/js/icons.js` following the 24×24 `viewBox`, `1.75px` stroke-width, and rounded line-cap aesthetic.

2. **Exclusively Web-First**:
   - The core product is [`index.html`](index.html).
   - Never convert the project into a terminal-only CLI application.
   - Never introduce backend server requirements or heavy build frameworks that break direct browser execution.

3. **Browser & Cross-Environment Compatibility**:
   - Code inside `assets/js/` must not reference Node-specific globals (`Buffer`, `process`, `fs`).
   - Use universal Web APIs: `TextEncoder`, `Blob`, `DOMParser`, `HTMLCanvasElement`.
   - Node-dependent testing or bootstrap code must be guarded with `if (typeof window !== 'undefined')`.

4. **Structure Chart & Image Export Preservation**:
   - The horizontal curved chart in [`assets/js/chart.js`](assets/js/chart.js) uses cubic Bézier curves (`M s.x s.y C ... t.x t.y`), with theme-aware colors via `getThemeColors()` function.
   - Dark mode: curveColor #1f6feb, dotColor #60a5fa, textColor #93c5fd, textSelectedColor #e0f2fe.
   - Light mode: curveColor #2563eb, dotColor #1d4ed8, textColor #001a4d (19.2:1 WCAG AAA contrast), textSelectedColor #0d47a1.
   - Any modifications must preserve pan & zoom, branch collapse/expand, node selection, and high-resolution PNG/SVG image export.
   - SVG export must properly escape XML entities in labels (& < > " ') and use safe "monospace" font.

5. **Cycle Safety & Defensive Recursion**:
   - Objects with circular references must always be detected and annotated as `↺ cycle` without causing infinite loops or stack overflow errors.

6. **Automated Verification Contract**:
   - Always run `npm run check` before marking any task as complete. Ensure 0 type errors and 100% passing tests.

---

## Branding & Visual Identity

### Logo
- **Design**: Prism with layered data concept (3-layer structure with hierarchy lines showing data relationship)
- **Purpose**: Represents data layering and organizational structure (NOT JSON angle brackets; completely independent from competitor products)
- **SVG Location**: [`assets/img/logo.svg`](assets/img/logo.svg)
- **Implementation**: Used inline in HTML headers with `viewBox="0 0 32 32"`, theme-aware colors via CSS

### Color Palette
Professional blue gradient palette:
- **Dark Mode Backgrounds**: #0a0e1a (page), #141824 (surface), #1e2736 (elevated)
- **Light Mode Backgrounds**: #ffffff (page), #f5f8fb (surface), #eff2f8 (elevated)
- **Primary Accent**: #2563eb (dark mode), #1f6feb (light mode)
- **Secondary**: #0d47a1 (tertiary)
- **Chart-specific Colors**: Dark (#1f6feb, #60a5fa, #93c5fd), Light (#2563eb, #1d4ed8, #001a4d)

### Theme System
- **Implementation**: CSS Custom Properties (variables) + localStorage persistence
- **Dark Mode**: `document.documentElement.classList.contains('light')` = false (default) or attribute `data-theme="dark"`
- **Light Mode**: `document.documentElement.classList.add('light')` and attribute `data-theme="light"`
- **Persistence**: Via `json-xray-theme` localStorage key with fallback to system `prefers-color-scheme`
- **Toggle**: Theme toggle button in header (ID: `theme-toggle`) available on all pages

### Typography
- **Font**: Google Fonts "Inter" (sans-serif, modern, professional)
- **Fallback Stack**: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Inter, sans-serif`
- **Load Location**: Linked in `<head>` via `https://fonts.googleapis.com/...`

### Navigation & Pages

**Primary Navigation Bar** (`.main-nav-bar`):
- 6 tool icons in responsive grid: Validate, Format, Minify, Chart, Tree, Privacy
- Present on all 4 pages: index.html, about.html, privacy-policy.html, 404.html
- Active state on current page tool

**Header** (`.app-header`):
- Brand logo (prism SVG) + "JSONX-Ray" text link (scrolls to top on index.html)
- GitHub icon link (opens in new tab)
- Theme toggle button (dark/light mode)

**Footer** (`.app-footer`):
- Left: Copyright text + value proposition
- Right: 3 links (About, Privacy, GitHub) with dot separators
- Responsive: stacks on mobile
- Present on all 4 pages

**Pages**:
- `index.html`: Main application (Validator & Editor, Structure Chart, Tree Explorer)
- `about.html`: Product marketing page (features grid, technology stack, open-source statement, CTA)
- `privacy-policy.html`: 10-section privacy policy (100% client-side guarantee, no data collection)
- `404.html`: Error page (professional styling, links back to main app and GitHub)
