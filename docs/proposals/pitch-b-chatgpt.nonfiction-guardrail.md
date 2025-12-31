## [PITCH: Participant B — ChatGPT 5.2]

### Title
**“Council Workspace”: A clear, user-assisted, accessible UI for multi-model orchestration (with zero ‘black box’ moments)**

### My Contribution to the Council
I’m defining the **interaction model + UI surface area** that makes council-style multi-model work feel obvious, safe, and controllable—especially when the extension is juggling multiple tabs, states, and failures.

### Problem Statement
Most “multi-LLM” tools either (a) dump side-by-side answers with no real synthesis, or (b) automate too aggressively and make users feel out of control. The Multi-LLM PRD Writer UX must **teach collaboration**, **route tasks intelligently**, and **keep the user in the driver’s seat**—while still feeling fast.

---

## Non‑fiction Guardrail (must-have for this technical project)
We need an explicit, enforceable rule: **no fictional stories, lore, characters, or narrative “color”** inside research, PRDs, peer reviews, or syntheses. We already saw a failure mode where the word “Multi-LLM” triggered story-like content; this must be prevented by design.

### Rule (copy/paste into prompts + PRD)
- **Technical mode only.** Write in factual, technical language.  
- **No fiction.** Do not invent stories, characters, worlds, metaphors-as-stories, or “origin narratives.”  
- **No made-up examples that read like fiction.** If an example is needed, use **minimal, clearly-labeled** synthetic examples (e.g., “Example input/output”)—no plot, no setting, no names.  
- **If uncertain, ask or omit.** Prefer “unknown / needs verification” over invention.

### Where the UX enforces it
- **Prompt Composer:** a mandatory “Technical / Non‑fiction” badge that is ON by default and included in every generated prompt.  
- **Output linter (lightweight):** flags narrative cues (“once upon a time”, named protagonists, worldbuilding language) and asks for rewrite.  
- **Peer review rubric:** includes a checkbox: “☐ No fictional/narrative content; technical tone maintained.”  
- **Stage 3 synthesis:** rejects narrative filler; summarizes only verifiable, implementation-relevant content.

---

### User Stories
- As a **busy operator**, I want to **see the exact state of every model** so I don’t waste time guessing what’s happening.
- As a **cautious user**, I want the extension to **prepare prompts but not send** unless I explicitly allow it.
- As a **power user**, I want **smart model recommendations** (files, research, real-time) so I’m not choosing blindly.
- As a **reviewer**, I want to **compare + trace sources to a specific model** without losing the synthesized “answer-first” view.
- As a **keyboard-only / screen-reader user**, I want the entire workflow to be **navigable and understandable** with assistive tech.

---

## Proposed Solution
A **single “Council Workspace” UI** (side panel or dedicated extension page) that acts as the “mission control” for:
1) **Prompt building**
2) **Model routing**
3) **Orchestration state + notifications**
4) **Stage navigation (1 → 2 → 3)**
5) **Recovery when tabs, DOM, or networks fail**

Core principle: **The user never wonders “did it send?” or “what now?”**  
Every state must be visible, actionable, and reversible.

---

## Three UI Approaches (pick one; all support the same interaction model)

### Option A — Chrome Side Panel (Recommended default)
**Best for:** persistent visibility while users work across tabs.  
**Tradeoff:** narrower layout, needs strong information hierarchy.

### Option B — Popup + “Open Workspace” CTA
**Best for:** lightweight entry; users launch into a full workspace when needed.  
**Tradeoff:** popups are cramped; easy to outgrow.

### Option C — Full-page “Council Workspace” Tab
**Best for:** complex projects, long documents, peer review, and synthesis.  
**Tradeoff:** users must context-switch from the LLM tabs.

**Recommendation:** **A + C hybrid**  
- Side panel = operational control (states, next steps, quick actions)  
- Full-page workspace = deep work (document editor, peer review, final PRD)

---

## UI Specifications

### Component 1: “Multi-LLM PRD Writer Dock” (Orchestration Panel)
**Where:** Side panel (or docked overlay).  
**Goal:** one glance shows *who’s doing what*.

**Layout (top → bottom):**
- **Stage header**: “Stage 1: First Opinions”
- **Model roster list** (one row per model)
- **Overall progress bar** (not color-only; includes counts + labels)
- **Next step CTA** (always one primary action)

**Model row content:**
- Model icon + name
- Status pill (text + icon):  
  - `Not open` / `Ready` / `Prompt ready (awaiting send)` / `Sending` / `Streaming` / `Complete` / `Error`
- Context action (right side): `Open`, `Review`, `Retry`, `View`, `Copy link`
- Secondary metadata (small text): last update time, token/cost estimate (if available)

**Interactions**
- Clicking a row focuses the model’s tab (or opens it).
- “Review” highlights where the prompt is filled and tells the user exactly what to do:  
  “Prompt inserted. Click **Send** in this tab when ready.”
- “Retry” is **scoped**: retry this model only, not the entire run.

**Accessibility**
- Each row is a single focusable element (`role="button"`), with sub-actions as proper buttons.
- Status is announced via `aria-live="polite"` on change (“Claude: Streaming 62%”).
- Progress uses text + pattern (not relying on color alone).

---

### Component 2: “Prompt Composer” (Council Prompt + Attachments)
**Where:** Full-page workspace (primary) + compact version in side panel.  
**Goal:** produce one canonical prompt, with optional model-specific deltas.

**Elements**
- Title field (optional) + tag chips (optional)
- Main prompt editor (Markdown-friendly; supports templates)
- Attachment dropzone (files, URLs, snippets)
- “Routing hints” area (auto-generated):  
  - file size class (small/medium/large)  
  - “Research needed?” toggle  
  - “Real-time needed?” toggle  
- “Send plan” preview: which models will be used + why (collaboration language)

**Key rule**
- Default behavior: **Prepare prompts in each tab, do NOT auto-send**.

---

### Component 3: “Model Router” (Explainable Recommendations)
**Where:** inline module in composer + “Why?” popover on each model row.

**UX behavior**
- Shows **Recommended / Suitable / Not ideal** (avoid “best”).
- Recommendations are explainable:  
  - “Large file detected (1.4MB) → ChatGPT 5.2 recommended.”  
  - “Needs citations / web research → Gemini Pro 3.0 recommended.”  
  - “Needs current info → Grok 4.1 Beta recommended.”

**User control**
- Users can override routing; overrides are remembered per project (optional).

---

### Component 4: “User-Assisted Send Controls”
**Where:** Settings + per-run control.

**Modes (copy is blunt and explicit)**
- **Never auto-send (default)**: “We fill. You click Send.”
- **Ask each time**: “We’ll ask before sending to each model.”
- **Preview delay**: “We show a preview countdown; you can cancel.”
- **Always (double-confirm required)**: “Auto-send is on. You are responsible for what gets sent.”

**UI safety**
- If “Always” is enabled, show a persistent badge: “Auto-send ON”.

---

### Component 5: “Notifications & Cross-tab Guidance”
**Where:** in-panel toasts + optional system notifications.

**Triggers**
- Prompt ready in a model tab
- Streaming started / completed
- Error requiring action
- Stage gate unlocked (“Peer review ready”)

**Design**
- Toasts are actionable: “Go to Claude” / “Retry” / “Dismiss”
- Don’t spam: coalesce updates (“2 models completed”)

---

### Component 6: “Stage Navigator” (1 → 2 → 3)
**Where:** left nav in full-page workspace + compact in side panel.

**Gating logic**
- Stage 2 activates only when all Stage 1 responses are “Complete” *or* user chooses “Proceed with 3/4”.
- Stage 3 activates only after peer review is saved.

**User clarity**
- Show a literal checklist:  
  - ☐ 4 prompts prepared  
  - ☐ 4 sends confirmed  
  - ☐ 4 responses captured  
  - ☐ peer review submitted  
  - ☐ synthesis generated

---

## Progress Indicators (what “good” looks like)
**Granular + truthful** beats fake precision.

- Per-model: discrete states + (optional) streaming percent when detectable
- Overall: “2/4 complete” with a bar and time estimate **only if reliable**
- “What happens next” is always visible:  
  “Next: Review prompts in Claude + Grok tabs and click Send.”

---

## Error States & Recovery Flows (no drama, just options)

### Error Class A — Tab/Permission issues
**Message:** “I can’t access the tab yet.”  
**Actions:** `Open tab`, `Request permission`, `Help`  
**Recovery:** once permission granted, resume.

### Error Class B — DOM/Selector changes (LLM UI updated)
**Message:** “The site layout changed; I can’t find the input box.”  
**Actions:** `Try alternate selector`, `Manual mode`, `Report issue`  
**Manual mode:** show user a “copy prompt” button and a checklist (“Paste into input, then click Send”).

### Error Class C — Rate limits / throttling
**Message:** “This model is rate-limited.”  
**Actions:** `Wait & retry`, `Switch model`, `Proceed without`

### Error Class D — Partial completion
**Message:** “Captured 3/4 responses.”  
**Actions:** `Retry missing model`, `Proceed with 3/4`, `Save and exit`

**Design rule:** every error card has:
- plain-language cause
- at least **two** recovery options
- a “what you can do right now” CTA

---

## Accessibility (WCAG-minded, practical)
- Full keyboard navigation (logical tab order; skip links in workspace)
- Visible focus states; no “outline: none”
- Status changes announced via `aria-live`
- Color is never the sole indicator (icons + text)
- Reduced motion respected (no essential animations)
- High contrast mode tested
- Screen-reader-friendly stage checklist (readable and not overly verbose)

---

## UX Metrics (forward-looking, reality-based)
Track these to avoid building a “cool demo” that fails in daily use:
- **Time-to-first-action** (open workspace → first prompt prepared)
- **Completion rate** for Stage 1 (4/4 vs 3/4)
- **Recovery success rate** (errors that lead to completion)
- **Mis-send incidents** (should be near zero with default settings)
- **User overrides of routing** (signals bad recommendations)

---

## How This Builds on Other Contributions
- **Claude (architecture):** I’m assuming a robust orchestrator exists; my UX ensures the orchestration is *legible* and the user always has the next action.
- **Gemini (research/security):** I’m leaving API/security details to Gemini; my UI simply surfaces “cost, keys, permissions” transparently and avoids dark patterns.
- **Grok (real-time):** I’m treating real-time as a routing reason + a visible badge (“current info”) and giving users clear disclaimers when freshness matters.

---

## What I'm NOT Covering (For Others)
- Service worker persistence strategy, tab messaging implementation details
- Security model / BYOK storage hardening
- Detailed DOM selector engineering (only surfaced as user-facing states)

---

## Priority Recommendation
**High.**  
If the UX is unclear, users won’t trust the tool (and they’ll bail the first time something “auto-sends” or a tab gets stuck). The orchestration panel + user-assisted send controls are the trust foundation.

---
*Participant: ChatGPT 5.2*  
*Focus: UX & Interface Design*  
*Also: Chairman in Stage 3*  
*Part of: Multi-LLM PRD Writer Round 1*
