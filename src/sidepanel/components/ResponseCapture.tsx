import { useState, useEffect } from 'react';
import type { ModelPlatform, WorkflowStage } from '@/lib/types';
import { saveResponse, createCapturedResponse, getResponseSummary } from '@/lib/responseManager';

interface ResponseCaptureProps {
    platform: ModelPlatform;
    onCapture: (response: string) => void;
    defaultStage?: WorkflowStage;
}

const STAGE_OPTIONS: { value: WorkflowStage; label: string }[] = [
    { value: 'stage1_briefing', label: '📋 Stage 1: Briefing' },
    { value: 'stage2_research', label: '🔍 Stage 2: Research' },
    { value: 'stage3_synthesis', label: '✨ Stage 3: Synthesis' }
];

export function ResponseCapture({ platform, onCapture, defaultStage = 'stage1_briefing' }: ResponseCaptureProps) {
    const [response, setResponse] = useState('');
    const [capturedAt, setCapturedAt] = useState<Date | null>(null);
    const [isManualMode, setIsManualMode] = useState(false);
    const [selectedStage, setSelectedStage] = useState<WorkflowStage>(defaultStage);
    const [savedCount, setSavedCount] = useState(0);
    const [showSavedConfirm, setShowSavedConfirm] = useState(false);

    // Load previous response count on mount
    useEffect(() => {
        loadResponseCount();
    }, []);

    const loadResponseCount = async () => {
        const summary = await getResponseSummary();
        setSavedCount(summary.total);
    };

    const handleAutoCapture = async () => {
        console.log(`[ResponseCapture] Auto-capturing from ${platform}`);

        try {
            // Request capture from adapter via background service worker
            const response = await chrome.runtime.sendMessage({
                type: 'capture_response',
                platform: platform
            });

            if (response?.success && response.text) {
                setResponse(response.text);
                setCapturedAt(new Date());
                onCapture(response.text);
            } else {
                // Fallback: adapter not connected or capture failed
                console.warn(`[ResponseCapture] Auto-capture failed for ${platform}:`, response?.error || 'Unknown error');
                // Show manual mode instead
                setIsManualMode(true);
            }
        } catch (error) {
            console.error(`[ResponseCapture] Auto-capture error:`, error);
            // Fallback to manual mode on any error
            setIsManualMode(true);
        }
    };

    const handleSaveResponse = async () => {
        if (!response.trim()) return;

        // Create and save the captured response
        const capturedResponse = createCapturedResponse(platform, selectedStage, response);
        await saveResponse(capturedResponse);

        // Update UI state
        setCapturedAt(new Date());
        onCapture(response);
        setShowSavedConfirm(true);

        // Reload count
        await loadResponseCount();

        // Hide confirmation after 2 seconds
        setTimeout(() => setShowSavedConfirm(false), 2000);
    };

    const handleClear = () => {
        setCapturedAt(null);
        setResponse('');
        setIsManualMode(false);
        setShowSavedConfirm(false);
    };

    const timeAgo = capturedAt
        ? Math.floor((Date.now() - capturedAt.getTime()) / 60000) + 'm ago'
        : null;

    const wordCount = response.trim().split(/\s+/).filter(w => w.length > 0).length;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-gray-900 capitalize">
                    {platform} Response
                </h3>
                <div className="flex items-center gap-2">
                    {showSavedConfirm && (
                        <span className="text-xs text-green-600 font-medium animate-pulse">
                            ✓ Saved!
                        </span>
                    )}
                    {capturedAt && (
                        <span className="text-xs text-gray-500">
                            {timeAgo}
                        </span>
                    )}
                </div>
            </div>

            {/* Stage Selector */}
            {!capturedAt && (
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Save to stage:</label>
                    <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value as WorkflowStage)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {STAGE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Capture Buttons */}
            {!capturedAt && !isManualMode && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Ready to capture response
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAutoCapture}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                        >
                            🎯 Auto-Capture
                        </button>
                        <button
                            onClick={() => setIsManualMode(true)}
                            className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
                        >
                            ✍️ Paste
                        </button>
                    </div>
                </div>
            )}

            {/* Manual Paste Mode */}
            {isManualMode && !capturedAt && (
                <div className="space-y-2">
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Paste the response here..."
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {wordCount} words • {response.length} chars
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsManualMode(false);
                                    setResponse('');
                                }}
                                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveResponse}
                                disabled={!response.trim()}
                                className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                💾 Save Response
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Captured Response Display */}
            {capturedAt && response && (
                <div className="space-y-2">
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-60 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {response.substring(0, 500)}
                            {response.length > 500 && '...'}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {wordCount} words • Stage: {STAGE_OPTIONS.find(s => s.value === selectedStage)?.label.split(':')[1] || selectedStage}
                        </span>
                        <div className="flex gap-2 text-xs">
                            <button
                                onClick={handleClear}
                                className="px-3 py-1 text-red-600 hover:text-red-700"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(response)}
                                className="px-3 py-1 text-blue-600 hover:text-blue-700"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Saved Response Count */}
            {savedCount > 0 && (
                <div className="text-xs text-gray-500 border-t pt-2">
                    📊 {savedCount} total responses saved across all models
                </div>
            )}
        </div>
    );
}
