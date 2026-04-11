import type {
  WardrobeCategory,
  WardrobeDetectionMode,
  WardrobeDetectionState,
  WardrobeItem,
  WardrobeSource,
  WardrobeStatus,
} from '../data/wearData';

export type DetectedWardrobeDraft = {
  name: string;
  category: WardrobeCategory;
  color: string;
  fit: string;
  material: string;
  tags: string[];
  styleNote: string;
  confidence: number;
  note: string;
  mode: Extract<WardrobeDetectionMode, 'mock' | 'openai'>;
};

const colorPairs: Record<string, string> = {
  black: 'from-[#d7d8de] via-[#fffaf4] to-[#eaecf4]',
  ink: 'from-[#d7d8de] via-[#fffaf4] to-[#eaecf4]',
  graphite: 'from-[#d9dde7] via-[#fffaf4] to-[#ecefff]',
  charcoal: 'from-[#dde0e7] via-[#fffaf4] to-[#edf0ff]',
  white: 'from-[#f1f3f6] via-[#fffaf4] to-[#edf4df]',
  ivory: 'from-[#f2ece4] via-[#fffaf4] to-[#f0f5df]',
  cream: 'from-[#f4eee5] via-[#fffaf4] to-[#eef4df]',
  stone: 'from-[#ece2d8] via-[#fffaf4] to-[#eef4df]',
  sand: 'from-[#eadfce] via-[#fffaf4] to-[#ecefff]',
  bone: 'from-[#ebe1d7] via-[#fffaf4] to-[#edf0ff]',
  indigo: 'from-[#dbe2ee] via-[#fffaf4] to-[#e9f0dc]',
  blue: 'from-[#d9e3f2] via-[#fffaf4] to-[#edf0ff]',
  brown: 'from-[#dfd4cc] via-[#fffaf4] to-[#f0efff]',
  espresso: 'from-[#ddd2cb] via-[#fffaf4] to-[#efefff]',
  silver: 'from-[#e0e5ef] via-[#fffaf4] to-[#f2eaff]',
  olive: 'from-[#e3e5d5] via-[#fffaf4] to-[#eef2df]',
};

function slug(value: string) {
  return value.trim().toLowerCase();
}

function paletteFromColor(color: string) {
  return colorPairs[slug(color)] ?? 'from-[#e8e2d8] via-[#fffaf4] to-[#ecefff]';
}

function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

export function buildWardrobeItem({
  id,
  imageDataUrl,
  detection,
  source,
  existingItem,
}: {
  id: string;
  imageDataUrl: string;
  detection: DetectedWardrobeDraft;
  source: WardrobeSource;
  existingItem?: WardrobeItem | null;
}) {
  const status: WardrobeStatus =
    existingItem?.status ??
    ({
      Outerwear: 'Core',
      Tops: 'Repeat',
      Bottoms: 'Repeat',
      Shoes: 'Core',
      Accessories: 'Occasion',
    }[detection.category] as WardrobeStatus);

  const state: WardrobeDetectionState = detection.mode === 'openai' ? 'reviewed' : 'auto-detected';

  return {
    id,
    name: detection.name,
    category: detection.category,
    fit: detection.fit,
    material: detection.material,
    color: detection.color,
    tags: normalizeTags(detection.tags),
    palette: existingItem?.palette ?? paletteFromColor(detection.color),
    status,
    imageDataUrl,
    source,
    styleNote: detection.styleNote,
    detection: {
      state,
      mode: detection.mode,
      confidence: detection.confidence,
      note: detection.note,
    },
  } satisfies WardrobeItem;
}

export function stringifyTags(tags: string[]) {
  return tags.join(', ');
}

export function parseTags(raw: string) {
  return normalizeTags(raw.split(','));
}
