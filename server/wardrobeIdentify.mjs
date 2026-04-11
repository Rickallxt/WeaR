const categoryKeywords = [
  { match: /\b(bomber|jacket|coat|trench|blazer|hoodie|parka)\b/i, value: 'Outerwear' },
  { match: /\b(trouser|pants|pant|jean|denim|skirt|short)\b/i, value: 'Bottoms' },
  { match: /\b(sneaker|shoe|loafer|boot|heel|runner|trainer)\b/i, value: 'Shoes' },
  { match: /\b(bag|belt|cap|hat|scarf|jewel|necklace|watch|glove)\b/i, value: 'Accessories' },
];

const colorKeywords = [
  'Black',
  'White',
  'Ivory',
  'Cream',
  'Stone',
  'Sand',
  'Bone',
  'Graphite',
  'Charcoal',
  'Grey',
  'Navy',
  'Indigo',
  'Blue',
  'Brown',
  'Espresso',
  'Silver',
  'Olive',
  'Khaki',
  'Burgundy',
];

const materialKeywords = [
  { match: /\bdenim|jean\b/i, value: 'Denim' },
  { match: /\bleather|suede\b/i, value: 'Leather' },
  { match: /\bknit|rib\b/i, value: 'Knit' },
  { match: /\bpoplin|cotton\b/i, value: 'Cotton' },
  { match: /\bwool|twill\b/i, value: 'Wool blend' },
  { match: /\bnylon|technical|gabardine\b/i, value: 'Technical fabric' },
];

const fitKeywords = [
  { match: /\boversized|boxy|slouchy\b/i, value: 'Oversized' },
  { match: /\bslim|close|skinny\b/i, value: 'Slim' },
  { match: /\bwide|relaxed|fluid\b/i, value: 'Relaxed' },
  { match: /\bcropped\b/i, value: 'Cropped' },
];

function titleCase(value) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function detectCategory(text) {
  const match = categoryKeywords.find((entry) => entry.match.test(text));
  return match?.value ?? 'Tops';
}

function detectColor(text, fallbackCategory) {
  const color = colorKeywords.find((entry) => new RegExp(`\\b${entry}\\b`, 'i').test(text));

  if (color) {
    return color;
  }

  return {
    Tops: 'Stone',
    Bottoms: 'Charcoal',
    Shoes: 'Ink',
    Outerwear: 'Sand',
    Accessories: 'Espresso',
  }[fallbackCategory];
}

function detectMaterial(text, category) {
  const material = materialKeywords.find((entry) => entry.match.test(text));

  if (material) {
    return material.value;
  }

  return {
    Tops: 'Cotton blend',
    Bottoms: 'Wool blend',
    Shoes: 'Leather',
    Outerwear: 'Technical fabric',
    Accessories: 'Smooth leather',
  }[category];
}

function detectFit(text, category) {
  const fit = fitKeywords.find((entry) => entry.match.test(text));

  if (fit) {
    return fit.value;
  }

  return {
    Tops: 'Regular clean',
    Bottoms: 'Long straight',
    Shoes: 'Low profile',
    Outerwear: 'Structured relaxed',
    Accessories: 'Compact',
  }[category];
}

function descriptorForCategory(category) {
  return {
    Tops: 'top',
    Bottoms: 'bottom',
    Shoes: 'shoe',
    Outerwear: 'layer',
    Accessories: 'accessory',
  }[category];
}

function articleFor(value) {
  return /^[aeiou]/i.test(value) ? 'an' : 'a';
}

export function buildFallbackIdentification({ fileName = '', existingItem }) {
  const hintText = [fileName, existingItem?.name, existingItem?.category, existingItem?.material, existingItem?.fit]
    .filter(Boolean)
    .join(' ');
  const category = existingItem?.category ?? detectCategory(hintText);
  const color = existingItem?.color ?? detectColor(hintText, category);
  const fit = existingItem?.fit ?? detectFit(hintText, category);
  const material = existingItem?.material ?? detectMaterial(hintText, category);
  const rawName = existingItem?.name || `${color} ${descriptorForCategory(category)}`;
  const name = titleCase(rawName);
  const tags = [
    category,
    color,
    fit,
    existingItem?.source === 'upload' ? 'Uploaded piece' : 'Auto-identified',
  ];

  return {
    name,
    category,
    color,
    fit,
    material,
    tags: Array.from(new Set(tags)),
    styleNote: `Detected as ${articleFor(descriptorForCategory(category))} ${descriptorForCategory(category)} with ${fit.toLowerCase()} proportions and ${articleFor(color)} ${color.toLowerCase()} finish.`,
    confidence: existingItem?.name ? 0.84 : 0.68,
    note: "Mock identification based on upload name and wardrobe context. You can review and refine it before saving.",
    mode: 'mock',
  };
}
