---
name: deploy
description: Full deploy pipeline — check, build, and submit to store
argument-hint: <android|ios>
disable-model-invocation: true
allowed-tools: Bash, Read, Edit
---

Full deployment pipeline for $ARGUMENTS[0].

## Steps

1. **Pre-flight checks:**
   - Run `npx tsc --noEmit` — must pass
   - Run `git status` — warn if uncommitted changes
   - Verify service account (Android) or Apple credentials (iOS) exist

2. **Build:**
   - Run `eas build --platform $ARGUMENTS[0] --profile production`
   - Wait for build to complete or report queue position

3. **Submit:**
   - Once build succeeds, run `eas submit --platform $ARGUMENTS[0] --profile production --latest`
   - Report submission status

4. **Post-deploy:**
   - Show the build URL and submission status
   - Remind about store review times
