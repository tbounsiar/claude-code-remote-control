---
name: expo-react-native
description: Conventions and patterns for this Expo React Native project. Use when creating or modifying components, screens, hooks, or styles.
user-invocable: false
---

# Expo React Native Patterns — Claude Code Remote Control

## Tech Stack
- React Native 0.81 + Expo SDK 54 + Expo Router 6 (file-based routing)
- TypeScript strict mode
- No external state management — Context API + custom hooks only
- No shared stylesheet — inline `StyleSheet.create()` per file

## File Conventions

| Type | Location | Naming |
|------|----------|--------|
| Screen | `app/` | lowercase (e.g. `scanner.tsx`) |
| Component | `components/` | PascalCase (e.g. `SessionCard.tsx`) |
| Hook | `hooks/` | camelCase with `use` prefix (e.g. `useSessions.ts`) |
| Utility/service | `lib/` | camelCase (e.g. `storage.ts`) |
| Constants | `lib/constants.ts` | UPPER_SNAKE_CASE |

## Screen Template
```tsx
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function ScreenName() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

## Component Template
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface Props {
  // typed props
}

export function ComponentName({ ...props }: Props) {
  const { colors } = useTheme();
  // ...
}

const styles = StyleSheet.create({ /* ... */ });
```

## Theming
- Always use `useTheme()` — never hardcode colors
- Access: `const { colors, dark } = useTheme()`
- Primary color: orange (#D97706 light / #F59E0B dark)
- All dynamic colors applied inline: `{ color: colors.text }`
- Static layout styles go in `StyleSheet.create()`

## Navigation (Expo Router)
- File-based routing in `app/` directory
- Dynamic routes: `app/session/[url].tsx`
- Navigate: `router.push('/scanner')` or `router.push({ pathname: '/session/[url]', params: { url } })`
- Deep link scheme: `clauderemote://`
- Use `useFocusEffect` for screen-focus side effects (not `useEffect`)

## Storage
- AsyncStorage via `lib/storage.ts` with serialized write queue
- All writes go through `serialized()` wrapper to prevent race conditions
- Storage keys prefixed with `@` (e.g. `@sessions`, `@theme_preference`)

## Notifications
- Setup in `lib/notifications.ts`
- Android channel: `session-events` (HIGH importance)
- Only send when app is in background + 30s cooldown
- Always check `AppState.currentState` before sending

## Important Rules
- Always restrict WebView navigation to `claude.ai` and `anthropic.com` domains
- Never store tokens or secrets in AsyncStorage — use expo-secure-store
- Camera permission is required for QR scanning — always handle the denied case
- Use `Platform.select()` for platform-specific values
