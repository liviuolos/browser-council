// Error recovery handlers from pitch-a-claude-opus.md lines 267-305

import type { ErrorType, RecoveryAction, ModelPlatform } from '@/lib/types';
import { CouncilStateMachine } from './CouncilStateMachine';
import { StorageHelper } from '@/lib/storage';

export class ErrorHandlers {
    /**
     * Handle tab closed during session
     */
    static async handleTabClosed(council: CouncilStateMachine, platform: ModelPlatform): Promise<RecoveryAction> {
        console.log(`[ErrorHandlers] Tab closed for ${platform}`);

        await council.setModelState(platform, 'not_open', 'Tab was closed');

        return {
            recoverable: true,
            action: 'reopen_tab',
            userMessage: `The ${platform} tab was closed. Reopen to continue.`
        };
    }

    /**
     * Handle DOM changes (selectors no longer work)
     */
    static async handleDomChanged(council: CouncilStateMachine, platform: ModelPlatform): Promise<RecoveryAction> {
        console.log(`[ErrorHandlers] DOM changed for ${platform}`);

        // In a real implementation, we'd try fallback selectors here
        // For now, fall back to manual mode

        await council.setModelState(platform, 'error', 'UI changed - manual mode required');

        return {
            recoverable: true,
            action: 'manual_mode',
            userMessage: `${platform} UI changed. Copy prompt manually.`,
            copyToClipboard: true
        };
    }

    /**
     * Handle service worker restart - recover all sessions
     */
    static async handleServiceWorkerRestart(): Promise<{ recovered: number }> {
        console.log('[ErrorHandlers] Service worker restarted - recovering sessions');

        const sessionIds = await StorageHelper.getActiveSessions();
        let recovered = 0;

        for (const sessionId of sessionIds) {
            const council = await CouncilStateMachine.recover(sessionId);
            if (council) {
                recovered++;
                console.log(`[ErrorHandlers] Recovered session ${sessionId}`);
            }
        }

        return { recovered };
    }

    /**
     * Handle rate limiting from LLM platform
     */
    static async handleRateLimited(council: CouncilStateMachine, platform: ModelPlatform): Promise<RecoveryAction> {
        console.log(`[ErrorHandlers] Rate limited on ${platform}`);

        await council.setModelState(platform, 'error', 'Rate limited');

        return {
            recoverable: true,
            action: 'retry',
            userMessage: `${platform} is rate limited. Wait and retry, or proceed without this model.`
        };
    }

    /**
     * Generic error handler
     */
    static async handleError(
        errorType: ErrorType,
        council: CouncilStateMachine,
        platform?: ModelPlatform
    ): Promise<RecoveryAction> {
        switch (errorType) {
            case 'TAB_CLOSED':
                return platform ? this.handleTabClosed(council, platform) : this.getUnknownError();

            case 'DOM_CHANGED':
                return platform ? this.handleDomChanged(council, platform) : this.getUnknownError();

            case 'RATE_LIMITED':
                return platform ? this.handleRateLimited(council, platform) : this.getUnknownError();

            case 'SERVICE_WORKER_RESTART':
                await this.handleServiceWorkerRestart();
                return {
                    recoverable: true,
                    action: 'auto_recovered',
                    userMessage: 'Session recovered after restart'
                };

            default:
                return this.getUnknownError();
        }
    }

    private static getUnknownError(): RecoveryAction {
        return {
            recoverable: false,
            action: 'manual_mode',
            userMessage: 'An unknown error occurred. Please try manual mode.'
        };
    }
}
