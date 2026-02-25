# Claude Code Remote Control

[![Build Android](https://github.com/tbounsiar/claude-code-remote-control/actions/workflows/build-android.yml/badge.svg)](https://github.com/tbounsiar/claude-code-remote-control/actions/workflows/build-android.yml)
[![Version](https://img.shields.io/github/v/release/tbounsiar/claude-code-remote-control)](https://github.com/tbounsiar/claude-code-remote-control/releases/latest)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey)](https://github.com/tbounsiar/claude-code-remote-control/releases)
[![License](https://img.shields.io/github/license/tbounsiar/claude-code-remote-control)](LICENSE)

Control your [Claude Code](https://code.claude.com) sessions remotely from any mobile device.

<p align="center">
  <img src="assets/icon.png" width="120" alt="Claude Code Remote Control icon" />
</p>

## Download

| Platform | Status |
|----------|--------|
| **Android (APK)** | [**Download v1.1.0**](https://github.com/tbounsiar/claude-code-remote-control/releases/download/v1.1.0/claude-code-remote-control-v1.1.0.apk) |
| **Google Play Store** | 🔜 Coming soon |
| **Apple App Store** | 🔜 Coming soon |

> The APK is for sideloading on Android. You may need to enable "Install from unknown sources" in your device settings.

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
3. 🔲 Click the extension icon — it generates a QR code for the current URL
4. 📱 Open **Claude Code Remote Control** on your phone
5. 📸 Tap **Scan QR Code** and scan the QR code from your screen
6. 🎉 You're connected — control your session from your phone!

## Google Sign-In Workaround

Google blocks OAuth inside WebViews. If your Claude account uses Google Sign-In:

1. Open **Settings** (gear icon) and enable **Google Sign-In**
2. Sessions will now open in your default browser instead of the in-app WebView
3. You can turn it off anytime to go back to the in-app experience

## Requirements

- A [Claude](https://claude.ai) subscription (Pro or Max plan)
- [Claude Code CLI](https://code.claude.com/docs/en/overview) installed on your computer
- Android 7+ or iOS 15+ device

## Privacy

Your sessions are loaded directly in an embedded browser on your device. No data passes through third-party servers.

[Privacy Policy](https://tbounsiar.github.io/claude-code-remote-control/privacy-policy/)

## License

MIT
