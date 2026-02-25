---
name: review
description: Review recent code changes for quality, security, and best practices
argument-hint: [commit-range]
disable-model-invocation: true
allowed-tools: Bash, Read, Glob, Grep
---

Review code changes for quality, security, and best practices.

Arguments: $ARGUMENTS
- Optional: commit range (e.g., HEAD~3..HEAD). Defaults to uncommitted changes.

## Steps

1. Get the diff:
   - If argument provided: `git diff $ARGUMENTS`
   - If no argument: `git diff` (unstaged) + `git diff --cached` (staged)
2. Read each changed file in full for context
3. Review against the checklist:
   - **Security:** No secrets, WebView domain restrictions, no XSS
   - **React Native:** useTheme(), StyleSheet, useFocusEffect, cleanup
   - **WebView:** Debounced observers, valid message protocol, UA appended
   - **TypeScript:** No `any`, strict compliance, proper interfaces
   - **Performance:** No unnecessary re-renders, serialized storage writes
4. Report findings with severity (CRITICAL / WARNING / INFO)
