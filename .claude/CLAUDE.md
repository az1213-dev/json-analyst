# JSON Analyst — Project Standards & Guidance

Loaded automatically at session start. Defines project invariants, coding standards, and architectural decisions for Claude Code.

## Project Essence
- **Purpose**: Professional JSON validator, formatter, and structure inspector (100% client-side, zero server deps)
- **Type**: Hybrid (NPM library + web app)
- **Quality Bar**: v1.0.0 production-ready (16/16 tests, zero type errors, WCAG AA)
- **License**: MIT

## Core Standards

### Code Quality
- TypeScript strict mode enabled
- All user inputs must be HTML-escaped before innerHTML assignment
- No emojis or extended Unicode pictographics in code or output
- Tests must pass: `npm run check` (16 tests + typecheck)
- Import style: ES modules only (no require)

### Security First
- Always escape HTML: use `escapeHtml()` helper before innerHTML
- No prototype pollution via __proto__ parsing
- No eval, Function constructor, or dynamic code execution
- File uploads: 5MB limit, .json extension/MIME validation only
- Circular references: safe traversal with cycle detection

### UI/UX
- Zero emojis (use SVG icons instead)
- Dark/light theme via CSS variables
- Professional button styling (hover effects, active states)
- Breadcrumb navigation for hierarchy exploration
- Responsive mobile-first design (tested on all breakpoints)

### File Organization
```
json-xray/
├── index.html                    # Main web app
├── privacy-policy.html          # GDPR compliance
├── 404.html                     # Error page
├── assets/
│   ├── css/style.css           # Design system, dark/light themes
│   ├── js/
│   │   ├── app.js              # Application controller
│   │   ├── tree-view.js        # Tree inspector
│   │   ├── chart.js            # Chart visualization
│   │   ├── engine.js           # JSON parser wrapper
│   │   ├── icons.js            # SVG icon definitions
│   │   └── package.json        # {"type":"module"}
│   └── img/logo.svg            # Brand logo
├── src/                        # NPM library (TypeScript)
│   ├── engine/
│   │   ├── detector.js         # Type detection
│   │   ├── traverser.js        # AST builder
│   │   ├── archetype.js        # Schema inference
│   │   └── metrics.js          # Metrics calculator
│   ├── formatters/             # Multi-format export
│   │   ├── ascii.js
│   │   ├── mermaid.js
│   │   ├── dot.js
│   │   └── html.js            # Standalone interactive viewer
│   ├── types/                  # TypeScript definitions
│   └── index.ts                # Library entry point
├── tests/                      # Automated tests
├── .claude/                    # This folder
├── .github/workflows/          # CI/CD pipelines
├── LICENSE                     # MIT License
├── README.md                   # Public documentation
└── package.json               # v1.0.0
```

## Before Publishing v1.0.0

Verify:
- ✅ All 16 tests passing
- ✅ Zero TypeScript errors
- ✅ All XSS vulnerabilities fixed (3 high-confidence findings)
- ✅ License consistent (MIT across LICENSE, package.json, README)
- ✅ All documentation up to date
- ✅ GitHub links functional
- ✅ Breadcrumb navigation working
- ✅ File upload validation (5MB, .json only)
- ✅ Dark/light theme with localStorage persistence
- ✅ Privacy policy moved to footer

## Key Commands

```bash
npm run check     # Run typecheck + tests (16/16 should pass)
npm run build     # Build CJS, ESM, .d.ts to dist/
npm run preview   # Serve at http://localhost:3000
npm test          # Run 16 tests only
npm run typecheck # TypeScript validation only
```

## Deployment Checklist

Before `git push`:
1. All changes committed (`git status` clean)
2. Tests passing (`npm run check`)
3. Documentation current
4. Security review complete
5. License consistent across all files
6. Git tag: `git tag v1.0.0`

See `.claude/DEPLOYMENT_READINESS.md` for full pre-flight checklist.

---

**Updated**: 2026-09-03  
**Version**: 1.0.0 (production-ready)
