import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

export interface Session {
  url: string;
  label?: string;
  addedAt: number;
}

// Simple write queue to prevent concurrent read-modify-write races
let writeQueue: Promise<void> = Promise.resolve();

function serialized<T>(fn: () => Promise<T>): Promise<T> {
  const task = writeQueue.then(fn, fn);
  writeQueue = task.then(() => {}, () => {});
  return task;
}

export async function getSessions(): Promise<Session[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

export function addSession(session: Session): Promise<Session[]> {
  return serialized(async () => {
    const sessions = await getSessions();
    const exists = sessions.some((s) => s.url === session.url);
    if (exists) {
      const updated = sessions.map((s) =>
        s.url === session.url ? { ...s, ...session } : s
      );
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
      return updated;
    }
    const updated = [session, ...sessions];
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    return updated;
  });
}

export function removeSession(url: string): Promise<Session[]> {
  return serialized(async () => {
    const sessions = await getSessions();
    const updated = sessions.filter((s) => s.url !== url);
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    return updated;
  });
}

export async function clearSessions(): Promise<void> {
  return serialized(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
  });
}

export function mergeSessions(
  discovered: Array<{ url: string; label?: string; active?: boolean }>
): Promise<Session[]> {
  return serialized(async () => {
    const existing = await getSessions();
    const existingUrls = new Set(existing.map((s) => s.url));
    const newSessions: Session[] = discovered
      .filter((d) => d.url && !existingUrls.has(d.url))
      .map((d) => ({
        url: d.url,
        label: d.label,
        addedAt: Date.now(),
      }));
    if (newSessions.length === 0) return existing;
    const merged = [...newSessions, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(merged));
    return merged;
  });
}
