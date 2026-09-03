# JSON X-Ray

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Zero Server Dependencies](https://img.shields.io/badge/server%20dependencies-0-brightgreen.svg)]()
[![100% Client-Side](https://img.shields.io/badge/execution-client%20side-blue.svg)]()
[![Tests Passing](https://img.shields.io/badge/tests-16%2F16-brightgreen.svg)]()

> **See right through your data.** JSON X-Ray is a professional JSON validator, formatter, and structure chart inspector running 100% client-side in your browser.

`json-xray` is an exclusively **web-based developer tool** that provides instant JSON validation, beautification, minification, and interactive visual structure exploration—all processing happens on your machine with **zero server dependencies** and **zero data transmission**.

---

## Key Features

### Core Tools
- **JSON Validator & Formatter**
  - Real-time syntax validation with line-accurate error reporting
  - One-click formatting (beautify), minification, and clearing
  - Full-width code editor with synchronized dynamic line numbers
  - Sample preset datasets for quick exploration

- **Structure Chart Visualization**
  - Interactive horizontal tree diagram with smooth cubic Bézier curves
  - Infinite canvas panning and mouse-wheel zoom with floating controls
  - Clickable node inspection showing paths, keys, values, and relationships
  - High-resolution PNG & SVG image export

- **Tree & Lineage Explorer**
  - Ancestor breadcrumb navigation (e.g., `ROOT > data > users > 0 > address`)
  - Real-time search filtering by variable name or type
  - Visual branch highlighting for quick pattern discovery

- **Array Schema Archetypes**
  - Automatic schema inference for array elements
  - Field optionality and frequency coverage analysis
  - Unified schema contracts for multi-item collections

- **Advanced Safety**
  - Cycle-safe traversal prevents stack overflow on recursive objects
  - Circular reference detection and annotation
  - Safe handling of deeply nested structures

### Architecture
- **100% Client-Side**: All processing in your browser—no backend, no uploads
- **Modular Design**: Clean separation of concerns with dedicated modules
- **SVG Icon System**: Professional vector icons (zero emojis)
- **Dark Mode**: Full dark/light theme support with persistent preference
- **Privacy-First**: Complete transparency—view the source on GitHub

---

## Directory Structure

```
json-xray/
├── index.html                     # Main JSON X-Ray application
├── privacy-policy.html            # Privacy policy page
├── 404.html                       # Custom error page
├── assets/
│   ├── css/
│   │   └── style.css              # Professional design system & theming
│   ├── js/
│   │   ├── icons.js               # SVG icon definitions (24×24, zero emojis)
│   │   ├── engine.js              # JSON AST parser, metrics, archetypes
│   │   ├── chart.js               # Interactive chart & image exporter
│   │   ├── tree-view.js           # Collapsible tree inspector
│   │   ├── app.js                 # Application controller & view management
│   │   └── package.json           # Declares {"type": "module"}
│   └── img/
│       └── logo.svg               # Brand logo (SVG)
├── src/                           # NPM library layer (builds to dist/)
│   ├── engine/                    # Core parsing & traversal
│   ├── formatters/                # ASCII, Mermaid, DOT, HTML formatters
│   ├── types/                     # TypeScript type definitions
│   └── index.ts                   # Library entry point
├── tests/                         # Automated test suite (16 tests, <100ms)
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules with security best practices
├── package.json                   # Project configuration
└── tsconfig.json                  # TypeScript configuration
```

---

## Quick Start

### In Browser (No Installation)
Simply open `index.html` in any modern web browser:
- **Direct**: Double-click `index.html` or drag it into your browser
- **With Server** (recommended):
  ```bash
  npx serve .
  ```
  Then navigate to `http://localhost:3000`

### Supported Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES2020+ support

---

## Development

### Setup
```bash
npm install
```

### Run Tests
```bash
npm test                  # Run 16 automated tests
npm run typecheck        # TypeScript type checking
npm run check            # Both tests and type check
```

### Build Library
```bash
npm run build            # Build CJS, ESM, and .d.ts for npm distribution
```

### Preview Web App
```bash
npm run preview          # Serve at http://localhost:3000
```

---

## How It Works

1. **Paste or Type JSON** into the editor
2. **Validate** automatically—see errors pinpointed to line/column
3. **Explore Visually**:
   - View the structure chart with pan/zoom controls
   - Click nodes to inspect details
   - Navigate parent/child relationships
4. **Export**: Download high-resolution charts as PNG or SVG
5. **All Processing** happens on your device—nothing is uploaded

---

## Security & Privacy

- **Zero Data Collection**: No servers, no telemetry, no tracking
- **Client-Side Only**: All JSON processing happens in your browser
- **No Cookies**: Theme preference stored in browser localStorage only
- **Open Source**: Audit the code on [GitHub](https://github.com/az1213-dev/json-xray)
- **Privacy Policy**: See [privacy-policy.html](privacy-policy.html)

---

## Features for Different Use Cases

| Use Case | Tools |
|----------|-------|
| Debugging API responses | Validator, Tree Explorer |
| Schema analysis | Archetypes, Chart |
| Sharing structure | Export PNG/SVG |
| Nested data exploration | Tree breadcrumbs, Search |
| Payload optimization | Minify + File size |
| Learning JSON | Sample presets, Visualizations |

---

## Technical Details

### Frontend Stack
- **HTML5**: Semantic markup, accessibility
- **CSS3**: Custom properties (variables), dark mode, responsive layout
- **JavaScript (ES2020+)**: Modular, no external dependencies
- **SVG**: Vector graphics and icons

### NPM Library (TypeScript)
The `src/` directory provides a reusable library:
- **Detector**: Classify JSON types and structures
- **Traverser**: Safe AST traversal with cycle detection
- **Formatters**: ASCII, Mermaid diagrams, Graphviz DOT, HTML
- **Archetypes**: Array schema inference

---

## Performance

- **Fast Validation**: <10ms for typical JSON (<10MB)
- **Low Memory**: Efficient streaming traversal
- **Responsive UI**: 60fps chart interactions
- **Quick Tests**: 16 tests run in <100ms
- **No Build Required**: Open index.html directly

---

## Browser Compatibility

| Feature | Support |
|---------|---------|
| Core validation | All modern browsers |
| Chart visualization | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| SVG export | All modern browsers |
| Dark mode | All modern browsers |
| localStorage | All modern browsers |

---

## Contributing

Found a bug or have a feature idea? Visit our [GitHub issues](https://github.com/az1213-dev/json-xray/issues) to contribute.

---

## License

[ISC](LICENSE) © [az1213-dev](https://github.com/az1213-dev)

---

**Happy validating! See right through your JSON with JSON X-Ray.**
