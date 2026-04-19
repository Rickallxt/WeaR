export type AchievementId =
  | 'first-piece'
  | 'style-curious'
  | 'closet-builder'
  | 'photo-ready'
  | 'fully-mapped'
  | 'first-look'
  | 'repeat-wearer'
  | 'style-director';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  check: (stats: WardrobeStats) => boolean;
}

export interface WardrobeStats {
  totalPieces: number;
  piecesWithPhotos: number;
  generationCount: number;
  repeatCount: number;
}

const STORAGE_KEY = 'wear:achievements';

export const achievements: Achievement[] = [
  {
    id: 'first-piece',
    title: 'First Piece',
    description: 'Added your first wardrobe item.',
    icon: '👕',
    check: (s) => s.totalPieces >= 1,
  },
  {
    id: 'style-curious',
    title: 'Style Curious',
    description: 'Mapped 5 wardrobe pieces.',
    icon: '🎨',
    check: (s) => s.totalPieces >= 5,
  },
  {
    id: 'closet-builder',
    title: 'Closet Builder',
    description: 'Mapped 20 wardrobe pieces.',
    icon: '🏗️',
    check: (s) => s.totalPieces >= 20,
  },
  {
    id: 'photo-ready',
    title: 'Photo Ready',
    description: 'Added photos to half your wardrobe.',
    icon: '📸',
    check: (s) => s.totalPieces > 0 && s.piecesWithPhotos / s.totalPieces >= 0.5,
  },
  {
    id: 'fully-mapped',
    title: 'Fully Mapped',
    description: 'Every piece has a photo — wardrobe complete.',
    icon: '✨',
    check: (s) => s.totalPieces >= 5 && s.piecesWithPhotos === s.totalPieces,
  },
  {
    id: 'first-look',
    title: 'First Look',
    description: 'Generated your first outfit.',
    icon: '🪞',
    check: (s) => s.generationCount >= 1,
  },
  {
    id: 'repeat-wearer',
    title: 'Repeat Wearer',
    description: 'Added 3 repeat-worthy anchor pieces.',
    icon: '🔄',
    check: (s) => s.repeatCount >= 3,
  },
  {
    id: 'style-director',
    title: 'Style Director',
    description: 'Mapped 50 wardrobe pieces.',
    icon: '🎬',
    check: (s) => s.totalPieces >= 50,
  },
];

export function loadUnlockedAchievements(): Set<AchievementId> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as AchievementId[]);
  } catch { /* ignore — localStorage may not be available */ }
  return new Set();
}

export function saveUnlockedAchievements(unlocked: Set<AchievementId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch { /* ignore — localStorage may not be available */ }
}

/** Returns newly unlocked achievements (ones not already in `unlocked`). */
export function checkNewAchievements(
  stats: WardrobeStats,
  unlocked: Set<AchievementId>,
): Achievement[] {
  return achievements.filter((a) => !unlocked.has(a.id) && a.check(stats));
}
