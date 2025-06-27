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
    
    // Find and replace the bookmarkletCode variable (more robust pattern)
    const bookmarkletCodeRegex = /const bookmarkletCode = `[^`]*(?:`[^`]*`[^`]*)*`;/;
    const newBookmarkletCode = `const bookmarkletCode = \`${escapedCode}\`;`;
    
    console.log(`🔍 Replacement code length: ${newBookmarkletCode.length}`);
    
    // Check if we can find the pattern
    const match = indexContent.match(bookmarkletCodeRegex);
    if (match) {
        console.log(`🔍 Found existing bookmarkletCode of length: ${match[0].length}`);
        const originalLength = indexContent.length;
        indexContent = indexContent.replace(bookmarkletCodeRegex, newBookmarkletCode);
        const newLength = indexContent.length;
        console.log(`🔍 HTML file length change: ${originalLength} → ${newLength}`);
        
        fs.writeFileSync(indexPath, indexContent, 'utf8');
    } else {
        // Fallback: try a simpler but more aggressive approach
        console.log('⚠️ Standard pattern failed, trying fallback approach...');
        const startMarker = 'const bookmarkletCode = `';
        const endMarker = '`;';
        
        const startIndex = indexContent.indexOf(startMarker);
        if (startIndex === -1) {
            throw new Error('Could not find bookmarkletCode variable start in index.html');
        }
        
        // Find the matching closing backtick and semicolon
        let endIndex = -1;
        let backtickCount = 0;
        let searchIndex = startIndex + startMarker.length;
        
        while (searchIndex < indexContent.length) {
            const char = indexContent[searchIndex];
            if (char === '`') {
                backtickCount++;
                if (indexContent.substring(searchIndex, searchIndex + endMarker.length) === endMarker) {
                    endIndex = searchIndex + endMarker.length;
                    break;
                }
            }
            searchIndex++;
        }
        
        if (endIndex === -1) {
            throw new Error('Could not find bookmarkletCode variable end in index.html');
        }
        
        const beforeCode = indexContent.substring(0, startIndex);
        const afterCode = indexContent.substring(endIndex);
        indexContent = beforeCode + newBookmarkletCode + afterCode;
        
        console.log(`🔍 Fallback replacement successful`);
        fs.writeFileSync(indexPath, indexContent, 'utf8');
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