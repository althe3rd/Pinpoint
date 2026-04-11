# Pinpoint — Orientation for AI Agents

Pinpoint Accessibility Checker ships in **two forms from a single source of truth**:

1. **Bookmarklet** — minified and embedded into [index.html](index.html) / [test-page.html](test-page.html)
2. **Browser extensions** — Chrome (MV3), Firefox (MV2), and Safari, built from [extension/](extension/)

Both forms run the same checker code. **Always edit the root source file, never the copies.**

## The one file that matters

> **[accessibility-checker.js](accessibility-checker.js)** is the primary source code.
> Everything the user interacts with — the sidebar panel, the scan engine, the score, the visualizations, the settings, the help, the picker — lives inside this ~9,300-line IIFE that exposes `window.uwAccessibilityChecker`.

If you are editing *behavior*, you are almost certainly editing this file. The copies under [extension/chrome/accessibility-checker.js](extension/chrome/accessibility-checker.js) and [extension/firefox/accessibility-checker.js](extension/firefox/accessibility-checker.js) are **overwritten on every extension build** — do not edit them directly.

### Map of accessibility-checker.js

Line numbers drift as the file grows; use them as a starting point and then search for the method name.

| Area | Approx. lines | Key methods |
|---|---|---|
| Init, Shadow DOM setup, loading panel | 1–150 | [`init`](accessibility-checker.js#L35), [`setupShadowDOM`](accessibility-checker.js#L43), [`showLoadingPanel`](accessibility-checker.js#L82) |
| Loading axe-core (extension bundle vs CDN) | 108–180 | [`loadAxeCore`](accessibility-checker.js#L108), [`tryLoadAxeFromExtension`](accessibility-checker.js#L143), [`loadAxeFromCDN`](accessibility-checker.js#L165) |
| Running scans (axe + best-practice checks) | 180–608 | [`runAxeChecks`](accessibility-checker.js#L180), [`runBestPracticeChecks`](accessibility-checker.js#L226) |
| Processing axe results into issue model | 609–970 | [`processAxeResults`](accessibility-checker.js#L609), [`buildDescription`](accessibility-checker.js#L751), [`buildRecommendation`](accessibility-checker.js#L767) |
| Manual-review & actionable recommendations | 973–1165 | [`getManualReviewRecommendations`](accessibility-checker.js#L973), [`getActionableRecommendations`](accessibility-checker.js#L1034) |
| Color contrast analysis (pixel + DOM sampling, gradients) | 1343–2455 | [`extractColorContrastInfo`](accessibility-checker.js#L1343), [`analyzeElementPixels`](accessibility-checker.js#L1654), [`analyzeGradientBackground`](accessibility-checker.js#L2105), [`shouldSkipContrastViolation`](accessibility-checker.js#L2346) |
| Focus-indicator visualization | 2472–2680 | [`toggleFocusIndicatorsVisualization`](accessibility-checker.js#L2472) |
| Landmark & heading structure visualization | 2683–3290 | [`toggleLandmarkStructureVisualization`](accessibility-checker.js#L2683), [`detectLandmarks`](accessibility-checker.js#L2825), [`detectHeadings`](accessibility-checker.js#L2864) |
| Scoring | 3318–3470 | [`calculateAccessibilityScore`](accessibility-checker.js#L3318), [`showScoreExplanation`](accessibility-checker.js#L3490) |
| Panel DOM construction | 3554–3753 | [`createPanel`](accessibility-checker.js#L3554) |
| **All panel CSS** (large block — single template literal) | 3754–5540 | [`getStyles`](accessibility-checker.js#L3754) |
| GSAP loading + panel animation / view transitions | 5541–6000 | [`loadGSAP`](accessibility-checker.js#L5546), [`animatePanel`](accessibility-checker.js#L5756), [`animateViewTransition`](accessibility-checker.js#L5932) |
| Navigation between views (results / settings / help / inspector) | 6000–6113 | [`initNavigation`](accessibility-checker.js#L6000), [`showView`](accessibility-checker.js#L6029) |
| Scope filters (include/exclude selectors, WCAG level) | 6114–6268 | [`getEffectiveExcludeSelectors`](accessibility-checker.js#L6155), [`buildAxeContext`](accessibility-checker.js#L6178), [`buildWcagTags`](accessibility-checker.js#L6234) |
| Inspector tools (outline, tab order viz) | 6269–6900 | [`initInspectorTools`](accessibility-checker.js#L6269), [`toggleOutlineView`](accessibility-checker.js#L6308), [`toggleTabOrderVisualization`](accessibility-checker.js#L6440) |
| Settings UI rendering | 6903–7270 | [`renderSettings`](accessibility-checker.js#L6915), [`resetSettingsToDefaults`](accessibility-checker.js#L6903) |
| Help content + rendering | 7277–7725 | [`getHelpTopics`](accessibility-checker.js#L7277), [`renderHelp`](accessibility-checker.js#L7596) |
| Element picker (click-to-scope) | 7726–8020 | [`startPickerMode`](accessibility-checker.js#L7726), [`generateSelectorForElement`](accessibility-checker.js#L7897) |
| Filters (errors/warnings/info) & issue dismissal | 8029–8215 | [`toggleFilter`](accessibility-checker.js#L8043), [`dismissIssue`](accessibility-checker.js#L8166) |
| Results display, score dial animation, grouping | 8216–8873 | [`displayResults`](accessibility-checker.js#L8311), [`renderScoreDial`](accessibility-checker.js#L8513), [`startResultsScoreAnimation`](accessibility-checker.js#L8570), [`groupIssuesByRule`](accessibility-checker.js#L8681), [`highlightCurrentInstance`](accessibility-checker.js#L8752) |
| Manual-verification tracking, score recalculation | 8874–9093 | [`toggleRuleVerification`](accessibility-checker.js#L8886), [`toggleManualCheck`](accessibility-checker.js#L8969), [`updateScore`](accessibility-checker.js#L8997) |
| Update check, minimize state, teardown | 9054–9330 | [`checkForUpdates`](accessibility-checker.js#L9094), [`toggleMinimize`](accessibility-checker.js#L9054), [`remove`](accessibility-checker.js#L9259) |

### Conventions inside accessibility-checker.js

- **Single IIFE, single global**: `window.uwAccessibilityChecker`. Re-running the bookmarklet on a page where it already exists will call `remove()` and exit.
- **Shadow DOM isolation**: all UI lives inside `this.shadowRoot`. Global styles (for the highlight-on-click behavior) are injected into the host document separately. When adding new panel UI, put CSS in [`getStyles`](accessibility-checker.js#L3754) and markup in [`createPanel`](accessibility-checker.js#L3554).
- **Object-literal style**: everything is `methodName: function() { ... }` attached to the checker object. Use `this.` for all internal calls. Don't introduce classes or modules — it would break the minifier/bookmarklet packaging.
- **Bookmarklet-only blocks**: code wrapped in `/* @bookmarklet-only-start */ ... /* @bookmarklet-only-end */` is **stripped** by the extension build (see [build-extensions.js:67](build-extensions.js#L67)). Use these markers for any CDN fallback, remote fetch, or other code that violates MV3 CSP.
- **Version string**: `version: '1.6.3'` near the top must stay in sync with [package.json](package.json). The update-check logic ([`checkForUpdates`](accessibility-checker.js#L9094)) compares against a remote manifest.
- **Persistence**: settings, manual-check state, dismissed issues, minimize state, and filter state all live in `localStorage` under `uw-a11y-*` keys.
- **Escaping**: untrusted strings going into the panel must use [`escapeHtmlContent`](accessibility-checker.js#L826) / [`escapeHtmlAttribute`](accessibility-checker.js#L815) / [`escapeJavaScript`](accessibility-checker.js#L841). There is a lot of `innerHTML` in this file — don't regress this.

## Build pipeline

### Bookmarklet build — [build.js](build.js)

```bash
npm run build         # one-shot build
npm run watch         # rebuild on save (recommended during development)
```

1. Minifies [accessibility-checker.js](accessibility-checker.js) with terser (mangle + dead-code elim, `drop_console: false`).
2. Writes [accessibility-checker.min.js](accessibility-checker.min.js).
3. Rewrites the `const bookmarkletCode = \`...\`;` template literal inside [index.html](index.html). The replacement walks the file respecting backslash escapes so `\`` inside the minified code doesn't prematurely close the template — do not simplify that parser.
4. Same rewrite for `const testBookmarkletCode` inside [test-page.html](test-page.html).

### Extension build — [build-extensions.js](build-extensions.js)

```bash
npm run build:extensions          # Chrome + Firefox + Safari
npm run build:safari              # Safari only
npm run build:safari:appstore     # Safari (App Store variant)
```

1. Copies root [accessibility-checker.js](accessibility-checker.js) into both [extension/chrome/](extension/chrome/) and [extension/firefox/](extension/firefox/), **stripping `@bookmarklet-only` blocks** on the way ([build-extensions.js:72](build-extensions.js#L72)).
2. Bundles `node_modules/axe-core/axe.min.js` and `node_modules/gsap/dist/gsap.min.js` into each extension dir (MV3 disallows remote code).
3. Packages zipped artifacts into [extension-builds/](extension-builds/) named by version.

**Version bumps:** update [package.json](package.json) `version`, the `version` field at the top of [accessibility-checker.js](accessibility-checker.js), and the `version` in [extension/chrome/manifest.json](extension/chrome/manifest.json) and [extension/firefox/manifest.json](extension/firefox/manifest.json) together.

## Where to find things (non-checker code)

| What | Where |
|---|---|
| Bookmarklet landing page + the actual draggable bookmarklet link | [index.html](index.html) |
| Dev test page with embedded "run latest" button | [test-page.html](test-page.html) |
| Standalone contrast/image-contrast test fixtures | [contrast-test.html](contrast-test.html), [image-contrast-test.html](image-contrast-test.html) |
| Chrome manifest, popup, background, content script | [extension/chrome/](extension/chrome/) |
| Firefox manifest (MV2), popup, background, content script | [extension/firefox/](extension/firefox/) |
| Packaged extension artifacts | [extension-builds/](extension-builds/) |
| MV3 remote-code compliance notes | [MANIFEST_V3_FIX.md](MANIFEST_V3_FIX.md) |
| Extension usage + publishing guide | [BROWSER-EXTENSIONS.md](BROWSER-EXTENSIONS.md) |
| Bookmarklet development workflow | [DEVELOPMENT.md](DEVELOPMENT.md) |
| User-facing project README | [README.md](README.md) |

> [enhanced-bookmarklet.js](enhanced-bookmarklet.js) at the project root is an empty placeholder — ignore it.

## Dependencies

- **axe-core** (`^4.10.3`) — the actual WCAG rule engine. Bundled into extensions; loaded from CDN in the bookmarklet unless the extension environment already provided it.
- **gsap** (`^3.13.0`) — panel animations and view transitions. Same dual-load pattern as axe-core. Falls back gracefully if load fails.
- **terser** (dev) — minification.
- **chokidar** (dev) — `npm run watch` file watching.

## Testing changes

There is no automated test suite. The workflow is:

1. `npm run watch` in one terminal.
2. Open [test-page.html](test-page.html) in a browser (it has seeded WCAG violations across severity levels).
3. Click **"Test Latest Bookmarklet"** on the page; this uses the freshly-rebuilt minified code.
4. For extension changes, load unpacked from [extension/chrome/](extension/chrome/) or [extension/firefox/](extension/firefox/) after running `npm run build:extensions`.

When you change scoring, contrast logic, or rule filtering, **also sanity-check on a real site** — the test page is comprehensive but synthetic.
