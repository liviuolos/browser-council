# browser-council
Multi-LLM orchestration Chrome extension. Coordinate ChatGPT, Claude, Gemini, and Grok with transparent, user-assisted workflows.

# browser-council

Multi-LLM orchestration Chrome extension. Coordinate ChatGPT, Claude, Gemini, and Grok with transparent, user-assisted workflows.

---

## About

**browser-council** brings multi-model collaboration to your browser, inspired by [Andrej Karpathy's llm-council](https://github.com/karpathy/llm-council). Where Karpathy pioneered the elegant command-line approach to LLM councils for better outputs through pluralism, browser-council adapts this philosophy for the browser environment—orchestrating web-based LLM interfaces with the same principle: **higher quality through diverse model perspectives**.

### Why Multi-LLM Councils?

As Karpathy demonstrated, relying on a single LLM—no matter how capable—leaves blind spots. Different models excel at different tasks: one might be stronger at technical precision, another at creative synthesis, a third at structured analysis. By coordinating multiple models in a structured workflow, you get:

- **Reduced bias** through diverse perspectives
- **Error correction** as models catch each other's mistakes  
- **Richer outputs** combining each model's strengths
- **Higher confidence** in consensus answers

### The Browser Challenge

While CLI-based councils work beautifully for API access, most users interact with LLMs through web UIs (ChatGPT, Claude, Gemini, Grok). browser-council solves the orchestration challenge in this constrained environment:

- **Fault-tolerant architecture** that survives Chrome MV3 service worker lifecycles
- **Transparent coordination** across multiple tabs with real-time status
- **User-assisted workflow** (no silent automation—you stay in control)
- **Graceful degradation** when automation fails (manual mode keeps you productive)
- **Privacy-first** design with local-only state and explicit permissions

### Core Philosophy

This isn't just automation—it's **augmentation**. browser-council treats you as the conductor:

- **You decide** what gets sent and when (user-assisted by default)
- **You see** every model's status, every prompt, every decision
- **You recover** from errors with clear choices, not dead ends
- **You trust** because nothing happens without your intent

### Honoring the Vision

Karpathy's llm-council showed us that the future of AI work isn't picking "the best" model—it's orchestrating many. browser-council brings that insight to where millions of people already work: their browser tabs. It's messier than pure API calls, but it meets users where they are.

Standing on the shoulders of giants. 🙏

---

## Features

- 🎯 **Structured Council Workflows**: Multi-stage orchestration (research → drafting → synthesis)
- 🔄 **Real-Time Status Dashboard**: See what every model is doing, right now
- 🛡️ **Security-First**: Defense-in-depth against prompt injection, tool misuse, state poisoning
- ♿ **Accessible**: Screen-reader friendly, keyboard navigable, status announcements
- 🔧 **Adapter Architecture**: Plugin-based LLM integrations with fallback selectors
- 💾 **Persistent State**: Survives tab crashes, browser restarts, service worker resets
- 📊 **Transparent Routing**: See *why* each model was chosen, override anytime
- 🚨 **Recovery-First UX**: Errors show actionable paths, not dead ends

---

## Status

🚧 **In Development** – Foundation phase (MV3 orchestrator + adapter plugins)

---

## Roadmap

- **Phase 1**: Core orchestration engine + 4-model adapters
- **Phase 2**: Council Workspace UI + user-assisted send controls
- **Phase 3**: Security hardening + audit timeline
- **Phase 4**: Advanced routing + cost tracking

---

## Philosophy

**User-assisted, not autonomous.** This extension prepares prompts and tracks state, but *you* hit send. Transparency over magic. Control over convenience.

Inspired by llm-council's insight. Built for browser reality.

---

*License, installation, and contribution guidelines coming soon.*
