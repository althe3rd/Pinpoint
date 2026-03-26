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
        'axe-core.min.js',
        'gsap.min.js',
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

function stripBookmarkletOnlyBlocks(content) {
    // Remove blocks marked as bookmarklet-only (CDN fallbacks not permitted in MV3 extensions)
    return content.replace(/\/\* @bookmarklet-only-start \*\/[\s\S]*?\/\* @bookmarklet-only-end \*\//g, '');
}

function syncAccessibilityCheckerSource() {
    try {
        const sourcePath = path.resolve('accessibility-checker.js');
        const chromeTarget = path.resolve('extension/chrome/accessibility-checker.js');
        const firefoxTarget = path.resolve('extension/firefox/accessibility-checker.js');

        if (!fs.existsSync(sourcePath)) {
            throw new Error('Source file accessibility-checker.js not found at project root');
        }

        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        const extensionContent = stripBookmarkletOnlyBlocks(sourceContent);

        fs.writeFileSync(chromeTarget, extensionContent);
        fs.writeFileSync(firefoxTarget, extensionContent);
        log('🔁 Synchronized accessibility-checker.js to extension/chrome/ and extension/firefox/ (CDN blocks stripped for MV3)', 'blue');
    } catch (error) {
        log(`❌ Error syncing accessibility-checker.js to extensions: ${error.message}`, 'red');
        throw error;
    }
}

function syncAxeCoreToExtensions() {
    try {
        const axeSourcePath = path.resolve('node_modules/axe-core/axe.min.js');
        const chromeTarget = path.resolve('extension/chrome/axe-core.min.js');
        const firefoxTarget = path.resolve('extension/firefox/axe-core.min.js');

        if (!fs.existsSync(axeSourcePath)) {
            throw new Error('axe-core not found in node_modules. Run npm install axe-core first.');
        }

        fs.copyFileSync(axeSourcePath, chromeTarget);
        fs.copyFileSync(axeSourcePath, firefoxTarget);
        log('📦 Bundled axe-core.min.js to extension/chrome/ and extension/firefox/', 'blue');
    } catch (error) {
        log(`❌ Error bundling axe-core to extensions: ${error.message}`, 'red');
        throw error;
    }
}

function syncGsapToExtensions() {
    try {
        const gsapSourcePath = path.resolve('node_modules/gsap/dist/gsap.min.js');
        const chromeTarget = path.resolve('extension/chrome/gsap.min.js');
        const firefoxTarget = path.resolve('extension/firefox/gsap.min.js');

        if (!fs.existsSync(gsapSourcePath)) {
            throw new Error('GSAP not found in node_modules. Run npm install gsap first.');
        }

        fs.copyFileSync(gsapSourcePath, chromeTarget);
        fs.copyFileSync(gsapSourcePath, firefoxTarget);
        log('🎬 Bundled gsap.min.js to extension/chrome/ and extension/firefox/', 'blue');
    } catch (error) {
        log(`❌ Error bundling GSAP to extensions: ${error.message}`, 'red');
        throw error;
    }
}

function syncIconsToExtensions() {
    try {
        const faviconDir = path.resolve('favicon_io');
        const chromeIconsDir = path.resolve('extension/chrome/icons');
        const firefoxIconsDir = path.resolve('extension/firefox/icons');
        
        if (!fs.existsSync(faviconDir)) {
            log('⚠️  favicon_io directory not found, skipping icon sync', 'yellow');
            return;
        }
        
        // Icon mapping: favicon_io filename -> extension icon filename
        const iconMapping = {
            'favicon-16x16.png': 'icon-16.png',
            'favicon-32x32.png': 'icon-32.png',
            'android-chrome-192x192.png': 'icon-48.png',  // Scale down 192x192 to 48x48 usage
            'android-chrome-512x512.png': 'icon-128.png'  // Scale down 512x512 to 128x128 usage
        };
        
        let syncedCount = 0;
        
        for (const [sourceIcon, targetIcon] of Object.entries(iconMapping)) {
            const sourcePath = path.join(faviconDir, sourceIcon);
            
            if (fs.existsSync(sourcePath)) {
                // Copy to Chrome extension
                const chromeTarget = path.join(chromeIconsDir, targetIcon);
                fs.copyFileSync(sourcePath, chromeTarget);
                
                // Copy to Firefox extension
                const firefoxTarget = path.join(firefoxIconsDir, targetIcon);
                fs.copyFileSync(sourcePath, firefoxTarget);
                
                syncedCount++;
            } else {
                log(`⚠️  Source icon not found: ${sourceIcon}`, 'yellow');
            }
        }
        
        if (syncedCount > 0) {
            log(`🎨 Synchronized ${syncedCount} icons from favicon_io/ to extensions`, 'blue');
        } else {
            log('⚠️  No icons were synchronized', 'yellow');
        }
        
    } catch (error) {
        log(`❌ Error syncing icons to extensions: ${error.message}`, 'red');
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

function createUnzippedChromeExtension(sourceDir, outputDir) {
    try {
        // Remove existing unzipped directory if it exists
        if (fs.existsSync(outputDir)) {
            execSync(`rm -rf "${outputDir}"`, { stdio: 'pipe' });
        }

        // Create the unzipped directory
        fs.mkdirSync(outputDir, { recursive: true });

        // Copy all files from source to unzipped directory
        execSync(`cp -R "${sourceDir}/"* "${outputDir}/"`, { stdio: 'pipe' });

        log(`📁 Created unzipped Chrome extension: ${outputDir}`, 'green');
        log(`   Load this folder in Chrome for development (chrome://extensions/)`, 'blue');
        
    } catch (error) {
        log(`❌ Error creating unzipped Chrome extension: ${error.message}`, 'red');
        throw error;
    }
}

function buildSafariExtension(isAppStoreReady = false) {
    try {
        const buildType = isAppStoreReady ? 'App Store ready Safari extension' : 'Safari extension';
        log(`🍎 Building ${buildType}...`, 'blue');
        
        const safariProjectDir = path.join(BUILD_DIR, 'safari-extension');
        const chromeExtensionDir = path.resolve('extension/chrome');
        
        // Clean up existing Safari project if it exists
        if (fs.existsSync(safariProjectDir)) {
            execSync(`rm -rf "${safariProjectDir}"`, { stdio: 'pipe' });
            log('🗑️  Cleaned up existing Safari project', 'blue');
        }
        
        // Check if xcrun is available (macOS only)
        try {
            execSync('which xcrun', { stdio: 'pipe' });
        } catch (error) {
            log('⚠️  Safari extension generation skipped: xcrun not available (macOS required)', 'yellow');
            return false;
        }
        
        // Generate Safari extension using Apple's converter
        const bundleId = isAppStoreReady ? 'com.pinpoint.accessibilitychecker' : 'com.pinpoint.accessibilitychecker.dev';
        
        const convertCommand = [
            'xcrun safari-web-extension-converter',
            `"${chromeExtensionDir}"`,
            `--project-location "${safariProjectDir}"`,
            `--app-name "Pinpoint Accessibility Checker"`,
            `--bundle-identifier "${bundleId}"`,
            '--swift',
            '--copy-resources',
            '--no-open',
            '--no-prompt',
            '--force'
        ].join(' ');
        
        execSync(convertCommand, { stdio: 'pipe' });
        
        if (isAppStoreReady) {
            // Configure for App Store submission
            configureAppStoreProject(safariProjectDir);
            // Update Xcode project version settings
            updateXcodeProjectVersions(safariProjectDir);
            // Update Safari extension manifest for App Store validation
            updateSafariExtensionManifest(safariProjectDir);
        }
        
        // Create a zip of the Safari project for easy distribution
        const safariZip = path.join(BUILD_DIR, `pinpoint-safari-v${VERSION}${isAppStoreReady ? '-appstore' : ''}.zip`);
        if (fs.existsSync(safariZip)) {
            fs.unlinkSync(safariZip);
        }
        
        execSync(`cd "${BUILD_DIR}" && zip -r "${path.basename(safariZip)}" safari-extension/`, {
            stdio: 'pipe'
        });
        
        log('✅ Safari extension generated successfully', 'green');
        log(`📱 Xcode project created at: ${safariProjectDir}`, 'blue');
        log(`📦 Safari project archive: ${safariZip}`, 'blue');
        
        if (isAppStoreReady) {
            log('🏪 App Store configuration applied', 'green');
            log('📋 Next steps for App Store submission:', 'blue');
            log('   1. Open the Xcode project', 'blue');
            log('   2. Select your development team in project settings', 'blue');
            log('   3. Archive the project (Product > Archive)', 'blue');
            log('   4. Submit to App Store Connect', 'blue');
        }
        
        return true;
        
    } catch (error) {
        log(`⚠️  Safari extension generation failed: ${error.message}`, 'yellow');
        log('   This is normal on non-macOS systems or if Xcode tools are not installed', 'yellow');
        return false;
    }
}

function configureAppStoreProject(safariProjectDir) {
    try {
        log('⚙️  Configuring project for App Store...', 'blue');
        
        const projectName = 'Pinpoint Accessibility Checker';
        
        // All Info.plist files that need version updates
        const plistFiles = [
            { path: path.join(safariProjectDir, projectName, 'iOS (App)', 'Info.plist'), type: 'iOS App' },
            { path: path.join(safariProjectDir, projectName, 'macOS (App)', 'Info.plist'), type: 'macOS App' },
            { path: path.join(safariProjectDir, projectName, 'iOS (Extension)', 'Info.plist'), type: 'iOS Extension' },
            { path: path.join(safariProjectDir, projectName, 'macOS (Extension)', 'Info.plist'), type: 'macOS Extension' }
        ];
        
        // Update all Info.plist files with consistent versioning
        plistFiles.forEach(({ path: plistPath, type }) => {
            if (fs.existsSync(plistPath)) {
                log(`📝 Updating ${type} Info.plist`, 'blue');
                
                // Base configuration for all plists
                const baseConfig = {
                    'CFBundleShortVersionString': VERSION,
                    'CFBundleVersion': VERSION
                };
                
                // Additional configuration based on type
                if (type.includes('App')) {
                    Object.assign(baseConfig, {
                        'CFBundleDisplayName': 'Pinpoint Accessibility Checker',
                        'NSHumanReadableCopyright': `© ${new Date().getFullYear()} Pinpoint Accessibility Checker. All rights reserved.`,
                        'ITSAppUsesNonExemptEncryption': false
                    });
                    
                    if (type === 'macOS App') {
                        Object.assign(baseConfig, {
                            'LSMinimumSystemVersion': '10.14',
                            'LSApplicationCategoryType': 'public.app-category.developer-tools'
                        });
                    }
                    
                    if (type === 'iOS App') {
                        Object.assign(baseConfig, {
                            'MinimumOSVersion': '14.0'
                        });
                    }
                }
                
                updateInfoPlist(plistPath, baseConfig);
            } else {
                log(`⚠️  ${type} Info.plist not found at ${plistPath}`, 'yellow');
            }
        });
        
        log('✅ App Store configuration completed', 'green');
        log(`📱 All components updated to version ${VERSION}`, 'blue');
        
    } catch (error) {
        log(`⚠️  App Store configuration warning: ${error.message}`, 'yellow');
    }
}

function updateInfoPlist(plistPath, updates) {
    try {
        // Read the plist file
        let plistContent = fs.readFileSync(plistPath, 'utf8');
        
        // Update each key-value pair
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'string' || typeof value === 'number') {
                // Look for existing key and replace its value
                const keyPattern = new RegExp(`(<key>${key}</key>\\s*<string>)[^<]*(<\\/string>)`, 'g');
                const keyPatternNumber = new RegExp(`(<key>${key}</key>\\s*<real>)[^<]*(<\\/real>)`, 'g');
                const keyPatternInteger = new RegExp(`(<key>${key}</key>\\s*<integer>)[^<]*(<\\/integer>)`, 'g');
                
                const replacement = `$1${value}$2`;
                
                if (plistContent.includes(`<key>${key}</key>`)) {
                    // Try different value types
                    if (plistContent.match(keyPattern)) {
                        plistContent = plistContent.replace(keyPattern, replacement);
                    } else if (plistContent.match(keyPatternNumber)) {
                        plistContent = plistContent.replace(keyPatternNumber, replacement);
                    } else if (plistContent.match(keyPatternInteger)) {
                        plistContent = plistContent.replace(keyPatternInteger, replacement);
                    } else {
                        // Generic replacement - find the key and replace the next value
                        const genericPattern = new RegExp(`(<key>${key}</key>\\s*<[^>]+>)[^<]*(<\\/[^>]+>)`, 'g');
                        plistContent = plistContent.replace(genericPattern, `<key>${key}</key>\n\t<string>${value}</string>`);
                    }
                } else {
                    // Add new key before closing </dict>
                    const dictClosePattern = /(\s*)<\/dict>(\s*<\/plist>)/;
                    plistContent = plistContent.replace(
                        dictClosePattern,
                        `$1\t<key>${key}</key>\n$1\t<string>${value}</string>\n$1</dict>$2`
                    );
                }
            } else if (typeof value === 'boolean') {
                // Handle boolean values
                const boolValue = value ? 'true' : 'false';
                if (plistContent.includes(`<key>${key}</key>`)) {
                    const boolPattern = new RegExp(`(<key>${key}</key>\\s*<)(true|false)(\\/?>)`, 'g');
                    plistContent = plistContent.replace(boolPattern, `$1${boolValue}$3`);
                } else {
                    const dictClosePattern = /(\s*)<\/dict>(\s*<\/plist>)/;
                    plistContent = plistContent.replace(
                        dictClosePattern,
                        `$1\t<key>${key}</key>\n$1\t<${boolValue}/>\n$1</dict>$2`
                    );
                }
            }
        }
        
        fs.writeFileSync(plistPath, plistContent);
        
    } catch (error) {
        log(`⚠️  Could not update ${path.basename(plistPath)}: ${error.message}`, 'yellow');
    }
}

function updateXcodeProjectVersions(safariProjectDir) {
    try {
        log('🔧 Updating Xcode project version settings...', 'blue');
        
        const projectName = 'Pinpoint Accessibility Checker';
        const projectFilePath = path.join(safariProjectDir, projectName, `${projectName}.xcodeproj`, 'project.pbxproj');
        
        if (!fs.existsSync(projectFilePath)) {
            log('⚠️  Xcode project file not found', 'yellow');
            return;
        }
        
        let projectContent = fs.readFileSync(projectFilePath, 'utf8');
        
        // Update MARKETING_VERSION (user-facing version)
        projectContent = projectContent.replace(
            /MARKETING_VERSION = [^;]+;/g,
            `MARKETING_VERSION = ${VERSION};`
        );
        
        // Update CURRENT_PROJECT_VERSION (build version)
        projectContent = projectContent.replace(
            /CURRENT_PROJECT_VERSION = [^;]+;/g,
            `CURRENT_PROJECT_VERSION = ${VERSION};`
        );
        
        fs.writeFileSync(projectFilePath, projectContent);
        
        log(`✅ Xcode project versions updated to ${VERSION}`, 'green');
        
    } catch (error) {
        log(`⚠️  Could not update Xcode project versions: ${error.message}`, 'yellow');
    }
}

function updateSafariExtensionManifest(safariProjectDir) {
    try {
        log('📝 Updating Safari extension manifest for App Store validation...', 'blue');
        
        const projectName = 'Pinpoint Accessibility Checker';
        const manifestPaths = [
            path.join(safariProjectDir, projectName, 'Shared (Extension)', 'Resources', 'manifest.json'),
            path.join(safariProjectDir, projectName, 'iOS (Extension)', 'Resources', 'manifest.json'),
            path.join(safariProjectDir, projectName, 'macOS (Extension)', 'Resources', 'manifest.json')
        ];
        
        // Safari-compliant description (112 characters or fewer)
        const safariDescription = "WCAG 2.1 AA accessibility testing powered by axe-core. Get detailed reports and recommendations.";
        
        // Verify the description length
        if (safariDescription.length > 112) {
            log(`⚠️  Warning: Description is ${safariDescription.length} characters, Safari limit is 112`, 'yellow');
        } else {
            log(`✅ Description length: ${safariDescription.length}/112 characters`, 'blue');
        }
        
        manifestPaths.forEach(manifestPath => {
            if (fs.existsSync(manifestPath)) {
                try {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    
                    // Update description for Safari validation
                    manifest.description = safariDescription;
                    
                    // Also ensure version is current
                    manifest.version = VERSION;
                    
                    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
                    log(`✅ Updated ${path.basename(path.dirname(manifestPath))} manifest`, 'blue');
                    
                } catch (error) {
                    log(`⚠️  Could not update ${manifestPath}: ${error.message}`, 'yellow');
                }
            }
        });
        
        log('✅ Safari extension manifests updated for App Store validation', 'green');
        
    } catch (error) {
        log(`⚠️  Could not update Safari extension manifests: ${error.message}`, 'yellow');
    }
}

function generateReadme() {
    const readmeContent = `# Pinpoint Accessibility Checker - Browser Extensions

This directory contains browser extension packages for the Pinpoint Accessibility Checker.

## Installation

### Chrome Extension

#### For Development:
1. Open Chrome and go to \`chrome://extensions/\`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the \`chrome-dev/\` folder
4. After making changes, run \`npm run build:extensions\` and click the reload button

#### For Distribution:
1. Use the \`pinpoint-chrome-v{version}.zip\` file
2. Upload to Chrome Web Store or install manually

### Firefox Extension
1. Open Firefox and go to \`about:debugging\`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the \`manifest.json\` file from the \`firefox\` folder
5. Or install the packaged \`.xpi\` file

### Safari Extension (macOS only)
1. Open the \`safari-extension/\` folder
2. Open the \`.xcodeproj\` file in Xcode
3. Build and run the project
4. Enable the extension in Safari preferences
5. Or use the pre-built project archive

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

To rebuild all extensions, run:
\`\`\`bash
npm run build:extensions
\`\`\`

For Safari only:
\`\`\`bash
npm run build:safari
\`\`\`

For Safari App Store submission:
\`\`\`bash
npm run build:safari:appstore
\`\`\`

## Development Workflow

1. **Setup**: Load \`extension-builds/chrome-dev/\` as an unpacked extension in Chrome
2. **Develop**: Make changes to your source files
3. **Test**: Run \`npm run build:extensions\` and click reload in Chrome
4. **Repeat**: The \`chrome-dev/\` folder is automatically updated each build

### Safari Extension Notes

- Safari extension generation requires macOS with Xcode command line tools
- The generated Xcode project can be opened and built in Xcode
- Safari extensions must be distributed through the Mac App Store for public release
- For development, you can load the extension directly from Xcode

### App Store Submission

For App Store submission, use the dedicated build command:
\`\`\`bash
npm run build:safari:appstore
\`\`\`

This creates an App Store ready project with:
- Proper bundle identifiers (production vs development)
- App Store metadata and copyright
- Minimum system requirements
- Security configurations
- Automated Info.plist updates

**Submission Steps:**
1. Run \`npm run build:safari:appstore\`
2. Open the generated Xcode project
3. Select your Apple Developer Team
4. Archive the project (Product > Archive)
5. Submit to App Store Connect

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
        
        // Always sync the shared checker source and icons into both extensions before packaging
        syncAccessibilityCheckerSource();
        syncAxeCoreToExtensions();
        syncGsapToExtensions();
        syncIconsToExtensions();

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
        const chromeUnzipped = path.join(BUILD_DIR, 'chrome-dev');
        
        createZipPackage(chromeDir, chromeZip);
        createZipPackage(firefoxDir, firefoxZip);
        
        // Create unzipped Chrome extension for development
        createUnzippedChromeExtension(chromeDir, chromeUnzipped);
        
        // Build Safari extension (macOS only)
        const safariSuccess = buildSafariExtension();
        
        // Generate documentation
        generateReadme();
        
        log('🎉 Build completed successfully!', 'green');
        log(`📦 Packages created in ${BUILD_DIR}/`, 'blue');
        log(`   - ${path.basename(chromeZip)} (Chrome - for Web Store)`, 'blue');
        log(`   - chrome-dev/ (Chrome - for development)`, 'blue');
        log(`   - ${path.basename(firefoxZip)} (Firefox)`, 'blue');
        
        if (safariSuccess) {
            const safariZip = `pinpoint-safari-v${VERSION}.zip`;
            log(`   - ${safariZip} (Safari - Xcode project)`, 'blue');
        }
        
        log(``, 'reset');
        log(`🔧 Development workflow:`, 'green');
        log(`   1. Open chrome://extensions/ in Chrome`, 'blue');
        log(`   2. Load unpacked extension from: ${BUILD_DIR}/chrome-dev/`, 'blue');
        log(`   3. After changes, run 'npm run build:extensions' and click reload`, 'blue');
        
    } catch (error) {
        log(`💥 Build failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

function buildSafariOnly() {
    log('🍎 Building Safari extension only...', 'green');
    log(`📋 Version: ${VERSION}`, 'blue');
    
    try {
        // Ensure build directory exists
        ensureDirectoryExists(BUILD_DIR);
        
        // Sync the shared checker source and icons to Chrome extension (Safari uses Chrome version)
        syncAccessibilityCheckerSource();
        syncAxeCoreToExtensions();
        syncGsapToExtensions();
        syncIconsToExtensions();
        
        // Update Chrome manifest version (Safari uses this as source)
        const chromeDir = 'extension/chrome';
        updateManifestVersion(path.join(chromeDir, 'manifest.json'));
        
        // Create unzipped Chrome extension for development  
        const chromeUnzipped = path.join(BUILD_DIR, 'chrome-dev');
        createUnzippedChromeExtension(chromeDir, chromeUnzipped);
        
        // Build Safari extension
        const safariSuccess = buildSafariExtension();
        
        if (safariSuccess) {
            log('🎉 Safari extension build completed successfully!', 'green');
            const safariZip = `pinpoint-safari-v${VERSION}.zip`;
            log(`📦 Safari project archive: ${safariZip}`, 'blue');
        } else {
            log('❌ Safari extension build failed', 'red');
            process.exit(1);
        }
        
    } catch (error) {
        log(`💥 Safari build failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

function buildSafariAppStore() {
    log('🏪 Building Safari extension for App Store submission...', 'green');
    log(`📋 Version: ${VERSION}`, 'blue');
    
    try {
        // Ensure build directory exists
        ensureDirectoryExists(BUILD_DIR);
        
        // Sync the shared checker source and icons to Chrome extension (Safari uses Chrome version)
        syncAccessibilityCheckerSource();
        syncAxeCoreToExtensions();
        syncGsapToExtensions();
        syncIconsToExtensions();
        
        // Update Chrome manifest version (Safari uses this as source)
        const chromeDir = 'extension/chrome';
        updateManifestVersion(path.join(chromeDir, 'manifest.json'));
        
        // Build Safari extension with App Store configuration
        const safariSuccess = buildSafariExtension(true);
        
        if (safariSuccess) {
            log('🎉 App Store ready Safari extension build completed successfully!', 'green');
            const safariZip = `pinpoint-safari-v${VERSION}-appstore.zip`;
            log(`📦 App Store project archive: ${safariZip}`, 'blue');
        } else {
            log('❌ Safari App Store build failed', 'red');
            process.exit(1);
        }
        
    } catch (error) {
        log(`💥 Safari App Store build failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, buildSafariExtension, buildSafariOnly, buildSafariAppStore };