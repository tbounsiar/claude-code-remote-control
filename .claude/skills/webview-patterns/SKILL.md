---
name: webview-patterns
description: WebView injection patterns and communication protocol between the React Native app and claude.ai. Use when modifying injected JavaScript, WebView behavior, or message handling.
user-invocable: false
---

# WebView Injection Patterns

## Architecture

The app loads `claude.ai/code` in a WebView and communicates via injected JavaScript.

```
┌─────────────────────┐     postMessage()      ┌──────────────────┐
│  React Native App   │ ◄──────────────────────  │  Injected JS     │
│  (WebViewSession)   │                          │  (runs in page)  │
│                     │  injectedJavaScript*     │                  │
│                     │ ─────────────────────►   │                  │
└─────────────────────┘                          └──────────────────┘
```

## Injection Points

1. **`injectedJavaScriptBeforeContentLoaded`** — Runs before page loads
   - Sets `window.__CLAUDE_REMOTE_APP = true`

2. **`injectedJavaScript`** — Runs after page loads
   - Auth detection, session state observer, session list parser
   - All wrapped in `setTimeout(fn, 500)` to wait for React hydration

3. **Dark mode CSS** — Conditional injection via `injectedCSSText` prop (based on theme)

## Message Protocol

All messages sent via `window.ReactNativeWebView.postMessage(JSON.stringify(payload))`.

### Message Types

| Type | Payload | Purpose |
|------|---------|---------|
| `AUTH_STATE` | `{ authenticated: boolean }` | Login form vs main content detection |
| `SESSION_STATE` | `{ waitingForInput: boolean, sessionUrl: string }` | Is the session idle/waiting? |
| `SESSION_LIST` | `{ sessions: Array<{url, label}> }` | Auto-discovered sessions from sidebar |

### Handling in WebViewSession.tsx

```tsx
const handleMessage = (event: WebViewMessageEvent) => {
  const data = JSON.parse(event.nativeEvent.data);
  switch (data.type) {
    case 'AUTH_STATE': // update auth state
    case 'SESSION_STATE': // trigger notification if waiting + background
    case 'SESSION_LIST': // merge into storage
  }
};
```

## DOM Detection Patterns

### Auth State
- **Not authenticated:** `document.querySelector('form[action*="login"], input[type="password"]')`
- **Authenticated:** `document.querySelector('main, [data-testid="main-content"]')`

### Session State (waiting for input)
- **Primary:** `textarea` element — check `disabled` attribute
- **Fallback:** `[contenteditable]` element — check `aria-disabled` attribute
- **Waiting = input is NOT disabled** (user can type)

### Session List
- Parse all `<a>` tags with `href` containing `/code/`
- Extract label from link text content
- Deduplicate by URL

## MutationObserver Pattern

```javascript
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    checkSessionState();
    parseSessionList();
  }, 300);
});
observer.observe(document.body, { childList: true, subtree: true });
```

- **Always debounce** — DOM changes are frequent
- **300ms minimum** debounce to avoid performance issues
- **Guard duplicates** — track `lastSessionCount` to avoid re-sending identical lists

## Navigation Restrictions

In `onShouldStartLoadWithRequest`:
- Allow: `claude.ai`, `*.claude.ai`, `anthropic.com`, `*.anthropic.com`
- Block all other domains — open in system browser via `Linking.openURL()`

## User Agent

```
{DefaultPlatformUA} ClaudeCodeRemoteControl/1.0
```
- Always **append** to the default UA — never replace it
- Use `Platform.select()` for platform-specific default UAs

## Common Pitfalls
- Claude.ai is a React SPA — DOM may not be ready immediately after load
- `textarea` may be replaced by `contenteditable` — always check both
- MutationObserver without debounce causes performance issues
- Replacing User-Agent entirely breaks claude.ai — always append
