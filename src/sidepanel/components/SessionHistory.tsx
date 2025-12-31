/**
 * SessionHistory - View and manage historical response sessions
 */

import { useState, useEffect } from 'react';
import type { ResponseSet, WorkflowStage } from '@/lib/types';
import { getAllResponseSets, clearResponsesForStage, clearAllResponses } from '@/lib/responseManager';

interface SessionHistoryProps {
    onRefresh?: () => void;
}

const STAGE_LABELS: Record<WorkflowStage, { icon: string; label: string }> = {
    'idle': { icon: '⏸️', label: 'Idle' },
    'stage1_briefing': { icon: '📋', label: 'Briefing' },
    'stage2_research': { icon: '🔍', label: 'Research' },
    'stage3_synthesis': { icon: '✨', label: 'Synthesis' }
};

export function SessionHistory({ onRefresh }: SessionHistoryProps) {
    const [responseSets, setResponseSets] = useState<ResponseSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
    const [expandedSet, setExpandedSet] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        const sets = await getAllResponseSets();
        setResponseSets(sets.sort((a, b) => b.createdAt - a.createdAt));
        setIsLoading(false);
    };

    const handleClearStage = async (stage: WorkflowStage) => {
        if (confirm(`Clear all responses for ${STAGE_LABELS[stage].label}?`)) {
            await clearResponsesForStage(stage);
            await loadHistory();
            onRefresh?.();
        }
    };

    const handleClearAll = async () => {
        await clearAllResponses();
        setShowConfirmClearAll(false);
        await loadHistory();
        onRefresh?.();
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const getTotalResponses = () => {
        return responseSets.reduce((sum, rs) => sum + Object.keys(rs.responses).length, 0);
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading history...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Session History</h3>
                    <p className="text-sm text-gray-500">
                        {responseSets.length} stages • {getTotalResponses()} total responses
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadHistory}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                    >
                        🔄 Refresh
                    </button>
                    {responseSets.length > 0 && (
                        <button
                            onClick={() => setShowConfirmClearAll(true)}
                            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800"
                        >
                            🗑️ Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Clear All Confirmation */}
            {showConfirmClearAll && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-medium mb-3">
                        ⚠️ Are you sure you want to delete ALL {getTotalResponses()} responses?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleClearAll}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                        >
                            Yes, Delete All
                        </button>
                        <button
                            onClick={() => setShowConfirmClearAll(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {responseSets.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h4>
                    <p className="text-sm text-gray-600">
                        Capture responses in the Workspace tab to see them here.
                    </p>
                </div>
            )}

            {/* Response Sets List */}
            <div className="space-y-3">
                {responseSets.map(rs => {
                    const stageInfo = STAGE_LABELS[rs.stage];
                    const responseCount = Object.keys(rs.responses).length;
                    const isExpanded = expandedSet === rs.id;

                    return (
                        <div
                            key={rs.id}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                        >
                            {/* Header */}
                            <div
                                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                                onClick={() => setExpandedSet(isExpanded ? null : rs.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{stageInfo.icon}</span>
                                    <div>
                                        <span className="font-medium text-gray-900">
                                            {stageInfo.label}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {responseCount} responses
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">
                                        {formatDate(rs.createdAt)}
                                    </span>
                                    <span className="text-gray-400">
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-4 py-3 bg-gray-50 border-t space-y-3">
                                    {/* Response List */}
                                    {Object.entries(rs.responses).map(([platform, response]) => (
                                        <div key={platform} className="bg-white rounded p-3 border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900 capitalize">
                                                    {platform}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {response?.wordCount || 0} words
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-3">
                                                {response?.text?.substring(0, 200) || 'No content'}
                                                {(response?.text?.length || 0) > 200 && '...'}
                                            </p>
                                        </div>
                                    ))}

                                    {/* Actions */}
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearStage(rs.stage);
                                            }}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            🗑️ Clear Stage
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
