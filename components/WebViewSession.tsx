import React, { useRef, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState, Linking as RNLinking, Platform, ScrollView } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import { useTheme } from '../hooks/useTheme';
import { notifySessionEvent } from '../lib/notifications';
import { mergeSessions } from '../lib/storage';
import {
  INJECTED_JS_BEFORE_LOAD,
  INJECTED_JS_AFTER_LOAD,
  DARK_MODE_CSS_INJECTION,
} from '../lib/injectedJS';
import { isAllowedHost } from '../lib/constants';
import { LoadingOverlay } from './LoadingOverlay';

const DEBUG = true; // Toggle debug overlay

const DEFAULT_USER_AGENT = Platform.select({
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36',
  ios:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  default:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.200 Mobile Safari/537.36',
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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addLog = useCallback((msg: string) => {
    if (!DEBUG) return;
    const ts = new Date().toLocaleTimeString('fr-FR', { hour12: false });
    setDebugLogs((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 30));
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
      if (!hostname) {
        addLog(`BLOCK (no host): ${reqUrl.substring(0, 80)}`);
        return false;
      }

      if (isAllowedHost(hostname)) {
        addLog(`ALLOW: ${hostname} ${reqUrl.substring(0, 60)}`);
        return true;
      }

      addLog(`EXTERNAL: ${hostname}`);
      RNLinking.openURL(reqUrl);
      return false;
    },
    [addLog]
  );

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const navUrl = navState.url || '';
      if (!navUrl || navUrl.startsWith('about:')) return;

      addLog(`NAV: ${navUrl.substring(0, 80)}`);

      const hostname = getHostname(navUrl);
      if (!hostname || isAllowedHost(hostname)) return;

      addLog(`NAV-BLOCK: ${hostname}`);
      webViewRef.current?.stopLoading();
      RNLinking.openURL(navUrl);
    },
    [addLog]
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

      {DEBUG && (
        <TouchableOpacity
          style={styles.debugToggle}
          onPress={() => setShowDebug(!showDebug)}
        >
          <Text style={styles.debugToggleText}>{showDebug ? 'Hide Log' : 'Log'}</Text>
        </TouchableOpacity>
      )}

      {DEBUG && showDebug && (
        <View style={styles.debugOverlay}>
          <ScrollView style={styles.debugScroll}>
            {debugLogs.map((log, i) => (
              <Text key={i} style={styles.debugText}>{log}</Text>
            ))}
            {debugLogs.length === 0 && (
              <Text style={styles.debugText}>No logs yet - navigate to see URLs</Text>
            )}
          </ScrollView>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        webviewDebuggingEnabled={true}
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
        onLoadStart={() => { setLoading(true); addLog('LOAD START'); }}
        onLoadEnd={() => { setLoading(false); addLog('LOAD END'); }}
        onError={(e) => {
          const desc = e.nativeEvent.description || 'Unknown error';
          addLog(`ERROR: ${desc}`);
          setError(desc);
        }}
        onHttpError={(e) => {
          addLog(`HTTP ${e.nativeEvent.statusCode}: ${e.nativeEvent.url?.substring(0, 60)}`);
          if (e.nativeEvent.statusCode >= 400) {
            setError(`HTTP ${e.nativeEvent.statusCode}`);
          }
        }}
        setSupportMultipleWindows={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        userAgent={DEFAULT_USER_AGENT}
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
  debugToggle: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  debugToggleText: {
    color: '#0f0',
    fontSize: 11,
    fontWeight: '700',
  },
  debugOverlay: {
    position: 'absolute',
    top: 32,
    left: 4,
    right: 4,
    maxHeight: 200,
    zIndex: 998,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 8,
    padding: 6,
  },
  debugScroll: {
    flex: 1,
  },
  debugText: {
    color: '#0f0',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 14,
  },
});
