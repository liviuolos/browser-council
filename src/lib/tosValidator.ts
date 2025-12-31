// TOS compliance validator

import type { ModelPlatform, Settings } from './types';
import { getAdapterByPlatform } from '@/content/adapters/registry';

/**
 * Check if auto-send is allowed for a platform given user settings
 */
export function canAutoSend(platform: ModelPlatform, userSettings: Settings): boolean {
    // Grok: ALWAYS manual (xAI TOS explicitly prohibits bots)
    if (platform === 'grok') {
        console.warn('[TOS] Auto-send BLOCKED for Grok (TOS requirement)');
        return false;
    }

    const config = getAdapterByPlatform(platform);

    // Check platform TOS compliance
    if (config?.tosCompliance?.requiresManualMode) {
        console.warn(`[TOS] Auto-send BLOCKED for ${platform} (platform requires manual mode)`);
        return false;
    }

    if (!config?.tosCompliance?.allowsAutomation) {
        console.warn(`[TOS] Auto-send BLOCKED for ${platform} (automation not allowed)`);
        return false;
    }

    // Check user setting
    if (userSettings.sendMode === 'manual') {
        console.log(`[TOS] Auto-send disabled (user preference: manual mode)`);
        return false;
    }

    // All checks passed
    console.log(`[TOS] Auto-send allowed for ${platform} (user mode: ${userSettings.sendMode})`);
    return true;
}

/**
 * Get TOS-safe send mode for a platform
 * This enforces platform restrictions even if user has automation enabled
 */
export function getSafeSendMode(platform: ModelPlatform, userSettings: Settings): 'manual' | 'semi_assisted' | 'automated' {
    // Grok: force manual
    if (platform === 'grok') {
        return 'manual';
    }

    const config = getAdapterByPlatform(platform);

    // Platform requires manual
    if (config?.tosCompliance?.requiresManualMode) {
        return 'manual';
    }

    // Platform doesn't allow automation
    if (!config?.tosCompliance?.allowsAutomation) {
        return 'manual';
    }

    // Use user preference
    return userSettings.sendMode;
}

/**
 * Get warning message for automation status
 */
export function getAutomationWarning(platform: ModelPlatform): string | null {
    if (platform === 'grok') {
        return '⚠️ CRITICAL: xAI Terms of Service explicitly prohibit automated access. Grok is ALWAYS manual mode.';
    }

    const config = getAdapterByPlatform(platform);

    if (config?.tosCompliance?.requiresManualMode) {
        return `⚠️ ${platform} requires manual mode per platform TOS.`;
    }

    if (config?.tosCompliance?.strictSecurityPolicy) {
        return `⚠️ ${platform} has strict security (Cloudflare). Automation may be blocked.`;
    }

    return null;
}

/**
 * Default safe settings
 */
export const DEFAULT_SETTINGS: Settings = {
    sendMode: 'manual',
    requireConfirmation: true,
    respectRateLimits: true
};
