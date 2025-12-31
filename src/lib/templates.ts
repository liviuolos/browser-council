// Prompt templates for Council workflows

import type { PromptTemplate, WorkflowStage } from './types';

export const STANDARD_PRD_TEMPLATE: PromptTemplate = {
    id: 'standard-prd',
    name: 'Standard PRD (3-Stage)',
    description: 'Comprehensive PRD using all 4 models with specialized research',
    stages: [
        {
            stage: 'stage1_briefing',
            prompt: `Write a Product Requirements Document for [FEATURE/PRODUCT NAME].

Include:
- Executive Summary
- Problem Statement
- Target Users
- Core Features
- Success Metrics

Keep it concise (1-2 pages). We'll expand in the next stage.`
        },
        {
            stage: 'stage2_research',
            prompt: 'Based on the initial brief, provide your specialized analysis:',
            modelHints: {
                chatgpt: 'Focus on user stories and acceptance criteria',
                claude: 'Focus on technical architecture and API design',
                gemini: 'Research market analysis and competitive landscape',
                grok: 'Identify risks, edge cases, and potential issues'
            }
        },
        {
            stage: 'stage3_synthesis',
            prompt: `Synthesize all the research into a final PRD.

Combine:
- User stories (ChatGPT)
- Technical architecture (Claude)
- Market analysis (Gemini)
- Risk assessment (Grok)

Create a comprehensive, implementation-ready PRD.`
        }
    ]
};

export const TECHNICAL_SPEC_TEMPLATE: PromptTemplate = {
    id: 'technical-spec',
    name: 'Technical Specification',
    description: 'Detailed technical spec for engineering teams',
    stages: [
        {
            stage: 'stage1_briefing',
            prompt: `Create a technical specification for [SYSTEM/FEATURE].

Cover:
- System overview
- Architecture patterns
- Data models
- API contracts
- Technology stack`
        },
        {
            stage: 'stage2_research',
            prompt: 'Expand your area of expertise:',
            modelHints: {
                chatgpt: 'Database schema and data flow',
                claude: 'API design and service architecture',
                gemini: 'Infrastructure and deployment strategy',
                grok: 'Security considerations and failure modes'
            }
        },
        {
            stage: 'stage3_synthesis',
            prompt: 'Compile the complete technical specification with all components integrated.'
        }
    ]
};

export const FEATURE_BRIEF_TEMPLATE: PromptTemplate = {
    id: 'feature-brief',
    name: 'Quick Feature Brief',
    description: 'Single-stage brief description for stakeholders',
    stages: [
        {
            stage: 'stage1_briefing',
            prompt: `Write a brief feature description for [FEATURE NAME].

Include:
- What it does (2-3 sentences)
- Who it's for
- Key benefit
- Effort estimate (T-shirt size)

Keep it under 200 words - this is for stakeholder alignment.`
        }
    ]
};

export const TEMPLATES: PromptTemplate[] = [
    STANDARD_PRD_TEMPLATE,
    TECHNICAL_SPEC_TEMPLATE,
    FEATURE_BRIEF_TEMPLATE
];

export function getTemplateById(id: string): PromptTemplate | undefined {
    return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByStage(stage: WorkflowStage): PromptTemplate[] {
    return TEMPLATES.filter(t => t.stages.some(s => s.stage === stage));
}
