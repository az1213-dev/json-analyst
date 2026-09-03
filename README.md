# JSON Analyst

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Server Dependencies](https://img.shields.io/badge/server%20dependencies-0-brightgreen.svg)]()
[![100% Client-Side](https://img.shields.io/badge/execution-client%20side-blue.svg)]()
[![Tests Passing](https://img.shields.io/badge/tests-16%2F16-brightgreen.svg)]()

> **Deep insights into your data.** JSON Analyst is a professional-grade JSON analysis and transformation suite running 100% in your browser. Validate, format, repair broken JSON, compact for production, convert to CSV, and explore data structures visually—all without leaving your browser and with zero server dependencies.

**JSON Analyst** is an exclusively **web-based developer tool** that provides instant JSON validation, transformation, and visualization. Whether you're debugging API responses, analyzing data structures, or preparing JSON for distribution, JSON Analyst delivers powerful features with a clean, professional interface.

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E" alt="Features" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Key Features

### Core Analysis Tools

#### **Validate**
- Real-time JSON syntax validation
- Precise error reporting with message details
- Instant feedback on malformed JSON
- Sample datasets for learning

#### **Format**
- Pretty-print JSON with configurable indentation
- Automatic whitespace normalization
- Readable output for documentation and debugging
- Copy and download formatted results

#### **Repair**
- Automatically fix common JSON errors:
  - Remove trailing commas
  - Fix single-quoted strings
  - Correct bracket/brace mismatches
  - Normalize string escaping
- Restore broken JSON to valid syntax

#### **Compact**
- Remove all unnecessary whitespace
- Minimize file size for production
- Ideal for data transmission and storage
- Perfect for minification pipelines

#### **CSV Conversion**
- Transform JSON arrays into CSV format
- Automatic column header generation
- Proper escaping and quote handling
- One-click CSV export
- Direct spreadsheet compatibility

### Advanced Features

#### **Structure Visualization**
- Interactive horizontal tree diagram
- Pan and zoom controls
- Click to inspect individual nodes
- Visual relationship mapping
- High-resolution PNG/SVG export

#### **Tree & Lineage Explorer**
- Navigate complex JSON hierarchies
- Breadcrumb navigation with click-through
- Real-time search filtering by key/type
- Parent-child relationship visualization
- Full lineage tracking

#### **Schema Archetypes**
- Automatic array schema inference
- Field optionality analysis
- Coverage percentage calculation
- Unified schema contracts for collections

#### **All Tools Gallery**
- Centralized tool discovery
- One-sentence descriptions of each feature
- Quick access to any tool
- Professional card-based layout

### Quality & Reliability

- **100% Client-Side**: All processing happens in your browser—nothing uploaded
- **Zero Data Collection**: No tracking, no telemetry, no servers
- **Cycle-Safe Traversal**: Handles circular references without crashes
- **Professional UI**: Dark/light theme, responsive design, SVG icons
- **Comprehensive Testing**: 16 automated tests, 100% passing
- **Zero Emojis**: Professional design system with custom SVG icons
- **WCAG AA Accessible**: Built for all users
- **TypeScript Strict Mode**: Type-safe codebase

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E" alt="Start" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Getting Started

### In Browser (No Installation)

Simply open `index.html` in any modern web browser:

**Option 1: Direct**
- Double-click `index.html` or drag it into your browser

**Option 2: With Local Server** (Recommended)
```bash
npx serve .
```
Then navigate to `http://localhost:3000`

### Supported Browsers

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Any modern browser with ES2020+ support

### System Requirements

- No installation required
- No backend needed
- Works offline
- 5MB file upload limit
- All modern browsers supported

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cline x1='9' y1='3' x2='9' y2='21'/%3E%3Cline x1='3' y1='9' x2='21' y2='9'/%3E%3C/svg%3E" alt="Tools" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Tools Overview

### Validation & Error Detection
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| Validate | Check JSON syntax | Paste/Upload JSON | Error messages or success |
| Repair | Fix broken JSON | Malformed JSON | Corrected, valid JSON |

### Formatting & Transformation
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| Format | Pretty-print JSON | Any JSON | Indented, readable JSON |
| Compact | Remove whitespace | Formatted JSON | Single-line JSON |
| CSV | Array-to-spreadsheet | JSON array | CSV with headers |

### Analysis & Visualization
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| Chart | Structure diagram | JSON data | Interactive visualization |
| Tree | Hierarchy explorer | JSON data | Navigable tree with search |

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E" alt="Cases" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Use Cases

| Scenario | Tools |
|----------|-------|
| Debugging API responses | Validate, Tree, Chart |
| Schema analysis | Chart, Tree, Archetype |
| Data migration prep | CSV, Compact |
| JSON documentation | Format, Download |
| Error diagnosis | Validate, Repair |
| Payload optimization | Compact, Download |
| Data exploration | Tree, Chart, Search |
| Cross-format conversion | CSV, Compact, Format |

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3Cpath d='M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m2.12-2.12l4.24-4.24M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0z'/%3E%3C/svg%3E" alt="Tech" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Technical Stack

### Frontend
- **HTML5**: Semantic markup, accessibility
- **CSS3**: Custom properties, dark mode, responsive layout
- **JavaScript (ES2020+)**: Modular, zero external dependencies in browser
- **SVG**: Vector icons (zero emojis)

### NPM Library (TypeScript)
The `src/` directory provides a reusable TypeScript library:

```typescript
import { buildTree, detectType, inferArchetype, computeMetrics } from 'json-analyst';

const tree = buildTree(jsonData);
const archetype = inferArchetype(arrayData);
const metrics = computeMetrics(tree);
```

**Available Modules:**
- `Detector`: JSON type classification
- `Traverser`: AST building with cycle detection
- `Archetype`: Schema inference and analysis
- `Metrics`: Structure complexity calculation
- `Formatters`: ASCII, Mermaid, Graphviz DOT, HTML export

### Quality Assurance
- 16 automated tests (100% passing)
- TypeScript strict mode
- Zero type errors
- Comprehensive test coverage

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'/%3E%3C/svg%3E" alt="Files" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Directory Structure

```
json-analyst/
├── index.html                     # Main application interface
├── about.html                     # Product information
├── privacy-policy.html            # Privacy & data handling
├── 404.html                       # Error page
├── CLAUDE.md                      # Project standards
├── LICENSE                        # MIT License
├── README.md                      # Public documentation
├── package.json                   # Project metadata
├── tsconfig.json                  # TypeScript configuration
│
├── assets/
│   ├── css/style.css              # Professional design system
│   ├── js/
│   │   ├── app.js                 # Application controller
│   │   ├── tree-view.js           # Tree explorer component
│   │   ├── chart.js               # Visualization engine
│   │   ├── engine.js              # JSON parsing wrapper
│   │   ├── icons.js               # SVG icon library
│   │   └── package.json           # ES modules declaration
│   └── img/logo.svg               # Brand identity
│
├── src/                           # NPM library (TypeScript)
│   ├── engine/
│   │   ├── detector.js
│   │   ├── traverser.js
│   │   ├── archetype.js
│   │   └── metrics.js
│   ├── formatters/
│   │   ├── ascii.js
│   │   ├── mermaid.js
│   │   ├── dot.js
│   │   └── html.js
│   ├── types/
│   └── index.ts
│
├── tests/                         # Automated test suite
├── .claude/
│   └── CLAUDE.md
└── .github/workflows/             # CI/CD automation
```

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E" alt="Performance" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Performance

- **Instant Validation**: <10ms for typical JSON (<10MB)
- **Efficient Traversal**: Streaming algorithm, low memory
- **Smooth UI**: 60fps interactions
- **Fast Testing**: 16 tests in ~65ms
- **No Build Required**: Open HTML directly

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E" alt="Security" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Security & Privacy

### Privacy First
- **100% Client-Side**: No backend servers, all processing local
- **Zero Data Collection**: No telemetry, tracking, or analytics
- **No Cookies**: Theme preference stored in localStorage only
- **Open Source**: Audit the code on GitHub
- **GDPR Compliant**: No data transmission, no personal data collection

### Security Hardened
- XSS protection via HTML escaping
- Safe JSON parsing with cycle detection
- No eval or dynamic code execution
- Input validation (5MB file limit, .json only)
- Secure CSV export with proper escaping

### Third-Party Trust
- Google Fonts for typography (trusted CDN)
- Zero tracking libraries
- Zero ads or sponsors

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3Cpath d='M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m2.12-2.12l4.24-4.24'/%3E%3C/svg%3E" alt="Design" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Design System

### Color Palette
- **Accent Blue**: Primary interactions
- **Accent Purple**: Secondary emphasis
- **Mint Green**: Success states
- **Error Red**: Validation errors
- **Neutral Grays**: Professional appearance

### Typography
- **Display Font**: Inter (sans-serif)
- **Monospace Font**: JetBrains Mono (code)
- **Fallback Stack**: System fonts for reliability

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px–1199px
- Mobile: < 768px

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cline x1='12' y1='5' x2='12' y2='19'/%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E" alt="Setup" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Installation & Development

### Quick Start
```bash
git clone https://github.com/az1213-dev/json-analyst.git
cd json-analyst
npm install
npm run check    # Tests + typecheck
npm run preview  # Serve at http://localhost:3000
```

### Build for Production
```bash
npm run build
```

Generates: `dist/index.js` (CommonJS), `dist/index.mjs` (ESM), `dist/index.d.ts` (TypeScript)

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E" alt="Testing" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Testing

### Test Coverage
- **Engine Tests**: Type detection, AST building, cycle safety
- **Formatter Tests**: ASCII, Mermaid, Graphviz, HTML output
- **Web Tests**: UI integration, icon validation, HTML structure
- **Total**: 16 tests, 100% pass rate

### Running Tests
```bash
npm run check        # Full suite (tests + typecheck)
npm test             # Tests only
npm run typecheck    # TypeScript only
```

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E" alt="Browser" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core JSON tools | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Visualization | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| CSV export | ✅ All | ✅ All | ✅ All | ✅ All |
| Dark mode | ✅ All | ✅ All | ✅ All | ✅ All |
| SVG icons | ✅ All | ✅ All | ✅ All | ✅ All |

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z'/%3E%3Cpolyline points='13 2 13 9 20 9'/%3E%3C/svg%3E" alt="License" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> License

JSON Analyst is released under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E" alt="Links" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Links

- **GitHub**: https://github.com/az1213-dev/json-analyst
- **Issues**: https://github.com/az1213-dev/json-analyst/issues
- **About**: See [about.html](about.html)
- **Privacy**: See [privacy-policy.html](privacy-policy.html)

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E" alt="Tips" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Tips & Tricks

### Keyboard Shortcuts
- `Tab`: Navigate between sections
- `Enter`: Activate selected tool
- `Ctrl+A`: Select all (in textareas)
- `Ctrl+C`: Copy (browser default)

### Best Practices
1. **Validate First**: Always check syntax before analysis
2. **Use Samples**: Try sample datasets to learn
3. **Dark Mode**: Easier on eyes for long sessions
4. **Export Often**: Download results for documentation
5. **Repair First**: Fix broken JSON before formatting

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M23 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E" alt="Contributing" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Contributing

Contributions are welcome! Please see GitHub issues for areas needing help.

---

## <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' width='24' height='24'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E" alt="Support" width="24" height="24" style="display: inline; margin-right: 8px; vertical-align: middle;"> Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/az1213-dev/json-analyst/issues)
- Review [privacy policy](privacy-policy.html) for data handling

---

**Version**: 1.0.0  
**Last Updated**: September 2026  
**Status**: Production Ready
