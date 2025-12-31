// Claude adapter implementation with ProseMirror handling

import { BaseAdapter, type PreparePromptResult, type CaptureResponseResult } from './BaseAdapter';
import type { AdapterConfig, ModelStatus } from '@/lib/types';

export class ClaudeAdapter extends BaseAdapter {
    constructor(config: AdapterConfig) {
        super(config);
    }

    async preparePrompt(
        prompt: string,
        _attachments?: any[],
        _routingHints?: Record<string, any>
    ): Promise<PreparePromptResult> {
        try {
            const inputElement = this.getInputElement();

            if (!inputElement) {
                return {
                    prepared: false,
                    diagnostics: 'Could not find contenteditable element'
                };
            }

            // For contenteditable elements (ProseMirror)
            if (inputElement instanceof HTMLElement && inputElement.isContentEditable) {
                // Set innerHTML for contenteditable
                inputElement.innerHTML = this.escapeHtml(prompt);

                // Trigger input event
                const inputEvent = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(inputEvent);

                // Also trigger change event for good measure
                const changeEvent = new Event('change', { bubbles: true });
                inputElement.dispatchEvent(changeEvent);

                console.log(`[Claude] Prompt prepared (${prompt.length} chars)`);

                return {
                    prepared: true,
                    diagnostics: 'Prompt inserted into ProseMirror editor'
                };
            }

            return {
                prepared: false,
                diagnostics: 'Input element is not contenteditable'
            };
        } catch (error) {
            return {
                prepared: false,
                diagnostics: `Error: ${String(error)}`
            };
        }
    }

    detectStatus(): ModelStatus {
        const input = this.getInputElement();
        const sendButton = this.getSendButton();

        if (!input || !sendButton) {
            return 'error';
        }

        // Check if contenteditable has content
        if (input instanceof HTMLElement && input.textContent?.trim()) {
            return 'prompt_ready';
        }

        return 'ready';
    }

    async captureResponse(): Promise<CaptureResponseResult> {
        // Claude doesn't have a standard response selector in our config
        // This is a basic implementation
        const responses = this.document.querySelectorAll('[data-testid*="message"]');
        const lastResponse = responses[responses.length - 1];

        if (!lastResponse) {
            throw new Error('No response found');
        }

        return {
            text: lastResponse.textContent || '',
            metadata: {
                responseCount: responses.length
            },
            timestamps: {
                start: Date.now(),
                end: Date.now()
            }
        };
    }

    /**
     * Escape HTML to prevent XSS when setting innerHTML
     */
    private escapeHtml(text: string): string {
        const div = this.document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
