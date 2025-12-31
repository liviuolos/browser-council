// Adapter registry with platform-specific selectors
// Updated December 31, 2025 with more robust fallback selectors

import type { AdapterConfig, ModelPlatform } from '@/lib/types';

export const ADAPTER_REGISTRY: Record<string, AdapterConfig> = {
    'chat.openai.com': {
        platform: 'chatgpt',
        selectors: {
            input: [
                'textarea#prompt-textarea',
                '[data-testid="prompt-textarea"]',
                'textarea[placeholder*="Message"]',
                'div[contenteditable="true"][data-placeholder]',
                'div[contenteditable="true"]',
                'textarea',
                'input[type="text"]'
            ],
            sendButton: [
                '[data-testid="send-button"]',
                'button[data-testid="fruitjuice-send-button"]',
                'button[aria-label*="Send"]',
                'button[aria-label*="send"]',
                'form button[type="submit"]',
                'form button:last-child',
                'button svg[viewBox]' // Icon-only buttons
            ],
            response: '[data-message-author-role="assistant"]',
            streaming: 'result-streaming'
        },
        capabilities: {
            supportsStreaming: true,
            supportsFileUpload: true,
            requiresContentEditable: false
        },
        tosCompliance: {
            allowsAutomation: false,
            requiresManualMode: false,
            strictSecurityPolicy: true,
            notes: 'Prohibits automated extraction, scraping, and bypassing rate limits'
        }
    },

    'chatgpt.com': {
        platform: 'chatgpt',
        selectors: {
            input: [
                'textarea#prompt-textarea',
                '[data-testid="prompt-textarea"]',
                'textarea[placeholder*="Message"]',
                'div[contenteditable="true"][data-placeholder]',
                'div[contenteditable="true"]',
                'textarea',
                'input[type="text"]'
            ],
            sendButton: [
                '[data-testid="send-button"]',
                'button[data-testid="fruitjuice-send-button"]',
                'button[aria-label*="Send"]',
                'button[aria-label*="send"]',
                'form button[type="submit"]',
                'form button:last-child',
                'button svg[viewBox]'
            ],
            response: '[data-message-author-role="assistant"]',
            streaming: 'result-streaming'
        },
        capabilities: {
            supportsStreaming: true,
            supportsFileUpload: true,
            requiresContentEditable: false
        },
        tosCompliance: {
            allowsAutomation: false,
            requiresManualMode: false,
            strictSecurityPolicy: true,
            notes: 'Same as chat.openai.com'
        }
    },

    'claude.ai': {
        platform: 'claude',
        selectors: {
            input: [
                // ProseMirror editor patterns
                'div.ProseMirror[contenteditable="true"]',
                '[data-placeholder][contenteditable="true"]',
                '.ProseMirror',
                // General contenteditable
                'div[contenteditable="true"]',
                '[contenteditable="true"]',
                // Fallback textarea
                'textarea[placeholder*="message"]',
                'textarea[placeholder*="Message"]',
                'textarea'
            ],
            sendButton: [
                // Claude-specific
                'button[aria-label="Send Message"]',
                'button[aria-label="Send message"]',
                'button[aria-label*="Send"]',
                'button[aria-label*="send"]',
                // Form patterns
                'form button[type="submit"]',
                'button[type="submit"]',
                // Icon patterns (Claude uses SVG icons)
                'button:has(svg[viewBox])',
                'button svg',
                // Last resort
                'button:last-of-type'
            ],
            response: '[data-testid*="message"], .font-claude-message, [class*="claude"]'
        },
        capabilities: {
            supportsStreaming: true,
            supportsFileUpload: true,
            requiresContentEditable: true
        },
        tosCompliance: {
            allowsAutomation: false,
            requiresManualMode: false,
            maxRequestsPerMinute: 10,
            strictSecurityPolicy: false,
            notes: 'Weekly usage limits; permission system required for sensitive actions'
        },
        notes: 'Uses ProseMirror editor - requires special handling for contenteditable'
    },

    'gemini.google.com': {
        platform: 'gemini',
        selectors: {
            input: [
                // Gemini's custom rich-textarea component
                'rich-textarea textarea',
                'rich-textarea',
                '.ql-editor', // Quill editor if used
                'textarea[aria-label*="prompt"]',
                'textarea[aria-label*="Enter"]',
                'textarea[placeholder*="Enter"]',
                '[contenteditable="true"]',
                'div[contenteditable="true"]',
                'textarea',
                'input[type="text"]'
            ],
            sendButton: [
                // Gemini-specific
                'button[aria-label*="Send"]',
                'button[aria-label*="send"]',
                'button[aria-label*="Submit"]',
                'button[mattooltip*="Send"]',
                // Material Design patterns
                'button.send-button',
                'button mat-icon-button',
                // General patterns
                'button[type="submit"]',
                'form button',
                // Icon buttons
                'button:has(mat-icon)',
                'button:has(svg)',
                'button svg'
            ],
            response: 'model-response, .model-response-text, [data-test-id*="response"]'
        },
        capabilities: {
            supportsStreaming: true,
            supportsFileUpload: true,
            requiresContentEditable: false
        },
        tosCompliance: {
            allowsAutomation: false,
            requiresManualMode: false,
            strictSecurityPolicy: true,
            notes: 'Google TOS applies; respect rate limits'
        }
    },

    'grok.com': {
        platform: 'grok',
        selectors: {
            input: [
                // Grok's input patterns
                'textarea[placeholder*="Ask"]',
                'textarea[placeholder*="ask"]',
                'textarea[placeholder*="message"]',
                'textarea[placeholder*="Message"]',
                'textarea[placeholder*="anything"]',
                // Contenteditable patterns
                'div[contenteditable="true"]',
                '[contenteditable="true"]',
                '[role="textbox"]',
                'div[role="textbox"]',
                // Textarea fallbacks
                'textarea[aria-label*="message"]',
                'textarea[aria-label*="input"]',
                'textarea[data-testid*="input"]',
                'main textarea',
                'form textarea',
                'textarea',
                // Input fallbacks
                'form input[type="text"]',
                'input[type="text"]'
            ],
            sendButton: [
                // Grok-specific
                'button[aria-label*="Send"]',
                'button[aria-label*="send"]',
                'button[aria-label*="Submit"]',
                'button[data-testid*="send"]',
                // Form patterns
                'button[type="submit"]',
                'form button',
                // Icon patterns
                'button:has(svg)',
                'button svg'
            ],
            response: '[data-testid*="message"], .message, [class*="response"], [class*="answer"]'
        },
        capabilities: {
            supportsStreaming: true,
            supportsFileUpload: false,
            requiresContentEditable: true
        },
        tosCompliance: {
            allowsAutomation: false,
            requiresManualMode: true,
            strictSecurityPolicy: true,
            notes: 'CRITICAL: xAI TOS explicitly bans "using bots to access" service. MANUAL MODE ONLY.'
        }
    },

    // Alternative domains
    'x.com': {
        platform: 'grok',
        selectors: {
            input: [
                'textarea[placeholder*="Ask"]',
                'div[contenteditable="true"]',
                '[role="textbox"]',
                'textarea'
            ],
            sendButton: [
                'button[aria-label*="Send"]',
                'button[type="submit"]',
                'button:has(svg)'
            ],
            response: '[data-testid*="message"]'
        },
        capabilities: {
            supportsStreaming: true,
            supportsFileUpload: false,
            requiresContentEditable: true
        },
        tosCompliance: {
            allowsAutomation: false,
            requiresManualMode: true,
            strictSecurityPolicy: true,
            notes: 'Same as grok.com - MANUAL MODE ONLY'
        }
    }
};

/**
 * Get adapter config for current hostname
 */
export function getAdapterForHostname(hostname: string): AdapterConfig | null {
    return ADAPTER_REGISTRY[hostname] || null;
}

/**
 * Get adapter config by platform
 */
export function getAdapterByPlatform(platform: ModelPlatform): AdapterConfig | null {
    for (const config of Object.values(ADAPTER_REGISTRY)) {
        if (config.platform === platform) {
            return config;
        }
    }
    return null;
}

/**
 * Get all registered hostnames for a platform
 */
export function getHostnamesForPlatform(platform: ModelPlatform): string[] {
    return Object.entries(ADAPTER_REGISTRY)
        .filter(([_, config]) => config.platform === platform)
        .map(([hostname]) => hostname);
}
