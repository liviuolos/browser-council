// Content script entry point - loads appropriate adapter for current platform

import { getAdapterForHostname } from './adapters/registry';
import { ChatGPTAdapter } from './adapters/ChatGPTAdapter';
import { ClaudeAdapter } from './adapters/ClaudeAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { GrokAdapter } from './adapters/GrokAdapter';
import type { BaseAdapter } from './adapters/BaseAdapter';
import type { ModelPlatform } from '@/lib/types';

let currentAdapter: BaseAdapter | null = null;
let port: chrome.runtime.Port | null = null;

// Initialize adapter for current platform
function initializeAdapter(): void {
    const hostname = window.location.hostname;
    const config = getAdapterForHostname(hostname);

    if (!config) {
        console.warn(`[Content] No adapter found for hostname: ${hostname}`);
        return;
    }

    console.log(`[Content] Initializing adapter for ${config.platform}`);

    // Create platform-specific adapter
    switch (config.platform) {
        case 'chatgpt':
            currentAdapter = new ChatGPTAdapter(config);
            break;
        case 'claude':
            currentAdapter = new ClaudeAdapter(config);
            break;
        case 'gemini':
            currentAdapter = new GeminiAdapter(config);
            break;
        case 'grok':
            currentAdapter = new GrokAdapter(config);
            break;
        default:
            console.error(`[Content] Unknown platform: ${config.platform}`);
            return;
    }

    // Establish long-lived connection to background
    connectToBackground(config.platform);

    // Check if adapter is ready
    if (currentAdapter.isReady()) {
        console.log(`[Content] Adapter ready for ${config.platform}`);
        sendStatus('ready');
    } else {
        console.warn(`[Content] Adapter not ready - waiting for DOM`);
        waitForReady();
    }
}

// Connect to background script
function connectToBackground(platform: ModelPlatform): void {
    port = chrome.runtime.connect({ name: `council-${platform}` });

    port.onMessage.addListener(handleMessage);
    port.onDisconnect.addListener(() => {
        console.log(`[Content] Disconnected from background`);
        port = null;
    });

    console.log(`[Content] Connected to background as ${platform}`);
}

// Handle messages from background
async function handleMessage(message: any): Promise<void> {
    console.log(`[Content] Received message:`, message.type);

    if (!currentAdapter) {
        console.error('[Content] No adapter initialized');
        return;
    }

    try {
        switch (message.type) {
            case 'prepare_prompt':
                const result = await currentAdapter.preparePrompt(
                    message.prompt,
                    message.attachments,
                    message.routingHints
                );

                if (result.prepared) {
                    sendStatus('prompt_ready');
                } else {
                    sendStatus('error', result.diagnostics);
                }

                // Send acknowledgment
                port?.postMessage({
                    type: 'ack',
                    originalMessageId: message.messageId,
                    result
                });
                break;

            case 'get_status':
                const status = currentAdapter.detectStatus();
                port?.postMessage({
                    type: 'status_update',
                    status,
                    messageId: crypto.randomUUID()
                });
                break;

            case 'capture_response':
                const response = await currentAdapter.captureResponse();
                port?.postMessage({
                    type: 'response_captured',
                    response,
                    messageId: crypto.randomUUID()
                });
                break;

            default:
                console.warn(`[Content] Unknown message type: ${message.type}`);
        }
    } catch (error) {
        console.error('[Content] Error handling message:', error);
        sendStatus('error', String(error));
    }
}

// Send status update to background
function sendStatus(status: string, error?: string): void {
    if (!port) {
        console.warn('[Content] Cannot send status - no port connection');
        return;
    }

    port.postMessage({
        type: 'status_update',
        status,
        error,
        messageId: crypto.randomUUID()
    });
}

// Wait for DOM to be ready
function waitForReady(): void {
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds max

    const checkReady = setInterval(() => {
        attempts++;

        if (currentAdapter?.isReady()) {
            clearInterval(checkReady);
            console.log(`[Content] Adapter ready after ${attempts * 500}ms`);
            sendStatus('ready');
        } else if (attempts >= maxAttempts) {
            clearInterval(checkReady);
            console.error('[Content] Adapter failed to become ready');
            sendStatus('error', 'UI elements not found after 10 seconds');
        }
    }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdapter);
} else {
    initializeAdapter();
}

console.log('[Content] Content script loaded');
