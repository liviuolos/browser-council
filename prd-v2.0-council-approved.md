# Multi-LLM PRD Writer — Product Requirements Document v2.0
**Council Approved**: December 30, 2025  
**Chairman**: ChatGPT 5.2 (Chairman Synthesis)  
**Contributors**: Claude Opus 4.5, Gemini Pro 3.0, Grok 4.1 Beta

---

## Executive Summary
Multi-LLM PRD Writer is a Chrome Extension (MV3) that coordinates a structured 3‑stage “council” workflow across multiple LLM web UIs (ChatGPT, Claude, Gemini, Grok) to produce high-quality PRDs. The core value is **higher output quality through pluralism** while keeping the user firmly in control—no hidden automation and no ambiguity about what was sent, where, and when.

The product differentiates by combining (1) a **fault-tolerant orchestration foundation** that survives MV3 service-worker lifecycles and tab failures, and (2) a **transparent “Council Workspace” UX** that makes every model’s state visible and actionable. Community sentiment confirms demand for multi-LLM orchestration while strongly penalizing invasive, privacy-hostile browser tools; this product must be lightweight, opt‑in, and explicit about data movement.

Security is treated as **defense-in-depth** for an assistant that operates in a hostile web environment: prompt injection/goal hijacking, tool misuse, and state poisoning are assumed. However, the product design explicitly rejects autonomous execution patterns; it is **user-assisted** by default, with human confirmation as the primary safety boundary.

---

## 1. Core Philosophy & Design Principles

### Design Tenets (non-negotiable)
1. **User-Assisted Workflow (default)**: The extension may **prepare** prompts and guide the user, but **must not auto-send** unless explicitly enabled.
2. **Explainable Model Routing**: Routing is advisory; users can override.
3. **Progress Visibility**: Every stage and per-model step has a clear state and “next action.”
4. **Graceful Degradation**: When automation breaks, the user still finishes (clipboard/manual mode).
5. **NO FICTION / Technical Mode Only**: Outputs must be factual, technical, and implementation-relevant; narrative “lore” is treated as an error.

### 1.1 User-Assisted Workflow
**Default behavior**: fill prompts in each model tab and stop at “awaiting send.”  
**User options** (per-run and/or settings):
- **Never auto-send** (default)
- **Ask each time**
- **Preview delay** (countdown + cancel)
- **Always** (double-confirm, persistent “Auto-send ON” badge)

**Hard rules**
- “Always” is *never* the default.
- If a site/DOM changes or permissions are missing, the system falls back to manual steps instead of guessing.  

### 1.2 Intelligent Model Routing
Routing is a **recommendation layer** driven by:
- Task type (long-form synthesis vs web research vs real-time freshness)
- Input characteristics (file size, number of attachments)
- User constraints (speed vs quality vs cost)
- Model availability (tab open/logged-in/ready)

Routing output is always paired with a “Why?” explanation and is overrideable.

### 1.3 Progress & Transparency
The UI must continuously show:
- Stage checklist (what’s done, what’s blocked, what’s next)
- Per-model status (Not open / Ready / Prompt ready / Awaiting send / Sending / Streaming / Complete / Error)
- Errors as **actionable recovery choices**, not dead ends

### 1.4 Graceful Degradation
When the extension cannot safely automate:
- Switch to **Manual Mode** with “Copy prompt” + step checklist (“Paste → Review → Click Send”)
- Continue the workflow with partial completion options (Proceed with 3/4, retry missing model)

---

## 2. Architecture (Foundation Layer)
The architecture is designed to survive MV3 constraints (ephemeral service worker) and the brittleness of DOM automation across constantly changing LLM UIs.

### 2.1 Service Worker Orchestrator
**Core**: a council finite-state machine (FSM) + event router running in the MV3 service worker.

**Key requirements**
- No critical state stored in global variables.
- State persisted after every meaningful transition.
- Recovery logic runs on wake-up and reconnect events.

**Keep-alive strategy**
- Use Alarm API wake-ups plus long-lived ports from the UI surface; optionally use an offscreen document for operations exceeding the worker lifetime.

### 2.2 Plugin-Based LLM Adapters
Each target platform is implemented as an adapter plugin:
- Multiple fallback selectors per UI element (input, send button, response container)
- Versionable selector bundles (hot-swappable without rewriting orchestrator)
- A “capabilities” descriptor (e.g., detects streaming, supports file upload)

Adapter contract (high level)
- `preparePrompt(prompt, attachments, routingHints) -> { prepared: bool, diagnostics }`
- `detectStatus() -> state`
- `captureResponse() -> { text, metadata, timestamps }`
- `enterManualMode() -> { clipboardText, steps }`

### 2.3 Cross-Tab Messaging
Communication patterns must be reliable:
- Long-lived `runtime.connect` ports for continuous state updates
- Acknowledgment + retry for one-shot `sendMessage`
- Per-tab scoping (one model failure must not derail the rest)

### 2.4 Error Recovery
Error handling is first-class and structured:
- **TAB_CLOSED** → instruct reopen + resume from persisted state
- **DOM_CHANGED** → try fallback selectors → manual mode
- **RATE_LIMITED** → wait/retry → switch model → proceed without
- **SERVICE_WORKER_RESTART** → restore state from storage, reconstruct sessions, rebind ports

---

## 3. User Interface (Experience Layer)

### 3.1 Council Workspace UI
**Hybrid UI (recommended)**:
- **Side panel** = mission control (model roster, progress, next action)
- **Full-page workspace** = deep work (prompt composer, doc view, peer review editor, synthesis output)

### 3.2 Orchestration Panel
**Model roster rows** show:
- Model + icon
- Status pill (text + icon, not color-only)
- Primary action (Open / Review / Retry / View)
- Secondary metadata (last update, optional cost estimate)

**Behavior**
- Clicking a row focuses/opens the relevant tab.
- “Review” shows exactly what was inserted and what the user must do next.
- Status updates announced via `aria-live="polite"`.

### 3.3 User-Assisted Send Controls
The UI makes “send authority” explicit:
- Current send mode is always visible in-panel.
- Every send event is logged locally as an auditable timeline entry: **who**, **what**, **where**, **when**.

### 3.4 Error States & Recovery
Error cards must include:
- Plain-language cause (what happened)
- At least two recovery paths
- A “do this now” CTA
- A safe fallback (manual mode) whenever automation is blocked

---

## 4. Security & Privacy (Scoped: Security Insights Only)
This product automates in a hostile environment (web pages + user data). The security posture assumes adversarial content and accidental misuse.

### 4.1 Threat Model (OWASP Agentic Top 10 — applied conservatively)
Primary risks relevant to a user-assisted browser extension:
- **Goal hijacking / prompt injection** via hostile web content or pasted text
- **Tool misuse** (sending content to the wrong model/site, unintended disclosure)
- **Memory/context poisoning** (persisted session notes or cached content)
- **Identity/permission abuse** (over-broad host permissions, extension data access)
- **Supply chain risk** (malicious updates, compromised dependencies)
- **Resource overload** (infinite loops / runaway retries, cost blowups)

### 4.2 Defense-in-Depth Controls
**Control boundaries**
- No high-impact action (send, export, share) without explicit user intent (default).
- Least-privilege permissions: per-host allow-list, request permissions just-in-time.

**Content handling**
- Treat all retrieved text as untrusted; isolate it from control instructions.
- Sanitize and label “external content” vs “user-authored prompt.”

**State & storage hygiene**
- Separate “live session state” from “persisted backups.”
- Clear session storage on completion or explicit user action.
- Avoid long-lived “memory” by default; if added later, require provenance tagging + review gates.

**Update integrity**
- Signed releases, dependency pinning, and a changelog of permission changes.

### 4.3 Privacy Controls
- **No auto-send by default**
- **Local-first**: session state stored locally; explicit user choice for syncing/export
- **Transparent permissions**: show what hosts are enabled and why
- **BYOK-ready** (future): if API-based routing is added later, keep keys local and visible; never silently transmit keys

---

## 5. Market Validation & User Needs

### 5.1 Developer Sentiment
Developers increasingly run “councils” of multiple models for accuracy and bias reduction. They dislike tools that feel invasive, slow the browser, or quietly transmit data. The “trust bar” for extensions is high: one privacy incident drives uninstall.

### 5.2 Pain Points Addressed
- Manual tab juggling across 3–4 LLMs
- Unclear state (“did it send?” / “which model is stuck?”)
- Brittle automation that fails silently when DOM changes
- Privacy risk from extensions that over-collect

### 5.3 Competitive Differentiation
- **User control as the product**: explicit send authority + audit trail
- **Resilience under MV3**: persisted state + recovery, not “best effort”
- **Explainable routing**: “why this model” instead of opaque “AI chooses”
- **Graceful degradation**: manual mode keeps workflows unblocked

---

## 6. Technical Implementation Roadmap

### Phase 1: Foundation (P0)
- [ ] Council FSM + session persistence (session + local backup)
- [ ] Keep-alive manager (alarms + long-lived ports)
- [ ] Reliable cross-tab messaging (ack/retry)
- [ ] Adapter plugins for 4 target platforms (selector fallbacks)
- [ ] Minimal side panel: roster + status + open/focus actions

### Phase 2: UX Polish (P1)
- [ ] Full “Council Workspace” page with prompt composer
- [ ] Stage navigator + gating (proceed with 3/4 supported)
- [ ] User-assisted send modes + clear badges
- [ ] Manual mode UX (copy prompt + checklist) for DOM/permission failures
- [ ] Notifications: coalesced, actionable

### Phase 3: Security Hardening (P1)
- [ ] Permission minimization + per-host allow list UI
- [ ] Output technical-mode enforcement (non-fiction guardrail + linter)
- [ ] Audit timeline (local): sends, retries, errors, recoveries
- [ ] Retry/cost guards (rate limit backoff, max attempts, budget caps)

### Phase 4: Enhancements (P2)
- [ ] Token/cost estimation and per-model usage dashboards (when detectable)
- [ ] Advanced routing heuristics (learned from overrides)
- [ ] Export flows (Markdown, JSON) and project templates
- [ ] Optional “model pack” updates for selector refreshes

---

## 7. Success Metrics
Product success is measured by reliability, trust, and completion—*not* vanity metrics.

- **Time-to-first-action**: < 30s (open workspace → first prompt prepared)
- **Stage 1 completion rate**: > 90% (4/4 or user-declared 3/4)
- **Zero mis-send incidents**: target 0 with default settings
- **Recovery success rate**: > 95% of errors lead to completion (via retry or manual mode)
- **Routing override rate**: monitor; high overrides signal poor recommendations
- **Uninstall rate after error**: should trend down with improved recovery UX

---

## 8. Risks & Mitigations

| Risk | Source | Mitigation |
|------|--------|------------|
| MV3 service worker termination breaks sessions | Architecture (MV3) | Persist state aggressively; alarms + long-lived ports; recover on wake |
| DOM changes break automation | Platform volatility | Adapter plugins with fallback selectors; hot-swap selector bundles; manual mode |
| User confusion / mistrust (“did it send?”) | UX | Explicit send modes; per-model state; audit timeline; “awaiting send” default |
| Privacy backlash / enterprise rejection | Market validation | Least privilege permissions; local-first; no auto-send default; transparent logs |
| Prompt injection / goal hijacking | Security | Treat external content as untrusted; confirmation gates; clear labeling and lints |
| Runaway retries / cost blowups | Ops | Backoff + max retries; per-run budget caps; per-model disable/proceed-without |
| Supply chain compromise | Security | Signed builds; dependency pinning; permission-change warnings |

---

## 9. Council Deliberation Summary

### Collaboration Statement
- **Proposal B (UX)** defines the trust boundary: user-assisted sending, transparent progress, accessibility, and recovery-first UX.
- **Proposal A (Architecture)** makes B possible under MV3: persistence, keep-alive, reliable messaging, and adapter plugins.
- **Proposal D (Market validation)** confirms what users punish and reward: privacy-first, non-intrusive tools; multi-LLM demand; cost visibility.
- **Proposal C (Security + landscape)** adds the threat model and defense-in-depth framing; its autonomy-leaning patterns are explicitly rejected for this product’s philosophy.

### Key Decisions Made
- **Core = B + A**: UX-driven control surface powered by fault-tolerant MV3 architecture.
- **Security = C (scoped)**: adopt OWASP-style threat modeling and mitigations, but keep user-assisted workflow as the control boundary.
- **Validation = D**: prioritize privacy transparency, lightweight performance, and routing explainability.

### Trade-offs Considered
- **Hybrid UI vs simplicity**: Side panel + full-page workspace increases scope but reduces user error and makes long-form PRD work practical.
- **Automation vs trust**: Maximum automation is possible but risky; the product chooses user control and manual fallback over “magic.”
- **Broad agent frameworks vs extension reality**: Framework comparisons inform ideas, but implementation must respect MV3 + web-UI automation constraints.

---

## Appendix: Peer Review Insights
**Reviewer**: Grok Standard Expert (2 passes)  
**Consensus**: A (architecture) and B (UX) form the essential core; D validates user needs; C provides security depth but must avoid autonomy creep.  
**Final Recommendation**: Proceed with A+B as foundation, enrich with D’s insights, selectively apply C’s security patterns.

---

*End of PRD*
