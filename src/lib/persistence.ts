import type { SavedCollection, UserProfile, WardrobeItem } from '../data/wearData';

const KEYS = {
  onboarded: 'wear:onboarded',
  profile: 'wear:profile',
  wardrobe: 'wear:wardrobe',
  collections: 'wear:collections',
  eventSession: 'wear:event-session',
} as const;

export type EventSession = {
  messages: { role: string; content: string; mode?: string }[];
  eventSummary: string;
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable (e.g. private browsing quota)
    // Fail silently — the app degrades gracefully without persistence
  }
}

export function loadOnboarded(): boolean {
  return readJson<boolean>(KEYS.onboarded) ?? false;
}

export function saveOnboarded(value: boolean): void {
  writeJson(KEYS.onboarded, value);
}

export function loadProfile(): UserProfile | null {
  return readJson<UserProfile>(KEYS.profile);
}

export function saveProfile(profile: UserProfile): void {
  writeJson(KEYS.profile, profile);
}

export function loadWardrobe(): WardrobeItem[] | null {
  return readJson<WardrobeItem[]>(KEYS.wardrobe);
}

export function saveWardrobe(wardrobe: WardrobeItem[]): void {
  writeJson(KEYS.wardrobe, wardrobe);
}

export function loadCollections(): SavedCollection[] | null {
  return readJson<SavedCollection[]>(KEYS.collections);
}

export function saveCollections(collections: SavedCollection[]): void {
  writeJson(KEYS.collections, collections);
}

export function loadEventSession(): EventSession | null {
  return readJson<EventSession>(KEYS.eventSession);
}

export function saveEventSession(session: EventSession): void {
  writeJson(KEYS.eventSession, session);
}

export function clearEventSession(): void {
  try {
    localStorage.removeItem(KEYS.eventSession);
  } catch {
    // ignore
  }
}

export function readLegacySnapshot() {
  return {
    onboarded: loadOnboarded(),
    profile: loadProfile(),
    wardrobe: loadWardrobe(),
    collections: loadCollections(),
    eventSession: loadEventSession(),
  };
}

export function hasLegacySnapshot() {
  const snapshot = readLegacySnapshot();
  return Boolean(
    snapshot.profile ||
      (snapshot.wardrobe && snapshot.wardrobe.length > 0) ||
      (snapshot.collections && snapshot.collections.length > 0) ||
      (snapshot.eventSession && snapshot.eventSession.messages.length > 0) ||
      snapshot.onboarded,
  );
}

export function clearLegacySnapshot(): void {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}
