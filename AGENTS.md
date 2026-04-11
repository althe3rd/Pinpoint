# Agent Orientation

This project's agent/AI orientation lives in **[CLAUDE.md](CLAUDE.md)** — read it first.

It covers:

- The dual shape of the project (bookmarklet + Chrome/Firefox/Safari extensions built from one source).
- Why **[accessibility-checker.js](accessibility-checker.js)** at the project root is the only source of truth for checker behavior, and a map of its ~9,300-line internals by functional area and line range.
- The `/* @bookmarklet-only-start */ ... /* @bookmarklet-only-end */` convention used to hide CDN/remote-code paths from the MV3 extension build.
- The build pipeline: [build.js](build.js) (bookmarklet + HTML embedding) and [build-extensions.js](build-extensions.js) (syncs source into [extension/chrome/](extension/chrome/) and [extension/firefox/](extension/firefox/), bundles axe-core and GSAP, packages zips).
- Where non-checker code lives (manifests, popups, test pages, docs).
- How to test changes (no automated suite — use [test-page.html](test-page.html) with `npm run watch`).

## Quick rules

- **Edit [accessibility-checker.js](accessibility-checker.js) at the root, never the copies** under [extension/chrome/](extension/chrome/) or [extension/firefox/](extension/firefox/). Those are overwritten on every extension build.
- **Panel CSS goes in [`getStyles`](accessibility-checker.js#L3754), panel markup in [`createPanel`](accessibility-checker.js#L3554)** — everything renders inside a Shadow DOM.
- **Keep the object-literal `methodName: function() {}` style.** Don't introduce classes or ES modules — it would break the bookmarklet packaging.
- **Escape all untrusted strings** with the `escapeHtml*` / `escapeJavaScript` helpers before interpolating into `innerHTML`.
- **Bump version in three places together**: [package.json](package.json), the `version` field at the top of [accessibility-checker.js](accessibility-checker.js), and both extension manifests ([extension/chrome/manifest.json](extension/chrome/manifest.json), [extension/firefox/manifest.json](extension/firefox/manifest.json)).
