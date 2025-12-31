// Gemini adapter implementation

import { BaseAdapter, type PreparePromptResult, type CaptureResponseResult } from './BaseAdapter';
import type { AdapterConfig, ModelStatus } from '@/lib/types';

export class GeminiAdapter extends BaseAdapter {
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
                    diagnostics: 'Could not find input element'
                };
            }

            // Handle both rich-textarea and regular textarea
            if (inputElement instanceof HTMLTextAreaElement) {
                inputElement.value = prompt;

                const inputEvent = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(inputEvent);

                console.log(`[Gemini] Prompt prepared (${prompt.length} chars)`);

                return {
                    prepared: true,
                    diagnostics: 'Prompt inserted successfully'
                };
            } else {
                // For custom rich-textarea element, try to find nested textarea
                const nestedTextarea = inputElement.querySelector('textarea');
                if (nestedTextarea) {
                    nestedTextarea.value = prompt;

                    const inputEvent = new Event('input', { bubbles: true });
                    nestedTextarea.dispatchEvent(inputEvent);

                    return {
                        prepared: true,
                        diagnostics: 'Prompt inserted into rich-textarea'
                    };
                }
            }

            return {
                prepared: false,
                diagnostics: 'Could not find textarea element'
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

        // Check if input has content
        let hasContent = false;

        if (input instanceof HTMLTextAreaElement && input.value.trim()) {
            hasContent = true;
        } else {
            const nestedTextarea = input.querySelector('textarea');
            if (nestedTextarea?.value.trim()) {
                hasContent = true;
            }
        }

        return hasContent ? 'prompt_ready' : 'ready';
    }

    async captureResponse(): Promise<CaptureResponseResult> {
        // Gemini response capture - basic implementation
        const responses = this.document.querySelectorAll('[data-test-id*="model-response"]');
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
