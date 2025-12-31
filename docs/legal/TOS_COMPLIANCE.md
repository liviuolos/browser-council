# Terms of Service Compliance & Safety Guide

**Multi-LLM PRD Writer Chrome Extension**  
**Version:** 1.2 | **Last Updated:** December 31, 2025

---

## Executive Summary

This extension is designed from the ground up to **respect the Terms of Service** of all supported AI platforms. Our core philosophy: **"User-Assisted, Never Automated"** ensures compliance while providing value.

**✅ Current Status: FULLY COMPLIANT** across all platforms (ChatGPT, Claude, Gemini, Grok)

---

## Platform-Specific Compliance

### 1. OpenAI (ChatGPT / ChatGPT Plus)

**Terms Research Date:** December 30, 2025  
**Sources:** OpenAI Terms of Use (effective Dec 11, 2024), Usage Policies (updated Oct 29, 2025)

#### ❌ **Prohibited Actions**

1. **Automated Data Extraction**
   > *"Any automated or programmatic method to extract data or output from the Services, including scraping, web harvesting, or web data extraction"* — **STRICTLY PROHIBITED**

2. **Bypassing Rate Limits**
   > Users may not *"circumvent rate limits or bypass any protective measures"*

3. **Automated High-Stakes Decisions**
   > *"Automation of high-stakes decisions in sensitive areas without human review"* is prohibited

4. **Account Sharing**
   > Premium accounts (Plus, Teams, Enterprise) tied to individuals — sharing violates TOS

#### ✅ **What This Extension Does (Compliant)**

- ✅ Inserts text into input fields (user interaction)
- ✅ Displays status information (read-only)
- ✅ Waits for **USER** to click send button
- ✅ **Does NOT** automatically submit forms
- ✅ **Does NOT** scrape/extract responses without user initiation
- ✅ **Does NOT** bypass rate limits or Cloudflare protection

#### ⚠️ **Future Feature Compliance**

**Manual Mode (Default - SAFE):**
```typescript
// Copy prompt to clipboard
navigator.clipboard.writeText(prompt);
// User pastes manually → TOS compliant
```

**Semi-Assisted (Opt-In - SAFE):**
```typescript
// Extension fills input
inputElement.value = prompt;
// USER clicks send → TOS compliant (human action)
```

**Full Automation (NOT RECOMMENDED):**
```typescript
// Auto-click send button
sendButton.click(); // ❌ Violates "automated" restriction
```

---

### 2. Anthropic (Claude / Claude Pro / Claude Max)

**Terms Research Date:** December 30, 2025  
**Sources:** Consumer Terms (effective Aug 28, 2025 & Oct 8, 2025), Usage Policy (effective Sept 15, 2025)

#### ❌ **Prohibited Actions**

1. **Excessive Automation**
   > Weekly usage limits introduced Aug 28, 2025 to prevent *"continuous background use"*

2. **Bypassing Safety Mechanisms**
   > Usage Policy prohibits bypassing protective measures or *"malicious computer, network, and infrastructure compromise activities"*

3. **Account Sharing**
   > Unauthorized account sharing violates terms

4. **Data Training Opt-Out Violation**
   > For consumer plans, users can opt-out of data training — extension must respect user's privacy settings

#### ✅ **What This Extension Does (Compliant)**

- ✅ **Respects Anthropic's Official Chrome Extension Philosophy**
  - Anthropic released "Claude for Chrome" (Dec 2025) with robust permission system
  - Our extension follows similar "permission-first" approach
  
- ✅ **Requires User Consent for Actions**
  - No automated clicking without user approval
  - Blocked from high-risk actions (purchases, financial transactions)

- ✅ **Respects Usage Limits**
  - Does NOT facilitate rapid-fire requests
  - User-paced workflow prevents limit abuse

#### 🔒 **Privacy Commitment**

Claude consumer plans have 2 data retention policies:
- **Opt-In Training:** 5-year retention
- **Opt-Out Training:** 30-day retention

**This extension:**
- ✅ Does NOT upload user data to external servers
- ✅ Stores session data temporarily in `chrome.storage.session` (cleared on browser close)
- ✅ All data stays local

---

### 3. Google (Gemini / Gemini Advanced)

**Terms Research Date:** December 30, 2025  
**Sources:** Google APIs Terms of Service, Gemini API Additional Terms (2025), General Google Terms

#### ❌ **Prohibited Actions**

1. **Automated Access Violating robots.txt**
   > Explicitly forbids *"using automated means to access content from any of our services in violation of the machine-readable instructions on our web pages (for example, robots.txt files that disallow crawling, training, or other activities)"*

2. **Reverse Engineering**
   > Users may not *"reverse engineer the services or underlying models"*

3. **Bypassing Abuse Protections**
   > May not *"interfere with monitoring"* or bypass safety mechanisms

4. **Jailbreaking / Adversarial Prompting**
   > Prohibited except for authorized safety/bug testing programs

#### ✅ **What This Extension Does (Compliant)**

- ✅ Uses Gemini's **public web interface** (not scraping API)
- ✅ Does NOT violate robots.txt (only DOM interaction on loaded pages)
- ✅ Does NOT reverse engineer models
- ✅ Does NOT bypass monitoring systems

#### 📊 **Data Usage Notes**

For **Unpaid Services** (free Gemini):
- Google may use prompts/responses to improve products
- Human reviewers may process data

For **Paid Services** (Gemini Advanced):
- Google does NOT use data to improve products

**This extension:**
- ✅ Transparent about data flow (local storage only)
- ✅ Does not exfiltrate data to third parties

---

### 4. xAI (Grok / Grok Premium)

**Terms Research Date:** December 30, 2025  
**Sources:** xAI Terms of Service, Acceptable Use & Responsible AI Policy

#### ❌ **Prohibited Actions**

1. **Using Bots**
   > Explicit prohibition: *"using bots to access"* the service

2. **Bypassing Rate Limits**
   > May not use services *"beyond published parameters, rate limits, or use limitations"*

3. **Circumventing Protections**
   > May not circumvent *"abuse protections or safety mechanisms"*

4. **Modifying / Reverse Engineering**
   > Forbidden to *"modify, copy... reverse engineer, or decompile our Service"*

#### ✅ **What This Extension Does (Compliant)**

- ✅ **NOT a Bot** — Extension is a UI assistant, user controls all actions
- ✅ **Does NOT automate** — User clicks send, not the extension
- ✅ **Respects Rate Limits** — No rapid requests, user-paced
- ✅ **Does NOT modify Grok** — Only interacts with public DOM

#### ⚠️ **Important Note**

xAI has the **strictest** anti-automation policy. For Grok:
- **Always use Manual Mode by default**
- **Never** auto-click send buttons
- **Never** bypass Cloudflare or security measures

---

## Global Compliance Principles

### 🎯 Core Philosophy: "User-Assisted, Never Automated"

**Definition:**
- The extension **prepares** and **organizes** work
- The USER **reviews** and **executes** actions
- Extension is a **tool**, not a **bot**

### ✅ Compliant Behaviors

1. **Read-Only DOM Inspection**
   - ✅ Checking if elements exist (adapter readiness)
   - ✅ Detecting UI state (button enabled/disabled)

2. **Non-Destructive DOM Interaction**
   - ✅ Filling input fields (equivalent to typing)
   - ✅ Triggering input events (React compatibility)

3. **User-Initiated Actions**
   - ✅ User clicks "send" button
   - ✅ User copies and pastes manually
   - ✅ Extension waits for user confirmation

4. **Local Data Storage**
   - ✅ Session state in `chrome.storage.session`
   - ✅ Backup in `chrome.storage.local`
   - ✅ No external server uploads

### ❌ Non-Compliant Behaviors (Avoided)

1. **Automated Form Submission**
   - ❌ Auto-clicking send buttons
   - ❌ Programmatically submitting forms
   - ❌ Bypassing user interaction

2. **Automated Data Extraction**
   - ❌ Scraping responses en masse
   - ❌ Bulk downloading conversations
   - ❌ Automated archiving without user action

3. **Rate Limit Bypass**
   - ❌ Rapid-fire requests
   - ❌ Multiple concurrent sessions
   - ❌ Circumventing Cloudflare / security

4. **Deceptive Practices**
   - ❌ Hiding extension activity from user
   - ❌ Spoofing user agent
   - ❌ Pretending to be human when automated

---

## Implementation Safeguards

### Code-Level Compliance

**1. Manual Mode (Default)**
```typescript
// src/lib/types.ts
export type SendMode = 'manual' | 'semi_assisted' | 'automated';

// Default configuration
export const DEFAULT_SETTINGS = {
  sendMode: 'manual', // ✅ Safe by default
  requireConfirmation: true,
  respectRateLimits: true
};
```

**2. User Confirmation Required**
```typescript
// Before any action
if (!userConfirmed) {
  showWarning('Please review prompt before sending');
  return;
}
```

**3. Rate Limiting**
```typescript
// Minimum delay between requests
const MIN_REQUEST_INTERVAL_MS = 3000; // 3 seconds

async function sendPrompt() {
  const timeSinceLastRequest = Date.now() - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    throw new Error('Please wait before sending another prompt');
  }
  // ... proceed
}
```

**4. Platform-Specific Adapters**
```typescript
// Each adapter has compliance settings
interface AdapterConfig {
  platform: ModelPlatform;
  maxAutoSendAllowed: boolean; // Grok = false
  requiresManualMode: boolean; // Grok = true
  // ...
}
```

### User-Facing Safeguards

**1. Settings Panel (Future)**
```
[ ] Enable Semi-Assisted Mode (fills prompts, you click send)
[ ] Enable Full Automation (⚠️ NOT RECOMMENDED - may violate TOS)

Current Mode: Manual (Safest) ✅
```

**2. Terms of Service Warnings**
```
⚠️ IMPORTANT: Enabling automation may violate platform Terms of Service.
By enabling this feature, you acknowledge:
- OpenAI prohibits automated interactions
- xAI explicitly bans bots
- You use this feature at your own risk
- We recommend Manual Mode for compliance

[X] I understand and accept the risks
[ Cancel ]  [ Enable Automation ]
```

**3. Per-Platform Indicators**
```
ChatGPT  ✅ Manual Mode (TOS Compliant)
Claude   ✅ Manual Mode (TOS Compliant)
Gemini   ✅ Manual Mode (TOS Compliant)
Grok     ✅ Manual Mode (Required - Strict TOS)
```

---

## Cloudflare & Security Respect

### Why We're Blocked

**Cloudflare Protection Triggers:**
1. ❌ Automated clicking patterns
2. ❌ Rapid requests without human delays
3. ❌ Missing browser fingerprints
4. ❌ Suspicious user-agent strings

### Our Approach

**✅ Respect, Don't Bypass:**
1. ✅ If Cloudflare blocks, **accept it**
2. ✅ Fall back to Manual Mode (copy/paste)
3. ✅ Show user-friendly error: *"Please complete security check in tab"*
4. ✅ **Never** attempt to bypass or circumvent

**Manual Mode as Fallback:**
```typescript
if (cloudflareDetected) {
  return {
    mode: 'manual',
    message: 'Security check required. Please paste prompt manually.',
    clipboardText: prompt
  };
}
```

---

## Enforcement & Monitoring

### Self-Monitoring

**Extension Logs (Console):**
```
[Council] Mode: MANUAL ✅
[Council] User confirmed send: YES
[Council] Compliance check: PASSED
[Council] TOS violation risk: NONE
```

**Alert System:**
```typescript
if (detectedNonCompliance) {
  disableFeature();
  alertUser('This action may violate TOS. Disabled for safety.');
}
```

### User Responsibility

**By using this extension, users agree to:**
1. ✅ Use Manual Mode as default
2. ✅ Not attempt TOS violations
3. ✅ Respect rate limits
4. ✅ Not share premium accounts
5. ✅ Review prompts before sending

---

## Extension Scope & Permissions

### Minimal Permission Model

**This extension uses the LEAST permissions possible:**

| Permission | Scope | Why |
|------------|-------|-----|
| `activeTab` | Current tab only | Interact only when user clicks extension |
| `tabGroups` | User's tab groups | Optional organization feature |
| `storage` | Local only | Save settings in browser |
| `alarms` | Background | Keep service worker alive |
| `scripting` | 5 LLM hosts only | Inject adapters on matching pages |

### What We DON'T Access:

- ❌ **Other browser windows** - No access to windows not containing LLM tabs
- ❌ **All tabs** - No `tabs` permission (removed in v0.2.0)
- ❌ **Browsing history** - Not requested, never used
- ❌ **Downloads** - Not requested
- ❌ **Network requests** - No `webRequest` permission
- ❌ **Bookmarks** - Not requested

### Host Permissions (Explicit List):

```json
"host_permissions": [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
    "https://grok.com/*"
]
```

Only these 5 domains. **No wildcards. No `<all_urls>`.**

### Content Script Scope:

Content scripts ONLY run on pages matching the 5 LLM hostnames:
- ✅ Runs: `https://chatgpt.com/c/abc123`
- ✅ Runs: `https://claude.ai/chat`
- ❌ Does NOT run: `https://google.com`
- ❌ Does NOT run: `https://example.com`
- ❌ Does NOT run: Any other website

---

## Privacy & Data Handling

### What We Collect

**Local Only:**
- ✅ Session state (cleared on browser close)
- ✅ Model status (ready/streaming/etc.)
- ✅ User preferences (send mode, settings)

**NEVER Collected:**
- ❌ Prompts sent to LLMs
- ❌ Responses from LLMs
- ❌ Account credentials
- ❌ Personal information
- ❌ Browsing history

### Storage Transparency

```typescript
// ALL data stored locally in Chrome
chrome.storage.session.set(councilState); // Temporary
chrome.storage.local.set(userSettings);   // Persistent

// NO external servers
// NO analytics
// NO telemetry
```

---

## Updates & Maintenance

### Monitoring TOS Changes

**We commit to:**
1. ✅ Quarterly review of all platform TOS
2. ✅ Immediate updates if TOS changes
3. ✅ Notify users of compliance-affecting updates
4. ✅ Disable features that become non-compliant

**Version History:**
- **v1.0 (Dec 2025):** Initial release - Manual Mode only (100% compliant)
- **v1.1 (Planned):** Semi-Assisted Mode (opt-in, TOS compliant)

---

## Legal Disclaimer

**This extension is:**
- ✅ An independent, open-source project
- ✅ Not affiliated with OpenAI, Anthropic, Google, or xAI
- ✅ Designed to assist users, not automate on their behalf
- ✅ Provided "AS IS" without warranty

**Users are responsible for:**
- ❌ Their own compliance with platform TOS
- ❌ Any account suspensions resulting from misuse
- ❌ Reviewing and understanding platform policies

**By using this extension, you agree that:**
- The developers are not liable for TOS violations
- You use the extension at your own risk
- You will follow recommended Manual Mode settings

---

## Quick Reference: Is This Allowed?

| Action | ChatGPT | Claude | Gemini | Grok | Extension Default |
|--------|---------|--------|--------|------|-------------------|
| **Fill input field** | ✅ | ✅ | ✅ | ✅ | ✅ YES |
| **User clicks send** | ✅ | ✅ | ✅ | ✅ | ✅ YES |
| **Auto-click send** | ❌ | ⚠️ | ❌ | ❌ | ❌ DISABLED |
| **Copy to clipboard** | ✅ | ✅ | ✅ | ✅ | ✅ YES (default) |
| **Scrape responses** | ❌ | ❌ | ❌ | ❌ | ❌ DISABLED |
| **Bypass rate limits** | ❌ | ❌ | ❌ | ❌ | ❌ NEVER |
| **Read DOM status** | ✅ | ✅ | ✅ | ✅ | ✅ YES |
| **Display UI info** | ✅ | ✅ | ✅ | ✅ | ✅ YES |

**Legend:**  
✅ Allowed | ⚠️ Use with caution | ❌ Prohibited

---

## Contact & Reporting

**Found a TOS issue?**  
Please report to: [GitHub Issues](https://github.com/liviuolos/browser-council/issues)

**TOS violation concern?**  
We take compliance seriously. Contact us immediately.

---

**Last TOS Review:** December 30, 2025  
**Next Scheduled Review:** March 31, 2026  
**Extension Version:** 1.0.0  
**Compliance Status:** ✅ FULLY COMPLIANT
