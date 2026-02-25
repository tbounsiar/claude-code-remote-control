import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import { router } from 'expo-router';
import { setupNotifications } from '../lib/notifications';

export function useNotifications() {
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    setupNotifications().catch(() => {});

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const sessionUrl = response.notification.request.content.data?.sessionUrl;
        if (sessionUrl && typeof sessionUrl === 'string') {
          router.push(`/session/${encodeURIComponent(sessionUrl)}`);
        }
      });

    return () => {
      responseListener.current?.remove();
    };
  }, []);
}
