/**
 * Response Manager - Store, retrieve, and compare LLM responses
 */

import type { CapturedResponse, ModelPlatform, ResponseSet, WorkflowStage } from './types';

// Storage key for persisting responses
const STORAGE_KEY = 'council_responses';

/**
 * Save a captured response to storage
 */
export async function saveResponse(response: CapturedResponse): Promise<void> {
    const existing = await getAllResponseSets();

    // Find or create response set for this stage
    let responseSet = existing.find(rs => rs.stage === response.stage);

    if (!responseSet) {
        responseSet = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            stage: response.stage,
            prompt: '',
            responses: {}
        };
        existing.push(responseSet);
    }

    // Add/update the response for this platform
    responseSet.responses[response.platform] = response;

    await chrome.storage.local.set({ [STORAGE_KEY]: existing });
    console.log(`[ResponseManager] Saved response from ${response.platform} for stage ${response.stage}`);
}

/**
 * Get all response sets
 */
export async function getAllResponseSets(): Promise<ResponseSet[]> {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || [];
}

/**
 * Get responses for a specific stage
 */
export async function getResponsesByStage(stage: WorkflowStage): Promise<ResponseSet | null> {
    const all = await getAllResponseSets();
    return all.find(rs => rs.stage === stage) || null;
}

/**
 * Get all responses grouped by platform
 */
export async function getResponsesByPlatform(): Promise<Partial<Record<ModelPlatform, CapturedResponse[]>>> {
    const all = await getAllResponseSets();
    const byPlatform: Partial<Record<ModelPlatform, CapturedResponse[]>> = {};

    for (const responseSet of all) {
        for (const [platform, response] of Object.entries(responseSet.responses)) {
            if (!byPlatform[platform as ModelPlatform]) {
                byPlatform[platform as ModelPlatform] = [];
            }
            byPlatform[platform as ModelPlatform]!.push(response as CapturedResponse);
        }
    }

    return byPlatform;
}

/**
 * Create a captured response from raw text
 */
export function createCapturedResponse(
    platform: ModelPlatform,
    stage: WorkflowStage,
    text: string
): CapturedResponse {
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

    return {
        platform,
        stage,
        text,
        capturedAt: Date.now(),
        wordCount,
        characterCount: text.length
    };
}

/**
 * Compare responses across platforms
 */
export function compareResponses(responses: CapturedResponse[]): {
    totalModels: number;
    averageWordCount: number;
    longestResponse: { platform: ModelPlatform; wordCount: number } | null;
    shortestResponse: { platform: ModelPlatform; wordCount: number } | null;
} {
    if (responses.length === 0) {
        return {
            totalModels: 0,
            averageWordCount: 0,
            longestResponse: null,
            shortestResponse: null
        };
    }

    const wordCounts = responses.map(r => ({ platform: r.platform, wordCount: r.wordCount }));
    const sorted = [...wordCounts].sort((a, b) => b.wordCount - a.wordCount);
    const total = wordCounts.reduce((sum, r) => sum + r.wordCount, 0);

    return {
        totalModels: responses.length,
        averageWordCount: Math.round(total / responses.length),
        longestResponse: sorted[0] || null,
        shortestResponse: sorted[sorted.length - 1] || null
    };
}

/**
 * Clear responses for a specific stage
 */
export async function clearResponsesForStage(stage: WorkflowStage): Promise<void> {
    const existing = await getAllResponseSets();
    const filtered = existing.filter(rs => rs.stage !== stage);
    await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
    console.log(`[ResponseManager] Cleared responses for stage ${stage}`);
}

/**
 * Clear all responses
 */
export async function clearAllResponses(): Promise<void> {
    await chrome.storage.local.remove([STORAGE_KEY]);
    console.log('[ResponseManager] Cleared all responses');
}

/**
 * Get response count summary
 */
export async function getResponseSummary(): Promise<{
    byStage: Record<WorkflowStage, number>;
    total: number;
}> {
    const all = await getAllResponseSets();
    const byStage: Record<WorkflowStage, number> = {
        'idle': 0,
        'stage1_briefing': 0,
        'stage2_research': 0,
        'stage3_synthesis': 0
    };

    let total = 0;

    for (const rs of all) {
        const count = Object.keys(rs.responses).length;
        byStage[rs.stage] = count;
        total += count;
    }

    return { byStage, total };
}
