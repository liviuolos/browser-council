/**
 * SynthesisWorkflow - Track progress through 3-stage workflow and generate PRD
 */

import { useState, useEffect } from 'react';
import type { PRDDocument, ResponseSet, WorkflowStage } from '@/lib/types';
import { getAllResponseSets, getResponseSummary } from '@/lib/responseManager';
import { generatePRD } from '@/lib/prdGenerator';
import { ResponseComparison } from './ResponseComparison';
import { PRDEditor } from './PRDEditor';
import { SessionHistory } from './SessionHistory';

interface SynthesisWorkflowProps {
    onExport?: (prd: PRDDocument) => void;
}

const STAGES: { stage: WorkflowStage; label: string; icon: string }[] = [
    { stage: 'stage1_briefing', label: 'Briefing', icon: '📋' },
    { stage: 'stage2_research', label: 'Research', icon: '🔍' },
    { stage: 'stage3_synthesis', label: 'Synthesis', icon: '✨' }
];

export function SynthesisWorkflow({ onExport }: SynthesisWorkflowProps) {
    const [responseSets, setResponseSets] = useState<ResponseSet[]>([]);
    const [summary, setSummary] = useState<{ byStage: Record<WorkflowStage, number>; total: number }>({
        byStage: { idle: 0, stage1_briefing: 0, stage2_research: 0, stage3_synthesis: 0 },
        total: 0
    });
    const [prd, setPrd] = useState<PRDDocument | null>(null);
    const [prdTitle, setPrdTitle] = useState('My PRD');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeView, setActiveView] = useState<'compare' | 'prd' | 'history'>('compare');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [sets, summaryData] = await Promise.all([
            getAllResponseSets(),
            getResponseSummary()
        ]);
        setResponseSets(sets);
        setSummary(summaryData);
    };

    const handleGeneratePRD = async () => {
        setIsGenerating(true);
        try {
            const generated = generatePRD(prdTitle, responseSets);
            setPrd(generated);
            setActiveView('prd');
        } catch (error) {
            console.error('Failed to generate PRD:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getStageStatus = (stage: WorkflowStage): 'complete' | 'partial' | 'empty' => {
        const count = summary.byStage[stage];
        if (count >= 4) return 'complete';
        if (count > 0) return 'partial';
        return 'empty';
    };

    return (
        <div className="space-y-6">
            {/* Workflow Progress */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Synthesis Progress</h2>

                <div className="flex items-center justify-between">
                    {STAGES.map((stageInfo, index) => {
                        const status = getStageStatus(stageInfo.stage);
                        const count = summary.byStage[stageInfo.stage];

                        return (
                            <div key={stageInfo.stage} className="flex items-center">
                                {/* Stage Circle */}
                                <div className={`
                                    flex items-center justify-center w-12 h-12 rounded-full border-2
                                    ${status === 'complete' ? 'bg-green-100 border-green-500 text-green-700' :
                                        status === 'partial' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                                            'bg-gray-100 border-gray-300 text-gray-500'}
                                `}>
                                    <span className="text-xl">{stageInfo.icon}</span>
                                </div>

                                {/* Stage Info */}
                                <div className="ml-3">
                                    <div className="font-medium text-gray-900">{stageInfo.label}</div>
                                    <div className="text-xs text-gray-500">
                                        {count}/4 responses
                                    </div>
                                </div>

                                {/* Arrow */}
                                {index < STAGES.length - 1 && (
                                    <div className="mx-4 text-gray-300">→</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Generate Button */}
                <div className="mt-6 flex items-center gap-4">
                    <input
                        type="text"
                        value={prdTitle}
                        onChange={(e) => setPrdTitle(e.target.value)}
                        placeholder="PRD Title"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                        onClick={handleGeneratePRD}
                        disabled={summary.total === 0 || isGenerating}
                        className={`
                            px-6 py-2 rounded-md font-medium text-white
                            ${summary.total > 0 && !isGenerating
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-gray-400 cursor-not-allowed'}
                        `}
                    >
                        {isGenerating ? 'Generating...' : '🪄 Generate PRD'}
                    </button>
                </div>

                {summary.total === 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                        Capture responses first to generate a PRD.
                    </p>
                )}
            </div>

            {/* View Toggle */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveView('compare')}
                    className={`px-4 py-2 font-medium text-sm ${activeView === 'compare'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    📊 Compare Responses
                </button>
                <button
                    onClick={() => setActiveView('prd')}
                    className={`px-4 py-2 font-medium text-sm ${activeView === 'prd'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    📄 PRD Editor
                </button>
                <button
                    onClick={() => setActiveView('history')}
                    className={`px-4 py-2 font-medium text-sm ${activeView === 'history'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    📜 History
                </button>
            </div>

            {/* Content */}
            {activeView === 'compare' && (
                <ResponseComparison />
            )}

            {activeView === 'prd' && (
                <PRDEditor
                    prd={prd}
                    onUpdate={setPrd}
                    onExport={onExport}
                />
            )}

            {activeView === 'history' && (
                <SessionHistory onRefresh={loadData} />
            )}
        </div>
    );
}
