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
                    <h2>🎓 UW Accessibility Checker</h2>
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
                rules: {},
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
                        violation.tags
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
                        incomplete.tags
                    );
                });
            });
            
            // Add summary information
            this.axeResults = {
                url: results.url,
                timestamp: results.timestamp,
                toolOptions: results.toolOptions,
                violations: results.violations.length,
                passes: results.passes.length,
                incomplete: results.incomplete.length,
                inapplicable: results.inapplicable.length
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
        
        // Show error message
        showError: function(message) {
            const panel = document.getElementById('uw-a11y-panel');
            if (panel) {
                const content = panel.querySelector('#uw-a11y-content');
                content.innerHTML = `
                    <div class="uw-a11y-issue error" style="margin: 1rem;">
                        <h4>⚠️ Error Loading Accessibility Checker</h4>
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
                    <h2>🎓 UW Accessibility Checker</h2>
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
            `;
            document.head.appendChild(style);
        },
        
        addIssue: function(type, title, description, element, recommendation, helpUrl, impact, tags) {
            this.issues.push({
                type: type,
                title: title,
                description: description,
                element: element,
                recommendation: recommendation,
                helpUrl: helpUrl,
                impact: impact,
                tags: tags || []
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
            
            // Display summary
            summary.innerHTML = `
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
                        <h4>🎉 Excellent Accessibility!</h4>
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
                        <div class="issue-meta">
                            <strong>Impact:</strong> ${issue.impact || 'unknown'} | 
                            <strong>Tags:</strong> ${issue.tags.join(', ')}
                            ${issue.helpUrl ? `<br><a href="${issue.helpUrl}" target="_blank" class="learn-more">Learn more about this rule ↗</a>` : ''}
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