# Security Policy for JSON X-Ray

## Threat Model

JSON X-Ray is a **100% client-side web application** with zero server-side dependencies. Security threats are constrained to:

1. **Malicious JSON Input**: Users paste untrusted JSON that could exploit parsing logic or cause DoS via deep recursion
2. **XSS via User Content**: While JSON is code-agnostic, malicious keys or strings could theoretically escape into DOM rendering
3. **Image Export Handling**: PNG/SVG export uses the Canvas API and Blob generation; potential for resource exhaustion

## Security Measures

### Input Validation & Parsing Safety
- ✓ **Cycle Detection**: Circular reference traversal never causes stack overflow (see `buildTree()` in `assets/js/engine.js`)
- ✓ **Depth Limits**: Configurable `maxDepth` parameter prevents infinite nesting attacks
- ✓ **Array Sampling**: Large arrays are sampled, not fully iterated, preventing memory exhaustion
- ✓ **Error Boundaries**: JSON.parse() wrapped in try-catch; syntax errors gracefully reported in UI
- ✓ **Type Detection**: Primitive types and containers strictly classified; no coercion vulnerabilities

### DOM Security
- ✓ **No innerHTML on User Data**: Node keys, paths, and values use textContent instead of innerHTML
- ✓ **CSS Escaping**: CSS.escape() used when constructing selectors (tree-view.js line 116)
- ✓ **SVG Hardcoding**: All SVG icons defined in `assets/js/icons.js` as constants—zero emoji use, zero dynamic SVG injection
- ✓ **No Template Injection**: Inline template literals use backticks only for safe HTML scaffolding; user data never interpolated into event handlers

### Client-Side Constraints
- ✓ **Browser Sandbox**: All execution within same-origin isolation; no network calls or storage access required
- ✓ **No External Dependencies**: Zero npm packages in `assets/js/`; all logic is native JavaScript
- ✓ **CSP Compatible**: No inline event handlers (onclick, onerror); all events attached via addEventListener
- ✓ **No eval() or Function()**: Never used; all code is static

## Testing & Verification

Run the automated test suite to verify security invariants:

```bash
npm run check  # Type checking + cycle-safety & anomaly detection tests
```

Key test files:
- `tests/traverser.test.js`: Cycle detection without stack overflow
- `tests/web.test.mjs`: SVG icon validation (zero emojis)
- `tests/web.test.mjs`: DOM integrity checks for `index.html`

## Deployment Safety

### Before Going Live
1. **Never modify `assets/js/icons.js`** to add emoji or external SVG URLs
2. **Never add `<script>` tags** with external src attributes
3. **Never use `innerHTML`** for user-supplied JSON keys or values
4. **Always run `npm run check`** before pushing to production
5. **Validate all new DOM manipulation** uses textContent, not innerHTML

### Browser Compatibility
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript (no transpilation required)
- Canvas & Blob APIs for image export (all browsers ≥ 2019)

## Known Limitations

1. **Very Deep JSON** (depth > 1000): May cause slowdown; use `maxDepth` config
2. **Large Arrays** (> 10k items): Only first N items visualized; full structure still analyzed
3. **Memory**: Browser tab memory cap applies; massive JSON files (100MB+) will hit limit

## Reporting Security Issues

If you discover a security vulnerability:
1. **Do not open a public issue**
2. Email: azapata12131@gmail.com with details
3. Include: JSON payload (sanitized), browser, steps to reproduce
4. Allow 72 hours for response before public disclosure

---

**Last Updated**: 2026-09-02  
**Status**: Pre-1.0 (No backwards-compatibility guarantee)
