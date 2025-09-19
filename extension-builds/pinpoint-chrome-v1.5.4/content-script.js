// Content script for Pinpoint Accessibility Checker
// This script runs on all pages and listens for messages to inject the accessibility checker

(function() {
    'use strict';
    
    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'runAccessibilityCheck') {
            injectAccessibilityChecker();
            sendResponse({success: true});
        }
        return true;
    });
    
    // Function to inject the accessibility checker
    function injectAccessibilityChecker() {
        // Check if checker is already running
        if (window.uwAccessibilityChecker) {
            window.uwAccessibilityChecker.remove();
            return;
        }
        
        // Create script element to inject the accessibility checker
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('accessibility-checker.js');
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
    
    // Add keyboard shortcut support (Ctrl+Shift+A or Cmd+Shift+A)
    document.addEventListener('keydown', function(event) {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        if (isCtrlOrCmd && event.shiftKey && event.key === 'A') {
            event.preventDefault();
            injectAccessibilityChecker();
        }
    });
    
    // Listen for extension installation/update to show welcome message
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'showWelcome') {
            showWelcomeMessage();
            sendResponse({success: true});
        }
        return true;
    });
    
    function showWelcomeMessage() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 1000000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
            line-height: 1.4;
        `;
        
        notification.innerHTML = `
            <div><strong>Pinpoint Accessibility Checker</strong></div>
            <div style="margin-top: 5px; font-size: 13px;">
                Extension installed! Click the Pinpoint icon in your toolbar or press Ctrl+Shift+A (Cmd+Shift+A on Mac) to run accessibility checks.
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Allow manual close by clicking
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
    
    // Debug function to check if content script is loaded
    console.log('Pinpoint Accessibility Checker content script loaded');
})();