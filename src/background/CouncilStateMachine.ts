// CouncilStateMachine - Core state management for council sessions
// Implementation from pitch-a-claude-opus.md lines 108-142

import type { CouncilState, ModelPlatform, ModelState, SerializedSessionState } from '@/lib/types';
import { StorageHelper } from '@/lib/storage';

export class CouncilStateMachine {
    private sessionId: string;
    private state: CouncilState;
    private models: Map<ModelPlatform, ModelState>;
    private lastUpdate: number;

    constructor(sessionId: string) {
        this.sessionId = sessionId;
        this.state = 'idle';
        this.models = new Map();
        this.lastUpdate = Date.now();

        // Initialize all 4 models
        this.initializeModels();
    }

    private initializeModels(): void {
        const platforms: ModelPlatform[] = ['chatgpt', 'claude', 'gemini', 'grok'];

        for (const platform of platforms) {
            this.models.set(platform, {
                platform,
                status: 'not_open',
                lastUpdate: Date.now()
            });
        }
    }

    async setState(newState: CouncilState): Promise<void> {
        this.state = newState;
        this.lastUpdate = Date.now();
        await this.persist();
    }

    async setModelState(platform: ModelPlatform, status: ModelState['status'], error?: string): Promise<void> {
        const modelState = this.models.get(platform);
        if (modelState) {
            modelState.status = status;
            modelState.lastUpdate = Date.now();
            if (error) {
                modelState.error = error;
            }
            this.lastUpdate = Date.now();
            await this.persist();
        }
    }

    async setModelTabId(platform: ModelPlatform, tabId: number): Promise<void> {
        const modelState = this.models.get(platform);
        if (modelState) {
            modelState.tabId = tabId;
            modelState.status = 'ready';
            this.lastUpdate = Date.now();
            await this.persist();
        }
    }

    getState(): CouncilState {
        return this.state;
    }

    getModelState(platform: ModelPlatform): ModelState | undefined {
        return this.models.get(platform);
    }

    getAllModels(): Map<ModelPlatform, ModelState> {
        return new Map(this.models);
    }

    getSessionId(): string {
        return this.sessionId;
    }

    /**
     * Persist state to both session and local storage
     * Called after EVERY state transition
     */
    async persist(): Promise<void> {
        const serialized = this.serialize();

        // Save to session storage (survives SW restarts, clears on browser close)
        await StorageHelper.saveSessionState(this.sessionId, serialized);

        // Backup to local storage (survives browser sessions)
        await StorageHelper.saveBackupState(this.sessionId, serialized);
    }

    /**
     * Serialize state for storage
     */
    serialize(): SerializedSessionState {
        return {
            sessionId: this.sessionId,
            state: this.state,
            models: Array.from(this.models.entries()),
            lastUpdate: this.lastUpdate
        };
    }

    /**
     * Deserialize state from storage
     */
    static deserialize(data: SerializedSessionState): CouncilStateMachine {
        const instance = new CouncilStateMachine(data.sessionId);
        instance.state = data.state;
        instance.models = new Map(data.models);
        instance.lastUpdate = data.lastUpdate;
        return instance;
    }

    /**
     * Recover session from storage (session first, then local backup)
     */
    static async recover(sessionId: string): Promise<CouncilStateMachine | null> {
        const data = await StorageHelper.getSessionState(sessionId);

        if (data) {
            console.log(`[CouncilStateMachine] Recovered session: ${sessionId}`);
            return CouncilStateMachine.deserialize(data);
        }

        console.warn(`[CouncilStateMachine] No stored state found for: ${sessionId}`);
        return null;
    }

    /**
     * Create new session
     */
    static async createSession(): Promise<CouncilStateMachine> {
        const sessionId = crypto.randomUUID();
        const council = new CouncilStateMachine(sessionId);
        await council.persist();
        console.log(`[CouncilStateMachine] Created new session: ${sessionId}`);
        return council;
    }
}
