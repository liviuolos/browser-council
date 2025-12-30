# [PITCH: Participant A — Claude Opus 4.5]

**Status**: ✅ Complete  
**Focus**: Architecture & Infrastructure

---

## [PITCH: Participant A — Claude Opus 4.5]

### Title
**"Resilient Council Orchestrator": A Fault-Tolerant, Plugin-Based Architecture for Multi-Tab LLM Coordination**

### My Contribution to the Council
I'm providing the **technical foundation**—the state machine, messaging backbone, and plugin architecture—that makes multi-model orchestration reliable across browser restarts, tab crashes, and platform DOM changes. This is the scaffolding that ChatGPT's UX will sit on and that Gemini's security research will validate.

### Problem Statement
Chrome Extension MV3 imposes severe constraints: **service workers are ephemeral and event-driven, terminating after ~30 seconds of inactivity** [Chrome Developers]. Unlike MV2's persistent background pages, there is no official way to keep a service worker perpetually alive—Google explicitly states they are not planning to support this. A council session spanning 4 models across 3 stages could easily take 5-10 minutes—far beyond the service worker's natural lifespan. Without careful architecture, the orchestrator will lose state, miss messages, and leave users stranded mid-workflow.

---

## Proposed Solution

### Core Design Principles (Research-Backed)
1. **State survives everything**: Use `chrome.storage.session` for live state and `chrome.storage.local` for persistence—not global variables which are lost on termination [Chrome Developers, HackerNoon]
2. **Messages are reliable**: Use acknowledgment + retry patterns with long-lived connections (`chrome.runtime.connect`) [Chrome Developers]
3. **Failures are local**: One model's crash doesn't derail the council
4. **Platforms are plugins**: DOM selectors and behaviors are hot-swappable adapters—critical since LLM platforms frequently update their interfaces [HARPA AI, dev.to]

---

## Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVICE WORKER (Orchestrator)                    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │ State Machine  │  │ Message Router │  │ Keep-Alive Manager         │ │
│  │ (council FSM)  │  │ (pub/sub)      │  │ (alarms + port heartbeat)  │ │
│  └───────┬────────┘  └───────┬────────┘  └────────────────────────────┘ │
│          │                   │                                          │
│  ┌───────▼───────────────────▼────────┐                                 │
│  │        Session Store               │                                 │
│  │  chrome.storage.session (live)     │                                 │
│  │  chrome.storage.local (persist)    │                                 │
│  └────────────────────────────────────┘                                 │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ Long-Lived Ports
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│ ChatGPT Tab   │  │ Claude Tab    │  │ Gemini Tab    │  ...
│ ┌───────────┐ │  │ ┌───────────┐ │  │ ┌───────────┐ │
│ │ Adapter   │ │  │ │ Adapter   │ │  │ │ Adapter   │ │
│ │ Plugin    │ │  │ │ Plugin    │ │  │ │ Plugin    │ │
│ └───────────┘ │  └───────────┘ │  │ └───────────┘ │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## Implementation Details

### 1. Keep-Alive Strategy (MV3 Survival) — Research-Validated

**The Problem**: Chrome terminates idle service workers after 30 seconds [Chrome Developers Lifecycle Docs].

**Solution Stack** (from Chrome 120+ best practices):

```javascript
class KeepAliveManager {
  constructor() {
    this.activeSessions = new Set();
  }

  async startSession(sessionId) {
    this.activeSessions.add(sessionId);
    
    // Primary: Chrome Alarm API (minimum 30s interval as of Chrome 120)
    // This matches the service worker timeout, ensuring wake-ups
    await chrome.alarms.create('council-keepalive', {
      periodInMinutes: 0.5  // 30 seconds - matches Chrome 120+ minimum
    });
    
    // Secondary: Long-lived port from UI panel keeps worker alive
    // as long as content script is running [kzar.co.uk]
  }

  handleAlarm(alarm) {
    if (alarm.name === 'council-keepalive' && this.activeSessions.size > 0) {
      // Any extension API call extends lifetime
      chrome.storage.session.get(['keepalive_ping']);
      this.checkSessionHealth();
    }
  }
}

// Alternative: Offscreen document for operations exceeding timeout (Chrome 109+)
// Can maintain DOM access and implicitly keep service worker active
```

**Key Research Finding**: As of Chrome 120, the minimum alarm interval was reduced to 30 seconds, perfectly matching the idle timeout. This is the documented workaround from Chrome's own migration guide.

### 2. State Persistence — Following Official Patterns

```javascript
class CouncilStateMachine {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.state = 'idle';
    this.models = new Map();
  }

  async persist() {
    // chrome.storage.session: Persists across SW restarts, clears on browser close
    // chrome.storage.local: Persists across browser sessions
    // chrome.storage.sync: Syncs across devices (100KB limit)
    
    await chrome.storage.session.set({
      [`council_${this.sessionId}`]: {
        state: this.state,
        models: Array.from(this.models.entries()),
        lastUpdate: Date.now()
      }
    });
    
    // Backup critical state to local storage for crash recovery
    await chrome.storage.local.set({
      [`council_backup_${this.sessionId}`]: this.serialize()
    });
  }

  static async recover(sessionId) {
    // Try session storage first, fall back to local
    let data = await chrome.storage.session.get(`council_${sessionId}`);
    if (!data[`council_${sessionId}`]) {
      data = await chrome.storage.local.get(`council_backup_${sessionId}`);
    }
    return data ? CouncilStateMachine.deserialize(data) : null;
  }
}
```

**Key Research Finding**: `localStorage` is NOT available in MV3 service workers due to its synchronous nature. Must use `chrome.storage` APIs or IndexedDB for larger data [StackOverflow, Chrome Developers].

### 3. Cross-Tab Messaging — Reliable Patterns

```javascript
class MessageRouter {
  constructor() {
    this.pending = new Map();
    this.ports = new Map(); // Long-lived connections
  }

  // For continuous communication: use long-lived ports
  setupLongLivedConnection(tabId) {
    const port = chrome.tabs.connect(tabId, { name: 'council-channel' });
    
    port.onMessage.addListener((msg) => this.handlePortMessage(tabId, msg));
    port.onDisconnect.addListener(() => this.handleDisconnect(tabId));
    
    this.ports.set(tabId, port);
    return port;
  }

  // For one-shot messages: use sendMessage with ack
  async sendWithAck(tabId, message, timeoutMs = 10000) {
    const messageId = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(messageId);
        reject(new Error(`Timeout: ${messageId}`));
      }, timeoutMs);

      this.pending.set(messageId, { resolve, reject, timeout });
      
      chrome.tabs.sendMessage(tabId, { ...message, messageId, needsAck: true })
        .catch(reject);
    });
  }

  // Broadcast to all tabs (no direct API - must query and loop)
  async broadcast(message) {
    const tabs = await chrome.tabs.query({});
    return Promise.allSettled(
      tabs.map(tab => this.sendWithAck(tab.id, message))
    );
  }
}
```

**Key Research Finding**: There's no direct broadcast function in Chrome APIs. To message all tabs, you must query tabs and loop through results [StackOverflow].

### 4. Plugin-Based LLM Adapters — Research on Current Selectors

Based on current research (December 2024), here are the known working selectors:

```javascript
const ADAPTER_REGISTRY = {
  'chat.openai.com': {
    platform: 'chatgpt',
    selectors: {
      input: [
        'textarea#prompt-textarea',
        '[data-testid="prompt-textarea"]',
        'textarea[placeholder*="Message"]'
      ],
      sendButton: [
        '[data-testid="send-button"]',
        'button[data-testid="fruitjuice-send-button"]',
        'form button[type="submit"]'
      ],
      response: '[data-message-author-role="assistant"]',
      streaming: 'result-streaming'
    }
  },
  
  'claude.ai': {
    platform: 'claude',
    selectors: {
      input: [
        'div.ProseMirror[contenteditable="true"]',
        '[contenteditable="true"]'
      ],
      sendButton: [
        'button[aria-label="Send message"]',
        'button[type="submit"]'
      ]
    },
    notes: 'Uses ProseMirror editor - requires special handling for contenteditable'
  },
  
  'gemini.google.com': {
    platform: 'gemini',
    selectors: {
      input: [
        'rich-textarea',
        'textarea[aria-label*="prompt"]'
      ],
      sendButton: [
        'button[aria-label="Send message"]'
      ]
    }
  },
  
  'grok.com': {
    platform: 'grok',
    selectors: {
      input: ['textarea'],
      sendButton: ['button[type="submit"]']
    }
  }
};

// Resilience: Multiple fallback selectors per element
// Hot-swap: Can update selectors without touching core code
// Research shows LLM platforms update their DOM frequently [HARPA AI, dev.to]
```

**Key Research Finding**: Extensions like HARPA AI and Claude's official computer-use feature demonstrate that robust selector fallbacks are essential. Claude's official integration can "navigate, click buttons, and fill forms directly in the browser" [Anthropic]. Our adapter approach mirrors this pattern.

### 5. Error Recovery with Graceful Degradation

```javascript
const ERROR_HANDLERS = {
  TAB_CLOSED: async (council, modelId) => {
    return {
      recoverable: true,
      action: 'reopen_tab',
      userMessage: `The ${modelId} tab was closed. Reopen to continue.`
    };
  },

  DOM_CHANGED: async (council, modelId) => {
    // Try alternate selectors (research shows this is common)
    const adapter = getAdapter(modelId);
    for (const selector of adapter.selectors.input) {
      if (document.querySelector(selector)) {
        return { recoverable: true, action: 'auto_recovered' };
      }
    }
    
    // Fallback: Manual mode with clipboard
    return {
      recoverable: true,
      action: 'manual_mode',
      userMessage: `${modelId} UI changed. Copy prompt manually.`,
      copyToClipboard: true
    };
  },

  SERVICE_WORKER_RESTART: async () => {
    // Recover from chrome.storage - this is why we persist aggressively
    const sessions = await chrome.storage.session.get(null);
    const activeSessions = Object.keys(sessions).filter(k => k.startsWith('council_'));
    
    for (const key of activeSessions) {
      await CouncilStateMachine.recover(key.replace('council_', ''));
    }
    
    return { recovered: activeSessions.length };
  }
};
```

---

## Research Validation

| Claim | Source | Verification |
|-------|--------|--------------|
| Service worker terminates after 30s idle | Chrome Developers Lifecycle Docs | ✅ Confirmed |
| `chrome.alarms` minimum 30s as of Chrome 120 | Chrome Developers Alarms API | ✅ Confirmed |
| Long-lived ports extend SW lifetime | kzar.co.uk, Chrome Docs | ✅ Confirmed |
| `localStorage` unavailable in MV3 SW | StackOverflow, Chrome Docs | ✅ Confirmed |
| Offscreen documents available Chrome 109+ | Chrome Developers | ✅ Confirmed |
| No broadcast API (must query + loop) | StackOverflow | ✅ Confirmed |
| LLM platforms frequently update DOM | HARPA AI, dev.to | ✅ Known issue |

---

## How This Enables Other Contributions

| Contributor | How My Architecture Supports Them |
|-------------|----------------------------------|
| **ChatGPT (UX)** | The state machine emits events for every transition—the UI just subscribes and renders. Error handlers return structured `userMessage` + `action` objects the UX can display directly. |
| **Gemini (Security)** | Plugin adapters isolate each platform. The messaging layer can be audited. Storage keys are per-session, enabling easy cleanup. |
| **Grok (Real-time)** | The adapter registry is hot-swappable—new models or selector updates can ship without touching the core orchestrator. |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Service worker terminates mid-session | High | High | Alarm keep-alive + aggressive state persistence + recovery on wake |
| LLM platform updates DOM selectors | High (per research) | Medium | Multiple fallback selectors + adapter hot-swap + manual mode fallback |
| User closes browser during session | Medium | Medium | `chrome.storage.local` for cross-session recovery |
| Content script injection blocked | Low | High | Graceful degradation to clipboard-assist manual mode |
| Chrome API changes in future versions | Low | High | Abstraction layer around Chrome APIs for easy updates |

---

## What I'm NOT Covering (For Others)

- **Detailed UI specifications** → ChatGPT (Participant B)
- **Security threat modeling, privacy architecture, BYOK storage** → Gemini (Participant C)
- **Current user sentiment, feature prioritization from community** → Grok (Participant D)
- **Tiptap editor integration details** → Implementation phase

---

## Priority Recommendation

**High (P0)**

The orchestrator is the load-bearing wall. Research confirms MV3 presents real challenges that have broken many extensions during migration. If state is lost mid-council or tabs can't reliably communicate, no amount of beautiful UX or thoughtful security will matter—users will experience a broken tool. 

**Ship this foundation first, validate it survives a 10-minute session with 4 models, then layer on the polish.**

---

### Sources Consulted
- Chrome Developers: Extension Service Worker Lifecycle
- Chrome Developers: chrome.alarms API (Chrome 120+ updates)
- Chrome Developers: chrome.storage API
- Chrome Developers: Message Passing
- HackerNoon: MV3 Migration Guide
- kzar.co.uk: Long-Lived Connections
- HARPA AI: Multi-LLM Chrome Extension Architecture
- Anthropic: Claude Computer Use Documentation
- StackOverflow: MV3 State Persistence Patterns
- Medium: Chrome Extension Messaging Patterns

---

*Participant: Claude Opus 4.5*  
*Focus: Architecture & Infrastructure*  
*Part of: Multi-LLM PRD Writer Round 1*
