import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../lib/constants';

export function useGoogleAuthMode() {
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.GOOGLE_AUTH_MODE).then((val) => {
      setEnabled(val === 'true');
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_AUTH_MODE, String(next));
  }, [enabled]);

  return { googleAuthMode: enabled, toggleGoogleAuthMode: toggle, loaded };
}
