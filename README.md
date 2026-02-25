# Claude Code Remote Control

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/tbounsiar/claude-code-remote-control/releases/tag/v1.0.0)
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

1. Run `claude` in your terminal with the `remote-control` flag
2. A QR code appears in your terminal
3. Open **Claude Code Remote Control** on your phone
4. **Scan the QR code** or **paste the URL** to connect
5. Interact with your Claude Code session from your phone
6. Get **push notifications** when the session needs your input

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

# Build with EAS
eas build --platform android --profile production
```

## License

MIT
