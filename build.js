const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function buildBookmarklet() {
    try {
        console.log('🔨 Building bookmarklet...');
        
        // Read the source file
        const sourceCode = fs.readFileSync('accessibility-checker.js', 'utf8');
        console.log('📖 Read accessibility-checker.js');
        
        // Minify the code with aggressive whitespace removal
        const minifyResult = await minify(sourceCode, {
            compress: {
                dead_code: true,
                drop_console: false, // Keep console.log for debugging
                drop_debugger: true,
                keep_fargs: false,
                unused: true,
                sequences: true,
                conditionals: true,
                booleans: true,
                loops: true,
                unsafe: false,
                pure_getters: true,
                unsafe_comps: true
            },
            mangle: {
                toplevel: true
            },
            format: {
                comments: false,
                beautify: false,
                indent_level: 0,
                semicolons: true
            }
        });
        
        if (minifyResult.error) {
            throw minifyResult.error;
        }
        
        const minifiedCode = minifyResult.code;
        console.log(`📦 Minified: ${sourceCode.length} → ${minifiedCode.length} chars (${Math.round((1 - minifiedCode.length/sourceCode.length) * 100)}% reduction)`);
        
        // Verify minified code is complete
        if (!minifiedCode || minifiedCode.length < 1000) {
            throw new Error('Minified code seems too short or empty');
        }
        
        // Update accessibility-checker.min.js
        fs.writeFileSync('accessibility-checker.min.js', minifiedCode);
        console.log('✅ Updated accessibility-checker.min.js');
        
        // Update index.html
        updateIndexHtml(minifiedCode);
        console.log('✅ Updated index.html');
        
        // Update test-page.html
        updateTestPage(minifiedCode);
        console.log('✅ Updated test-page.html');
        
        console.log('🎉 Build complete!');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

function updateIndexHtml(minifiedCode) {
    const indexPath = 'index.html';
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    console.log(`🔍 Original minified code length: ${minifiedCode.length}`);
    
    // Clean and escape the minified code for safe embedding in a JavaScript string
    const escapedCode = minifiedCode
        .replace(/\r?\n/g, '')   // Remove all newlines FIRST
        .replace(/\r/g, '')      // Remove carriage returns
        .replace(/\s+/g, ' ')    // Replace multiple whitespace with single space
        .trim()                  // Remove leading/trailing whitespace
        .replace(/\\/g, '\\\\')  // Escape backslashes
        .replace(/`/g, '\\`')    // Escape backticks
        .replace(/\$/g, '\\$');  // Escape dollar signs (for template literals)
    
    console.log(`🔍 Escaped code length: ${escapedCode.length}`);

    const newBookmarkletCode = `const bookmarkletCode = \`${escapedCode}\`;`;
    console.log(`🔍 Replacement code length: ${newBookmarkletCode.length}`);

    // Find the bookmarkletCode declaration and locate its end while respecting
    // backslash escape sequences (so escaped backticks \` inside the template
    // literal don't get misread as a closing delimiter).
    const startMarker = 'const bookmarkletCode = `';
    const startIndex = indexContent.indexOf(startMarker);
    if (startIndex === -1) {
        throw new Error('Could not find bookmarkletCode variable start in index.html');
    }

    let i = startIndex + startMarker.length;
    let endIndex = -1;
    while (i < indexContent.length) {
        const ch = indexContent[i];
        if (ch === '\\') {
            // Skip the next character entirely (handles \`, \\, \$, etc.)
            i += 2;
            continue;
        }
        if (ch === '`') {
            // Found the unescaped closing backtick; expect `;` after it
            if (indexContent[i + 1] === ';') {
                endIndex = i + 2;
            } else {
                endIndex = i + 1;
            }
            break;
        }
        i++;
    }

    if (endIndex === -1) {
        throw new Error('Could not find bookmarkletCode variable end in index.html');
    }

    const beforeCode = indexContent.substring(0, startIndex);
    const afterCode = indexContent.substring(endIndex);
    const originalLength = indexContent.length;
    indexContent = beforeCode + newBookmarkletCode + afterCode;
    console.log(`🔍 HTML file length change: ${originalLength} → ${indexContent.length}`);

    fs.writeFileSync(indexPath, indexContent, 'utf8');
}

function updateTestPage(minifiedCode) {
    const testPagePath = 'test-page.html';
    
    // Check if test page exists
    if (!fs.existsSync(testPagePath)) {
        console.log('⚠️ test-page.html not found, skipping update');
        return;
    }
    
    let testPageContent = fs.readFileSync(testPagePath, 'utf8');
    
    // Clean and escape the minified code for safe embedding
    const escapedCode = minifiedCode
        .replace(/\r?\n/g, '')   // Remove all newlines FIRST
        .replace(/\r/g, '')      // Remove carriage returns
        .replace(/\s+/g, ' ')    // Replace multiple whitespace with single space
        .trim()                  // Remove leading/trailing whitespace
        .replace(/\\/g, '\\\\')  // Escape backslashes
        .replace(/`/g, '\\`')    // Escape backticks
        .replace(/\$/g, '\\$');  // Escape dollar signs (for template literals)
    
    const newTestBookmarkletCode = `const testBookmarkletCode = \`${escapedCode}\`;`;

    // Locate the existing testBookmarkletCode declaration, walking the string
    // while respecting backslash escape sequences (so \` and \\ inside the
    // template literal are not misread as a closing delimiter).
    const startMarker = 'const testBookmarkletCode = `';
    const startIndex = testPageContent.indexOf(startMarker);

    if (startIndex !== -1) {
        let i = startIndex + startMarker.length;
        let endIndex = -1;
        while (i < testPageContent.length) {
            const ch = testPageContent[i];
            if (ch === '\\') { i += 2; continue; }
            if (ch === '`') {
                endIndex = (testPageContent[i + 1] === ';') ? i + 2 : i + 1;
                break;
            }
            i++;
        }
        if (endIndex === -1) {
            console.log('⚠️ Could not find end of testBookmarkletCode declaration');
            return;
        }
        const before = testPageContent.substring(0, startIndex);
        const after = testPageContent.substring(endIndex);
        testPageContent = before + newTestBookmarkletCode + after;
        fs.writeFileSync(testPagePath, testPageContent, 'utf8');
        console.log(`🔍 Updated testBookmarkletCode in test page`);
    } else {
        // Fallback: try to find the placeholder
        const placeholderPattern = 'PLACEHOLDER_FOR_BOOKMARKLET_CODE';
        if (testPageContent.includes(placeholderPattern)) {
            console.log('🔍 Found placeholder in test page, replacing...');
            testPageContent = testPageContent.replace(
                `const testBookmarkletCode = \`${placeholderPattern}\`;`,
                newTestBookmarkletCode
            );
            fs.writeFileSync(testPagePath, testPageContent, 'utf8');
        } else {
            console.log('⚠️ Could not find testBookmarkletCode variable or placeholder in test-page.html');
        }
    }
}

// Watch mode
if (process.argv.includes('--watch')) {
    const chokidar = require('chokidar');
    
    console.log('👀 Watching accessibility-checker.js for changes...');
    
    // Build once initially
    buildBookmarklet();
    
    // Watch for changes
    chokidar.watch('accessibility-checker.js').on('change', () => {
        console.log('\n📝 File changed, rebuilding...');
        buildBookmarklet();
    });
    
    // Keep the process running
    process.on('SIGINT', () => {
        console.log('\n👋 Stopping watch mode...');
        process.exit(0);
    });
} else {
    // Single build
    buildBookmarklet();
} 