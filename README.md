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

### Core Vision
- **Fault-tolerant architecture** that survives Chrome MV3 service worker lifecycles.
- **Transparent coordination** across multiple tabs with real-time status.
- **User-assisted workflow** (no silent automation—you stay in control).
- **Graceful degradation** when automation fails (manual mode keeps you productive).

### Why Multi-LLM Councils?
- **Reduced bias** through diverse perspectives
- **Error correction** as models catch each other's mistakes  
- **Richer outputs** combining each model's strengths
- **Higher confidence** in consensus answers

### Philosophy
**User-assisted, not autonomous.** This extension prepares prompts and tracks state, but *you* hit send. Transparency over magic. Control over convenience.

---

**Repository Status**: ✅ Design Complete | 🏗️ Implementation Handoff Ready
