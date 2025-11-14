# Third-Party Libraries Documentation

This document provides information about third-party libraries included in the Pinpoint Accessibility Checker browser extension.

## Libraries Included

### 1. axe-core (v4.10.3)

**Purpose**: Accessibility testing engine that powers the automated WCAG 2.1 AA compliance checks.

**Source Information**:
- **npm Package**: `axe-core@4.10.3`
- **npm Registry**: https://www.npmjs.com/package/axe-core/v/4.10.3
- **Official GitHub**: https://github.com/dequelabs/axe-core
- **GitHub Release**: https://github.com/dequelabs/axe-core/releases/tag/v4.10.3
- **Maintainer**: Deque Systems, Inc.
- **License**: Mozilla Public License 2.0 (MPL 2.0)

**File in Extension**: `axe-core.min.js`

**Build Process**:
- Installed via npm: `npm install axe-core@4.10.3`
- Copied from: `node_modules/axe-core/axe.min.js`
- Build script location: `build-extensions.js` (lines 136-152)
- No modifications made to the original file

**Verification**:
```bash
# The file header contains version and copyright information:
# /*! axe v4.10.3
# * Copyright (c) 2015 - 2025 Deque Systems, Inc.
```

### 2. GSAP (GreenSock Animation Platform) (v3.13.0)

**Purpose**: Animation library used for smooth UI animations and transitions in the accessibility checker panel.

**Source Information**:
- **npm Package**: `gsap@3.13.0`
- **npm Registry**: https://www.npmjs.com/package/gsap/v/3.13.0
- **Official Website**: https://gsap.com/
- **Official GitHub**: https://github.com/greensock/GSAP
- **Maintainer**: GreenSock, Inc.
- **License**: GreenSock Standard License (free for common use, see https://gsap.com/standard-license)

**File in Extension**: `gsap.min.js`

**Build Process**:
- Installed via npm: `npm install gsap@3.13.0`
- Copied from: `node_modules/gsap/dist/gsap.min.js`
- Build script location: `build-extensions.js` (lines 155-171)
- No modifications made to the original file

**Verification**:
```bash
# The file header contains version and copyright information:
# /*!
# * GSAP 3.13.0
# * https://gsap.com
# * @license Copyright 2025, GreenSock. All rights reserved.
```

## Build Process

Our automated build process ensures that all third-party libraries are:
1. Obtained from official npm registry packages
2. Copied directly without any modifications
3. Include original copyright headers and version information

**Build Command**: `npm run build:extensions`

**Build Script**: `build-extensions.js`

The build script performs the following steps:
1. Reads package.json for version requirements
2. Copies files directly from node_modules
3. Bundles them into the extension package
4. Validates all required files are present

## Version Management

All library versions are locked in `package.json`:
```json
{
  "dependencies": {
    "axe-core": "^4.10.3",
    "gsap": "^3.13.0"
  }
}
```

## Content Security Policy

The extension uses a strict Content Security Policy that only allows locally bundled scripts:
```json
"content_security_policy": "script-src 'self'; object-src 'self';"
```

No external CDN resources are loaded by the extension. All dependencies are bundled locally.

## Updates

When updating third-party libraries:
1. Update version in `package.json`
2. Run `npm install` to download from official source
3. Run `npm run build:extensions` to rebuild extension packages
4. Test thoroughly before submission

## Contact

For questions about third-party library usage in this extension:
- **GitHub Issues**: https://github.com/althe3rd/Pinpoint/issues
- **Project Repository**: https://github.com/althe3rd/Pinpoint

---

*Last Updated: November 14, 2025 (Extension v1.5.77)*

