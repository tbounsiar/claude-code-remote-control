import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Linking as RNLinking } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import { useTheme } from '../hooks/useTheme';
import { notifySessionEvent } from '../lib/notifications';
import { mergeSessions } from '../lib/storage';
import {
  INJECTED_JS_BEFORE_LOAD,
  INJECTED_JS_AFTER_LOAD,
  DARK_MODE_CSS_INJECTION,
} from '../lib/injectedJS';
import { CLAUDE_DOMAIN, ANTHROPIC_DOMAIN } from '../lib/constants';
import { LoadingOverlay } from './LoadingOverlay';

interface Props {
  url: string;
}

export function WebViewSession({ url }: Props) {
  const { dark } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const injectedAfterLoad =
    INJECTED_JS_AFTER_LOAD + (dark ? '\n' + DARK_MODE_CSS_INJECTION : '');

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'SESSION_STATE':
            if (data.waitingForInput) {
              notifySessionEvent(
                'Session needs input',
                'Your Claude Code session is waiting for a response.',
                url
              );
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

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const navUrl = navState.url || '';
      if (
        navUrl &&
        !navUrl.includes(CLAUDE_DOMAIN) &&
        !navUrl.includes(ANTHROPIC_DOMAIN) &&
        !navUrl.startsWith('about:')
      ) {
        webViewRef.current?.stopLoading();
        RNLinking.openURL(navUrl);
      }
    },
    []
  );

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
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        userAgent="ClaudeCodeRemoteControl/1.0"
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
});
