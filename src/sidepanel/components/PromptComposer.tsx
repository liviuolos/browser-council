import { useState } from 'react';
import type { WorkflowStage } from '@/lib/types';
import { TEMPLATES, getTemplateById } from '@/lib/templates';
import { copyToClipboard } from '@/lib/clipboard';

export function PromptComposer({ onChange }: { onChange?: (prompt: string) => void }) {
    const [selectedStage, setSelectedStage] = useState<WorkflowStage>('stage1_briefing');
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
    const [prompt, setPrompt] = useState('');
    const [copied, setCopied] = useState(false);

    const template = getTemplateById(selectedTemplate);
    const stageData = template?.stages.find(s => s.stage === selectedStage);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplate(templateId);
        const newTemplate = getTemplateById(templateId);
        const newStageData = newTemplate?.stages.find(s => s.stage === selectedStage);
        if (newStageData) {
            setPrompt(newStageData.prompt);
            onChange?.(newStageData.prompt);
        }
    };

    const handleStageChange = (stage: WorkflowStage) => {
        setSelectedStage(stage);
        const newStageData = template?.stages.find(s => s.stage === stage);
        if (newStageData) {
            setPrompt(newStageData.prompt);
            onChange?.(newStageData.prompt);
        }
    };

    const handlePromptChange = (newPrompt: string) => {
        setPrompt(newPrompt);
        onChange?.(newPrompt);
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(prompt);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const charCount = prompt.length;

    return (
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Prompt Composer</h2>
                <span className="text-sm text-gray-500">{charCount} characters</span>
            </div>

            {/* Stage Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Stage
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleStageChange('stage1_briefing')}
                        className={`px-3 py-2 rounded text-sm font-medium ${selectedStage === 'stage1_briefing'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        1: Briefing
                    </button>
                    <button
                        onClick={() => handleStageChange('stage2_research')}
                        className={`px-3 py-2 rounded text-sm font-medium ${selectedStage === 'stage2_research'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        2: Research
                    </button>
                    <button
                        onClick={() => handleStageChange('stage3_synthesis')}
                        className={`px-3 py-2 rounded text-sm font-medium ${selectedStage === 'stage3_synthesis'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        3: Synthesis
                    </button>
                </div>
            </div>

            {/* Template Selector */}
            <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                </label>
                <select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
                {template && (
                    <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                )}
            </div>

            {/* Prompt Textarea */}
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                </label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Enter your prompt here..."
                />
            </div>

            {/* Model Hints (Stage 2 only) */}
            {
                selectedStage === 'stage2_research' && stageData?.modelHints && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm font-medium text-blue-900 mb-2">Model-Specific Hints:</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                            {Object.entries(stageData.modelHints).map(([model, hint]) => (
                                <li key={model}>
                                    <strong className="capitalize">{model}:</strong> {hint}
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleCopy}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                    {copied ? '✅ Copied!' : '📋 Copy All'}
                </button>
                <button
                    onClick={() => console.log('Prepare for models')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                    Prepare for Models
                </button>
            </div>
        </div >
    );
}
