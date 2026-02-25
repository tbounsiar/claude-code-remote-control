---
name: build
description: Build the app with EAS for a specific platform and profile
argument-hint: <android|ios> [profile]
disable-model-invocation: true
allowed-tools: Bash, Read
---

Build the app using EAS Build.

Arguments: $ARGUMENTS
- First argument: platform (android or ios)
- Second argument (optional): build profile (development, preview, production). Defaults to production.

## Steps

1. Run `npx tsc --noEmit` to verify TypeScript compiles
2. Check `git status` — warn if there are uncommitted changes (EAS clones from git)
3. Run `eas build --platform $ARGUMENTS[0] --profile ${1:-production}`
4. Report the build status and build ID
