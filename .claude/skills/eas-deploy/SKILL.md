---
name: eas-deploy
description: EAS Build and Submit workflows for publishing to Play Store and App Store. Use when building, submitting, or configuring deployment.
user-invocable: false
allowed-tools: Bash, Read, Edit, Write
---

# EAS Build & Submit — Claude Code Remote Control

## Project IDs
- **EAS Project:** d32c5ffe-aef9-4716-8064-77e0be5c069f
- **Owner:** tbounsiar
- **Android Package:** com.tbsoft.claudecoderemotecontrol
- **iOS Bundle ID:** com.tbsoft.claudecoderemotecontrol

## Build Profiles (eas.json)

| Profile | Purpose | Distribution |
|---------|---------|-------------|
| `development` | Dev client with hot reload | internal (simulator for iOS) |
| `preview` | Internal testing APK | internal |
| `production` | Store release (AAB) | store (auto-increment) |

## Common Commands

### Build
```bash
# Android production build (AAB for Play Store)
eas build --platform android --profile production

# iOS production build
eas build --platform ios --profile production

# Preview APK (for manual testing)
eas build --platform android --profile preview
```

### Submit
```bash
# Submit latest Android build to Play Store (internal track)
eas submit --platform android --profile production --latest

# Submit latest iOS build to App Store
eas submit --platform ios --profile production --latest

# Submit a specific build
eas submit --platform android --profile production --id BUILD_ID
```

### Status
```bash
eas build:list --limit 5          # Recent builds
eas build:view BUILD_ID           # Specific build details
eas whoami                        # Verify logged-in account
```

## Pre-Build Checklist
1. All changes committed and pushed (EAS clones from git)
2. `npx tsc --noEmit` passes
3. `app.json` version/versionCode updated if needed
4. Service account JSON present locally (not in git)

## Android Play Store
- **Service account:** `play-store-publisher-488511-d2d205b5709e.json` (gitignored)
- **Track:** internal (for testing), then promote to production in Play Console
- **Build type:** AAB (Android App Bundle) — required by Play Store

## iOS App Store
- **Apple ID / Team ID / ASC App ID:** configured in `eas.json` under `submit.production.ios`
- Requires Apple Developer account credentials during submit

## Troubleshooting

### "Install dependencies" fails
- Check that all changes are committed + pushed (EAS clones from git remote)
- `.npmrc` with `legacy-peer-deps=true` must be committed

### Peer dependency conflicts
- Fixed by `.npmrc` with `legacy-peer-deps=true`
- Root cause: `react-dom` version mismatch with Expo's pinned `react`

### Keystore generation
- First Android build prompts for keystore generation (interactive — cannot use `--non-interactive`)
- After first build, keystore is stored in EAS and reused automatically

## Important Notes
- **Never commit** service account JSON files — they're gitignored via `play-store-publisher-*.json`
- **The repo is public** — double-check no secrets before pushing
- Production builds auto-increment `versionCode` via `eas.json` config
- Free tier builds queue for ~20 min — paid plan gives priority
