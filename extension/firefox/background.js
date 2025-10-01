// Background script for Pinpoint Accessibility Checker (Firefox)

// Use browser API for Firefox, fallback to chrome for compatibility
const extensionAPI = (typeof browser !== 'undefined') ? browser : chrome;

// Handle extension installation
extensionAPI.runtime.onInstalled.addListener((details) => {
    console.log('Pinpoint Accessibility Checker installed/updated');
    
    if (details.reason === 'install') {
        // Show welcome message on first install
        showWelcomeMessage();
        
        // Optionally open the website for more information
        // extensionAPI.tabs.create({ url: 'https://althe3rd.github.io/Pinpoint/' });
    } else if (details.reason === 'update') {
        console.log('Extension updated to version:', extensionAPI.runtime.getManifest().version);
    }
});

// Handle extension startup
extensionAPI.runtime.onStartup.addListener(() => {
    console.log('Pinpoint Accessibility Checker started');
});

// Handle toolbar icon clicks (browserAction for Firefox)
extensionAPI.browserAction.onClicked.addListener(async (tab) => {
    try {
        // Check if we can access this tab
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') || 
            tab.url.startsWith('moz-extension://') ||
            tab.url.startsWith('about:') ||
            tab.url.startsWith('file://')) {
            
            // Show notification for restricted pages
            await safeSetBadge('!', '#dc3545', tab.id);
            
            setTimeout(() => {
                safeSetBadge('', null, tab.id);
            }, 3000);
            
            return;
        }
        
        // Inject content script programmatically (more privacy-friendly)
        // Firefox uses tabs.executeScript for programmatic injection
        await extensionAPI.tabs.executeScript(tab.id, {
            file: 'content-script.js'
        });
        
        // Show success badge temporarily
        await safeSetBadge('✓', '#28a745', tab.id);
        
        setTimeout(() => {
            safeSetBadge('', null, tab.id);
        }, 3000);
        
    } catch (error) {
        console.error('Error handling toolbar click:', error);
        
        // Show error badge
        await safeSetBadge('!', '#dc3545', tab.id);
        
        setTimeout(() => {
            safeSetBadge('', null, tab.id);
        }, 3000);
    }
});

// Handle keyboard shortcuts (if supported)
if (extensionAPI.commands && extensionAPI.commands.onCommand) {
    extensionAPI.commands.onCommand.addListener(async (command) => {
        if (command === 'run-accessibility-check') {
            const tabs = await extensionAPI.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            if (tab) {
                try {
                    // Use same programmatic injection for keyboard shortcuts
                    await extensionAPI.tabs.executeScript(tab.id, {
                        file: 'content-script.js'
                    });
                } catch (error) {
                    console.error('Error handling keyboard shortcut:', error);
                }
            }
        }
    });
}

// Handle messages from content scripts or popup
extensionAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVersion') {
        sendResponse({ version: extensionAPI.runtime.getManifest().version });
    } else if (request.action === 'logError') {
        console.error('Content script error:', request.error);
        sendResponse({ success: true });
    }
    
    return true; // Keep message channel open for async response
});

// Safe badge setting that handles closed tabs (Firefox version)
async function safeSetBadge(text, color, tabId) {
    try {
        // Check if tab still exists
        await extensionAPI.tabs.get(tabId);
        
        // Set badge text
        await extensionAPI.browserAction.setBadgeText({ text: text, tabId: tabId });
        
        // Set badge color if provided
        if (color) {
            await extensionAPI.browserAction.setBadgeBackgroundColor({ color: color, tabId: tabId });
        }
    } catch (error) {
        // Tab no longer exists, silently ignore
        console.log(`Tab ${tabId} no longer exists, skipping badge update`);
    }
}

// Show welcome message to active tab
async function showWelcomeMessage() {
    try {
        const tabs = await extensionAPI.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        
        if (tab && !tab.url.startsWith('chrome://') && 
            !tab.url.startsWith('chrome-extension://') &&
            !tab.url.startsWith('moz-extension://') &&
            !tab.url.startsWith('about:')) {
            
            // Wait a moment for content script to load
            setTimeout(async () => {
                try {
                    // Check if tab still exists before sending message
                    await extensionAPI.tabs.get(tab.id);
                    await extensionAPI.tabs.sendMessage(tab.id, {
                        action: 'showWelcome'
                    });
                } catch (error) {
                    // Content script might not be ready yet or tab closed, that's okay
                    console.log('Welcome message not sent - content script not ready or tab closed');
                }
            }, 1000);
        }
    } catch (error) {
        console.log('Could not show welcome message:', error.message);
    }
}

// Handle tab updates to clear badges
extensionAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        // Clear any existing badges when page starts loading
        safeSetBadge('', null, tabId);
    }
});

// Set up context menu (optional feature for right-click)
extensionAPI.runtime.onInstalled.addListener(() => {
    if (extensionAPI.contextMenus) {
        extensionAPI.contextMenus.create({
            id: 'pinpoint-check',
            title: 'Check accessibility with Pinpoint',
            contexts: ['page']
        });
    }
});

if (extensionAPI.contextMenus && extensionAPI.contextMenus.onClicked) {
    extensionAPI.contextMenus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId === 'pinpoint-check' && tab) {
            try {
                // Use same programmatic injection for context menu
                await extensionAPI.tabs.executeScript(tab.id, {
                    file: 'content-script.js'
                });
            } catch (error) {
                console.error('Error from context menu:', error);
            }
        }
    });
}

console.log('Pinpoint Accessibility Checker background script loaded (Firefox)');