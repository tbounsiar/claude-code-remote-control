---
name: submit
description: Submit the latest build to Play Store or App Store
argument-hint: <android|ios>
disable-model-invocation: true
allowed-tools: Bash, Read
---

Submit the latest EAS build to the app store.

Arguments: $ARGUMENTS
- First argument: platform (android or ios)

## Steps

1. Run `eas build:list --platform $ARGUMENTS[0] --limit 1` to verify a build exists
2. Check that the service account file exists (Android) or Apple credentials are configured (iOS)
3. Run `eas submit --platform $ARGUMENTS[0] --profile production --latest`
4. Report the submission status
