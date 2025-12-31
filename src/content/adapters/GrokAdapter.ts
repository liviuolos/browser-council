// Grok adapter implementation

import { BaseAdapter, type PreparePromptResult, type CaptureResponseResult } from './BaseAdapter';
import type { AdapterConfig, ModelStatus } from '@/lib/types';

export class GrokAdapter extends BaseAdapter {
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
                    diagnostics: 'Could not find textarea'
                };
            }

            if (inputElement instanceof HTMLTextAreaElement) {
                inputElement.value = prompt;

                const inputEvent = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(inputEvent);

                console.log(`[Grok] Prompt prepared (${prompt.length} chars)`);

                return {
                    prepared: true,
                    diagnostics: 'Prompt inserted successfully'
                };
            }

            return {
                prepared: false,
                diagnostics: 'Input element is not a textarea'
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

        if (input instanceof HTMLTextAreaElement && input.value.trim()) {
            return 'prompt_ready';
        }

        return 'ready';
    }

    async captureResponse(): Promise<CaptureResponseResult> {
        // Grok response capture - basic implementation
        // Since Grok is newer, selectors might need updating
        const responses = this.document.querySelectorAll('[data-testid*="message"], .message');
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
}
