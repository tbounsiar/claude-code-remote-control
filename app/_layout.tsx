import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { addSession } from '../lib/storage';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { dark, colors } = useTheme();
  useNotifications();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      let sessionUrl: string | null = null;

      if (url.startsWith('clauderemote://')) {
        // Custom scheme: clauderemote://session?url=<encoded>
        try {
          const parsed = Linking.parse(url);
          sessionUrl = parsed.queryParams?.url as string | null;
        } catch {
          // fallback
        }
      } else if (url.includes('claude.ai/code')) {
        sessionUrl = url;
      }

      if (sessionUrl) {
        await addSession({ url: sessionUrl, addedAt: Date.now() });
        router.push(`/session/${encodeURIComponent(sessionUrl)}`);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    // Handle initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="scanner"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="session/[url]" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
