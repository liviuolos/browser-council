# Multi-LLM PRD Writer — Evaluator Report

**Version:** 1.2.0 | **Date:** December 31, 2025

---

## What This Extension Does

The Multi-LLM PRD Writer helps users **create better PRDs** by consulting 4 AI models (ChatGPT, Claude, Gemini, Grok) in a structured 3-stage workflow, then synthesizing their responses into a unified document.

**Core Value Proposition:**
> "Higher output quality through AI pluralism — get perspectives from 4 different models, see them side-by-side, and generate a synthesized PRD."

---

## User Journey Overview

```mermaid
flowchart TB
    subgraph Start["🚀 Getting Started"]
        A[Install Extension] --> B[Click Extension Icon]
        B --> C[Side Panel Opens]
    end
    
    subgraph Compose["📝 Stage 1: Compose"]
        C --> D[Select PRD Stage]
        D --> E[Choose Template]
        E --> F[Write/Edit Prompt]
        F --> G[Copy Prompt]
    end
    
    subgraph Consult["🤖 Stage 2: Consult Models"]
        G --> H[Open AI Tab]
        H --> I[Paste Prompt]
        I --> J[Click Send Manually]
        J --> K[Wait for Response]
        K --> L[Capture Response]
        L -->|Repeat for each model| H
    end
    
    subgraph Synthesize["✨ Stage 3: Synthesize"]
        L --> M[Compare Responses]
        M --> N[Generate PRD]
        N --> O[Edit Sections]
        O --> P[Export Markdown]
    end
    
    P --> Q[📄 Final PRD Document]
```

---

## Main Navigation

The extension has a **3-tab interface**:

```mermaid
flowchart LR
    subgraph Tabs["Side Panel Navigation"]
        W[🏠 Workspace] ---|Primary| S[✨ Synthesize]
        S ---|Configure| ST[⚙️ Settings]
    end
    
    subgraph WorkspaceContent["Workspace Tab"]
        W --> PC[Prompt Composer]
        PC --> MR[Model Roster]
        MR --> RC[Response Capture]
    end
    
    subgraph SynthesizeContent["Synthesize Tab"]
        S --> SP[Stage Progress]
        SP --> RC2[Compare Responses]
        RC2 --> PE[PRD Editor]
        PE --> HI[History]
    end
    
    subgraph SettingsContent["Settings Tab"]
        ST --> SM[Send Mode]
        SM --> TW[TOS Warnings]
    end
```

---

## Tab 1: Workspace

This is where users **compose prompts** and **capture responses**.

### Prompt Composer
```
┌─────────────────────────────────────────┐
│  📋 Prompt Composer                     │
├─────────────────────────────────────────┤
│  Stage: [Briefing ▼]                    │
│  Template: [Standard PRD ▼]             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Your prompt text here...         │  │
│  │                                   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  245 characters                         │
│                                         │
│  [📋 Copy All] [🔄 Use Template]        │
└─────────────────────────────────────────┘
```

### Model Roster
```
┌─────────────────────────────────────────┐
│  🤖 Model Roster                        │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ 🟢 ChatGPT          [2 📝] READY  │  │
│  │ ✓ Manual Mode • TOS Safe          │  │
│  │ [📋 Copy Prompt] [🔗 Open Tab]    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🟠 Claude           [1 📝] READY  │  │
│  │ ✓ Manual Mode • TOS Safe          │  │
│  │ [📋 Copy Prompt] [🔗 Open Tab]    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🔵 Gemini           [0 📝] READY  │  │
│  │ ✓ Manual Mode • TOS Safe          │  │
│  │ [📋 Copy Prompt] [🔗 Open Tab]    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🟣 Grok             [0 📝] READY  │  │
│  │ ✓ Manual Mode • Always Manual     │  │
│  │ [📋 Copy Prompt] [🔗 Open Tab]    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║ ✨ Ready to synthesize!           ║  │
│  ║ 3 responses from 2 models         ║  │
│  ║ [Go to Synthesize →]              ║  │
│  ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘
```

### Response Capture (per model)
```
┌─────────────────────────────────────────┐
│  ChatGPT Response                 2m ago│
├─────────────────────────────────────────┤
│  Save to stage: [📋 Briefing ▼]         │
│                                         │
│  [🎯 Auto-Capture]  [✍️ Paste]          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Response content preview here...  │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  245 words • Stage: Briefing            │
│  [Clear] [Copy]                         │
│                                         │
│  ✓ Saved!                               │
└─────────────────────────────────────────┘
```

---

## Tab 2: Synthesize

This is where users **compare responses** and **generate PRDs**.

### Stage Progress Indicator
```
┌─────────────────────────────────────────┐
│  Synthesis Progress                     │
├─────────────────────────────────────────┤
│                                         │
│   📋          🔍          ✨            │
│ Briefing → Research → Synthesis         │
│   2/4        1/4        0/4             │
│   ●●○○       ●○○○       ○○○○            │
│                                         │
│  PRD Title: [My New PRD              ]  │
│                                         │
│  [🪄 Generate PRD]                      │
│                                         │
└─────────────────────────────────────────┘
```

### Sub-Navigation
```
┌─────────────────────────────────────────┐
│  [📊 Compare] [📄 PRD Editor] [📜 History]
├─────────────────────────────────────────┤
```

### Compare Responses View
```
┌─────────────────────────────────────────┐
│  Compare Responses                      │
├─────────────────────────────────────────┤
│  Stage: [All Stages ▼]                  │
│                                         │
│  ┌─────────┬─────────┬─────────────────┐
│  │ ChatGPT │ Claude  │ (expand/collapse)
│  ├─────────┼─────────┼─────────────────┤
│  │ 245 wds │ 312 wds │                 │
│  │         │         │                 │
│  │ Text... │ Text... │                 │
│  │         │         │                 │
│  │ [Copy]  │ [Copy]  │                 │
│  │ [Select]│ [Select]│                 │
│  └─────────┴─────────┴─────────────────┘
└─────────────────────────────────────────┘
```

### PRD Editor View
```
┌─────────────────────────────────────────┐
│  PRD Editor                             │
├─────────────────────────────────────────┤
│  "My New PRD"                           │
│                                         │
│  ┌ Overview ────────────────────────┐   │
│  │ [Edit content inline...]         │   │
│  │                                  │   │
│  └──────────────────────────── [🗑️]┘   │
│                                         │
│  ┌ Problem Statement ───────────────┐   │
│  │ [Edit content inline...]         │   │
│  │                                  │   │
│  └──────────────────────────── [🗑️]┘   │
│                                         │
│  ┌ Proposed Solution ───────────────┐   │
│  │ [Edit content inline...]         │   │
│  │                                  │   │
│  └──────────────────────────── [🗑️]┘   │
│                                         │
│  [+ Add Section]                        │
│                                         │
│  [📋 Copy to Clipboard] [⬇️ Download MD]│
└─────────────────────────────────────────┘
```

### History View
```
┌─────────────────────────────────────────┐
│  Session History                        │
│  3 stages • 5 total responses           │
├─────────────────────────────────────────┤
│                                         │
│  [🔄 Refresh] [🗑️ Clear All]            │
│                                         │
│  ┌ 📋 Briefing ─────────── 2 responses ┐│
│  │ Dec 31, 2025, 8:15 AM          ▼    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌ 🔍 Research ─────────── 2 responses ┐│
│  │ Dec 31, 2025, 8:20 AM          ▼    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌ ✨ Synthesis ────────── 1 response  ┐│
│  │ Dec 31, 2025, 8:25 AM          ▼    ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Tab 3: Settings

```
┌─────────────────────────────────────────┐
│  ⚙️ Settings                            │
├─────────────────────────────────────────┤
│                                         │
│  Send Mode                              │
│  ○ Manual (Recommended)                 │
│    Copy prompt, switch to tab,          │
│    paste, and click send yourself.      │
│                                         │
│  ○ Semi-Assisted                        │
│    ⚠️ May violate some platform TOS     │
│    Extension fills in text; you click   │
│    send. Grok remains manual always.    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ⚠️ TOS Notice                     │  │
│  │ Grok (xAI) TOS bans "using bots   │  │
│  │ to access" their service.         │  │
│  │ Grok is ALWAYS manual mode.       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Save Settings]                        │
└─────────────────────────────────────────┘
```

---

## Complete Workflow Diagram

```mermaid
flowchart TB
    subgraph Phase1["📝 Phase 1: Preparation"]
        direction TB
        A1[Open Side Panel] --> A2[Select Stage]
        A2 --> A3[Choose Template]
        A3 --> A4[Compose Prompt]
    end
    
    subgraph Phase2["🤖 Phase 2: Consultation"]
        direction TB
        B1[Copy Prompt] --> B2[Open Model Tab]
        B2 --> B3[Paste Prompt]
        B3 --> B4[Review and Send]
        B4 --> B5[Wait for Response]
        B5 --> B6[Capture Response]
        B6 --> B7{More Models?}
        B7 -->|Yes| B1
        B7 -->|No| C1
    end
    
    subgraph Phase3["✨ Phase 3: Synthesis"]
        direction TB
        C1[Go to Synthesize Tab] --> C2[Compare Responses]
        C2 --> C3[Generate PRD]
        C3 --> C4[Edit Sections]
        C4 --> C5[Export Document]
    end
    
    Phase1 --> Phase2
    Phase2 --> Phase3
```

---

## Response Capture Flow

```mermaid
flowchart LR
    subgraph User["User Actions"]
        U1[Click Auto-Capture] --> U2{Success?}
        U2 -->|Yes| U3[Response Captured]
        U2 -->|No| U4[Manual Paste Mode]
        U4 --> U5[Paste Text]
        U5 --> U6[Click Save]
        U6 --> U3
    end
    
    subgraph Storage["Data Flow"]
        U3 --> S1[Save to Stage]
        S1 --> S2[Update Badge Count]
        S2 --> S3[Available in Synthesize]
    end
```

---

## PRD Generation Flow

```mermaid
flowchart TB
    subgraph Input["Captured Responses"]
        R1[ChatGPT Response]
        R2[Claude Response]
        R3[Gemini Response]
        R4[Grok Response]
    end
    
    subgraph Process["PRD Generator"]
        P1[Extract Key Insights]
        P2[Merge Perspectives]
        P3[Structure Sections]
    end
    
    subgraph Output["Generated PRD"]
        O1[Overview]
        O2[Problem Statement]
        O3[Proposed Solution]
        O4[Requirements]
        O5[Success Criteria]
    end
    
    R1 --> P1
    R2 --> P1
    R3 --> P1
    R4 --> P1
    P1 --> P2 --> P3
    P3 --> O1
    P3 --> O2
    P3 --> O3
    P3 --> O4
    P3 --> O5
```

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Prompt Composer | ✅ | 3 stages, 3 templates |
| Copy to Clipboard | ✅ | One-click copy |
| Model Roster | ✅ | 4 models with status |
| Response Capture | ✅ | Auto + Manual modes |
| Stage Selection | ✅ | Briefing/Research/Synthesis |
| Response Comparison | ✅ | Side-by-side view |
| PRD Generation | ✅ | Auto-generate sections |
| Section Editing | ✅ | Inline edit, add, delete |
| Markdown Export | ✅ | Copy or download |
| Session History | ✅ | View/clear past sessions |
| Response Badges | ✅ | Count per model |
| Settings | ✅ | Send mode configuration |
| TOS Compliance | ✅ | Grok always manual |

---

## Gaps and Opportunities

### User-Visible Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| Proceed with 3/4 models | Medium | P1 |
| Toast notifications on errors | Low | P2 |
| Routing explanations | Low | P2 |
| Token/cost estimates | Low | P3 |

### UX Improvement Opportunities

1. Better empty states - Show guidance when no responses yet
2. Progress animations - Loading states during PRD generation
3. Keyboard shortcuts - Power user efficiency
4. Drag-to-reorder sections - PRD editor enhancement

---

## Recommended Next Steps

```mermaid
flowchart LR
    subgraph Now["Priority: High"]
        N1[Test on live AI sites]
        N2[Update any broken selectors]
    end
    
    subgraph Soon["Priority: Medium"]
        S1[Add toast notifications]
        S2[Implement Proceed with 3/4]
    end
    
    subgraph Later["Priority: Low"]
        L1[Add routing explanations]
        L2[Token/cost estimation]
        L3[Keyboard shortcuts]
    end
    
    Now --> Soon --> Later
```

---

## How to Test

1. **Install**: Load `dist/` folder in `chrome://extensions`
2. **Click** the extension icon → Side panel opens
3. **Compose** a prompt in the Workspace tab
4. **Copy** and paste to each AI model
5. **Capture** responses (paste or auto-capture)
6. **Switch** to Synthesize tab
7. **Generate** PRD and export

---

*End of Evaluator Report*
