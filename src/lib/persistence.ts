import type { SavedCollection, SavedOutfit, UserProfile, WardrobeItem } from '../data/wearData';

const KEYS = {
  onboarded: 'wear:onboarded',
  profile: 'wear:profile',
  wardrobe: 'wear:wardrobe',
  collections: 'wear:collections',
  outfits: 'wear:outfits',
  eventSession: 'wear:event-session',
} as const;

const STALE_LAUNDRY_MS = 7 * 24 * 60 * 60 * 1000;

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

function normalizeNameKey(value: string): string {
  return value.trim().toLowerCase();
}

function parseTimestamp(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
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

export function migrateCollectionsToOutfits(
  collections: SavedCollection[] | null | undefined,
  wardrobe: WardrobeItem[] | null | undefined,
): SavedOutfit[] {
  if (!collections?.length) {
    return [];
  }

  const itemIdByName = new Map<string, string>();
  const coverByItemId = new Map<string, string>();

  for (const item of wardrobe ?? []) {
    const nameKey = normalizeNameKey(item.name);
    if (!nameKey || itemIdByName.has(nameKey)) {
      continue;
    }

    itemIdByName.set(nameKey, item.id);

    const cover = item.imageUrl ?? item.imageDataUrl ?? undefined;
    if (cover) {
      coverByItemId.set(item.id, cover);
    }
  }

  const migratedAt = new Date().toISOString();

  return collections.map((collection) => {
    const itemIds = Array.from(
      new Set(
        collection.pins
          .map((pin) => itemIdByName.get(normalizeNameKey(pin)))
          .filter((itemId): itemId is string => Boolean(itemId)),
      ),
    );

    const coverImageDataUrl = itemIds
      .map((itemId) => coverByItemId.get(itemId))
      .find((cover): cover is string => Boolean(cover));

    return {
      id: `outfit-${collection.id}`,
      name: collection.title,
      itemIds,
      createdAt: migratedAt,
      coverImageDataUrl,
      vibe: collection.vibe,
      timesWorn: 0,
    };
  });
}

export function loadOutfits(wardrobe: WardrobeItem[] | null = loadWardrobe()): SavedOutfit[] | null {
  const saved = readJson<SavedOutfit[]>(KEYS.outfits);
  if (saved) {
    return saved;
  }

  const migrated = migrateCollectionsToOutfits(loadCollections(), wardrobe);
  if (migrated.length === 0) {
    return null;
  }

  // Persisting the migrated value makes the legacy collection bridge one-shot,
  // so the next load reads the new shape directly instead of re-converting it.
  writeJson(KEYS.outfits, migrated);
  return migrated;
}

export function saveOutfits(outfits: SavedOutfit[]): void {
  writeJson(KEYS.outfits, outfits);
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

export function toggleLaundry(itemId: string, inLaundry: boolean): WardrobeItem[] {
  const wardrobe = loadWardrobe() ?? [];
  const toggledAt = new Date().toISOString();
  const nextWardrobe = wardrobe.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      inLaundry,
      // Preserve the original laundry timestamp so stale-item nudges measure
      // from the first time the item entered the laundry state.
      laundrySince: inLaundry ? item.laundrySince ?? toggledAt : undefined,
    };
  });

  saveWardrobe(nextWardrobe);
  return nextWardrobe;
}

export function pruneStaleLaundryItems(
  now: Date | string | number = new Date(),
  wardrobe: WardrobeItem[] | null = loadWardrobe(),
): string[] {
  const nowTimestamp =
    now instanceof Date
      ? now.getTime()
      : typeof now === 'number'
        ? now
        : Date.parse(now);

  if (!Number.isFinite(nowTimestamp) || !wardrobe?.length) {
    return [];
  }

  return wardrobe
    .filter((item) => item.inLaundry)
    .filter((item) => {
      const laundryTimestamp = parseTimestamp(item.laundrySince);
      return laundryTimestamp !== null && nowTimestamp - laundryTimestamp >= STALE_LAUNDRY_MS;
    })
    .map((item) => item.id);
}

export function readLegacySnapshot() {
  return {
    onboarded: loadOnboarded(),
    profile: loadProfile(),
    wardrobe: loadWardrobe(),
    collections: loadCollections(),
    outfits: readJson<SavedOutfit[]>(KEYS.outfits),
    eventSession: loadEventSession(),
  };
}

export function hasLegacySnapshot() {
  const snapshot = readLegacySnapshot();
  return Boolean(
    snapshot.profile ||
      (snapshot.wardrobe && snapshot.wardrobe.length > 0) ||
      (snapshot.collections && snapshot.collections.length > 0) ||
      (snapshot.outfits && snapshot.outfits.length > 0) ||
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
