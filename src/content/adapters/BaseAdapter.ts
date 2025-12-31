// Base adapter interface for LLM platform adapters

import type { AdapterConfig, ModelStatus } from '@/lib/types';

export interface PreparePromptResult {
    prepared: boolean;
    diagnostics: string;
}

export interface ManualModeResult {
    clipboardText: string;
    steps: string[];
}

export interface CaptureResponseResult {
    text: string;
    metadata?: Record<string, any>;
    timestamps?: {
        start: number;
        end: number;
    };
}

export abstract class BaseAdapter {
    protected config: AdapterConfig;
    protected document: Document;

    constructor(config: AdapterConfig, doc: Document = document) {
        this.config = config;
        this.document = doc;
    }

    /**
     * Try to find element using fallback selectors
     */
    protected findElement(selectors: string[]): Element | null {
        for (const selector of selectors) {
            const element = this.document.querySelector(selector);
            if (element) {
                console.log(`[${this.config.platform}] Found element with selector: ${selector}`);
                return element;
            }
        }
        console.warn(`[${this.config.platform}] No element found for selectors:`, selectors);
        return null;
    }

    /**
     * Get input element
     */
    protected getInputElement(): Element | null {
        return this.findElement(this.config.selectors.input);
    }

    /**
     * Get send button element
     */
    protected getSendButton(): Element | null {
        return this.findElement(this.config.selectors.sendButton);
    }

    /**
     * Prepare prompt in the UI (abstract - platform-specific)
     */
    abstract preparePrompt(
        prompt: string,
        attachments?: any[],
        routingHints?: Record<string, any>
    ): Promise<PreparePromptResult>;

    /**
     * Detect current status of the platform
     */
    abstract detectStatus(): ModelStatus;

    /**
     * Capture response from the platform
     */
    abstract captureResponse(): Promise<CaptureResponseResult>;

    /**
     * Enter manual mode - return clipboard text and steps
     */
    enterManualMode(prompt: string): ManualModeResult {
        return {
            clipboardText: prompt,
            steps: [
                'Paste the prompt into the input field',
                'Review the prompt',
                'Click Send'
            ]
        };
    }

    /**
     * Check if adapter can work with current DOM
     */
    isReady(): boolean {
        const input = this.getInputElement();
        const sendButton = this.getSendButton();
        return !!(input && sendButton);
    }

    /**
     * Get platform name
     */
    getPlatform(): string {
        return this.config.platform;
    }
}
