# Privacy Policy for Multi-LLM PRD Writer

**Last Updated**: December 30, 2025

## 1. Overview
Multi-LLM PRD Writer ("we", "our", or "the Extension") is a browser extension designed to help users orchestrate interactions with Large Language Models (LLMs) via their existing web sessions. **We prioritize your privacy by keeping data local and requiring explicit action for all data transmission.**

## 2. Data Collection and Storage

### 2.1 Local Storage (On-Device)
The Extension stores the following data locally on your device using `chrome.storage.local`:
- **Session State**: Temporary drafts of your prompts and the responses received from LLMs.
- **Settings**: Your preferences for auto-send behavior, theme, and model routing overrides.
- **Audit Logs**: A local history of actions taken (e.g., "Sent prompt to ChatGPT at 10:00 AM").

**This data never leaves your device** unless you explicitly choose to export it.

### 2.2 Data Transmission to Third Parties
The Extension automates interactions with the following third-party LLM providers *only when you actively trigger a workflow*:
- OpenAI (ChatGPT)
- Anthropic (Claude)
- Google (Gemini)
- xAI (Grok)

When you click "Send" (or enable auto-send), the Extension inserts your prompt text into the respective website's interface. The Extension operates as a user-agent acting on your behalf. We do not transmit your data to any other servers, analytics providers, or our own cloud.

## 3. Permissions Usage

- **Storage**: To save your session state locally so work isn't lost if the browser acts up.
- **Alarms**: To keep the orchestration engine alive during long reasoning tasks.
- **Scripting / Host Permissions**: To detect the status of LLM tabs (e.g., "Ready", "Streaming") and insert prompts into the input fields of `chatgpt.com`, `claude.ai`, `gemini.google.com`, and `grok.com`.

## 4. User Control
- You can clear all local data at any time via the Extension settings ("Clear Session").
- You can revoke host permissions via the Chrome Extensions management page.
- The Extension defaults to "Manual Mode," meaning no data is sent to an LLM provider without your specific click.

## 5. Contact
For questions about this policy, please contact: [Insert Contact Email]
