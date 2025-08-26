#!/usr/bin/env node

/**
 * Build script for Pinpoint Accessibility Checker Browser Extensions
 * Creates ZIP packages for Chrome and Firefox from the extension directories
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION = require('./package.json').version;
const BUILD_DIR = 'extension-builds';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`📁 Created directory: ${dir}`, 'blue');
    }
}

function validateExtensionFiles(extensionDir) {
    const requiredFiles = [
        'manifest.json',
        'content-script.js',
        'popup.html',
        'popup.css',
        'popup.js',
        'background.js',
        'accessibility-checker.js',
        'icons/icon-16.png',
        'icons/icon-32.png',
        'icons/icon-48.png',
        'icons/icon-128.png'
    ];

    const missingFiles = requiredFiles.filter(file => {
        const filePath = path.join(extensionDir, file);
        return !fs.existsSync(filePath);
    });

    if (missingFiles.length > 0) {
        log(`❌ Missing files in ${extensionDir}:`, 'red');
        missingFiles.forEach(file => log(`   - ${file}`, 'red'));
        return false;
    }

    log(`✅ All required files present in ${extensionDir}`, 'green');
    return true;
}

function syncAccessibilityCheckerSource() {
    try {
        const sourcePath = path.resolve('accessibility-checker.js');
        const chromeTarget = path.resolve('extension/chrome/accessibility-checker.js');
        const firefoxTarget = path.resolve('extension/firefox/accessibility-checker.js');

        if (!fs.existsSync(sourcePath)) {
            throw new Error('Source file accessibility-checker.js not found at project root');
        }

        fs.copyFileSync(sourcePath, chromeTarget);
        fs.copyFileSync(sourcePath, firefoxTarget);
        log('🔁 Synchronized accessibility-checker.js to extension/chrome/ and extension/firefox/', 'blue');
    } catch (error) {
        log(`❌ Error syncing accessibility-checker.js to extensions: ${error.message}`, 'red');
        throw error;
    }
}

function updateManifestVersion(manifestPath) {
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        manifest.version = VERSION;
        
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        log(`📝 Updated version to ${VERSION} in ${manifestPath}`, 'blue');
    } catch (error) {
        log(`❌ Error updating manifest version: ${error.message}`, 'red');
        throw error;
    }
}

function createZipPackage(sourceDir, outputPath) {
    try {
        // Remove existing zip if it exists
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }

        // Create zip using native tools
        const isWindows = process.platform === 'win32';
        const absoluteOutputPath = path.resolve(outputPath);
        const absoluteSourceDir = path.resolve(sourceDir);
        
        if (isWindows) {
            // Use PowerShell on Windows
            execSync(`powershell Compress-Archive -Path "${absoluteSourceDir}\\*" -DestinationPath "${absoluteOutputPath}"`, {
                stdio: 'pipe'
            });
        } else {
            // Use zip command on Unix-like systems
            execSync(`cd "${absoluteSourceDir}" && zip -r "${absoluteOutputPath}" .`, {
                stdio: 'pipe'
            });
        }

        log(`📦 Created package: ${outputPath}`, 'green');
        
        // Get file size
        const stats = fs.statSync(outputPath);
        const fileSizeInKB = Math.round(stats.size / 1024);
        log(`   Size: ${fileSizeInKB} KB`, 'blue');
        
    } catch (error) {
        log(`❌ Error creating zip package: ${error.message}`, 'red');
        throw error;
    }
}

function generateReadme() {
    const readmeContent = `# Pinpoint Accessibility Checker - Browser Extensions

This directory contains browser extension packages for the Pinpoint Accessibility Checker.

## Installation

### Chrome Extension
1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the \`chrome\` folder
4. Or install the packaged \`.zip\` file

### Firefox Extension
1. Open Firefox and go to \`about:debugging\`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the \`manifest.json\` file from the \`firefox\` folder
5. Or install the packaged \`.xpi\` file

## Usage

1. Click the Pinpoint icon in your browser toolbar
2. Click "Run Accessibility Check" 
3. Or use the keyboard shortcut: \`Ctrl+Shift+A\` (Windows/Linux) or \`Cmd+Shift+A\` (Mac)

## Features

- **WCAG 2.1 AA Testing**: Comprehensive accessibility analysis
- **Axe-core Powered**: Uses the industry-standard testing engine
- **Accessibility Score**: Get a 0-100 score for your page
- **Detailed Reports**: Technical information and actionable recommendations
- **Manual Review Support**: Track verification of items needing human review

## Version

Current version: ${VERSION}

## Building

To rebuild the extensions, run:
\`\`\`bash
npm run build:extensions
\`\`\`

## Support

- **Website**: https://althe3rd.github.io/Pinpoint/
- **GitHub**: https://github.com/althe3rd/Pinpoint
- **Issues**: Report bugs and feature requests on GitHub

Built with ❤️ for accessibility testing.
`;

    const readmePath = path.join(BUILD_DIR, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    log(`📝 Generated README.md`, 'blue');
}

function main() {
    log('🚀 Building Pinpoint Browser Extensions', 'green');
    log(`📋 Version: ${VERSION}`, 'blue');
    
    try {
        // Ensure build directory exists
        ensureDirectoryExists(BUILD_DIR);
        
        // Always sync the shared checker source into both extensions before packaging
        syncAccessibilityCheckerSource();

        // Validate extension directories
        const chromeDir = 'extension/chrome';
        const firefoxDir = 'extension/firefox';
        
        if (!validateExtensionFiles(chromeDir) || !validateExtensionFiles(firefoxDir)) {
            process.exit(1);
        }
        
        // Update manifest versions
        updateManifestVersion(path.join(chromeDir, 'manifest.json'));
        updateManifestVersion(path.join(firefoxDir, 'manifest.json'));
        
        // Create packages
        const chromeZip = path.join(BUILD_DIR, `pinpoint-chrome-v${VERSION}.zip`);
        const firefoxZip = path.join(BUILD_DIR, `pinpoint-firefox-v${VERSION}.xpi`);
        
        createZipPackage(chromeDir, chromeZip);
        createZipPackage(firefoxDir, firefoxZip);
        
        // Generate documentation
        generateReadme();
        
        log('🎉 Build completed successfully!', 'green');
        log(`📦 Packages created in ${BUILD_DIR}/`, 'blue');
        log(`   - ${path.basename(chromeZip)} (Chrome)`, 'blue');
        log(`   - ${path.basename(firefoxZip)} (Firefox)`, 'blue');
        
    } catch (error) {
        log(`💥 Build failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };