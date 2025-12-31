/**
 * PRDEditor - Edit and export generated PRD documents
 */

import { useState } from 'react';
import type { PRDDocument, PRDSection } from '@/lib/types';
import { updatePRDSection, addPRDSection, deletePRDSection } from '@/lib/prdGenerator';
import { exportPRDAsMarkdown, copyPRDToClipboard, downloadPRDAsFile } from '@/lib/exportManager';

interface PRDEditorProps {
    prd: PRDDocument | null;
    onUpdate?: (prd: PRDDocument) => void;
    onExport?: (prd: PRDDocument) => void;
}

export function PRDEditor({ prd, onUpdate, onExport: _onExport }: PRDEditorProps) {
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [copied, setCopied] = useState(false);
    const [showAddSection, setShowAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    if (!prd) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No PRD Generated</h3>
                <p className="text-sm text-gray-600">
                    Click "Generate PRD" above to create a PRD from your captured responses.
                </p>
            </div>
        );
    }

    const handleStartEdit = (section: PRDSection) => {
        setEditingSection(section.id);
        setEditContent(section.content);
    };

    const handleSaveEdit = () => {
        if (editingSection && onUpdate) {
            const updated = updatePRDSection(prd, editingSection, editContent);
            onUpdate(updated);
        }
        setEditingSection(null);
        setEditContent('');
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
        setEditContent('');
    };

    const handleDeleteSection = (sectionId: string) => {
        if (onUpdate && confirm('Delete this section?')) {
            const updated = deletePRDSection(prd, sectionId);
            onUpdate(updated);
        }
    };

    const handleAddSection = () => {
        if (onUpdate && newSectionTitle.trim()) {
            const updated = addPRDSection(prd, newSectionTitle, '_Add content here..._');
            onUpdate(updated);
            setNewSectionTitle('');
            setShowAddSection(false);
        }
    };

    const handleCopyToClipboard = async () => {
        const success = await copyPRDToClipboard(prd);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        downloadPRDAsFile(prd);
    };

    const sortedSections = [...prd.sections].sort((a, b) => a.order - b.order);

    return (
        <div className="space-y-4">
            {/* Header & Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{prd.title}</h2>
                    <p className="text-sm text-gray-500">
                        Created {new Date(prd.createdAt).toLocaleString()} •
                        {prd.sections.length} sections
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyToClipboard}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                        {copied ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        ⬇️ Download
                    </button>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {sortedSections.map((section) => (
                    <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b">
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                            <div className="flex items-center gap-2">
                                {editingSection !== section.id && (
                                    <>
                                        <button
                                            onClick={() => handleStartEdit(section)}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSection(section.id)}
                                            className="text-xs text-red-600 hover:text-red-800"
                                        >
                                            🗑️
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Section Content */}
                        <div className="p-4">
                            {editingSection === section.id ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={8}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-700">
                                        {section.content}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Source Models */}
                        {section.sourceModels.length > 0 && (
                            <div className="bg-gray-50 px-4 py-2 border-t">
                                <span className="text-xs text-gray-500">
                                    Sources: {section.sourceModels.join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Section */}
            {showAddSection ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            placeholder="Section title..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                            onClick={handleAddSection}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setShowAddSection(false)}
                            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowAddSection(true)}
                    className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                    + Add Section
                </button>
            )}

            {/* Preview Markdown */}
            <details className="bg-gray-100 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    View Markdown Output
                </summary>
                <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                    {exportPRDAsMarkdown(prd)}
                </pre>
            </details>
        </div>
    );
}
