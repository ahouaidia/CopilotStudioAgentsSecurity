# Copilot Studio Agents Security — Workshop Website

## Project Overview
Single-page static HTML/CSS/JS website for a "Copilot Studio Agents Security" workshop. No build step, no package manager — purely CDN-based.

## Tech Stack
- **HTML5** — Semantic sections, data attributes for interactivity
- **CSS3** — Custom properties, keyframe animations, backdrop-filter glassmorphism
- **Tailwind CSS** — Play CDN (extended with brand colors in `<script>` config block)
- **Vanilla JavaScript (ES6)** — No framework, no modules
- **Cytoscape.js** v3.29.2 + Dagre — Interactive data flow graph
- **Lucide Icons** — SVG icons via `data-lucide` attributes (call `lucide.createIcons()` after DOM updates)
- **Google Fonts** — Libre Baskerville (headings), Montserrat (body)
- **WebGL** — Canvas shader for hero energy background

## File Structure
```
index.html          # Single-page site (all sections)
css/styles.css      # All custom styles, variables, animations
js/app.js           # All interactivity (~2600+ lines)
assets/             # Images (logos, diagrams, photos)
_reference/         # Design reference (gitignored, not part of deliverable)
```

## Brand Colors (CSS Custom Properties)
```css
--brand-black:     #212129
--brand-grey:      #E7E7E7
--brand-gold:      #9D833E
--brand-blue:      #16ABE0
--brand-pink:      #D93D7A
--brand-turquoise: #00B0A3
--brand-purple:    #7B5EA7
```

## Key Conventions

### CSS
- CSS custom properties (`--brand-*`, `--bg-*`, `--text-*`) for all design tokens
- BEM-like hyphenated naming: `.hero-section`, `.hub-container`, `.detail-panel`, `.dataflow-*`
- Tailwind utility classes mixed in HTML for layout (`max-w-6xl`, `mx-auto`, `px-6`)
- Keyframe animations for entrances, glows, pulses, sweeps
- Dark cybersecurity aesthetic: dark backgrounds, glow effects, glassmorphism

### JavaScript
- **Procedural/functional** — no classes, no modules
- `init*()` pattern: each feature has its own `initFeatureName()` function
- All init functions called sequentially in `DOMContentLoaded`
- `IntersectionObserver` for scroll-triggered animations
- `requestAnimationFrame` for canvas animations (shader, particles)
- Data-driven rendering via template literals + `innerHTML`
- After injecting HTML with Lucide icons, always call `lucide.createIcons()`

### HTML
- Sections use `id` attributes for anchor navigation (`#anatomy`, `#top10-risks`, etc.)
- Interactive elements use `data-*` attributes (`data-component`, `data-step`, `data-target`)
- Icons: `<i data-lucide="icon-name" class="w-5 h-5"></i>`

## Sections
1. **Hero** — WebGL energy shader background, animated stats
2. **Anatomy** — Hub-spoke diagram, 6 components with detail panels, attack chain simulation
3. **Top 10 Risks** — Risk list with severity spectrum
4. **Playbook** — Filterable mitigation recommendations
5. **Data Flow / Threat Modeling** — Cytoscape graph with flip-card to threat modeling view (canvas particle network)
6. **Defenses** — (in progress)
7. **Labs** — (in progress)

## Development
- **No build step** — Open `index.html` directly in browser
- **No tests** — Visual verification only
- **Git** — Push to `master` branch on GitHub (ahouaidia/CopilotStudioAgentsSecurity)

## Important Patterns
- The Cytoscape data flow diagram has a flip-card interaction: clicking "Threat Modeling" flips to show a canvas-based animated particle network (adapted from the Oversharing-Public project's hero section)
- Canvas animations (hero shader, hub particles, threat modeling particles) use their own `init*()` functions and `requestAnimationFrame` loops
- The `_reference/` directory contains a cloned design reference project — it is gitignored and should not be modified
