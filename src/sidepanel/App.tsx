import { useState, useEffect } from 'react';
import type { SerializedSessionState, Settings, ModelPlatform } from '@/lib/types';
import ModelRoster from './components/ModelRoster';
import { PromptComposer } from './components/PromptComposer';
import { ManualInstructions } from './components/ManualInstructions';
import { ResponseCapture } from './components/ResponseCapture';
import { Settings as SettingsPanel } from './components/Settings';
import { SynthesisWorkflow } from './components/SynthesisWorkflow';
import { DEFAULT_SETTINGS } from '@/lib/tosValidator';

function App() {
    const [sessionState, setSessionState] = useState<SerializedSessionState | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState<'workspace' | 'synthesize' | 'settings'>('workspace');
    const [showManualInstructions, setShowManualInstructions] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<ModelPlatform | null>(null);
    const [responses, setResponses] = useState<Record<ModelPlatform, string>>({} as Record<ModelPlatform, string>);

    // Initialize or load session
    useEffect(() => {
        const initSession = async () => {
            try {
                // First, try to create a new session
                const createResponse = await chrome.runtime.sendMessage({
                    type: 'create_session'
                });

                if (createResponse?.success && createResponse.sessionId) {
                    console.log('[App] Session created:', createResponse.sessionId);
                    setSessionId(createResponse.sessionId);

                    // Now get the initial state
                    const stateResponse = await chrome.runtime.sendMessage({
                        type: 'get_session_state',
                        sessionId: createResponse.sessionId
                    });

                    if (stateResponse?.success && stateResponse.state) {
                        setSessionState(stateResponse.state);
                    }
                } else {
                    console.error('[App] Failed to create session:', createResponse);
                }
            } catch (error) {
                console.error('[App] Error initializing session:', error);
            }
        };

        initSession();
    }, []);

    // Poll for session state updates
    useEffect(() => {
        if (!sessionId) return;

        const pollState = async () => {
            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'get_session_state',
                    sessionId: sessionId
                });

                if (response?.success && response.state) {
                    setSessionState(response.state);
                }
            } catch (error) {
                console.error('[App] Error polling state:', error);
            }
        };

        const interval = setInterval(pollState, 2000);
        return () => clearInterval(interval);
    }, [sessionId]);

    // Load settings from storage
    useEffect(() => {
        chrome.storage.local.get(['settings'], (result) => {
            if (result.settings) {
                setSettings(result.settings);
            }
        });
    }, []);

    const handleSaveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        chrome.storage.local.set({ settings: newSettings });
    };

    const handleManualComplete = () => {
        setShowManualInstructions(false);
        setSelectedPlatform(null);
    };

    const handleCaptureResponse = (platform: ModelPlatform, response: string) => {
        setResponses(prev => ({ ...prev, [platform]: response }));
    };

    if (!sessionState) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-2">Multi-LLM Council</h1>
                    <p className="text-blue-100">Phase 3: Response Aggregation & PRD Synthesis</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('workspace')}
                            className={`flex-1 px-4 py-3 font-medium ${activeTab === 'workspace'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📝 Workspace
                        </button>
                        <button
                            onClick={() => setActiveTab('synthesize')}
                            className={`flex-1 px-4 py-3 font-medium ${activeTab === 'synthesize'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ✨ Synthesize
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 px-4 py-3 font-medium ${activeTab === 'settings'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            ⚙️ Settings
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === 'workspace' && (
                    <div className="space-y-4">
                        {/* Prompt Composer */}
                        <PromptComposer onChange={setCurrentPrompt} />

                        {/* Manual Instructions (if active) */}
                        {showManualInstructions && selectedPlatform && (
                            <ManualInstructions
                                platform={selectedPlatform}
                                onComplete={handleManualComplete}
                                onCancel={() => setShowManualInstructions(false)}
                            />
                        )}

                        {/* Model Roster */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <ModelRoster
                                sessionState={sessionState}
                                currentPrompt={currentPrompt}
                                onNavigateToSynthesize={() => setActiveTab('synthesize')}
                            />
                        </div>

                        {/* Response Capture Section */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Capture</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(['chatgpt', 'claude', 'gemini', 'grok'] as ModelPlatform[]).map(platform => (
                                    <ResponseCapture
                                        key={platform}
                                        platform={platform}
                                        onCapture={(response) => handleCaptureResponse(platform, response)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Object.keys(responses).length}
                                    </div>
                                    <div className="text-xs text-gray-600">Responses Captured</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {currentPrompt ? '✓' : '-'}
                                    </div>
                                    <div className="text-xs text-gray-600">Prompt Ready</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {settings.sendMode.toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-600">Send Mode</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {sessionState.state.toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-600">Session State</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'synthesize' && (
                    <SynthesisWorkflow />
                )}

                {activeTab === 'settings' && (
                    <SettingsPanel
                        initialSettings={settings}
                        onSave={handleSaveSettings}
                    />
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 py-4">
                    <p>Multi-LLM PRD Writer v1.2.0 • Complete</p>
                    <p className="mt-1">
                        ✅ TOS Compliant • Manual Mode Default • All Data Local
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
