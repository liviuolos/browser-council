// KeepAliveManager - Prevents MV3 service worker termination
// Implementation from pitch-a-claude-opus.md lines 72-101

import { StorageHelper } from '@/lib/storage';

export class KeepAliveManager {
    private activeSessions: Set<string>;
    private static instance: KeepAliveManager;
    private readonly ALARM_NAME = 'council-keepalive';
    private readonly ALARM_INTERVAL_MINUTES = 0.5; // 30 seconds - Chrome 120+ minimum

    private constructor() {
        this.activeSessions = new Set();
        this.setupListeners();
    }

    static getInstance(): KeepAliveManager {
        if (!KeepAliveManager.instance) {
            KeepAliveManager.instance = new KeepAliveManager();
        }
        return KeepAliveManager.instance;
    }

    private setupListeners(): void {
        // Listen for alarm events
        chrome.alarms.onAlarm.addListener((alarm) => this.handleAlarm(alarm));
    }

    async startSession(sessionId: string): Promise<void> {
        console.log(`[KeepAlive] Starting session: ${sessionId}`);
        this.activeSessions.add(sessionId);

        // Create alarm if not already set
        const existing = await chrome.alarms.get(this.ALARM_NAME);
        if (!existing) {
            await chrome.alarms.create(this.ALARM_NAME, {
                periodInMinutes: this.ALARM_INTERVAL_MINUTES
            });
            console.log(`[KeepAlive] Alarm created with ${this.ALARM_INTERVAL_MINUTES * 60}s interval`);
        }
    }

    async stopSession(sessionId: string): Promise<void> {
        console.log(`[KeepAlive] Stopping session: ${sessionId}`);
        this.activeSessions.delete(sessionId);

        // Clear alarm if no active sessions
        if (this.activeSessions.size === 0) {
            await chrome.alarms.clear(this.ALARM_NAME);
            console.log('[KeepAlive] Alarm cleared - no active sessions');
        }
    }

    private async handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
        if (alarm.name === this.ALARM_NAME && this.activeSessions.size > 0) {
            // Any extension API call extends service worker lifetime
            await StorageHelper.saveKeepAlivePing();
            await this.checkSessionHealth();

            console.log(`[KeepAlive] Ping - ${this.activeSessions.size} active sessions`);
        }
    }

    private async checkSessionHealth(): Promise<void> {
        // Verify active sessions still exist in storage
        const storedSessions = await StorageHelper.getActiveSessions();

        for (const sessionId of this.activeSessions) {
            if (!storedSessions.includes(sessionId)) {
                console.warn(`[KeepAlive] Session ${sessionId} missing from storage, removing`);
                this.activeSessions.delete(sessionId);
            }
        }
    }

    getActiveSessions(): string[] {
        return Array.from(this.activeSessions);
    }

    hasActiveSessions(): boolean {
        return this.activeSessions.size > 0;
    }
}
