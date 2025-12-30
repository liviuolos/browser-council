# Multi-LLM Council: PRD Genesis

**This repository contains the complete "Council Process" documentation used to design [browser-council](#target-project-browser-council).**

It is a living case study of using multiple LLMs (Claude, ChatGPT, Gemini, Grok) to collaboratively write a high-quality Product Requirements Document (PRD).

---

## 📂 The Council Archives

The full design process is preserved in the [`docs/`](./docs) folder:

| Stage | Output | Model Role |
|-------|--------|------------|
| **1. Proposals** | [Architecture Pitch](./docs/01_proposals/pitch-a-claude-opus.md) | **Claude Opus** (System Architect) |
| | [UX/UI Pitch](./docs/01_proposals/pitch-b-chatgpt.nonfiction-guardrail.md) | **ChatGPT** (Product Designer) |
| | [Market Validation](./docs/01_proposals/pitch-d-grok.md) | **Grok** (User Researcher) |
| | [Security Audit](./docs/01_proposals/pitch-c-gemini.md) | **Gemini** (Security Engineer) |
| **2. Review** | [Blind Peer Review](./docs/02_reviews/stage2-review-grok-expert.md) | **Grok Expert** (Unbiased Reviewer) |
| **3. Synthesis** | [**FINAL PRD v2.0**](./docs/05_specs/prd-v2.0-council-approved.md) | **ChatGPT** (Chairman) |

### 📦 Handoff Package
Ready to build? The implementation blueprints are zipped here:
👉 [`handoff/Multi-LLM-PRD-Writer-Handoff-LEAN.zip`](./handoff/Multi-LLM-PRD-Writer-Handoff-LEAN.zip)

---

<a name="target-project-browser-council"></a>
## 🚀 Target Project: "browser-council"

*The following describes the Chrome Extension defined by the PRD above.*

### About
**browser-council** brings multi-model collaboration to your browser, inspired by [Andrej Karpathy's llm-council](https://github.com/karpathy/llm-council). Where Karpathy pioneered the elegant command-line approach to LLM councils for better outputs through pluralism, browser-council adapts this philosophy for the browser environment.

### The Browser Challenge
While CLI-based councils work beautifully for API access, most users interact with LLMs through web UIs (ChatGPT, Claude, Gemini, Grok). browser-council solves the orchestration challenge in this constrained environment:

- **Fault-tolerant architecture** that survives Chrome MV3 service worker lifecycles.
- **Transparent coordination** across multiple tabs with real-time status.
- **User-assisted workflow** (no silent automation—you stay in control).
- **Graceful degradation** when automation fails (manual mode keeps you productive).
- **Privacy-first** design with local-only state and explicit permissions.

### Core Philosophy
**User-assisted, not autonomous.** This extension prepares prompts and tracks state, but *you* hit send. Transparency over magic. Control over convenience.

This isn't just automation—it's **augmentation**. browser-council treats you as the conductor:
- **You decide** what gets sent and when
- **You see** every model's status
- **You recover** from errors with clear choices
- **You trust** because nothing happens without your intent

### Features
- 🎯 **Structured Council Workflows**: Multi-stage orchestration (research → drafting → synthesis)
- 🔄 **Real-Time Status Dashboard**: See what every model is doing, right now
- 🛡️ **Security-First**: Defense-in-depth against prompt injection, tool misuse, state poisoning
- ♿ **Accessible**: Screen-reader friendly, keyboard navigable, status announcements
- 🔧 **Adapter Architecture**: Plugin-based LLM integrations with fallback selectors
- 💾 **Persistent State**: Survives tab crashes, browser restarts, service worker resets
- 📊 **Transparent Routing**: See *why* each model was chosen, override anytime
- 🚨 **Recovery-First UX**: Errors show actionable paths, not dead ends

### Status & Roadmap
**Repository Status**: ✅ Design Complete | 🏗️ Implementation Handoff Ready

**Future Roadmap:**
- **Phase 1**: Core orchestration engine + 4-model adapters
- **Phase 2**: Council Workspace UI + user-assisted send controls
- **Phase 3**: Security hardening + audit timeline
- **Phase 4**: Advanced routing + cost tracking

