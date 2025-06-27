(function() {
    'use strict';
    
    // Prevent multiple instances
    if (window.uwAccessibilityChecker) {
        window.uwAccessibilityChecker.remove();
        return;
    }
    
    // Main accessibility checker object
    window.uwAccessibilityChecker = {
        issues: [],
        axeLoaded: false,
        
        // Initialize the checker
        init: function() {
            this.showLoadingPanel();
            this.loadAxeCore();
        },
        
        // Show loading panel while axe-core loads
        showLoadingPanel: function() {
            const panel = document.createElement('div');
            panel.id = 'uw-a11y-panel';
            panel.innerHTML = `
                <div id="uw-a11y-header">
                    <h2>Pinpoint Accessibility Checker</h2>
                    <button id="uw-a11y-close">✕</button>
                </div>
                <div id="uw-a11y-content">
                    <div style="text-align: center; padding: 2rem;">
                        <div class="uw-a11y-spinner"></div>
                        <p style="margin-top: 1rem;">Loading axe-core accessibility engine...</p>
                        <p style="font-size: 0.9rem; color: #666;">This may take a few seconds on first use.</p>
                    </div>
                </div>
            `;
            
            this.addStyles();
            document.body.appendChild(panel);
            
            // Add event listeners
            document.getElementById('uw-a11y-close').onclick = () => this.remove();
        },
        
        // Load axe-core dynamically
        loadAxeCore: function() {
            // Check if axe is already loaded
            if (window.axe) {
                this.axeLoaded = true;
                this.runAxeChecks();
                return;
            }
            
            // Load axe-core from CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.8.2/axe.min.js';
            script.onload = () => {
                this.axeLoaded = true;
                this.runAxeChecks();
            };
            script.onerror = () => {
                this.showError('Failed to load axe-core. Please check your internet connection and try again.');
            };
            document.head.appendChild(script);
        },
        
        // Run axe-core accessibility checks
        runAxeChecks: function() {
            if (!window.axe) {
                this.showError('axe-core failed to load properly.');
                return;
            }
            
            // Configure axe for WCAG 2.1 AA
            const axeConfig = {
                rules: {
                    // Disable the region rule which often creates false positives
                    // for "Ensures all page content is contained by landmarks"
                    'region': { enabled: false }
                },
                tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
                // Include experimental rules for broader coverage
                // but prioritize established WCAG 2.1 AA rules
            };
            
            // Run axe-core analysis
            window.axe.run(document, axeConfig, (err, results) => {
                if (err) {
                    this.showError('Error running accessibility analysis: ' + err.message);
                    return;
                }
                
                this.processAxeResults(results);
                this.displayResults();
            });
        },
        
        // Process axe-core results into our format
        processAxeResults: function(results) {
            this.issues = [];
            
            // Process violations (errors)
            results.violations.forEach(violation => {
                violation.nodes.forEach(node => {
                    this.addIssue(
                        'error',
                        violation.description,
                        this.buildDescription(violation, node),
                        this.getElementFromNode(node),
                        this.buildRecommendation(violation),
                        violation.helpUrl,
                        violation.impact || 'serious',
                        violation.tags,
                        this.buildDetailedInfo(violation, node)
                    );
                });
            });
            
            // Process incomplete items (warnings)
            results.incomplete.forEach(incomplete => {
                incomplete.nodes.forEach(node => {
                    this.addIssue(
                        'warning',
                        incomplete.description,
                        'Manual review needed: ' + this.buildDescription(incomplete, node),
                        this.getElementFromNode(node),
                        this.buildRecommendation(incomplete),
                        incomplete.helpUrl,
                        incomplete.impact || 'moderate',
                        incomplete.tags,
                        this.buildDetailedInfo(incomplete, node)
                    );
                });
            });
            
            // Add summary information and calculate score
            this.axeResults = {
                url: results.url,
                timestamp: results.timestamp,
                toolOptions: results.toolOptions,
                violations: results.violations.length,
                passes: results.passes.length,
                incomplete: results.incomplete.length,
                inapplicable: results.inapplicable.length,
                score: this.calculateAccessibilityScore(results)
            };
        },
        
        // Build description from axe result
        buildDescription: function(rule, node) {
            let description = rule.help || rule.description;
            
            if (node.failureSummary) {
                description += '\n\nDetails: ' + node.failureSummary;
            }
            
            if (node.html) {
                description += '\n\nElement: ' + node.html.substring(0, 100);
                if (node.html.length > 100) description += '...';
            }
            
            return description;
        },
        
        // Build recommendation from axe result
        buildRecommendation: function(rule) {
            if (rule.help) {
                return rule.help;
            }
            return 'Please refer to the help documentation for specific guidance on fixing this issue.';
        },
        
        // Get DOM element from axe node data
        getElementFromNode: function(node) {
            if (node.target && node.target.length > 0) {
                try {
                    // Use axe's selector to find the element
                    return document.querySelector(node.target[0]);
                } catch (e) {
                    // Fallback: try to find by other means
                    return null;
                }
            }
            return null;
        },
        
        // Build detailed technical information about the issue
        buildDetailedInfo: function(rule, node) {
            const details = [];
            
            // Add HTML source context with line number estimation
            if (node.html) {
                details.push({
                    type: 'html',
                    label: 'HTML Source',
                    value: node.html
                });
                
                // Try to estimate line number
                const lineNumber = this.estimateLineNumber(node.html);
                if (lineNumber > 0) {
                    details.push({
                        type: 'line',
                        label: 'Approximate Line',
                        value: lineNumber
                    });
                }
            }
            
            // Add CSS selector
            if (node.target && node.target[0]) {
                details.push({
                    type: 'selector',
                    label: 'CSS Selector',
                    value: node.target[0]
                });
            }
            
            // Add specific rule-based details
            if (rule.id === 'color-contrast') {
                const colorInfo = this.extractColorContrastInfo(node);
                if (colorInfo) {
                    details.push({
                        type: 'colors',
                        label: 'Color Information',
                        value: colorInfo
                    });
                }
            }
            
            if (rule.id.includes('landmark') || rule.id.includes('region')) {
                details.push({
                    type: 'landmarks',
                    label: 'Landmark Context',
                    value: this.analyzeLandmarkContext(node)
                });
            }
            
            if (rule.id.includes('heading')) {
                details.push({
                    type: 'headings',
                    label: 'Heading Structure',
                    value: this.analyzeHeadingStructure(node)
                });
            }
            
            // Add failure summary details
            if (node.failureSummary) {
                details.push({
                    type: 'failure',
                    label: 'Technical Details',
                    value: node.failureSummary
                });
            }
            
            // Add any additional data from axe
            if (node.any && node.any.length > 0) {
                const anyDetails = node.any.map(item => item.message || item.id).filter(Boolean);
                if (anyDetails.length > 0) {
                    details.push({
                        type: 'checks',
                        label: 'Failed Checks',
                        value: anyDetails.join(', ')
                    });
                }
            }
            
            return details;
        },
        
        // Estimate line number by counting newlines in document
        estimateLineNumber: function(htmlSnippet) {
            try {
                const documentHTML = document.documentElement.outerHTML;
                const index = documentHTML.indexOf(htmlSnippet.substring(0, 50));
                if (index > -1) {
                    const beforeSnippet = documentHTML.substring(0, index);
                    return beforeSnippet.split('\n').length;
                }
            } catch (e) {
                // Fallback: return 0 if estimation fails
            }
            return 0;
        },
        
        // Extract color contrast information
        extractColorContrastInfo: function(node) {
            try {
                const element = this.getElementFromNode(node);
                if (!element) return null;
                
                const styles = window.getComputedStyle(element);
                const fgColor = styles.color;
                const bgColor = styles.backgroundColor;
                
                // Calculate contrast ratio if possible
                const contrast = this.calculateContrastRatio(fgColor, bgColor);
                
                return {
                    foreground: fgColor,
                    background: bgColor,
                    contrast: contrast ? contrast.toFixed(2) + ':1' : 'Unable to calculate',
                    required: 'WCAG AA requires 4.5:1 for normal text, 3:1 for large text'
                };
            } catch (e) {
                return null;
            }
        },
        
        // Simple contrast ratio calculation
        calculateContrastRatio: function(fg, bg) {
            try {
                // This is a simplified version - in practice you'd want a more robust color parser
                const fgLuminance = this.getLuminance(fg);
                const bgLuminance = this.getLuminance(bg);
                
                if (fgLuminance === null || bgLuminance === null) return null;
                
                const lighter = Math.max(fgLuminance, bgLuminance);
                const darker = Math.min(fgLuminance, bgLuminance);
                
                return (lighter + 0.05) / (darker + 0.05);
            } catch (e) {
                return null;
            }
        },
        
        // Get relative luminance (simplified)
        getLuminance: function(color) {
            // This is a very simplified version - would need more robust color parsing for production
            try {
                if (color.startsWith('rgb')) {
                    const values = color.match(/\d+/g);
                    if (values && values.length >= 3) {
                        const r = parseInt(values[0]) / 255;
                        const g = parseInt(values[1]) / 255;
                        const b = parseInt(values[2]) / 255;
                        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    }
                }
            } catch (e) {
                // Return null if calculation fails
            }
            return null;
        },
        
        // Analyze landmark context
        analyzeLandmarkContext: function(node) {
            try {
                const element = this.getElementFromNode(node);
                if (!element) return 'Element not found';
                
                const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-label], section[aria-labelledby], [role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"]');
                
                return `Found ${landmarks.length} landmarks on page. Current element: ${element.tagName.toLowerCase()}${element.getAttribute('role') ? ' (role="' + element.getAttribute('role') + '")' : ''}`;
            } catch (e) {
                return 'Unable to analyze landmark context';
            }
        },
        
        // Analyze heading structure
        analyzeHeadingStructure: function(node) {
            try {
                const element = this.getElementFromNode(node);
                if (!element) return 'Element not found';
                
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                const currentIndex = headings.indexOf(element);
                const currentLevel = parseInt(element.tagName.charAt(1));
                
                let context = `Current: ${element.tagName} "${element.textContent.substring(0, 50)}"`;
                
                if (currentIndex > 0) {
                    const prevHeading = headings[currentIndex - 1];
                    const prevLevel = parseInt(prevHeading.tagName.charAt(1));
                    context += `\nPrevious: ${prevHeading.tagName} (level ${prevLevel})`;
                    
                    if (currentLevel > prevLevel + 1) {
                        context += `\nIssue: Skipped from H${prevLevel} to H${currentLevel}`;
                    }
                }
                
                return context;
            } catch (e) {
                return 'Unable to analyze heading structure';
            }
        },
        
        // Calculate accessibility score
        calculateAccessibilityScore: function(results) {
            // Weight different types of issues
            const weights = {
                critical: 10,
                serious: 7,
                moderate: 3,
                minor: 1
            };
            
            let totalDeductions = 0;
            let totalPossible = results.passes.length + results.violations.length + results.incomplete.length;
            
            // Calculate deductions for violations
            results.violations.forEach(violation => {
                const weight = weights[violation.impact] || weights.moderate;
                totalDeductions += violation.nodes.length * weight;
            });
            
            // Calculate deductions for incomplete items (less severe)
            results.incomplete.forEach(incomplete => {
                const weight = (weights[incomplete.impact] || weights.moderate) * 0.5;
                totalDeductions += incomplete.nodes.length * weight;
            });
            
            // Calculate score (0-100)
            if (totalPossible === 0) return 100; // No tests run
            
            const maxPossibleDeductions = totalPossible * weights.critical;
            const score = Math.max(0, Math.round(100 - (totalDeductions / maxPossibleDeductions) * 100));
            
            return {
                score: score,
                deductions: totalDeductions,
                maxPossible: maxPossibleDeductions,
                details: {
                    violations: results.violations.length,
                    incomplete: results.incomplete.length,
                    passes: results.passes.length
                }
            };
        },
        
        // Show error message
        showError: function(message) {
            const panel = document.getElementById('uw-a11y-panel');
            if (panel) {
                const content = panel.querySelector('#uw-a11y-content');
                content.innerHTML = `
                    <div class="uw-a11y-issue error" style="margin: 1rem;">
                        <h4>Error Loading Accessibility Checker</h4>
                        <p>${message}</p>
                        <p><strong>Suggestions:</strong></p>
                        <ul>
                            <li>Check your internet connection</li>
                            <li>Try refreshing the page and running the bookmarklet again</li>
                            <li>Ensure your browser allows loading external scripts</li>
                        </ul>
                    </div>
                `;
            }
        },
        
        // Create and show the results panel
        createPanel: function() {
            let panel = document.getElementById('uw-a11y-panel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'uw-a11y-panel';
                document.body.appendChild(panel);
            }
            
            panel.innerHTML = `
                <div id="uw-a11y-header">
                    <h2>Pinpoint Accessibility Checker</h2>
                    <button id="uw-a11y-close">✕</button>
                </div>
                <div id="uw-a11y-content">
                    <div id="uw-a11y-summary"></div>
                    <div id="uw-a11y-results"></div>
                </div>
            `;
            
            // Add event listeners
            document.getElementById('uw-a11y-close').onclick = () => this.remove();
            
            return panel;
        },
        
        // Add CSS styles
        addStyles: function() {
            if (document.getElementById('uw-a11y-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'uw-a11y-styles';
            style.textContent = `
                #uw-a11y-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 450px;
                    max-height: 85vh;
                    background: #ffffff;
                    border: 3px solid #c5050c;
                    border-radius: 8px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    z-index: 999999;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    overflow: hidden;
                }
                #uw-a11y-header {
                    background: #c5050c;
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                #uw-a11y-header h2 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                #uw-a11y-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                #uw-a11y-close:hover {
                    background: rgba(255,255,255,0.2);
                }
                #uw-a11y-content {
                    max-height: calc(85vh - 60px);
                    overflow-y: auto;
                    padding: 16px;
                }
                #uw-a11y-summary {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    padding: 12px;
                    margin-bottom: 16px;
                }
                .uw-a11y-issue {
                    margin-bottom: 12px;
                    padding: 12px;
                    border-left: 4px solid #ffc107;
                    background: #fff3cd;
                    border-radius: 0 4px 4px 0;
                    cursor: pointer;
                }
                .uw-a11y-issue.error {
                    border-left-color: #dc3545;
                    background: #f8d7da;
                }
                .uw-a11y-issue.warning {
                    border-left-color: #ffc107;
                    background: #fff3cd;
                }
                .uw-a11y-issue.info {
                    border-left-color: #17a2b8;
                    background: #d1ecf1;
                }
                .uw-a11y-issue h4 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: bold;
                }
                .uw-a11y-issue p {
                    margin: 4px 0;
                    line-height: 1.4;
                }
                .uw-a11y-issue .issue-meta {
                    font-size: 12px;
                    color: #666;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                }
                .uw-a11y-issue .learn-more {
                    color: #c5050c;
                    text-decoration: none;
                    font-size: 12px;
                }
                .uw-a11y-issue .learn-more:hover {
                    text-decoration: underline;
                }
                .uw-a11y-highlight {
                    background: yellow !important;
                    border: 2px solid red !important;
                    box-shadow: 0 0 0 2px yellow !important;
                }
                .uw-a11y-count {
                    font-weight: bold;
                    padding: 2px 8px;
                    border-radius: 12px;
                    color: white;
                    font-size: 12px;
                    margin-right: 8px;
                }
                .count-error { background: #dc3545; }
                .count-warning { background: #ffc107; color: #212529; }
                .count-info { background: #17a2b8; }
                .uw-a11y-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #c5050c;
                    border-radius: 50%;
                    animation: uw-spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes uw-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .axe-summary {
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #dee2e6;
                    padding-top: 12px;
                    margin-top: 12px;
                }
                .uw-a11y-score-container {
                    text-align: center;
                    margin: 1rem 0;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 2px solid #e9ecef;
                }
                .uw-a11y-score-dial {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 1rem auto;
                }
                .uw-a11y-score-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, #28a745 0deg 0deg, #e9ecef 0deg 360deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .uw-a11y-score-inner {
                    width: 90px;
                    height: 90px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    font-weight: bold;
                }
                .uw-a11y-score-number {
                    font-size: 24px;
                    color: #333;
                }
                .uw-a11y-score-label {
                    font-size: 10px;
                    color: #666;
                    text-transform: uppercase;
                }
                .uw-a11y-details {
                    margin-top: 1rem;
                    padding: 0.5rem;
                    background: #f1f3f4;
                    border-left: 3px solid #007cba;
                    border-radius: 0 4px 4px 0;
                    font-size: 12px;
                    display: none;
                }
                .uw-a11y-details.expanded {
                    display: block;
                }
                .uw-a11y-details-toggle {
                    background: none;
                    border: none;
                    color: #007cba;
                    cursor: pointer;
                    font-size: 12px;
                    text-decoration: underline;
                    padding: 0;
                    margin-top: 0.5rem;
                }
                .uw-a11y-details-item {
                    margin: 0.5rem 0;
                    padding: 0.5rem;
                    background: white;
                    border-radius: 3px;
                }
                .uw-a11y-details-label {
                    font-weight: bold;
                    color: #495057;
                }
                .uw-a11y-details-value {
                    font-family: monospace;
                    background: #f8f9fa;
                    padding: 0.25rem;
                    border-radius: 2px;
                    margin-top: 0.25rem;
                    word-break: break-all;
                }
            `;
            document.head.appendChild(style);
        },
        
        addIssue: function(type, title, description, element, recommendation, helpUrl, impact, tags, detailedInfo) {
            this.issues.push({
                type: type,
                title: title,
                description: description,
                element: element,
                recommendation: recommendation,
                helpUrl: helpUrl,
                impact: impact,
                tags: tags || [],
                detailedInfo: detailedInfo || []
            });
        },
        
        displayResults: function() {
            const panel = this.createPanel();
            const summary = document.getElementById('uw-a11y-summary');
            const results = document.getElementById('uw-a11y-results');
            
            // Count issues by type
            const counts = {
                error: this.issues.filter(i => i.type === 'error').length,
                warning: this.issues.filter(i => i.type === 'warning').length,
                info: this.issues.filter(i => i.type === 'info').length
            };
            
            // Get accessibility score
            const scoreData = this.axeResults ? this.axeResults.score : null;
            
            // Display summary with score dial
            summary.innerHTML = `
                ${scoreData ? this.renderScoreDial(scoreData) : ''}
                <h3>axe-core Accessibility Analysis</h3>
                <p><strong>Total Issues Found:</strong> ${this.issues.length}</p>
                <div style="margin: 8px 0;">
                    <span class="uw-a11y-count count-error">${counts.error}</span>Violations
                    <span class="uw-a11y-count count-warning">${counts.warning}</span>Manual Review
                </div>
                <p><small>Click on any issue to highlight the element on the page.</small></p>
                ${this.axeResults ? `
                    <div class="axe-summary">
                        <strong>Test Summary:</strong> ${this.axeResults.violations} violations, 
                        ${this.axeResults.passes} passes, ${this.axeResults.incomplete} need review, 
                        ${this.axeResults.inapplicable} not applicable<br>
                        <strong>Standard:</strong> WCAG 2.1 AA | <strong>Engine:</strong> axe-core
                    </div>
                ` : ''}
            `;
            
            // Display issues
            if (this.issues.length === 0) {
                results.innerHTML = `
                    <div class="uw-a11y-issue info">
                        <h4>Excellent Accessibility!</h4>
                        <p>No accessibility violations detected by axe-core. Your page meets WCAG 2.1 AA automated testing standards.</p>
                        <p><strong>Next Steps:</strong> Consider manual testing with screen readers and keyboard navigation for complete accessibility validation.</p>
                    </div>
                `;
            } else {
                results.innerHTML = this.issues.map((issue, index) => `
                    <div class="uw-a11y-issue ${issue.type}" onclick="window.uwAccessibilityChecker.highlightElement(${index})" style="cursor: ${issue.element ? 'pointer' : 'default'}">
                        <h4>${issue.title}</h4>
                        <p>${issue.description.split('\n')[0]}</p>
                        <p><strong>How to fix:</strong> ${issue.recommendation}</p>
                        ${issue.detailedInfo && issue.detailedInfo.length > 0 ? `
                            <button class="uw-a11y-details-toggle" onclick="window.uwAccessibilityChecker.toggleDetails(${index}); event.stopPropagation();">
                                Show technical details
                            </button>
                            <div class="uw-a11y-details" id="details-${index}">
                                ${this.renderDetailedInfo(issue.detailedInfo)}
                            </div>
                        ` : ''}
                        <div class="issue-meta">
                            <strong>Impact:</strong> ${issue.impact || 'unknown'} | 
                            <strong>Tags:</strong> ${issue.tags.join(', ')}
                            ${issue.helpUrl ? `<br><a href="${issue.helpUrl}" target="_blank" class="learn-more">Learn more about this rule</a>` : ''}
                        </div>
                    </div>
                `).join('');
            }
        },
        
        highlightElement: function(issueIndex) {
            // Remove previous highlights
            document.querySelectorAll('.uw-a11y-highlight').forEach(el => {
                el.classList.remove('uw-a11y-highlight');
            });
            
            const issue = this.issues[issueIndex];
            if (issue.element) {
                issue.element.classList.add('uw-a11y-highlight');
                issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    if (issue.element) {
                        issue.element.classList.remove('uw-a11y-highlight');
                    }
                }, 3000);
            }
        },
        
        // Render the accessibility score dial
        renderScoreDial: function(scoreData) {
            const score = scoreData.score;
            const percentage = (score / 100) * 360; // Convert to degrees
            const color = score >= 90 ? '#28a745' : score >= 70 ? '#ffc107' : score >= 50 ? '#fd7e14' : '#dc3545';
            
            return `
                <div class="uw-a11y-score-container">
                    <div class="uw-a11y-score-dial">
                        <div class="uw-a11y-score-circle" style="background: conic-gradient(from 0deg, ${color} 0deg ${percentage}deg, #e9ecef ${percentage}deg 360deg);">
                            <div class="uw-a11y-score-inner">
                                <div class="uw-a11y-score-number">${score}</div>
                                <div class="uw-a11y-score-label">Score</div>
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 14px;">
                        <strong>Accessibility Score:</strong> ${score}/100<br>
                        <span style="font-size: 12px; color: #666;">
                            ${score >= 90 ? 'Excellent accessibility!' : 
                              score >= 70 ? 'Good accessibility with room for improvement' : 
                              score >= 50 ? 'Fair accessibility - several issues to address' : 
                              'Poor accessibility - immediate attention needed'}
                        </span>
                    </div>
                </div>
            `;
        },
        
        // Render detailed technical information
        renderDetailedInfo: function(detailedInfo) {
            return detailedInfo.map(detail => {
                let value = detail.value;
                
                // Special formatting for different types
                if (detail.type === 'colors' && typeof value === 'object') {
                    value = `
                        <div style="margin: 0.5rem 0;">
                            <div><strong>Foreground:</strong> <span style="background: ${value.foreground}; color: white; padding: 2px 6px; border-radius: 2px;">${value.foreground}</span></div>
                            <div><strong>Background:</strong> <span style="background: ${value.background}; border: 1px solid #ccc; padding: 2px 6px; border-radius: 2px;">${value.background}</span></div>
                            <div><strong>Contrast Ratio:</strong> ${value.contrast}</div>
                            <div><strong>Requirement:</strong> ${value.required}</div>
                        </div>
                    `;
                }
                
                return `
                    <div class="uw-a11y-details-item">
                        <div class="uw-a11y-details-label">${detail.label}:</div>
                        <div class="uw-a11y-details-value">${value}</div>
                    </div>
                `;
            }).join('');
        },
        
        // Toggle detailed information display
        toggleDetails: function(issueIndex) {
            const detailsElement = document.getElementById(`details-${issueIndex}`);
            const button = detailsElement.previousElementSibling;
            
            if (detailsElement.classList.contains('expanded')) {
                detailsElement.classList.remove('expanded');
                button.textContent = 'Show technical details';
            } else {
                detailsElement.classList.add('expanded');
                button.textContent = 'Hide technical details';
            }
        },
        
        remove: function() {
            const panel = document.getElementById('uw-a11y-panel');
            if (panel) panel.remove();
            
            const styles = document.getElementById('uw-a11y-styles');
            if (styles) styles.remove();
            
            // Remove highlights
            document.querySelectorAll('.uw-a11y-highlight').forEach(el => {
                el.classList.remove('uw-a11y-highlight');
            });
            
            delete window.uwAccessibilityChecker;
        }
    };
    
    // Initialize the accessibility checker
    window.uwAccessibilityChecker.init();
})(); 