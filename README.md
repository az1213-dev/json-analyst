# JSON Analyst

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Server Dependencies](https://img.shields.io/badge/server%20dependencies-0-brightgreen.svg)]()
[![100% Client-Side](https://img.shields.io/badge/execution-client%20side-blue.svg)]()
[![Tests Passing](https://img.shields.io/badge/tests-16%2F16-brightgreen.svg)]()

> **Deep insights into your data.** JSON Analyst is a professional-grade JSON analysis and transformation suite running 100% in your browser. Validate, format, repair broken JSON, compact for production, convert to CSV, and explore data structures visually—all without leaving your browser and with zero server dependencies.

**JSON Analyst** is an exclusively **web-based developer tool** that provides instant JSON validation, transformation, and visualization. Whether you're debugging API responses, analyzing data structures, or preparing JSON for distribution, JSON Analyst delivers powerful features with a clean, professional interface.

---

## <img src="assets/img/icons/features.svg" alt="Features" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Key Features

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

## <img src="assets/img/icons/start.svg" alt="Start" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Getting Started

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

## <img src="assets/img/icons/tools.svg" alt="Tools" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Tools Overview

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

## <img src="assets/img/icons/cases.svg" alt="Cases" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Use Cases

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

## <img src="assets/img/icons/tech.svg" alt="Tech" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Technical Stack

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

## <img src="assets/img/icons/files.svg" alt="Files" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Directory Structure

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

## <img src="assets/img/icons/performance.svg" alt="Performance" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Performance

- **Instant Validation**: <10ms for typical JSON (<10MB)
- **Efficient Traversal**: Streaming algorithm, low memory
- **Smooth UI**: 60fps interactions
- **Fast Testing**: 16 tests in ~65ms
- **No Build Required**: Open HTML directly

---

## <img src="assets/img/icons/security.svg" alt="Security" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Security & Privacy

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

## <img src="assets/img/icons/design.svg" alt="Design" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Design System

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

## <img src="assets/img/icons/setup.svg" alt="Setup" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Installation & Development

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

## <img src="assets/img/icons/testing.svg" alt="Testing" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Testing

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

## <img src="assets/img/icons/browser.svg" alt="Browser" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core JSON tools | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Visualization | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| CSV export | ✅ All | ✅ All | ✅ All | ✅ All |
| Dark mode | ✅ All | ✅ All | ✅ All | ✅ All |
| SVG icons | ✅ All | ✅ All | ✅ All | ✅ All |

---

## <img src="assets/img/icons/license.svg" alt="License" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> License

JSON Analyst is released under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

## <img src="assets/img/icons/links.svg" alt="Links" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Links

- **GitHub**: https://github.com/az1213-dev/json-analyst
- **Issues**: https://github.com/az1213-dev/json-analyst/issues
- **About**: See [about.html](about.html)
- **Privacy**: See [privacy-policy.html](privacy-policy.html)

---

## <img src="assets/img/icons/tips.svg" alt="Tips" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Tips & Tricks

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

## <img src="assets/img/icons/contributing.svg" alt="Contributing" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Contributing

Contributions are welcome! Please see GitHub issues for areas needing help.

---

## <img src="assets/img/icons/support.svg" alt="Support" width="20" height="20" style="vertical-align: middle; margin-right: 6px;"> Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/az1213-dev/json-analyst/issues)
- Review [privacy policy](privacy-policy.html) for data handling

---

**Version**: 1.0.0  
**Last Updated**: September 2026  
**Status**: Production Ready
