const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo config plugin that patches react-native-webview's Android source to:
 * 1. Remove the X-Requested-With header (Google uses it to detect WebViews)
 * 2. Override User-Agent Client Hints (Sec-Ch-Ua) to hide "Android WebView" brand
 *
 * This allows Google OAuth to work inside the WebView by making it
 * indistinguishable from a regular Chrome browser.
 */
module.exports = function withWebViewNoRequestedWith(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const webviewKtPath = path.join(
        config.modRequest.projectRoot,
        "node_modules",
        "react-native-webview",
        "android",
        "src",
        "main",
        "java",
        "com",
        "reactnativecommunity",
        "webview",
        "RNCWebViewManagerImpl.kt"
      );

      let content = fs.readFileSync(webviewKtPath, "utf8");

      // Check if already patched (v2 marker)
      if (content.includes("REFLECTION_FALLBACK_XRW")) {
        return config;
      }

      // Remove any old patches from previous versions
      content = content.replace(
        /\n\s*\/\/ --- Google OAuth WebView bypass ---[\s\S]*?catch \(_: Exception\) \{\}\n/g,
        "\n"
      );
      content = content.replace(
        /\n\s*\/\/ Remove X-Requested-With header to allow Google OAuth[\s\S]*?catch \(e: Exception\) \{\s*\n\s*\/\/ Ignore if not supported on this device\s*\n\s*\}\n/g,
        "\n"
      );

      // Add imports
      if (!content.includes("import androidx.webkit.WebViewFeature")) {
        content = content.replace(
          "import androidx.webkit.WebSettingsCompat",
          "import androidx.webkit.WebSettingsCompat\nimport androidx.webkit.WebViewFeature\nimport androidx.webkit.UserAgentMetadata"
        );
      } else if (!content.includes("import androidx.webkit.UserAgentMetadata")) {
        content = content.replace(
          "import androidx.webkit.WebViewFeature",
          "import androidx.webkit.WebViewFeature\nimport androidx.webkit.UserAgentMetadata"
        );
      }

      // After the line that sets mixedContentMode, add our patches
      const anchor =
        "settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW";
      const patch = `
        // --- Google OAuth WebView bypass (REFLECTION_FALLBACK_XRW) ---
        // 1. Remove X-Requested-With header
        //    Try official API first, then reflection fallback
        var xrwRemoved = false
        try {
            WebSettingsCompat.setRequestedWithHeaderOriginAllowList(settings, emptySet())
            xrwRemoved = true
        } catch (_: Exception) {}

        if (!xrwRemoved) {
            // Reflection fallback: access internal AwSettings directly
            try {
                val providerField = android.webkit.WebView::class.java.getDeclaredField("mProvider")
                providerField.isAccessible = true
                val provider = providerField.get(webView)
                val getSettingsMethod = provider.javaClass.getMethod("getSettings")
                val awSettings = getSettingsMethod.invoke(provider)
                val setMethod = awSettings.javaClass.getDeclaredMethod(
                    "setRequestedWithHeaderOriginAllowList",
                    java.util.Set::class.java
                )
                setMethod.isAccessible = true
                setMethod.invoke(awSettings, java.util.HashSet<String>())
            } catch (_: Exception) {}
        }

        // 2. Override User-Agent Client Hints to hide "Android WebView" brand
        //    Google reads Sec-Ch-Ua header to detect WebViews and block OAuth
        try {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.USER_AGENT_METADATA)) {
                val chromeBrand = UserAgentMetadata.BrandVersion.Builder()
                    .setBrand("Chromium")
                    .setMajorVersion("131")
                    .setFullVersion("131.0.6778.200")
                    .build()
                val googleChrome = UserAgentMetadata.BrandVersion.Builder()
                    .setBrand("Google Chrome")
                    .setMajorVersion("131")
                    .setFullVersion("131.0.6778.200")
                    .build()
                val notABrand = UserAgentMetadata.BrandVersion.Builder()
                    .setBrand("Not_A Brand")
                    .setMajorVersion("24")
                    .setFullVersion("24.0.0.0")
                    .build()
                val metadata = UserAgentMetadata.Builder()
                    .setBrandVersionList(listOf(chromeBrand, googleChrome, notABrand))
                    .setFullVersion("131.0.6778.200")
                    .setPlatform("Android")
                    .setPlatformVersion("14.0.0")
                    .setArchitecture("arm")
                    .setModel("Pixel 8")
                    .setMobile(true)
                    .build()
                WebSettingsCompat.setUserAgentMetadata(settings, metadata)
            }
        } catch (_: Exception) {}`;

      content = content.replace(anchor, anchor + "\n" + patch);

      fs.writeFileSync(webviewKtPath, content, "utf8");

      return config;
    },
  ]);
};
