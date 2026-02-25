import { useState, useEffect, useCallback } from 'react';
import {
  getSessions,
  addSession as addSessionToStorage,
  removeSession as removeSessionFromStorage,
  clearSessions as clearAllSessions,
  mergeSessions as mergeSessionsToStorage,
  type Session,
} from '../lib/storage';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSession = useCallback(async (session: Session) => {
    const updated = await addSessionToStorage(session);
    setSessions(updated);
    return updated;
  }, []);

  const removeSession = useCallback(async (url: string) => {
    const updated = await removeSessionFromStorage(url);
    setSessions(updated);
    return updated;
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllSessions();
    setSessions([]);
  }, []);

  const mergeSessions = useCallback(
    async (discovered: Array<{ url: string; label?: string; active?: boolean }>) => {
      const updated = await mergeSessionsToStorage(discovered);
      setSessions(updated);
      return updated;
    },
    []
  );

  return {
    sessions,
    loading,
    refresh,
    addSession,
    removeSession,
    clearAll,
    mergeSessions,
  };
}
