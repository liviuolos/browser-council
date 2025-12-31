// Shared// Type definitions for Multi-LLM Council Extension

// ============================================
// Workflow Types (Phase 2)
// ============================================

export type WorkflowStage =
    | 'idle'
    | 'stage1_briefing'     // Initial PRD brief
    | 'stage2_research'     // Model-specific research
    | 'stage3_synthesis';   // Final synthesis

export interface CouncilWorkflow {
    currentStage: WorkflowStage;
    stage1Prompt?: string;
    stage2Prompts?: Record<ModelPlatform, string>;
    stage3Prompt?: string;
    responses?: Record<ModelPlatform, string>;
}

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    stages: {
        stage: WorkflowStage;
        prompt: string;
        modelHints?: Record<ModelPlatform, string>;
    }[];
}

export type SendMode = 'manual' | 'semi_assisted' | 'automated';

export interface Settings {
    sendMode: SendMode;
    requireConfirmation: boolean;
    respectRateLimits: boolean;
}

// ============================================
// Message Passing Types
// ============================================

export type MessageType =
    | 'create_session'
    | 'get_session_state'
    | 'status_update'
    | 'awaiting_send'
    | 'sending'
    | 'streaming'
    | 'complete'
    | 'error';

export type ModelPlatform = 'chatgpt' | 'claude' | 'gemini' | 'grok';

export type ModelStatus =
    | 'not_open'
    | 'ready'
    | 'prompt_ready'
    | 'awaiting_send'
    | 'sending'
    | 'streaming'
    | 'complete'
    | 'error';

export type CouncilState = 'idle' | 'stage1' | 'stage2' | 'stage3' | 'complete' | 'error';

export interface ModelState {
    platform: ModelPlatform;
    status: ModelStatus;
    tabId?: number;
    lastUpdate: number;
    error?: string;
}

export interface SessionState {
    sessionId: string;
    state: CouncilState;
    models: Map<ModelPlatform, ModelState>;
    lastUpdate: number;
}

export interface SerializedSessionState {
    sessionId: string;
    state: CouncilState;
    models: Array<[ModelPlatform, ModelState]>;
    lastUpdate: number;
}

export interface MessageBase {
    messageId: string;
    type: string;
    needsAck?: boolean;
}

export interface AckMessage extends MessageBase {
    type: 'ack';
    originalMessageId: string;
}

export interface StatusUpdateMessage extends MessageBase {
    type: 'status_update';
    platform: ModelPlatform;
    status: ModelStatus;
    error?: string;
}

export interface PreparePromptMessage extends MessageBase {
    type: 'prepare_prompt';
    platform: ModelPlatform;
    prompt: string;
    attachments?: any[];
    routingHints?: Record<string, any>;
}

export type Message = AckMessage | StatusUpdateMessage | PreparePromptMessage;

export interface AdapterCapabilities {
    supportsStreaming: boolean;
    supportsFileUpload: boolean;
    requiresContentEditable: boolean;
}

export interface AdapterSelectors {
    input: string[];
    sendButton: string[];
    response?: string;
    streaming?: string;
}

export interface AdapterConfig {
    platform: ModelPlatform;
    selectors: AdapterSelectors;
    capabilities?: AdapterCapabilities;
    tosCompliance?: {
        allowsAutomation: boolean;        // Can we auto-click send?
        requiresManualMode: boolean;      // Must use manual mode only?
        maxRequestsPerMinute?: number;    // Rate limit guidance
        strictSecurityPolicy: boolean;    // Has Cloudflare/strict security?
        notes?: string;                   // Platform-specific warnings
    };
    notes?: string;
}

export interface RecoveryAction {
    recoverable: boolean;
    action: 'reopen_tab' | 'auto_recovered' | 'manual_mode' | 'retry';
    userMessage?: string;
    copyToClipboard?: boolean;
}

export type ErrorType = 'TAB_CLOSED' | 'DOM_CHANGED' | 'SERVICE_WORKER_RESTART' | 'RATE_LIMITED' | 'UNKNOWN';

// ============================================
// Phase 3: Response Aggregation & PRD Types
// ============================================

export interface CapturedResponse {
    platform: ModelPlatform;
    stage: WorkflowStage;
    text: string;
    capturedAt: number;
    wordCount: number;
    characterCount: number;
}

export interface ResponseSet {
    id: string;
    createdAt: number;
    stage: WorkflowStage;
    prompt: string;
    responses: Partial<Record<ModelPlatform, CapturedResponse>>;
}

export interface PRDSection {
    id: string;
    title: string;
    content: string;
    sourceModels: ModelPlatform[];
    order: number;
}

export interface PRDDocument {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    sections: PRDSection[];
    sourceResponses: ResponseSet[];
}

export const PRD_SECTION_TEMPLATES: Array<{ id: string; title: string; description: string }> = [
    { id: 'overview', title: 'Product Overview', description: 'High-level summary of the product' },
    { id: 'problem', title: 'Problem Statement', description: 'The problem being solved' },
    { id: 'solution', title: 'Proposed Solution', description: 'How the product solves the problem' },
    { id: 'requirements', title: 'Functional Requirements', description: 'Key features and capabilities' },
    { id: 'non_functional', title: 'Non-Functional Requirements', description: 'Performance, security, scalability' },
    { id: 'success', title: 'Success Criteria', description: 'How success will be measured' },
    { id: 'timeline', title: 'Timeline & Milestones', description: 'Delivery phases and dates' },
    { id: 'risks', title: 'Risks & Mitigations', description: 'Potential issues and how to address them' }
];
