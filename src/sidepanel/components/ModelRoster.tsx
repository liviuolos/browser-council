import { useState, useEffect } from 'react';
import type { SerializedSessionState, ModelPlatform } from '@/lib/types';
import { copyToClipboard } from '@/lib/clipboard';
import { getResponsesByPlatform } from '@/lib/responseManager';

interface ModelRosterProps {
    sessionState: SerializedSessionState;
    currentPrompt?: string;
    onNavigateToSynthesize?: () => void;
}

const PLATFORM_LABELS: Record<ModelPlatform, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    grok: 'Grok'
};

const PLATFORM_COLORS: Record<ModelPlatform, string> = {
    chatgpt: 'bg-green-100 text-green-800 border-green-300',
    claude: 'bg-orange-100 text-orange-800 border-orange-300',
    gemini: 'bg-blue-100 text-blue-800 border-blue-300',
    grok: 'bg-purple-100 text-purple-800 border-purple-300'
};

const PLATFORM_URLS: Record<ModelPlatform, string> = {
    chatgpt: 'https://chatgpt.com',
    claude: 'https://claude.ai',
    gemini: 'https://gemini.google.com',
    grok: 'https://grok.com'
};

const STATUS_COLORS = {
    not_open: 'bg-gray-100 text-gray-700',
    ready: 'bg-green-100 text-green-700',
    prompt_ready: 'bg-blue-100 text-blue-700',
    awaiting_send: 'bg-yellow-100 text-yellow-700',
    sending: 'bg-orange-100 text-orange-700',
    streaming: 'bg-purple-100 text-purple-700',
    complete: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700'
};

function ModelRoster({ sessionState, currentPrompt = '', onNavigateToSynthesize }: ModelRosterProps) {
    const models = sessionState.models;
    const [copiedPlatform, setCopiedPlatform] = useState<ModelPlatform | null>(null);
    const [responseCounts, setResponseCounts] = useState<Partial<Record<ModelPlatform, number>>>({});

    // Load response counts on mount and periodically
    useEffect(() => {
        loadResponseCounts();
        const interval = setInterval(loadResponseCounts, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadResponseCounts = async () => {
        const byPlatform = await getResponsesByPlatform();
        const counts: Partial<Record<ModelPlatform, number>> = {};
        for (const [platform, responses] of Object.entries(byPlatform)) {
            counts[platform as ModelPlatform] = (responses || []).length;
        }
        setResponseCounts(counts);
    };

    const handleCopy = async (platform: ModelPlatform) => {
        const success = await copyToClipboard(currentPrompt || 'No prompt available');
        if (success) {
            setCopiedPlatform(platform);
            setTimeout(() => setCopiedPlatform(null), 2000);
        }
    };

    const handleOpenTab = (platform: ModelPlatform) => {
        chrome.tabs.create({ url: PLATFORM_URLS[platform] });
    };

    const totalResponses = Object.values(responseCounts).reduce((sum, count) => sum + (count || 0), 0);
    const readyToSynthesize = totalResponses >= 2;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Model Roster</h2>
                <div className="flex items-center gap-2">
                    {totalResponses > 0 && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                            📊 {totalResponses} responses
                        </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">
                        {sessionState.state.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Ready to Synthesize Banner */}
            {readyToSynthesize && onNavigateToSynthesize && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium text-purple-800">
                            ✨ Ready to synthesize!
                        </span>
                        <span className="text-xs text-purple-600 ml-2">
                            {totalResponses} responses from {Object.keys(responseCounts).length} models
                        </span>
                    </div>
                    <button
                        onClick={onNavigateToSynthesize}
                        className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700"
                    >
                        Go to Synthesize →
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {models.map(([platform, modelState]) => {
                    const responseCount = responseCounts[platform] || 0;

                    return (
                        <div
                            key={platform}
                            className={`p-3 rounded-lg border-2 ${PLATFORM_COLORS[platform]} transition-all`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                                    <span className="font-semibold">{PLATFORM_LABELS[platform]}</span>
                                    {/* Response Badge */}
                                    {responseCount > 0 && (
                                        <span className="text-xs px-2 py-0.5 bg-white bg-opacity-70 rounded-full font-medium">
                                            {responseCount} 📝
                                        </span>
                                    )}
                                </div>

                                <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[modelState.status]}`}>
                                    {modelState.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            {/* Manual Mode Indicator */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                    ✓ Manual Mode
                                </span>
                                <span className="text-xs text-gray-600">
                                    TOS Safe
                                </span>
                                {platform === 'grok' && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                        Always Manual
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => handleCopy(platform)}
                                    disabled={!currentPrompt}
                                    className="flex-1 px-3 py-1.5 bg-white border border-current rounded text-sm font-medium hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {copiedPlatform === platform ? '✓ Copied!' : '📋 Copy Prompt'}
                                </button>
                                <button
                                    onClick={() => handleOpenTab(platform)}
                                    className="flex-1 px-3 py-1.5 bg-white border border-current rounded text-sm font-medium hover:bg-opacity-50"
                                >
                                    🔗 Open Tab
                                </button>
                            </div>

                            {modelState.tabId && (
                                <div className="text-xs text-gray-600 mt-1">
                                    Tab ID: {modelState.tabId}
                                </div>
                            )}

                            {modelState.error && (
                                <div className="text-xs text-red-600 mt-1 font-medium">
                                    Error: {modelState.error}
                                </div>
                            )}

                            <div className="text-xs text-gray-500 mt-1">
                                Updated: {new Date(modelState.lastUpdate).toLocaleTimeString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                    <strong>Manual Workflow:</strong> Use "Copy Prompt" to copy, then switch to the tab, paste, review, and click send yourself.
                </p>
            </div>
        </div>
    );
}

export default ModelRoster;
