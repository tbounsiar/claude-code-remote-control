# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A React Native (Expo) mobile app for remotely controlling Claude Code sessions. Users can scan QR codes or paste URLs from `claude remote-control` terminal sessions, then interact with those sessions via an embedded WebView. The app sends push notifications when a session is waiting for input.

## Commands

- `npx expo start` — Start the dev server (or `npm start`)
- `npx expo start --android` / `--ios` — Start on a specific platform
- `npx expo prebuild` — Generate native projects
- TypeScript checking: `npx tsc --noEmit`

No test framework is configured.

## Architecture

**Expo Router file-based routing** (`app/` directory):
- `app/index.tsx` — Home screen with session list, QR scan button, paste-URL modal, and browse button
- `app/scanner.tsx` — Camera-based QR code scanner (full-screen modal)
- `app/session/[url].tsx` — Session viewer; wraps `WebViewSession` component with a back-navigation header
- `app/settings.tsx` — Theme preference (system/light/dark) and clear-sessions action
- `app/_layout.tsx` — Root layout with `ThemeProvider`, deep link handling (`clauderemote://` scheme and `claude.ai/code` URLs), and notification setup

**Core components** (`components/`):
- `WebViewSession` — The central component. Loads claude.ai/code URLs in a WebView, injects JavaScript to detect auth state, observe session state changes (waiting for input), and parse session lists. Sends push notifications when a session becomes idle. Non-Claude/Anthropic URLs are opened in the system browser.

**Injected JavaScript** (`lib/injectedJS.ts`):
- Three injection scripts: pre-load flag (`window.__CLAUDE_REMOTE_APP`), post-load DOM observer (auth detection, session state, session list parsing), and dark mode CSS injection
- Communication from WebView to app happens via `window.ReactNativeWebView.postMessage()` with JSON messages typed as `AUTH_STATE`, `SESSION_STATE`, or `SESSION_LIST`

**Data layer** (`lib/storage.ts`):
- Sessions stored in AsyncStorage as a JSON array of `{ url, label?, addedAt }` objects
- Key functions: `addSession` (upsert), `removeSession`, `mergeSessions` (for auto-discovered sessions from WebView), `clearSessions`

**Theming** (`lib/theme.ts` + `hooks/useTheme.tsx`):
- `ThemeProvider` context with system/light/dark preference persisted to AsyncStorage
- All colors accessed via `useTheme().colors` — amber/orange primary (`#D97706`/`#F59E0B`)

## Key Conventions

- Styles use `StyleSheet.create` inline in each file (no shared stylesheet or styling library)
- All theme colors come from `useTheme()` and are applied inline via style arrays: `style={[styles.x, { color: colors.y }]}`
- Deep link scheme: `clauderemote://` (configured in `app.json` as `scheme`)
- Android intent filter for `https://claude.ai/code` URLs
- Custom user agent: `ClaudeCodeRemoteControl/1.0`
- Navigation domains restricted to `claude.ai` and `anthropic.com`; external URLs open in system browser
