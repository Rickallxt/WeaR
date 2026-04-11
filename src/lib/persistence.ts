import type { UserProfile, WardrobeItem } from '../data/wearData';

const KEYS = {
  onboarded: 'wear:onboarded',
  profile: 'wear:profile',
  wardrobe: 'wear:wardrobe',
} as const;

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
