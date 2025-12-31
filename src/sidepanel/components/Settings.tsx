import { useState } from 'react';
import type { Settings, SendMode } from '@/lib/types';
import { DEFAULT_SETTINGS, getAutomationWarning } from '@/lib/tosValidator';

interface SettingsProps {
    initialSettings?: Settings;
    onSave: (settings: Settings) => void;
}

export function Settings({ initialSettings = DEFAULT_SETTINGS, onSave }: SettingsProps) {
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [showWarning, setShowWarning] = useState(false);

    const handleSendModeChange = (mode: SendMode) => {
        if (mode !== 'manual') {
            setShowWarning(true);
        }
        setSettings({ ...settings, sendMode: mode });
    };

    const handleSave = () => {
        onSave(settings);
        // Save to chrome.storage.local
        chrome.storage.local.set({ settings });
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        setShowWarning(false);
    };

    const grokWarning = getAutomationWarning('grok');

    return (
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

            {/* Send Mode */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Send Mode
                </label>
                <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="sendMode"
                            value="manual"
                            checked={settings.sendMode === 'manual'}
                            onChange={() => handleSendModeChange('manual')}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Manual</span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    Recommended
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    TOS Safe
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                You copy/paste prompts and click send yourself. Fully compliant with all platform TOS.
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="sendMode"
                            value="semi_assisted"
                            checked={settings.sendMode === 'semi_assisted'}
                            onChange={() => handleSendModeChange('semi_assisted')}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Semi-Assisted</span>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                    Use Caution
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Extension fills prompts, you review and click send. May violate some platform TOS.
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                        <input
                            type="radio"
                            name="sendMode"
                            value="automated"
                            checked={settings.sendMode === 'automated'}
                            onChange={() => handleSendModeChange('automated')}
                            className="mt-1"
                            disabled
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Automated</span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                    Not Recommended
                                </span>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                    Disabled
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Auto-fills and auto-sends. Likely violates TOS. Currently disabled.
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Warnings */}
            {showWarning && settings.sendMode !== 'manual' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                TOS Compliance Warning
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Enabling semi-assisted or automated mode may violate platform Terms of Service:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>OpenAI prohibits automated interactions</li>
                                    <li>Anthropic has usage limits and permission systems</li>
                                    <li>Google prohibits bypassing robots.txt</li>
                                    <li>xAI explicitly bans bots</li>
                                </ul>
                                <p className="mt-2 font-medium">Use at your own risk. Account suspension possible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grok Specific Warning */}
            {grokWarning && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Grok Restriction</h3>
                            <p className="mt-2 text-sm text-red-700">{grokWarning}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Additional Options */}
            <div className="space-y-2">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.requireConfirmation}
                        onChange={(e) => setSettings({ ...settings, requireConfirmation: e.target.checked })}
                        className="rounded"
                    />
                    <span className="text-sm text-gray-700">Require confirmation before sending</span>
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.respectRateLimits}
                        onChange={(e) => setSettings({ ...settings, respectRateLimits: e.target.checked })}
                        className="rounded"
                    />
                    <span className="text-sm text-gray-700">Respect rate limits (min 3s between requests)</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
                <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                    Save Settings
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                    Reset to Safe Defaults
                </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
                Settings are saved locally in your browser
            </p>
        </div>
    );
}
