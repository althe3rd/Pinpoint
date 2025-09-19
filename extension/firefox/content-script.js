// Content script for Pinpoint Accessibility Checker (Firefox)
// This script only runs when the extension button is clicked (activeTab permission)

(function() {
    'use strict';
    
    // Use browser API for Firefox, fallback to chrome for compatibility
    const runtime = (typeof browser !== 'undefined') ? browser.runtime : chrome.runtime;
    
    // Function to inject the accessibility checker
    function injectAccessibilityChecker() {
        // Check if checker is already running
        if (window.uwAccessibilityChecker) {
            window.uwAccessibilityChecker.remove();
            return;
        }
        
        // Create script element to inject the accessibility checker
        const script = document.createElement('script');
        script.src = runtime.getURL('accessibility-checker.js');
        script.onload = function() {
            // Script loaded, the accessibility checker should now be available
            console.log('Pinpoint Accessibility Checker loaded');
            this.remove(); // Clean up script tag
        };
        script.onerror = function() {
            console.error('Failed to load Pinpoint Accessibility Checker');
            this.remove();
        };
        
        // Inject into the page
        (document.head || document.documentElement).appendChild(script);
    }
    
    // Auto-run when content script loads (triggered by extension button click)
    injectAccessibilityChecker();
    
    // Debug function to check if content script is loaded
    console.log('Pinpoint Accessibility Checker content script loaded (Firefox)');
})();