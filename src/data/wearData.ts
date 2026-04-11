import { createFashionMockImage } from '../lib/wardrobeVisuals';

export type ScreenKey =
  | 'dashboard'
  | 'wardrobe'
  | 'generate'
  | 'studio'
  | 'profile'
  | 'saved'
  | 'settings';

export type WardrobeCategory = 'Tops' | 'Bottoms' | 'Shoes' | 'Outerwear' | 'Accessories';
export type WardrobeStatus = 'Core' | 'Occasion' | 'Repeat';
export type WardrobeSource = 'seed' | 'example' | 'upload';
export type WardrobeDetectionState = 'curated' | 'auto-detected' | 'reviewed' | 'error';
export type WardrobeDetectionMode = 'curated' | 'mock' | 'openai' | 'manual';

export type NavItem = {
  key: ScreenKey;
  label: string;
  caption: string;
  icon: 'grid' | 'hanger' | 'spark' | 'profile' | 'bookmark' | 'settings';
};

export type UserProfile = {
  name: string;
  path: 'Women' | 'Men' | 'Style-neutral';
  height: string;
  weight: string;
  shoulderLine: string;
  legLine: string;
  fitPreference: 'Slim' | 'Regular' | 'Oversized' | 'Mixed';
  stylePreferences: string[];
  occasions: string[];
  confidenceGoal: string;
};

export type WardrobeItem = {
  id: string;
  name: string;
  category: WardrobeCategory;
  fit: string;
  material: string;
  color: string;
  tags: string[];
  palette: string;
  status: WardrobeStatus;
  imageDataUrl?: string | null;
  source?: WardrobeSource;
  styleNote?: string;
  detection?: {
    state: WardrobeDetectionState;
    mode: WardrobeDetectionMode;
    confidence: number;
    note: string;
  };
};

export type OutfitSuggestion = {
  id: string;
  title: string;
  vibe: string;
  pieces: string[];
  note: string;
  silhouette: string;
  palette: string;
};

export type SavedCollection = {
  title: string;
  count: number;
  vibe: string;
  palette: string;
  pins: string[];
};

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Home', caption: 'Today, saved, insights', icon: 'grid' },
  { key: 'wardrobe', label: 'Wardrobe', caption: 'Closet builder', icon: 'hanger' },
  { key: 'generate', label: 'Generate', caption: 'Upload and compose', icon: 'spark' },
  { key: 'studio', label: 'Outfit studio', caption: 'Own-clothes styling', icon: 'spark' },
  { key: 'profile', label: 'Style profile', caption: 'Fit intelligence', icon: 'profile' },
  { key: 'saved', label: 'Saved looks', caption: 'Collections and pins', icon: 'bookmark' },
  { key: 'settings', label: 'Settings', caption: 'Profile and preferences', icon: 'settings' },
];

export const baseProfile: UserProfile = {
  name: 'Avery',
  path: 'Style-neutral',
  height: '173',
  weight: '68',
  shoulderLine: 'Balanced shoulder',
  legLine: 'Longer leg line',
  fitPreference: 'Mixed',
  stylePreferences: ['Clean minimal', 'Luxury', 'Streetwear'],
  occasions: ['Work', 'Dinner', 'Weekend city'],
  confidenceGoal: 'Look more intentional without buying more.',
};

export const wardrobeItems: WardrobeItem[] = [
  {
    id: 'w1',
    name: 'Bone cropped bomber',
    category: 'Outerwear',
    fit: 'Structured relaxed',
    material: 'Technical cotton',
    color: 'Bone',
    tags: ['Evening', 'Layering hero', 'Sharp shoulder'],
    palette: 'from-[#ebe2d8] via-[#fffaf4] to-[#dbe2ff]',
    status: 'Core',
    imageDataUrl: createFashionMockImage({
      label: 'Bone cropped bomber',
      kind: 'bomber',
      backdrop: ['#f7f0e8', '#eef1ff'],
      garment: '#d8ccbf',
      accent: '#f8f5ef',
      hardware: '#6c738d',
    }),
    source: 'seed',
    styleNote: 'Structured cropped outer layer with a clean shoulder line.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
  {
    id: 'w2',
    name: 'Black column trouser',
    category: 'Bottoms',
    fit: 'Long straight',
    material: 'Wool blend',
    color: 'Ink black',
    tags: ['Lengthening', 'Work', 'Dinner'],
    palette: 'from-[#d7d8de] via-[#f7f5f1] to-[#e8ecf7]',
    status: 'Repeat',
    imageDataUrl: createFashionMockImage({
      label: 'Black column trouser',
      kind: 'trouser',
      backdrop: ['#f5f2ee', '#ecefff'],
      garment: '#26272e',
      accent: '#3f4454',
      hardware: '#8d94a8',
    }),
    source: 'seed',
    styleNote: 'Long straight trouser with a quiet vertical line.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
  {
    id: 'w3',
    name: 'Soft knit tank',
    category: 'Tops',
    fit: 'Close clean',
    material: 'Fine knit',
    color: 'Stone',
    tags: ['Base layer', 'Warm weather', 'Quiet'],
    palette: 'from-[#efe7de] via-[#fffaf6] to-[#eef6dc]',
    status: 'Repeat',
    imageDataUrl: createFashionMockImage({
      label: 'Soft knit tank',
      kind: 'tank',
      backdrop: ['#f7efe8', '#eef5df'],
      garment: '#d2c6ba',
      accent: '#f8f3ec',
      hardware: '#8e938d',
    }),
    source: 'seed',
    styleNote: 'Close clean tank for quiet base-layer balance.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
  {
    id: 'w4',
    name: 'Silver low sneaker',
    category: 'Shoes',
    fit: 'Low profile',
    material: 'Leather',
    color: 'Silver',
    tags: ['Weekend', 'Night', 'Modern'],
    palette: 'from-[#dfe3ef] via-[#fbf8f4] to-[#f4ebff]',
    status: 'Core',
    imageDataUrl: createFashionMockImage({
      label: 'Silver low sneaker',
      kind: 'sneaker',
      backdrop: ['#f3f2f0', '#f2ecff'],
      garment: '#d7dce3',
      accent: '#ffffff',
      hardware: '#8f95a8',
    }),
    source: 'seed',
    styleNote: 'Low-profile metallic sneaker for a modern finish.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
  {
    id: 'w5',
    name: 'Dark rinse wide jean',
    category: 'Bottoms',
    fit: 'Wide leg',
    material: 'Denim',
    color: 'Deep indigo',
    tags: ['Casual', 'Volume', 'Travel'],
    palette: 'from-[#d8deec] via-[#faf7f2] to-[#e8f1d8]',
    status: 'Repeat',
    imageDataUrl: createFashionMockImage({
      label: 'Dark rinse wide jean',
      kind: 'jean',
      backdrop: ['#edf2fb', '#f0f4de'],
      garment: '#33405b',
      accent: '#60708c',
      hardware: '#d9dded',
    }),
    source: 'seed',
    styleNote: 'Wide-leg denim that adds volume without losing polish.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
  {
    id: 'w6',
    name: 'Light trench layer',
    category: 'Outerwear',
    fit: 'Long fluid',
    material: 'Cotton blend',
    color: 'Sand',
    tags: ['Travel', 'Transitional', 'Long line'],
    palette: 'from-[#e8ddcf] via-[#fffaf3] to-[#e5e9ff]',
    status: 'Occasion',
    imageDataUrl: createFashionMockImage({
      label: 'Light trench layer',
      kind: 'trench',
      backdrop: ['#f7efe7', '#eef0ff'],
      garment: '#d5c4ae',
      accent: '#ebe1d4',
      hardware: '#70614f',
    }),
    source: 'seed',
    styleNote: 'Fluid trench built for travel and transitional layering.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
  {
    id: 'w7',
    name: 'Clean white shirt',
    category: 'Tops',
    fit: 'Regular crisp',
    material: 'Poplin',
    color: 'White',
    tags: ['Work', 'Dinner', 'Polish'],
    palette: 'from-[#f2f3f6] via-[#ffffff] to-[#e9f2d9]',
    status: 'Core',
    imageDataUrl: createFashionMockImage({
      label: 'Clean white shirt',
      kind: 'shirt',
      backdrop: ['#f6f6f6', '#eef5df'],
      garment: '#f4f5f6',
      accent: '#ffffff',
      hardware: '#9095a1',
    }),
    source: 'seed',
    styleNote: 'Crisp poplin shirt for polished work and dinner looks.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
  {
    id: 'w8',
    name: 'Soft leather belt bag',
    category: 'Accessories',
    fit: 'Compact',
    material: 'Leather',
    color: 'Espresso',
    tags: ['Travel', 'Finish', 'Hands-free'],
    palette: 'from-[#d8cec4] via-[#f8f4ef] to-[#ecebff]',
    status: 'Occasion',
    imageDataUrl: createFashionMockImage({
      label: 'Soft leather belt bag',
      kind: 'bag',
      backdrop: ['#f2ebe4', '#efefff'],
      garment: '#5b4036',
      accent: '#8a6658',
      hardware: '#c7b18b',
    }),
    source: 'seed',
    styleNote: 'Compact accessory for hands-free travel and sharp finishing.',
    detection: {
      state: 'curated',
      mode: 'curated',
      confidence: 0.99,
      note: 'Curated WeaR demo item used to make the desktop prototype feel fully dressed.',
    },
  },
];

export const todayOutfit: OutfitSuggestion = {
  id: 'o1',
  title: 'City dinner polish',
  vibe: 'Sharper, low effort, wardrobe-only',
  pieces: ['Bone cropped bomber', 'Soft knit tank', 'Black column trouser', 'Silver low sneaker'],
  note: 'The cropped layer keeps the upper half crisp while the longer trouser extends the line through the leg.',
  silhouette: 'Shorter top block + longer clean leg = balanced proportion on your frame.',
  palette: 'from-[#dfe4ff] via-[#faf6f1] to-[#ebf5d8]',
};

export const alternateOutfits: OutfitSuggestion[] = [
  {
    id: 'o2',
    title: 'Creative studio day',
    vibe: 'Relaxed tailoring',
    pieces: ['Clean white shirt', 'Dark rinse wide jean', 'Light trench layer'],
    note: 'More volume through the leg stays clean because the upper half is quiet and crisp.',
    silhouette: 'Long outer layer sharpens a softer wide-leg base.',
    palette: 'from-[#e6e4ff] via-[#fffaf2] to-[#e8f2dd]',
  },
  {
    id: 'o3',
    title: 'Weekend city move',
    vibe: 'Easy but intentional',
    pieces: ['Soft knit tank', 'Dark rinse wide jean', 'Silver low sneaker', 'Soft leather belt bag'],
    note: 'A quiet base with one metallic lift keeps the outfit modern without looking overbuilt.',
    silhouette: 'Open top line + wider leg reads relaxed but still clean.',
    palette: 'from-[#dae4f3] via-[#fbf8f2] to-[#eef1ff]',
  },
  {
    id: 'o4',
    title: 'Late gallery stop',
    vibe: 'Quiet luxury',
    pieces: ['Clean white shirt', 'Black column trouser', 'Bone cropped bomber'],
    note: 'The contrast stays minimal while the structure does the work.',
    silhouette: 'Shoulder structure holds shape without extra bulk.',
    palette: 'from-[#ece2d8] via-[#fffaf4] to-[#dfe6ff]',
  },
];

export const savedCollections: SavedCollection[] = [
  {
    title: 'After dark',
    count: 12,
    vibe: 'Quiet sharpness',
    palette: 'from-[#d9ddff] via-[#faf6f2] to-[#ecefd9]',
    pins: ['Silver low sneaker', 'Black column trouser', 'Bone cropped bomber'],
  },
  {
    title: 'Studio week',
    count: 9,
    vibe: 'Clean relaxed',
    palette: 'from-[#e1e7f1] via-[#fbf8f4] to-[#e9efd9]',
    pins: ['Light trench layer', 'Dark rinse wide jean', 'Clean white shirt'],
  },
  {
    title: 'Travel smart',
    count: 7,
    vibe: 'Layered utility',
    palette: 'from-[#ece5db] via-[#fffaf4] to-[#e2e8ff]',
    pins: ['Soft leather belt bag', 'Soft knit tank', 'Light trench layer'],
  },
];

export const styleLogic = [
  'Longer legs read strongest when the outfit stays clean through the ankle and avoids heavy visual breaks.',
  'Structure at the shoulder gives shape faster than adding more accessories or louder product.',
  'Mixed fit works best for you when one piece stays close and one piece carries the volume.',
];

export const colorTendencies = [
  { name: 'Bone', hex: '#e8ded3' },
  { name: 'Ink', hex: '#23242b' },
  { name: 'Silver', hex: '#cdd2dd' },
  { name: 'Soft lime', hex: '#d7e995' },
  { name: 'Periwinkle', hex: '#b8bdfd' },
];

export const quickRefinements = [
  'Swap top',
  'Swap shoes',
  'Make it sharper',
  'Make it more casual',
  'Lean more minimal',
];

export const stats = [
  { label: 'Mapped pieces', value: '128', detail: '85% of wardrobe categorized' },
  { label: 'Ready-to-wear looks', value: '46', detail: 'Built from owned pieces only' },
  { label: 'Best repeat category', value: 'Outerwear', detail: 'High polish, low effort' },
  { label: 'Saved combinations', value: '21', detail: 'Pinned by mood and occasion' },
];

export const onboardingStyleOptions = [
  'Streetwear',
  'Clean minimal',
  'Classic',
  'Edgy',
  'Luxury',
  'Casual',
  'Creative',
];

export const onboardingOccasions = [
  'Work',
  'Dinner',
  'Weekend city',
  'Travel',
  'Events',
  'Date night',
];

export const fitModes: Array<UserProfile['fitPreference']> = ['Slim', 'Regular', 'Oversized', 'Mixed'];
