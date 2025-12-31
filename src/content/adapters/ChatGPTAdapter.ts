// ChatGPT adapter implementation

import { BaseAdapter, type PreparePromptResult, type CaptureResponseResult } from './BaseAdapter';
import type { AdapterConfig, ModelStatus } from '@/lib/types';

export class ChatGPTAdapter extends BaseAdapter {
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
                    diagnostics: 'Could not find input textarea'
                };
            }

            // For textarea elements
            if (inputElement instanceof HTMLTextAreaElement) {
                inputElement.value = prompt;

                // Trigger input event for React
                const inputEvent = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(inputEvent);

                console.log(`[ChatGPT] Prompt prepared (${prompt.length} chars)`);

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

        // Check if textarea has content
        if (input instanceof HTMLTextAreaElement && input.value.trim()) {
            return 'prompt_ready';
        }

        // Check if there's a streaming response
        if (this.config.selectors.streaming) {
            const streaming = this.document.querySelector(this.config.selectors.streaming);
            if (streaming) {
                return 'streaming';
            }
        }

        return 'ready';
    }

    async captureResponse(): Promise<CaptureResponseResult> {
        const responseSelector = this.config.selectors.response;

        if (!responseSelector) {
            throw new Error('No response selector configured');
        }

        const responses = this.document.querySelectorAll(responseSelector);
        const lastResponse = responses[responses.length - 1];

        if (!lastResponse) {
            throw new Error('No response found');
        }

        return {
            text: lastResponse.textContent || '',
            metadata: {
                selector: responseSelector,
                responseCount: responses.length
            },
            timestamps: {
                start: Date.now(),
                end: Date.now()
            }
        };
    }
}
