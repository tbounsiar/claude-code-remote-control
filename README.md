# Claude Code Remote Control

[![Build Android](https://github.com/tbounsiar/claude-code-remote-control/actions/workflows/build-android.yml/badge.svg)](https://github.com/tbounsiar/claude-code-remote-control/actions/workflows/build-android.yml)
[![Version](https://img.shields.io/github/v/release/tbounsiar/claude-code-remote-control)](https://github.com/tbounsiar/claude-code-remote-control/releases/latest)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey)](https://github.com/tbounsiar/claude-code-remote-control/releases)
[![License](https://img.shields.io/github/license/tbounsiar/claude-code-remote-control)](LICENSE)

Control your Claude Code sessions remotely from any mobile device.

<p align="center">
  <img src="assets/icon.png" width="120" alt="Claude Code Remote Control icon" />
</p>

## Download

| Platform | Status |
|----------|--------|
| **Android (APK)** | [**Download v1.0.0**](https://github.com/tbounsiar/claude-code-remote-control/releases/download/v1.0.0/claude-code-remote-control-v1.0.0.apk) |
| **Google Play Store** | 🔜 Coming soon |
| **Apple App Store** | 🔜 Coming soon |

> **Note:** The APK is for sideloading on Android. You may need to enable "Install from unknown sources" in your device settings.

## How It Works

1. Start a Remote Control session:
   - **New session:** run `claude remote-control` in your terminal
   - **Existing session:** type `/remote-control` (or `/rc`) inside Claude Code
2. A **session URL** appears in the terminal (press **Space** to show a QR code)
3. Open **Claude Code Remote Control** on your phone
4. **Scan the QR code** or **paste the session URL** to connect
5. Interact with your Claude Code session from your phone
6. Get **push notifications** when the session needs your input

> See the [official Remote Control docs](https://code.claude.com/docs/en/remote-control) for full details.

### 📷 Quick Start — Scan from your browser

An alternative to the `remote-control` terminal command:

1. 🧩 Install the [QR Code Generator](https://chromewebstore.google.com/detail/qr-code-generator/afpbjjgbdimpioenaedcjgkaigggcdpp) Chrome extension
2. 🌐 Open your Claude Code session in Chrome (`claude.ai/code`)
3. 🔲 Click the QR Code Generator extension icon — it generates a QR code for the current URL
4. 📱 Open **Claude Code Remote Control** on your phone
5. 📸 Tap **Scan QR Code** and scan the QR code from your screen
6. 🎉 You're connected — control your session from your phone!

## Requirements

- A [Claude](https://claude.ai) subscription
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed on your computer
- Android 7+ or iOS 15+ device

## Privacy

Your sessions are loaded directly in an embedded browser on your device. No data passes through third-party servers.

[Privacy Policy](https://tbounsiar.github.io/claude-code-remote-control/privacy-policy/)

## Building from Source

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# TypeScript check
npx tsc --noEmit
```

## CI/CD — Automated Builds

Android builds run automatically via **GitHub Actions** on every tag push (`v*`).

**Trigger a new release:**
```bash
git tag v1.1.0
git push --tags
```

This will:
1. Run `expo prebuild` to generate the Android project
2. Build a signed AAB (Play Store) and APK (sideload)
3. Create a GitHub Release with both artifacts attached

See the [workflow file](.github/workflows/build-android.yml) for required GitHub Secrets configuration.

## License

MIT
