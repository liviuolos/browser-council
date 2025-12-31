// Main service worker entry point

import { KeepAliveManager } from './KeepAliveManager';
import { MessageRouter } from './MessageRouter';
import { CouncilStateMachine } from './CouncilStateMachine';
import { ErrorHandlers } from './ErrorHandlers';

// Singleton instances
const keepAlive = KeepAliveManager.getInstance();
// Initialize MessageRouter singleton (sets up listeners)
MessageRouter.getInstance();

// Active councils tracked by session ID
const activeCouncils = new Map<string, CouncilStateMachine>();

// Extension install/update handler
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[Background] Extension installed/updated:', details.reason);

    if (details.reason === 'install') {
        // First install - no recovery needed
        console.log('[Background] First install - ready for use');
    } else if (details.reason === 'update') {
        // Extension updated - attempt recovery
        await recoverActiveSessions();
    }
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
    console.log('[Background] Extension icon clicked, opening side panel for tab:', tab.id);

    if (tab.id) {
        try {
            // Open side panel in current window
            await chrome.sidePanel.open({ tabId: tab.id });
        } catch (error) {
            console.error('[Background] Failed to open side panel:', error);
            // Fallback: try opening for window
            try {
                await chrome.sidePanel.open({ windowId: tab.windowId });
            } catch (fallbackError) {
                console.error('[Background] Fallback side panel open also failed:', fallbackError);
            }
        }
    }
});

// Service worker startup handler
chrome.runtime.onStartup.addListener(async () => {
    console.log('[Background] Service worker starting up');
    await recoverActiveSessions();
});

// Service worker activated (after termination)
self.addEventListener('activate', async (_event) => {
    console.log('[Background] Service worker activated');
    await recoverActiveSessions();
});

/**
 * Recover active sessions from storage
 */
async function recoverActiveSessions(): Promise<void> {
    console.log('[Background] Attempting to recover active sessions...');

    const result = await ErrorHandlers.handleServiceWorkerRestart();
    console.log(`[Background] Recovered ${result.recovered} sessions`);

    // Reload recovered councils into active map
    const sessionIds = await chrome.storage.session.get(null);

    for (const key of Object.keys(sessionIds)) {
        if (key.startsWith('council_')) {
            const sessionId = key.replace('council_', '');
            const council = await CouncilStateMachine.recover(sessionId);

            if (council) {
                activeCouncils.set(sessionId, council);
                await keepAlive.startSession(sessionId);
            }
        }
    }
}

/**
 * Create new council session
 */
async function createNewSession(): Promise<string> {
    const council = await CouncilStateMachine.createSession();
    const sessionId = council.getSessionId();

    activeCouncils.set(sessionId, council);
    await keepAlive.startSession(sessionId);

    console.log(`[Background] Created new council session: ${sessionId}`);
    return sessionId;
}

/**
 * Get council by session ID
 */
function getCouncil(sessionId: string): CouncilStateMachine | undefined {
    return activeCouncils.get(sessionId);
}

// Message handling from content scripts and UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] Message received:', message.type, sender);

    (async () => {
        try {
            switch (message.type) {
                case 'create_session':
                    const sessionId = await createNewSession();
                    sendResponse({ success: true, sessionId });
                    break;

                case 'get_session_state':
                    const council = getCouncil(message.sessionId);
                    if (council) {
                        sendResponse({
                            success: true,
                            state: council.serialize()
                        });
                    } else {
                        sendResponse({ success: false, error: 'Session not found' });
                    }
                    break;

                case 'status_update':
                    const updateCouncil = getCouncil(message.sessionId);
                    if (updateCouncil && message.platform) {
                        await updateCouncil.setModelState(
                            message.platform,
                            message.status,
                            message.error
                        );
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: 'Session not found' });
                    }
                    break;

                case 'capture_response':
                    // Find the tab for this platform and request capture
                    try {
                        const platform = message.platform;
                        const tabs = await chrome.tabs.query({});

                        // Find tab matching platform
                        const platformUrls: Record<string, string[]> = {
                            chatgpt: ['chat.openai.com', 'chatgpt.com'],
                            claude: ['claude.ai'],
                            gemini: ['gemini.google.com'],
                            grok: ['grok.com', 'x.com']
                        };

                        const matchUrls = platformUrls[platform] || [];
                        const platformTab = tabs.find(tab =>
                            tab.url && matchUrls.some(url => tab.url!.includes(url))
                        );

                        if (!platformTab || !platformTab.id) {
                            sendResponse({
                                success: false,
                                error: `No ${platform} tab found. Please open ${platform} first.`
                            });
                            break;
                        }

                        // Send capture request to content script
                        try {
                            const captureResult = await chrome.tabs.sendMessage(platformTab.id, {
                                type: 'capture_response',
                                messageId: crypto.randomUUID()
                            });

                            if (captureResult?.text) {
                                sendResponse({ success: true, text: captureResult.text });
                            } else {
                                sendResponse({
                                    success: false,
                                    error: captureResult?.error || 'No response captured'
                                });
                            }
                        } catch (tabError) {
                            sendResponse({
                                success: false,
                                error: `Could not capture from ${platform}. Please ensure the page is fully loaded.`
                            });
                        }
                    } catch (captureError) {
                        sendResponse({ success: false, error: String(captureError) });
                    }
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('[Background] Error handling message:', error);
            sendResponse({ success: false, error: String(error) });
        }
    })();

    return true; // Keep channel open for async response
});

// Tab removal handler
chrome.tabs.onRemoved.addListener(async (tabId) => {
    console.log(`[Background] Tab ${tabId} removed`);

    // Find councils with this tab and mark as closed
    for (const [_sessionId, council] of activeCouncils) {
        const models = council.getAllModels();
        for (const [platform, modelState] of models) {
            if (modelState.tabId === tabId) {
                await ErrorHandlers.handleTabClosed(council, platform);
            }
        }
    }
});

console.log('[Background] Service worker loaded and ready');

// Export for potential testing/debugging
export { createNewSession, getCouncil, activeCouncils };
