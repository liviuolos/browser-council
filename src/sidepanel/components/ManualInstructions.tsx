import { useState } from 'react';
import type { ModelPlatform } from '@/lib/types';

interface ManualInstructionsProps {
    platform: ModelPlatform;
    onComplete: () => void;
    onCancel: () => void;
}

export function ManualInstructions({ platform, onComplete, onCancel }: ManualInstructionsProps) {
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { id: 1, text: 'Prompt copied to clipboard', icon: '✅' },
        { id: 2, text: `Switch to ${platform} tab`, icon: currentStep >= 2 ? '✅' : '⏳' },
        { id: 3, text: 'Paste into input box', icon: currentStep >= 3 ? '✅' : '⏳' },
        { id: 4, text: 'Review prompt', icon: currentStep >= 4 ? '✅' : '⏳' },
        { id: 5, text: 'Click Send button', icon: currentStep >= 5 ? '✅' : '⏳' },
        { id: 6, text: 'Return here when complete', icon: currentStep >= 6 ? '✅' : '⏳' }
    ];

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleMarkAsSent = () => {
        setCurrentStep(steps.length);
        setTimeout(() => onComplete(), 500);
    };

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-amber-900">
                    Manual Mode Instructions
                </h3>
                <span className="text-sm font-medium text-amber-700 capitalize">
                    {platform}
                </span>
            </div>

            <div className="space-y-2">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`flex items-start gap-3 p-2 rounded ${currentStep >= step.id ? 'bg-white' : 'bg-amber-100'
                            }`}
                    >
                        <span className="text-lg flex-shrink-0">{step.icon}</span>
                        <div className="flex-1">
                            <span
                                className={`text-sm ${currentStep >= step.id
                                    ? 'text-gray-900 font-medium'
                                    : 'text-gray-600'
                                    }`}
                            >
                                {step.id}. {step.text}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                {currentStep < steps.length && (
                    <button
                        onClick={handleNext}
                        className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
                    >
                        Next Step
                    </button>
                )}
                {currentStep >= steps.length - 1 && (
                    <button
                        onClick={handleMarkAsSent}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                    >
                        Mark as Sent
                    </button>
                )}
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                    Cancel
                </button>
            </div>

            <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
                💡 <strong>TOS Safe:</strong> Manual mode ensures compliance with all platform terms of service.
            </div>
        </div>
    );
}
