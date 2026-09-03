# JSON X-Ray Design System

## Overview

JSON X-Ray implements a professional, accessible design system optimized for developer tools. The design prioritizes clarity, hierarchy, and a seamless dark/light mode experience.

---

## Typography

### Font Stack
- **Display & UI**: `Inter` (Google Fonts) — Modern, humanist sans-serif with excellent screen rendering
- **Code & Data**: `JetBrains Mono` — Monospace font optimized for code readability
- **Fallbacks**: System fonts ensure instant rendering before Google Fonts loads

### Type Scale
```
Page Title:     28px, weight 700 (display font)
Headings:       15-18px, weight 600-700
Body Text:      13-14px, weight 400-500
Labels:         11-13px, weight 500-600
Monospace:      12-13px, weight 400
```

### Line Height
- Headings: 1.2
- Body text: 1.6
- Code: 1.6

---

## Color System

### Dark Mode (Default)
```
Primary Colors:
  --bg-page:              #0d1117 (Page background)
  --bg-surface:           #161b22 (Card/surface background)
  --bg-surface-elevated:  #21262d (Hover state)
  --bg-canvas:            #090b12 (Chart background)

Text Colors:
  --text-primary:         #f0f6fc (Main text)
  --text-secondary:       #c9d1d9 (Supporting text)
  --text-muted:           #8b949e (Disabled/tertiary)
  --text-dim:             #6e7681 (Placeholder text)

Borders:
  --border-subtle:        #30363d (Light border)
  --border-strong:        #484f58 (Emphasized border)

Accents:
  --accent-blue:          #0a84ff (Primary action)
  --accent-purple:        #7c3aed (Chart/secondary)
  --accent-mint:          #00e5a3 (Success/string types)
  --accent-lavender:      #a78bfa (Variable names)

Semantic:
  --success-green:        #238636 (Valid state)
  --error-red:            #da3633 (Error state)
```

### Light Mode
Inverts the above for maximum contrast and readability:
- Light backgrounds (#fff, #f6f8fa)
- Dark text (#1f2328)
- Maintained accent colors for consistency

### Color Accessibility
- ✓ WCAG AA compliant contrast ratios throughout
- ✓ No color-only information encoding
- ✓ Semantic colors for status (success/error/warning)
- ✓ Colorblind-friendly palette

---

## Components

### Buttons

**Primary Button** (`.btn-action-primary`)
- Used for main actions (Validate JSON, Export)
- Background: `--accent-blue`
- Includes shadow on hover for depth
- Slight lift effect on hover (`translateY(-1px)`)

**Chart Button** (`.btn-action-chart`)
- Used for chart/visualization actions
- Background: `--accent-purple`
- Same interaction patterns as primary button

**Secondary Button** (`.btn-action-sub`)
- Used for tertiary actions (Format, Minify, Clear)
- Background: `--bg-surface`
- Blue border highlight on hover
- Subtle shadow on interaction

**Dark Mode Toggle** (`#theme-toggle`)
- 36×36px icon button in header
- Shows sun icon (light mode) or sun-rays icon (dark mode)
- Smooth icon transition via CSS pseudo-elements
- Embedded SVG icons (no external requests)

### Input Fields

**Select / Input** (`.select-preset`, `.app-search-input`)
- Hover: Border changes to `--border-strong`
- Focus: Blue focus ring (`0 0 0 3px rgba(10, 132, 255, 0.1)`)
- Background changes on interaction for visual feedback
- Font family matches UI (`--font-sans`)

### Navigation

**Nav Pills** (`.nav-pill`)
- Inactive: Muted color, transparent background
- Hover: Light background, primary text color
- Active: Full background fill + subtle shadow
- Chart pill uses purple accent when active

### Status / Info

**Status Banner** (`.status-banner`)
- Success state: Green background with checkmark icon
- Error state: Red background with close icon
- Full-width contextual messaging

**Metric Pills** (`.metric-pill`)
- Monospace font for data display
- Border and light background for separation
- Alert variant uses error red for warnings

---

## Dark Mode Implementation

### Theme Toggle Behavior
1. **Default (System)**: Respects `prefers-color-scheme` media query
2. **Explicit Light**: `[data-theme="light"]` stamps on `<html>`
3. **Explicit Dark**: `[data-theme="dark"]` stamps on `<html>`

### CSS Structure
```css
:root { /* Light palette (default) */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* Dark palette */ }
}
html.light, :root[data-theme="light"] { /* Explicit light */ }
:root[data-theme="dark"] { /* Explicit dark */ }
```

### Icon Adaptation
Theme icons are embedded SVG data URIs that change color with theme:
```css
:root:not([data-theme="light"]) #theme-toggle::before {
  background-image: url('data:image/svg+xml;...');
}
```

---

## Spacing System

```
Header Height:          58px
Main Padding:           24px (vertical), 20px (horizontal)
Section Gap:            24px
Card/Component Gap:     12-16px
Padding (Cards):        14-18px
Border Radius:          6-8px
```

### Spacing Rules
- Use flexbox `gap` property for sibling groups
- Never use per-element margins that collapse
- Consistent horizontal padding throughout
- Responsive padding on smaller screens

---

## Interactions

### Transitions
- Default: `0.2s ease` for state changes
- Theme toggle: `0.3s ease` (full page)
- Drawer slide: `0.25s cubic-bezier(0.16, 1, 0.3, 1)` (custom easing)

### Hover States
- Buttons: Slight lift + shadow enhancement
- Inputs: Border color + background shift
- Cards: Border accent + subtle shadow
- Pills: Background fill

### Focus States
- All interactive elements have visible focus ring
- Focus ring: `0 0 0 3px rgba(accent, 0.1)`
- Meets accessibility guidelines

### Active States
- Buttons: Scale down slightly (`scale(0.98)`)
- Pills: Full color + reduced shadow
- Inputs: Maintained focus state

---

## Breakpoints & Responsive

### Desktop (1200px+)
- Full-width content
- Multi-column layouts
- Expanded editor height

### Tablet (768px-1199px)
- Flexible grid columns
- Adjusted padding

### Mobile (< 768px)
- Single column layouts
- Reduced padding
- Stacked buttons
- Full-width inputs

---

## Icons

### Icon System (`assets/js/icons.js`)
- **24 SVG Icons** total
- **1.75px stroke width** for consistent weight
- **Rounded line caps** for modern feel
- **No external icon fonts** — all inline SVG
- **Zero emojis** — professional vector graphics

### Icon Usage
- Icons injected via `insertAdjacentHTML()`
- Icon classes apply only inline styles
- Icon positioning via flexbox in button layouts
- Icon sizing: 14-18px (16px default)

### Icon Gallery
```
Navigation:     chevronRight, chevronDown
Actions:        check, close, copy, tree, chart
UI:             zoomIn, zoomOut, zoomReset, search
Status:         warning, info, cycle, dot
Functional:     download, image, clear, format, minify
Settings:       settings, expand, collapse, code
```

---

## Accessibility

### WCAG Compliance
- ✓ Color contrast ratios ≥ 4.5:1
- ✓ Focus visible on all interactive elements
- ✓ Semantic HTML structure
- ✓ ARIA labels on icon buttons
- ✓ Keyboard navigation support

### Responsive Text
- Base font size: 13-14px (readable without zoom)
- Line height ≥ 1.5 throughout
- Text wrapping without cutting off

### Motion Preferences
- Respects `prefers-reduced-motion` media query (future)
- Smooth transitions, no jarring animations

---

## Component Specifications

### Editor Card
- Height: 380px (JSON input)
- Line gutter: 48px wide
- Monospace font: 12.5px
- Synchronized scrolling with line numbers

### Chart View
- Height: 560px
- Canvas background: `--bg-canvas`
- Toolbar: Fixed top with export controls
- Inspector drawer: 360px wide, slides in from right

### Tree View
- Sidebar: 50% width
- Inspector: 50% width
- Max height: 480px (scrollable)
- Search bar with expand/collapse controls

### Articles Grid
- Auto-fit columns (min 280px)
- Gap: 24px
- Responsive to screen size

---

## Open Source Resources Used

### Typography
- **Google Fonts**: Inter for UI typography
  - Modern, metric-compatible with system fonts
  - 4 weights for hierarchy (400, 500, 600, 700)

### Design Inspiration
- **GitHub**: Color palette and component patterns
- **JSONLint**: Original design philosophy
- **Modern Design Systems**: Accessibility guidelines

### SVG Icons
- Custom icons matching 24×24 grid
- Inspired by Feather Icons aesthetic
- Optimized SVG with inline CSS colors

---

## Development Guidelines

### Adding New Components
1. Use CSS custom properties for colors (no hardcoded values)
2. Add hover/active states with `transition: all 0.2s ease`
3. Ensure focus state is visible
4. Test in both light and dark modes
5. Verify WCAG AA contrast

### Theming New Elements
1. Define color in `:root` (light palette)
2. Override in `@media (prefers-color-scheme: dark)`
3. Add explicit theme selector if needed
4. Never put color-only definitions inside media queries

### Icon Integration
1. Add new SVG to `Icons` object in `assets/js/icons.js`
2. Use `icon()` function to inject with classes
3. Keep viewBox at 24×24
4. Use `currentColor` for color inheritance

---

## Future Enhancements

- [ ] Add `prefers-reduced-motion` media query support
- [ ] Implement CSS Grid for complex layouts
- [ ] Add loading state animations
- [ ] High contrast mode variant
- [ ] Custom scrollbar styling
- [ ] Viewport-based font scaling

---

**Last Updated**: 2026-09-02  
**Version**: 1.0  
**Status**: Active & Maintained
