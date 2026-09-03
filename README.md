# JSON Analyst

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Server Dependencies](https://img.shields.io/badge/server%20dependencies-0-brightgreen.svg)]()
[![100% Client-Side](https://img.shields.io/badge/execution-client%20side-blue.svg)]()
[![Tests Passing](https://img.shields.io/badge/tests-16%2F16-brightgreen.svg)]()

> **Deep insights into your data.** JSON Analyst is a professional-grade JSON analysis and transformation suite running 100% in your browser. Validate, format, repair broken JSON, compact for production, convert to CSV, and explore data structures visually—all without leaving your browser and with zero server dependencies.

**JSON Analyst** is an exclusively **web-based developer tool** that provides instant JSON validation, transformation, and visualization. Whether you're debugging API responses, analyzing data structures, or preparing JSON for distribution, JSON Analyst delivers powerful features with a clean, professional interface.

---

## ✨ Key Features

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

## 🚀 Getting Started

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

## 📋 Tools Overview

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

## 🎯 Use Cases

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

## 🛠️ Technical Stack

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

## 📁 Directory Structure

```
json-analyst/
├── index.html                     # Main application interface
├── about.html                     # Product information
├── privacy-policy.html            # Privacy & data handling
├── 404.html                       # Error page
│
├── assets/
│   ├── css/
│   │   └── style.css              # Professional design system
│   ├── js/
│   │   ├── app.js                 # Main application controller
│   │   ├── tree-view.js           # Tree explorer component
│   │   ├── chart.js               # Visualization engine
│   │   ├── engine.js              # JSON parsing wrapper
│   │   ├── icons.js               # SVG icon library
│   │   └── package.json           # ES modules declaration
│   └── img/
│       └── logo.svg               # Brand identity
│
├── src/                           # Reusable NPM library (TypeScript)
│   ├── engine/
│   │   ├── detector.js            # Type detection
│   │   ├── traverser.js           # AST builder
│   │   ├── archetype.js           # Schema inference
│   │   └── metrics.js             # Metrics calculation
│   ├── formatters/
│   │   ├── ascii.js               # ASCII tree formatter
│   │   ├── mermaid.js             # Mermaid diagram formatter
│   │   ├── dot.js                 # Graphviz DOT formatter
│   │   └── html.js                # Standalone HTML viewer
│   ├── types/                     # TypeScript definitions
│   └── index.ts                   # Library entry point
│
├── tests/                         # Automated test suite
│   ├── *.test.js                  # SDK tests
│   └── web.test.mjs               # Web integration tests
│
├── .claude/                       # Development documentation
│   ├── CLAUDE.md                  # Project standards
│   ├── DEPLOYMENT_READINESS.md    # Release checklist
│   └── docs/                      # Detailed guides
│
├── .github/workflows/             # CI/CD automation
├── .gitignore                     # Git rules
├── .env.example                   # Configuration template
├── LICENSE                        # MIT License
├── package.json                   # Project metadata
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

---

## ⚡ Performance

- **Instant Validation**: <10ms for typical JSON (<10MB)
- **Efficient Traversal**: Streaming algorithm, low memory
- **Smooth UI**: 60fps interactions
- **Fast Testing**: 16 tests in ~65ms
- **No Build Required**: Open HTML directly

---

## 🔒 Security & Privacy

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

## 🎨 Design System

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

## 📦 Installation & Development

### Quick Start
```bash
# Clone or download the repository
git clone https://github.com/az1213-dev/json-analyst.git
cd json-analyst

# Install dependencies
npm install

# Run tests
npm test

# Type check
npm run typecheck

# Run all checks
npm run check

# Preview in browser
npm run preview
```

### Build for Production
```bash
npm run build
```

This generates:
- `dist/index.js` - CommonJS
- `dist/index.mjs` - ES Module
- `dist/index.d.ts` - TypeScript declarations

---

## 🧪 Testing

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

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core JSON tools | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| Visualization | ✅ 90+ | ✅ 88+ | ✅ 14+ | ✅ 90+ |
| CSV export | ✅ All | ✅ All | ✅ All | ✅ All |
| Dark mode | ✅ All | ✅ All | ✅ All | ✅ All |
| SVG icons | ✅ All | ✅ All | ✅ All | ✅ All |

---

## 📄 License

JSON Analyst is released under the **MIT License**. See [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **GitHub**: https://github.com/az1213-dev/json-analyst
- **Issues**: https://github.com/az1213-dev/json-analyst/issues
- **About**: See [about.html](about.html)
- **Privacy**: See [privacy-policy.html](privacy-policy.html)

---

## 💡 Tips & Tricks

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

### Common Workflows

**API Response Analysis:**
1. Copy response JSON
2. Paste into Validate
3. Click Tree to explore structure
4. Use Chart for visual overview

**CSV Export:**
1. Paste JSON array
2. Click CSV conversion
3. Copy or download result
4. Open in spreadsheet app

**Minification for Production:**
1. Paste formatted JSON
2. Click Compact
3. Download compact version
4. Deploy with confidence

---

## 🤝 Contributing

Contributions are welcome! Please see GitHub issues for areas needing help.

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/az1213-dev/json-analyst/issues)
- Check existing documentation in [.claude/docs/](../.claude/docs/)
- Review [privacy policy](privacy-policy.html) for data handling

---

**Version**: 1.0.0  
**Last Updated**: September 2026  
**Status**: Production Ready  
**Quality**: 16/16 tests passing | Zero type errors | WCAG AA compliant
