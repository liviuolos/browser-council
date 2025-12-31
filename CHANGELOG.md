# Changelog

All notable changes to the Multi-LLM PRD Writer Chrome Extension.

## [1.2.0] - 2025-12-31

### Added
- **Session History** - View and manage historical response sessions
- **Stage Selection** - Save responses to specific workflow stages (Briefing/Research/Synthesis)
- **Response Badges** - See response count per model in ModelRoster
- **Ready to Synthesize Banner** - Quick navigation when 2+ responses captured
- **History Tab** - New tab in Synthesize view with expand/collapse and clear functions

### Changed
- Updated footer to show v1.2.0 Complete
- Updated manifest version to 1.2.0
- Improved cross-tab navigation flow

---

## [1.1.0] - 2025-12-31

### Added
- **Response Aggregation** - Side-by-side comparison of all 4 model responses
- **PRD Generator** - Auto-generate structured PRD from captured responses
- **PRD Editor** - Section-based editing with add/delete functionality
- **Export Manager** - Download as Markdown or copy to clipboard
- **Synthesize Tab** - New main tab for synthesis workflow

### Changed
- Updated header to "Phase 3: Response Aggregation & PRD Synthesis"
- Updated footer to show v1.1.0 Phase 3

---

## [1.0.0] - 2025-12-30

### Added
- **Prompt Composer** - 3-stage workflow templates (Briefing/Research/Synthesis)
- **Manual Workflow** - TOS-compliant copy/paste workflow
- **Response Capture** - Manual paste with timestamp tracking
- **Settings Panel** - Send mode configuration with TOS warnings
- **TOS Validator** - Runtime enforcement of platform compliance

### Changed
- Enhanced ModelRoster with copy prompt and open tab buttons
- Added Manual Instructions component
- Implemented Workspace/Settings tab navigation

---

## [0.2.0] - 2025-12-30

### Added
- Limited extension scope with `activeTab` permission
- Side panel opens on extension icon click
- Fixed session initialization flow

### Fixed
- Grok adapter selectors with fallback patterns
- Loading spinner issue resolved

---

## [0.1.0] - 2025-12-30

### Added
- **Service Worker Foundation** - MV3-compliant keep-alive system
- **KeepAliveManager** - Chrome alarms API (30s interval)
- **CouncilStateMachine** - State persistence across restarts
- **MessageRouter** - Long-lived port connections with ack/retry
- **Adapter Plugin System** - ChatGPT, Claude, Gemini, Grok adapters
- **Side Panel UI** - Model roster with status display
- **TOS Compliance Documentation** - Comprehensive safety guide

### Security
- Manual mode default for all platforms
- Grok automation permanently blocked
- No external server communication
- All data stored locally

---

## Version History Summary

| Version | Phase | Key Features |
|---------|-------|--------------|
| 1.2.0 | 4 | Session History, Stage Selection, Response Badges |
| 1.1.0 | 3 | PRD Generator, Response Comparison, Export |
| 1.0.0 | 2 | Prompt Composer, Manual Workflow, Settings |
| 0.2.0 | 1b | Scope Limits, Side Panel Click |
| 0.1.0 | 1 | Foundation, Service Worker, Adapters |
