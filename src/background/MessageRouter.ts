// MessageRouter - Reliable cross-tab messaging with ack/retry pattern
// Implementation from pitch-a-claude-opus.md lines 150-191

import type { Message, MessageBase } from '@/lib/types';

interface PendingMessage {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeout: ReturnType<typeof setTimeout>;
}

export class MessageRouter {
    private pending: Map<string, PendingMessage>;
    private ports: Map<number, chrome.runtime.Port>;
    private static instance: MessageRouter;

    private constructor() {
        this.pending = new Map();
        this.ports = new Map();
        this.setupListeners();
    }

    static getInstance(): MessageRouter {
        if (!MessageRouter.instance) {
            MessageRouter.instance = new MessageRouter();
        }
        return MessageRouter.instance;
    }

    private setupListeners(): void {
        // Listen for port connections from content scripts
        chrome.runtime.onConnect.addListener((port) => {
            console.log(`[MessageRouter] Port connected: ${port.name}`);

            port.onMessage.addListener((msg) => this.handlePortMessage(port, msg));
            port.onDisconnect.addListener(() => this.handleDisconnect(port));
        });
    }

    /**
     * Setup long-lived connection to a tab
     * Keeps service worker alive as long as content script is running
     */
    setupLongLivedConnection(tabId: number): chrome.runtime.Port {
        // Clean up existing port if any
        this.cleanupPort(tabId);

        const port = chrome.tabs.connect(tabId, { name: 'council-channel' });

        port.onMessage.addListener((msg) => this.handlePortMessage(port, msg));
        port.onDisconnect.addListener(() => this.handleDisconnect(port));

        this.ports.set(tabId, port);
        console.log(`[MessageRouter] Long-lived connection established to tab ${tabId}`);

        return port;
    }

    /**
     * Send message with acknowledgment and retry
     */
    async sendWithAck(tabId: number, message: MessageBase, timeoutMs: number = 10000): Promise<any> {
        const messageId = crypto.randomUUID();
        const messageWithId = { ...message, messageId, needsAck: true };

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(messageId);
                reject(new Error(`Timeout: ${messageId} to tab ${tabId}`));
            }, timeoutMs);

            this.pending.set(messageId, { resolve, reject, timeout });

            chrome.tabs.sendMessage(tabId, messageWithId)
                .catch((error) => {
                    clearTimeout(timeout);
                    this.pending.delete(messageId);
                    reject(error);
                });
        });
    }

    /**
     * Send message via long-lived port
     */
    sendViaPort(tabId: number, message: Message): boolean {
        const port = this.ports.get(tabId);
        if (!port) {
            console.warn(`[MessageRouter] No port found for tab ${tabId}`);
            return false;
        }

        try {
            port.postMessage(message);
            return true;
        } catch (error) {
            console.error(`[MessageRouter] Error sending via port to tab ${tabId}:`, error);
            return false;
        }
    }

    /**
     * Broadcast message to all tabs
     * No direct broadcast API - must query and loop
     */
    async broadcast(message: MessageBase): Promise<PromiseSettledResult<any>[]> {
        const tabs = await chrome.tabs.query({});

        console.log(`[MessageRouter] Broadcasting to ${tabs.length} tabs`);

        return Promise.allSettled(
            tabs.map(tab => {
                if (tab.id) {
                    return this.sendWithAck(tab.id, message);
                }
                return Promise.reject(new Error('Tab has no ID'));
            })
        );
    }

    private handlePortMessage(port: chrome.runtime.Port, msg: any): void {
        console.log(`[MessageRouter] Port message from ${port.name}:`, msg);

        // Handle acknowledgments
        if (msg.type === 'ack' && msg.originalMessageId) {
            const pending = this.pending.get(msg.originalMessageId);
            if (pending) {
                clearTimeout(pending.timeout);
                pending.resolve(msg);
                this.pending.delete(msg.originalMessageId);
            }
        }

        // Emit event for other message types (handled by background script)
        // This will be wired up in the main background script
    }

    private handleDisconnect(port: chrome.runtime.Port): void {
        console.log(`[MessageRouter] Port disconnected: ${port.name}`);

        // Find and remove port from map
        for (const [tabId, storedPort] of this.ports.entries()) {
            if (storedPort === port) {
                this.ports.delete(tabId);
                break;
            }
        }
    }

    private cleanupPort(tabId: number): void {
        const existingPort = this.ports.get(tabId);
        if (existingPort) {
            try {
                existingPort.disconnect();
            } catch (error) {
                // Port may already be disconnected
            }
            this.ports.delete(tabId);
        }
    }

    /**
     * Check if tab has an active port connection
     */
    hasActivePort(tabId: number): boolean {
        return this.ports.has(tabId);
    }

    /**
     * Get all connected tab IDs
     */
    getConnectedTabs(): number[] {
        return Array.from(this.ports.keys());
    }
}
