// Type-safe storage utilities for chrome.storage

import type { SerializedSessionState } from './types';

export class StorageHelper {
    /**
     * Save session state to chrome.storage.session
     * Persists across SW restarts, clears on browser close
     */
    static async saveSessionState(sessionId: string, state: SerializedSessionState): Promise<void> {
        await chrome.storage.session.set({
            [`council_${sessionId}`]: state
        });
    }

    /**
     * Save backup state to chrome.storage.local
     * Persists across browser sessions
     */
    static async saveBackupState(sessionId: string, state: SerializedSessionState): Promise<void> {
        await chrome.storage.local.set({
            [`council_backup_${sessionId}`]: state
        });
    }

    /**
     * Retrieve session state, trying session storage first, then local backup
     */
    static async getSessionState(sessionId: string): Promise<SerializedSessionState | null> {
        // Try session storage first
        const sessionData = await chrome.storage.session.get(`council_${sessionId}`);
        if (sessionData[`council_${sessionId}`]) {
            return sessionData[`council_${sessionId}`] as SerializedSessionState;
        }

        // Fall back to local backup
        const localData = await chrome.storage.local.get(`council_backup_${sessionId}`);
        if (localData[`council_backup_${sessionId}`]) {
            return localData[`council_backup_${sessionId}`] as SerializedSessionState;
        }

        return null;
    }

    /**
     * Get all active session IDs from storage
     */
    static async getActiveSessions(): Promise<string[]> {
        const data = await chrome.storage.session.get(null);
        return Object.keys(data)
            .filter(key => key.startsWith('council_'))
            .map(key => key.replace('council_', ''));
    }

    /**
     * Clear session state (both session and local)
     */
    static async clearSession(sessionId: string): Promise<void> {
        await chrome.storage.session.remove(`council_${sessionId}`);
        await chrome.storage.local.remove(`council_backup_${sessionId}`);
    }

    /**
     * Save keep-alive ping timestamp
     */
    static async saveKeepAlivePing(): Promise<void> {
        await chrome.storage.session.set({
            keepalive_ping: Date.now()
        });
    }
}
