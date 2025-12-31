/**
 * ResponseComparison - Side-by-side view of all 4 model responses
 */

import { useState, useEffect } from 'react';
import type { CapturedResponse, ModelPlatform, ResponseSet, WorkflowStage } from '@/lib/types';
import { getAllResponseSets, compareResponses } from '@/lib/responseManager';

interface ResponseComparisonProps {
    stage?: WorkflowStage;
    onSelectResponse?: (platform: ModelPlatform, response: CapturedResponse) => void;
}

const PLATFORM_COLORS: Record<ModelPlatform, string> = {
    chatgpt: 'border-green-500 bg-green-50',
    claude: 'border-orange-500 bg-orange-50',
    gemini: 'border-blue-500 bg-blue-50',
    grok: 'border-red-500 bg-red-50'
};

const PLATFORM_NAMES: Record<ModelPlatform, string> = {
    chatgpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    grok: 'Grok'
};

export function ResponseComparison({ stage, onSelectResponse }: ResponseComparisonProps) {
    const [responseSets, setResponseSets] = useState<ResponseSet[]>([]);
    const [expandedPlatform, setExpandedPlatform] = useState<ModelPlatform | null>(null);
    const [copiedPlatform, setCopiedPlatform] = useState<ModelPlatform | null>(null);

    useEffect(() => {
        loadResponses();
    }, [stage]);

    const loadResponses = async () => {
        const sets = await getAllResponseSets();
        if (stage) {
            setResponseSets(sets.filter(rs => rs.stage === stage));
        } else {
            setResponseSets(sets);
        }
    };

    const handleCopyResponse = async (platform: ModelPlatform, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedPlatform(platform);
            setTimeout(() => setCopiedPlatform(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Get all responses for comparison
    const allResponses: CapturedResponse[] = [];
    for (const rs of responseSets) {
        allResponses.push(...(Object.values(rs.responses).filter(Boolean) as CapturedResponse[]));
    }

    const stats = compareResponses(allResponses);

    if (responseSets.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses Yet</h3>
                <p className="text-sm text-gray-600">
                    Capture responses from the Workspace tab to compare them here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-900">
                        {stats.totalModels} models captured
                    </span>
                    <span className="text-blue-700">
                        Avg: {stats.averageWordCount} words
                    </span>
                    {stats.longestResponse && (
                        <span className="text-blue-600">
                            Longest: {PLATFORM_NAMES[stats.longestResponse.platform]} ({stats.longestResponse.wordCount}w)
                        </span>
                    )}
                </div>
            </div>

            {/* Response Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['chatgpt', 'claude', 'gemini', 'grok'] as ModelPlatform[]).map(platform => {
                    // Find response for this platform across all stages
                    let response: CapturedResponse | undefined;
                    for (const rs of responseSets) {
                        if (rs.responses[platform]) {
                            response = rs.responses[platform];
                            break;
                        }
                    }

                    const isExpanded = expandedPlatform === platform;

                    return (
                        <div
                            key={platform}
                            className={`border-2 rounded-lg overflow-hidden ${PLATFORM_COLORS[platform]}`}
                        >
                            {/* Header */}
                            <div className="bg-white bg-opacity-70 px-4 py-2 flex items-center justify-between border-b">
                                <span className="font-semibold text-gray-900">
                                    {PLATFORM_NAMES[platform]}
                                </span>
                                {response && (
                                    <span className="text-xs text-gray-600">
                                        {response.wordCount} words
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {response ? (
                                    <>
                                        <div className={`prose prose-sm ${isExpanded ? '' : 'line-clamp-6'}`}>
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {isExpanded ? response.text : response.text.substring(0, 500)}
                                                {!isExpanded && response.text.length > 500 && '...'}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                onClick={() => setExpandedPlatform(isExpanded ? null : platform)}
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                {isExpanded ? 'Show Less' : 'Show More'}
                                            </button>
                                            <button
                                                onClick={() => handleCopyResponse(platform, response!.text)}
                                                className="text-xs text-gray-600 hover:text-gray-800"
                                            >
                                                {copiedPlatform === platform ? '✓ Copied' : 'Copy'}
                                            </button>
                                            {onSelectResponse && (
                                                <button
                                                    onClick={() => onSelectResponse(platform, response!)}
                                                    className="text-xs text-purple-600 hover:text-purple-800"
                                                >
                                                    Use in PRD
                                                </button>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="mt-2 text-xs text-gray-500">
                                            Captured {new Date(response.capturedAt).toLocaleTimeString()}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <span className="text-gray-500 text-sm">No response captured</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
