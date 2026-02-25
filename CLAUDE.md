# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A React Native (Expo) mobile app for remotely controlling Claude Code sessions. Users scan QR codes or paste URLs from `claude remote-control` terminal sessions, then interact via an embedded WebView. Push notifications alert when a session needs input.

## Commands

- `npx expo start` — Dev server (`npm start`)
- `npx expo start --android` / `--ios` — Platform-specific
- `npx tsc --noEmit` — TypeScript strict check
- `eas build --platform <android|ios> --profile <profile>` — Build with EAS
- `eas submit --platform <android|ios> --profile production --latest` — Submit to store

No test framework is configured.

## Architecture

**Expo Router file-based routing** (`app/`):
- `index.tsx` — Home: session list, QR scan, paste-URL modal, browse button
- `scanner.tsx` — Camera QR scanner (full-screen modal)
- `session/[url].tsx` — Session viewer wrapping `WebViewSession`
- `settings.tsx` — Theme preference, clear sessions
- `_layout.tsx` — Root layout: ThemeProvider, deep linking, notifications

**Core component** (`components/WebViewSession.tsx`):
- Loads claude.ai/code in WebView with injected JS
- Detects auth state, session state (waiting for input), session lists
- Sends push notifications when idle (background only, 30s cooldown)
- Restricts navigation to claude.ai / anthropic.com domains

**Injected JavaScript** (`lib/injectedJS.ts`):
- Pre-load: sets `window.__CLAUDE_REMOTE_APP`
- Post-load: MutationObserver (debounced 300ms) for auth, session state, session list
- Messages via `postMessage()`: `AUTH_STATE`, `SESSION_STATE`, `SESSION_LIST`

**Data layer** (`lib/storage.ts`):
- AsyncStorage with serialized write queue (prevents race conditions)
- Session model: `{ url, label?, addedAt }`

**Theming** (`hooks/useTheme.tsx` + `lib/theme.ts`):
- Context with system/light/dark preference, persisted to AsyncStorage
- Orange primary: `#D97706` (light) / `#F59E0B` (dark)

## Key Conventions

- `StyleSheet.create` inline per file — no shared stylesheet
- All colors from `useTheme().colors` — never hardcode
- `useFocusEffect` for screen-focus side effects (not `useEffect`)
- Deep link scheme: `clauderemote://`
- Custom UA: `{defaultUA} ClaudeCodeRemoteControl/1.0` (append, never replace)
- Storage keys: `@` prefixed (e.g. `@sessions`)
- Public repo — never commit secrets (service accounts, .env, keystores)

## Claude Code Tools

**Slash commands:** `/build`, `/submit`, `/check`, `/review`, `/deploy`, `/fix`

**Agents:** `code-reviewer` (read-only review), `bug-fixer` (investigate + fix), `feature-dev` (implement features)

**Skills (auto-loaded):** `expo-react-native` (conventions), `webview-patterns` (injection protocol), `eas-deploy` (build/submit)
