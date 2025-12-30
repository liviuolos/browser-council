# Multi-LLM Council: Implementation Handoff Package

**Date**: December 30, 2025  
**Status**: Ready for Code Implementation (Phase 1)  
**Context**: This document prepares the next engineering team (Google Antigravity instance) to build the "Multi-LLM PRD Writer" Chrome Extension without losing the nuanced decisions made by the Council.

---

## 1. The Core "Truth" Files
The implementation agent **MUST** read these files first to understand *what* to build.

| File | Purpose | Criticality |
|------|---------|-------------|
| **`prd-v2.0-council-approved.md`** | **The Constitution**. Defines features, logic, and metrics. | 🔴 P0 (Required) |
| **`pitch-a-claude-opus.md`** | **The Code Blueprints**. Contains actual `ServiceWorker` and `KeepAlive` class implementations. | 🔴 P0 (Required) |
| **`pitch-b-chatgpt.nonfiction-guardrail.md`** | **The UI Spec**. Detailed UX layouts, error states, and accessibility rules. | 🔴 P0 (Required) |
| **`pitch-c-gemini.md`** | **The Security Model**. OWASP threat mitigations (specific sections only). | 🟡 P1 (Reference) |
| **`pitch-d-grok.md`** | **The User Voice**. Validation for privacy features (no auto-send). | 🟢 P2 (Context) |

---

## 2. Technical Stack Recommendation
Based on Proposal A (Architecture) and Proposal B (UX):

- **Framework**: React 18+ (Complex state management for "Council Workspace")
- **Build Tool**: Vite (Fast HMR)
- **Language**: TypeScript (Strict typing for message passing contracts)
- **Styling**: Tailwind CSS (Rapid UI development for the "Hybrid Panel")
- **Extension Tooling**: `@crxjs/vite-plugin` (CRITICAL for HMR in content scripts) or `vite-plugin-web-extension`.

---

## 3. Chrome Extension Specific "Gotchas" (The "Unknown Unknowns")
Things that aren't in the PRD but are strictly required for a working extension:

### A. Development Requirements
- **HMR Handling**: Service workers don't hot-reload easily. The build setup must handle `chrome.runtime.reload()` triggers.
- **Content Security Policy (CSP)**: React's inline scripts are blocked by MV3. `manifest.json` needs careful CSP config.

### B. Asset Requirements (Web Store)
- **Icons**: 16x16, 48x48, 128x128 PNGs (Clean, no transparency issues).
- **Store Screenshots**: 1280x800 showcase images (Proposal B's UI screens).
- **Privacy Policy URL**: Mandatory for submission (Draft needs hosting, e.g., GitHub Pages).

### C. Permissions (Least Privilege)
The PRD emphasizes privacy. `manifest.json` permissions should be minimal:
```json
{
  "permissions": ["storage", "alarms", "tabs", "scripting"],
  "host_permissions": [
    "https://chatgpt.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
    "https://grok.com/*"
  ]
}
```

---

## 4. Implementation Sequence (to guide the Agent)

### Step 1: "The Skeleton" & Directory Structure
**CRITICAL**: Do not create flat files in the root. Initialize with this exact structure to keep the project maintainable:
```text
/src
  /background    # Service Worker (KeepAliveManager)
  /sidepanel     # React App (Proposal B UI)
  /content       # Script Adapters (Proposal A)
  /lib           # Shared Logic (State Machine)
/manifest.json
/vite.config.ts
```
- Initialize Vite + React + TS.
- Setup `manifest.json` with the permissions listed above.

### Step 2: "The Heart" (Proposal A)
- Implement `background.ts` (Service Worker).
- Paste `KeepAliveManager` code from `pitch-a-claude-opus.md`.
- Implement `CouncilStateMachine`.

### Step 3: "The Face" (Proposal B)
- Build the Side Panel UI (`<ModelRoster />`).
- Build the "Prompt Composer" component.

### Step 4: "The Nervous System"
- Implement Content Scripts for the 4 platforms.
- Paste the `ADAPTER_REGISTRY` selectors from `pitch-a-claude-opus.md`.

---

## 5. Artifact ZIP
*Provide this zip path to the next agent if they cannot access the full workspace history.*

`claude-initial.zip` (Contains all the above markdown files)
