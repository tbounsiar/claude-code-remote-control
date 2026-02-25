import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState, Linking as RNLinking, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../hooks/useTheme';
import { notifySessionEvent } from '../lib/notifications';
import { mergeSessions } from '../lib/storage';
import {
  INJECTED_JS_BEFORE_LOAD,
  INJECTED_JS_AFTER_LOAD,
  DARK_MODE_CSS_INJECTION,
} from '../lib/injectedJS';
import { isAllowedHost, isGoogleAuthHost } from '../lib/constants';
import { LoadingOverlay } from './LoadingOverlay';

const DEFAULT_USER_AGENT = Platform.select({
  android:
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  ios:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  default:
    'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
});

const NOTIFICATION_COOLDOWN_MS = 30_000;

interface Props {
  url: string;
}

export function WebViewSession({ url }: Props) {
  const { dark, colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastNotifyRef = useRef<number>(0);
  const pendingAuthRef = useRef(false);

  // Reload WebView when user returns from Chrome Custom Tab after OAuth
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && pendingAuthRef.current) {
        pendingAuthRef.current = false;
        webViewRef.current?.reload();
      }
    });
    return () => subscription.remove();
  }, []);

  const injectedAfterLoad =
    INJECTED_JS_AFTER_LOAD + (dark ? '\n' + DARK_MODE_CSS_INJECTION : '');

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'SESSION_STATE':
            if (data.waitingForInput) {
              const now = Date.now();
              const isForeground = AppState.currentState === 'active';
              if (!isForeground && now - lastNotifyRef.current > NOTIFICATION_COOLDOWN_MS) {
                lastNotifyRef.current = now;
                notifySessionEvent(
                  'Session needs input',
                  'Your Claude Code session is waiting for a response.',
                  url
                );
              }
            }
            break;

          case 'SESSION_LIST':
            if (Array.isArray(data.sessions)) {
              mergeSessions(data.sessions);
            }
            break;

          case 'AUTH_STATE':
            // Could be used to show a login indicator
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    },
    [url]
  );

  const getHostname = (rawUrl: string): string | null => {
    try {
      return new URL(rawUrl).hostname;
    } catch {
      return null;
    }
  };

  const handleShouldStartLoad = useCallback(
    (request: { url: string }) => {
      const { url: reqUrl } = request;
      if (reqUrl.startsWith('about:')) return true;

      const hostname = getHostname(reqUrl);
      if (!hostname) return false;

      // Google blocks OAuth in embedded WebViews — open in Chrome Custom Tab
      if (isGoogleAuthHost(hostname)) {
        pendingAuthRef.current = true;
        WebBrowser.openBrowserAsync(reqUrl, {
          dismissButtonStyle: 'close',
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        });
        return false;
      }
      // Allow Claude/Anthropic domains, block everything else
      if (isAllowedHost(hostname)) {
        return true;
      }
      RNLinking.openURL(reqUrl);
      return false;
    },
    []
  );

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const navUrl = navState.url || '';
      if (!navUrl || navUrl.startsWith('about:')) return;

      const hostname = getHostname(navUrl);
      if (hostname && !isAllowedHost(hostname)) {
        webViewRef.current?.stopLoading();
        RNLinking.openURL(navUrl);
      }
    },
    []
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorIcon]}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Failed to load</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} />
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsBackForwardNavigationGestures={true}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JS_BEFORE_LOAD}
        injectedJavaScript={injectedAfterLoad}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(e) => setError(e.nativeEvent.description || 'An error occurred')}
        onHttpError={(e) => {
          if (e.nativeEvent.statusCode >= 400) {
            setError(`HTTP ${e.nativeEvent.statusCode}`);
          }
        }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        userAgent={`${DEFAULT_USER_AGENT} ClaudeCodeRemoteControl/1.0`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
