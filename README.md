# Multi-LLM PRD Writer

**Chrome Extension for orchestrating multiple AI models to create comprehensive Product Requirements Documents**

[![TOS Compliant](https://img.shields.io/badge/TOS-Compliant-green)](./docs/legal/TOS_COMPLIANCE.md)
[![License](https://img.shields.io/badge/License-MIT-blue)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-orange)]()

---

## 🎯 Overview

The Multi-LLM PRD Writer is a Chrome Extension that helps you leverage multiple AI models (ChatGPT, Claude, Gemini, Grok) simultaneously to create better Product Requirements Documents. 

**Key Philosophy:** User-assisted, never automated. You stay in control.

---

## ✨ Features

### Phase 1 (Foundation) ✅
- ✅ **Service Worker Persistence** - MV3-compliant keep-alive system
- ✅ **Multi-Model Status Display** - See all 4 AI models at a glance
- ✅ **Adapter Plugin System** - Extensible platform support
- ✅ **Resilient State Management** - Survives browser restarts
- ✅ **TOS Compliant** - Respects all platform policies

### Phase 2 (Council Workspace UI) ✅
- ✅ **Prompt Composer** - Templates for PRD stages
- ✅ **Manual Copy/Paste Workflow** - TOS-compliant user control
- ✅ **Response Capture** - Stage selector (Briefing/Research/Synthesis)
- ✅ **Settings Panel** - Send mode configuration with TOS warnings

### Phase 3 (Response Aggregation) ✅
- ✅ **Side-by-Side Comparison** - View all 4 model responses
- ✅ **PRD Generator** - Auto-generate structured PRD sections
- ✅ **PRD Editor** - Edit, add, delete sections
- ✅ **Markdown Export** - Download or copy to clipboard

### Phase 4 (Enhanced Workflow) ✅
- ✅ **Response Badges** - See response count per model
- ✅ **Stage Selection** - Save responses to specific workflow stages
- ✅ **Ready to Synthesize Banner** - Quick navigation when ready
- ✅ **Persistent Storage** - Responses saved across sessions

---

## 🔐 Privacy & Scope

**This extension uses minimal permissions and only accesses tabs you explicitly open.**

### What We Access:
- ✅ **Only the 5 LLM sites** - ChatGPT, Claude, Gemini, Grok (no other websites)
- ✅ **Only YOUR active tabs** - Never background tabs or other windows
- ✅ **Only tabs you open** - Content scripts only run on matching URLs you navigate to
- ✅ **Tab groups** - Optional organization (you control which tabs are grouped)

### What We DON'T Do:
- ❌ **No access to all windows** - Extension cannot see other browser windows
- ❌ **No access to all tabs** - Only tabs matching the 5 LLM hostnames
- ❌ **No background monitoring** - No silent data collection
- ❌ **No external servers** - All data stays in your browser's local storage
- ❌ **No browsing history** - We don't track or store your history

### Permissions Explained:
| Permission | Why We Need It |
|------------|----------------|
| `activeTab` | Interact with the current tab when you click the extension |
| `tabGroups` | Optional feature to organize LLM tabs together |
| `storage` | Save your settings locally in your browser |
| `alarms` | Keep service worker alive for session persistence |
| `scripting` | Inject adapter scripts into LLM pages (only matching hosts) |
| `host_permissions` | Explicitly limited to 5 LLM domains only |

📖 **See also:** [TOS_COMPLIANCE.md](./docs/legal/TOS_COMPLIANCE.md) for platform-specific policies

## 🔒 Terms of Service Compliance

**This extension is designed to be 100% TOS compliant** with all supported platforms.

### Our Commitment

- ✅ **Manual Mode by Default** - You control all actions
- ✅ **No Automated Scraping** - Respects data extraction policies
- ✅ **No Bot Behavior** - User-initiated interactions only
- ✅ **Respects Rate Limits** - No rapid-fire requests
- ✅ **Cloudflare Respect** - Never bypasses security

### Platform-Specific Compliance

| Platform | Status | Key Restrictions |
|----------|--------|------------------|
| **ChatGPT** | ✅ Compliant | No automated extraction/scraping |
| **Claude** | ✅ Compliant | Weekly usage limits, permission system |
| **Gemini** | ✅ Compliant | Respect robots.txt, no reverse engineering |
| **Grok** | ✅ Compliant | **Explicitly prohibits bots** - Manual mode required |

📖 **Full TOS Analysis:** See [TOS_COMPLIANCE.md](./docs/legal/TOS_COMPLIANCE.md)

---

## 🚀 Installation

### From Source

1. **Clone the repository:**
   ```bash
   git clone https://github.com/liviuolos/browser-council.git
   cd browser-council
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

---

## 📖 Usage

### Phase 1 (Current)

1. **Open the side panel:**
   - Click the extension icon in your toolbar
   - Or use the side panel in Chrome

2. **View model status:**
   - See connection status for all 4 models
   - Monitor which tabs have active adapters

3. **Open LLM tabs:**
   - Navigate to ChatGPT, Claude, Gemini, or Grok
   - The extension auto-detects and connects

### Future Usage (Phase 2+)

- Prepare prompts in the side panel
- Review and edit before sending
- Copy/paste to each platform manually
- Aggregate responses

---

## 🏗️ Architecture

### Service Worker (MV3 Compliant)

**Core Components:**
- `KeepAliveManager` - Prevents SW termination using Chrome alarms API
- `CouncilStateMachine` - Aggressive state persistence (session + local storage)
- `MessageRouter` - Reliable cross-tab messaging with ack/retry
- `ErrorHandlers` - Graceful degradation and recovery

### Adapter Plugin System

**Platform-specific adapters:**
- `ChatGPTAdapter` - Handles textarea and React events
- `ClaudeAdapter` - ProseMirror contenteditable support
- `GeminiAdapter` - Rich-textarea component handling
- `GrokAdapter` - Basic textarea with strict TOS

**Fallback Selector Strategy:**
```typescript
selectors: {
  input: [
    'textarea#prompt-textarea',      // Specific
    '[data-testid="prompt-textarea"]', // Data attribute
    'textarea'                        // Generic fallback
  ]
}
```

### UI (React + Tailwind CSS)

- Side panel with model roster
- Platform-specific status indicators
- Connection health monitoring

---

## 🛡️ Safety & Privacy

### What We Collect

**Local Storage Only:**
- ✅ Session state (cleared on browser close)
- ✅ Model connection status
- ✅ User preferences

**NEVER Collected:**
- ❌ Prompts or responses
- ❌ Account credentials
- ❌ Personal information
- ❌ Browsing history

### No External Servers

- All data stays in `chrome.storage` (local to your browser)
- No analytics or telemetry
- No third-party data sharing

---

## 🔧 Development

### Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Extension:** CRXJS Vite Plugin (MV3)
- **Styling:** Tailwind CSS
- **Storage:** chrome.storage API

### Project Structure

```
/src
  /background     ← Service Worker orchestration
  /sidepanel      ← React UI
  /content        ← Content script adapters
  /lib            ← Shared types & utilities
/public
  /icons          ← Extension icons
```

### Key Design Decisions

1. **Service Worker First** - All critical logic in SW (MV3 requirement)
2. **Aggressive Persistence** - State saved after every transition
3. **Plugin-Based Adapters** - Easy to add new platforms
4. **User-Assisted Philosophy** - Compliance by design

---

## 📋 Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Service Worker infrastructure
- [x] Adapter plugin system
- [x] Minimal UI
- [x] TOS compliance documentation

### 🔄 Phase 2: Core Workflow (In Progress)
- [ ] Prompt composer in side panel
- [ ] Manual copy/paste workflow
- [ ] Response capture (user-initiated)
- [ ] Basic PRD template

### 🔮 Phase 3: Enhanced Features
- [ ] Multi-stage council workflow
- [ ] Response comparison
- [ ] Export to Markdown/PDF
- [ ] Custom prompts library

### 🔮 Phase 4: Advanced
- [ ] Cost tracking per platform
- [ ] Usage analytics (local only)
- [ ] Advanced routing logic
- [ ] Custom adapter creation UI

---

## ⚖️ Legal

### License

MIT License - See [LICENSE](./LICENSE)

### Disclaimer

**This extension is:**
- An independent, open-source project
- Not affiliated with OpenAI, Anthropic, Google, or xAI
- Provided "AS IS" without warranty

**Users are responsible for:**
- Their own compliance with platform Terms of Service
- Any account actions or suspensions
- Reviewing and understanding platform policies

**By using this extension, you agree:**
- Developers are not liable for TOS violations
- You use the extension at your own risk
- You will follow recommended Manual Mode settings

---

## 🤝 Contributing

Contributions welcome! Please:

1. Read [TOS_COMPLIANCE.md](./docs/legal/TOS_COMPLIANCE.md) first
2. Ensure changes maintain TOS compliance
3. Add tests for new features
4. Update documentation

### Reporting Issues

Found a bug or TOS concern? [Open an issue](https://github.com/liviuolos/browser-council/issues)

---

## 📚 Documentation

- **[TOS Compliance Guide](./docs/legal/TOS_COMPLIANCE.md)** - Full platform-by-platform analysis
- **[Walkthrough](./walkthrough.md)** - Phase 1 implementation details
- **[Handoff Package](./docs/handoff/HANDOFF_PACKAGE.md)** - Project requirements
- **[PRD](./docs/specs/prd-v2.0-council-approved.md)** - Product specification

---

## 🙏 Acknowledgments

Built with guidance from:
- **Google Nano Banana** - Iconography and visual assets
- **OpenAI Documentation** - ChatGPT API best practices
- **Anthropic Documentation** - Claude safety guidelines
- **Chrome Extensions MV3** - Service Worker patterns
- **Community Feedback** - GitHub contributors

---

## 📧 Contact

**Project Maintainer:** Liviu Olos  
**GitHub:** [@liviuolos](https://github.com/liviuolos)  
**Repository:** [browser-council](https://github.com/liviuolos/browser-council)

---

## ⭐ Support

If you find this project helpful:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🤝 Contribute code

**Thank you for using Multi-LLM PRD Writer responsibly!**
