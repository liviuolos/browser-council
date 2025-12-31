/**
 * PRD Generator - Combine LLM responses into structured PRD document
 */

import type { CapturedResponse, PRDDocument, PRDSection, ResponseSet } from './types';

/**
 * Generate a PRD document from response sets
 */
export function generatePRD(
    title: string,
    responseSets: ResponseSet[]
): PRDDocument {
    const sections: PRDSection[] = [];

    // Create sections based on available responses
    const allResponses = collectAllResponses(responseSets);

    // Generate Overview section (from briefing stage)
    const briefingResponses = responseSets.find(rs => rs.stage === 'stage1_briefing');
    if (briefingResponses && Object.keys(briefingResponses.responses).length > 0) {
        sections.push({
            id: 'overview',
            title: 'Product Overview',
            content: synthesizeSection(Object.values(briefingResponses.responses) as CapturedResponse[], 'overview'),
            sourceModels: Object.keys(briefingResponses.responses) as any[],
            order: 0
        });
    }

    // Generate Problem Statement
    sections.push({
        id: 'problem',
        title: 'Problem Statement',
        content: extractProblemStatement(allResponses),
        sourceModels: allResponses.map(r => r.platform),
        order: 1
    });

    // Generate Solution section
    sections.push({
        id: 'solution',
        title: 'Proposed Solution',
        content: extractSolution(allResponses),
        sourceModels: allResponses.map(r => r.platform),
        order: 2
    });

    // Generate Requirements
    const researchResponses = responseSets.find(rs => rs.stage === 'stage2_research');
    if (researchResponses && Object.keys(researchResponses.responses).length > 0) {
        sections.push({
            id: 'requirements',
            title: 'Functional Requirements',
            content: synthesizeRequirements(Object.values(researchResponses.responses) as CapturedResponse[]),
            sourceModels: Object.keys(researchResponses.responses) as any[],
            order: 3
        });
    }

    // Generate Success Criteria
    const synthesisResponses = responseSets.find(rs => rs.stage === 'stage3_synthesis');
    if (synthesisResponses && Object.keys(synthesisResponses.responses).length > 0) {
        sections.push({
            id: 'success',
            title: 'Success Criteria',
            content: synthesizeSection(Object.values(synthesisResponses.responses) as CapturedResponse[], 'success'),
            sourceModels: Object.keys(synthesisResponses.responses) as any[],
            order: 4
        });
    }

    return {
        id: crypto.randomUUID(),
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sections,
        sourceResponses: responseSets
    };
}

/**
 * Collect all responses from all stages
 */
function collectAllResponses(responseSets: ResponseSet[]): CapturedResponse[] {
    const responses: CapturedResponse[] = [];
    for (const rs of responseSets) {
        responses.push(...(Object.values(rs.responses) as CapturedResponse[]));
    }
    return responses;
}

/**
 * Synthesize content from multiple responses into a section
 */
function synthesizeSection(responses: CapturedResponse[], _sectionType: string): string {
    if (responses.length === 0) {
        return '_No responses captured yet._';
    }

    // Combine responses with model attribution
    let content = '';

    for (const response of responses) {
        const modelName = getPlatformDisplayName(response.platform);
        const excerpt = extractExcerpt(response.text, 500);
        content += `### ${modelName} Insights\n\n${excerpt}\n\n`;
    }

    return content.trim();
}

/**
 * Extract problem statement from responses
 */
function extractProblemStatement(responses: CapturedResponse[]): string {
    if (responses.length === 0) {
        return '_Define the problem your product solves._';
    }

    // Look for problem-related keywords in responses
    const problemKeywords = ['problem', 'challenge', 'issue', 'pain point', 'need'];

    let problemContent = '';

    for (const response of responses) {
        const sentences = response.text.split(/[.!?]+/);
        const problemSentences = sentences.filter(s =>
            problemKeywords.some(kw => s.toLowerCase().includes(kw))
        ).slice(0, 3);

        if (problemSentences.length > 0) {
            problemContent += `**${getPlatformDisplayName(response.platform)}:** ${problemSentences.join('. ')}.\n\n`;
        }
    }

    return problemContent.trim() || '_Analyze responses to extract problem statements._';
}

/**
 * Extract solution from responses
 */
function extractSolution(responses: CapturedResponse[]): string {
    if (responses.length === 0) {
        return '_Describe your proposed solution._';
    }

    const solutionKeywords = ['solution', 'approach', 'we will', 'we can', 'implement', 'build', 'create'];

    let solutionContent = '';

    for (const response of responses) {
        const sentences = response.text.split(/[.!?]+/);
        const solutionSentences = sentences.filter(s =>
            solutionKeywords.some(kw => s.toLowerCase().includes(kw))
        ).slice(0, 3);

        if (solutionSentences.length > 0) {
            solutionContent += `**${getPlatformDisplayName(response.platform)}:** ${solutionSentences.join('. ')}.\n\n`;
        }
    }

    return solutionContent.trim() || '_Synthesize solution approach from responses._';
}

/**
 * Synthesize requirements from research responses
 */
function synthesizeRequirements(responses: CapturedResponse[]): string {
    if (responses.length === 0) {
        return '_List functional requirements._';
    }

    let requirements = '## Requirements by Model\n\n';

    for (const response of responses) {
        requirements += `### ${getPlatformDisplayName(response.platform)}\n\n`;

        // Try to extract bullet points or numbered lists
        const lines = response.text.split('\n');
        const bulletLines = lines.filter(l =>
            l.trim().match(/^[-•*]\s/) || l.trim().match(/^\d+[.)]\s/)
        ).slice(0, 10);

        if (bulletLines.length > 0) {
            requirements += bulletLines.join('\n') + '\n\n';
        } else {
            requirements += extractExcerpt(response.text, 300) + '\n\n';
        }
    }

    return requirements.trim();
}

/**
 * Extract excerpt from text
 */
function extractExcerpt(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get display name for platform
 */
function getPlatformDisplayName(platform: string): string {
    const names: Record<string, string> = {
        'chatgpt': 'ChatGPT',
        'claude': 'Claude',
        'gemini': 'Gemini',
        'grok': 'Grok'
    };
    return names[platform] || platform;
}

/**
 * Update a section in a PRD document
 */
export function updatePRDSection(
    prd: PRDDocument,
    sectionId: string,
    newContent: string
): PRDDocument {
    const sections = prd.sections.map(s =>
        s.id === sectionId ? { ...s, content: newContent } : s
    );

    return {
        ...prd,
        sections,
        updatedAt: Date.now()
    };
}

/**
 * Reorder sections in PRD
 */
export function reorderPRDSections(
    prd: PRDDocument,
    sectionIds: string[]
): PRDDocument {
    const orderedSections = sectionIds
        .map((id, index) => {
            const section = prd.sections.find(s => s.id === id);
            return section ? { ...section, order: index } : null;
        })
        .filter((s): s is PRDSection => s !== null);

    return {
        ...prd,
        sections: orderedSections,
        updatedAt: Date.now()
    };
}

/**
 * Add a new section to PRD
 */
export function addPRDSection(
    prd: PRDDocument,
    title: string,
    content: string
): PRDDocument {
    const newSection: PRDSection = {
        id: crypto.randomUUID(),
        title,
        content,
        sourceModels: [],
        order: prd.sections.length
    };

    return {
        ...prd,
        sections: [...prd.sections, newSection],
        updatedAt: Date.now()
    };
}

/**
 * Delete a section from PRD
 */
export function deletePRDSection(
    prd: PRDDocument,
    sectionId: string
): PRDDocument {
    const sections = prd.sections
        .filter(s => s.id !== sectionId)
        .map((s, index) => ({ ...s, order: index }));

    return {
        ...prd,
        sections,
        updatedAt: Date.now()
    };
}
