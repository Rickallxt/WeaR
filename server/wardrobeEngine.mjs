function safeSelectedItems(selectedItems) {
  return Array.isArray(selectedItems) ? selectedItems : [];
}

export function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts = [];

  for (const output of payload?.output ?? []) {
    for (const content of output?.content ?? []) {
      if (content.type === 'output_text' && content.text) {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join('\n').trim();
}

export function extractImageResult(payload) {
  for (const output of payload?.output ?? []) {
    if (output.type === 'image_generation_call' && output.result) {
      return {
        imageBase64: output.result,
        revisedPrompt: output.revised_prompt ?? '',
      };
    }
  }

  return null;
}

export function parseJsonFromText(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    throw new Error('No JSON object found in model output.');
  }

  return JSON.parse(text.slice(start, end + 1));
}

export function optionCountForItems(itemCount) {
  if (itemCount <= 0) return 0;
  if (itemCount <= 2) return 1;
  if (itemCount <= 5) return 2;
  return 3;
}

export function buildFallbackOptions(selectedItems, eventSummary) {
  const normalizedItems = safeSelectedItems(selectedItems);
  const total = optionCountForItems(normalizedItems.length);

  return Array.from({ length: total }, (_, index) => {
    const rotated = normalizedItems
      .slice(index)
      .concat(normalizedItems.slice(0, index))
      .slice(0, Math.min(4, normalizedItems.length));

    return {
      id: `fallback-${index + 1}`,
      title: ['Event-ready edit', 'Sharper alternate', 'Relaxed fallback'][index] ?? `Option ${index + 1}`,
      vibe: ['Clean and polished', 'More dressed', 'More relaxed'][index] ?? 'Balanced',
      rationale:
        index === 0
          ? 'Builds the cleanest outfit from the selected wardrobe pieces and keeps the event context central.'
          : index === 1
            ? 'Creates a sharper alternate from the same wardrobe without introducing new shopping.'
            : 'Keeps the outfit easier and more relaxed while staying appropriate for the event.',
      itemIds: rotated.map((item) => item.id),
      eventFit: eventSummary || 'Aligned to the event context you provided.',
    };
  });
}

export function buildFallbackChat({ userMessage, selectedItems }) {
  const selectedNames = safeSelectedItems(selectedItems)
    .slice(0, 3)
    .map((item) => item.name)
    .join(', ');

  return {
    reply:
      `Got it. I'll treat this as the active event context and keep the styling relevant to it. ` +
      (selectedNames
        ? `I'll prioritize pieces like ${selectedNames}.`
        : "Upload or select wardrobe photos and I'll tighten the recommendation further."),
    summary: userMessage,
    mode: 'demo',
  };
}

function buildSlotMarkup(slot, item, fallbackPalette) {
  if (typeof item?.imageDataUrl === 'string' && item.imageDataUrl.startsWith('data:image')) {
    return `
      <g transform="translate(${slot.x} ${slot.y}) rotate(${slot.rotation} ${slot.width / 2} ${slot.height / 2})">
        <rect x="0" y="0" width="${slot.width}" height="${slot.height}" rx="28" fill="rgba(255,255,255,0.94)" />
        <image href="${item.imageDataUrl}" x="12" y="12" width="${slot.width - 24}" height="${slot.height - 24}" preserveAspectRatio="xMidYMid slice" />
      </g>
    `;
  }

  const label = item?.name ?? 'Wardrobe slot';

  return `
    <g transform="translate(${slot.x} ${slot.y}) rotate(${slot.rotation} ${slot.width / 2} ${slot.height / 2})">
      <rect x="0" y="0" width="${slot.width}" height="${slot.height}" rx="28" fill="rgba(255,255,255,0.94)" />
      <rect x="12" y="12" width="${slot.width - 24}" height="${slot.height - 24}" rx="22" fill="${fallbackPalette}" />
      <circle cx="${slot.width / 2}" cy="${slot.height * 0.33}" r="${Math.min(slot.width, slot.height) * 0.16}" fill="rgba(255,255,255,0.52)" />
      <rect x="${slot.width * 0.27}" y="${slot.height * 0.48}" width="${slot.width * 0.46}" height="${slot.height * 0.24}" rx="26" fill="rgba(255,255,255,0.66)" />
      <text x="${slot.width / 2}" y="${slot.height - 34}" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#17181c">${label}</text>
    </g>
  `;
}

export function buildSvgCollage(selectedItems, title) {
  const normalizedItems = safeSelectedItems(selectedItems).slice(0, 4);
  const slots = [
    { x: 48, y: 44, width: 260, height: 328, rotation: -6 },
    { x: 332, y: 36, width: 244, height: 312, rotation: 4 },
    { x: 114, y: 380, width: 230, height: 286, rotation: -3 },
    { x: 364, y: 360, width: 210, height: 254, rotation: 5 },
  ];
  const fallbackPalettes = ['#e9e1d7', '#dde4ff', '#e4efcf', '#efe7ff'];
  const renderCount = Math.max(normalizedItems.length, 2);

  const images = Array.from({ length: renderCount }, (_, index) =>
    buildSlotMarkup(slots[index], normalizedItems[index], fallbackPalettes[index % fallbackPalettes.length]),
  ).join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024">
      <defs>
        <linearGradient id="wear-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8f4ee" />
          <stop offset="50%" stop-color="#efe9df" />
          <stop offset="100%" stop-color="#ebe5ff" />
        </linearGradient>
      </defs>
      <rect width="768" height="1024" fill="url(#wear-bg)" />
      <circle cx="132" cy="150" r="120" fill="rgba(152,161,255,0.18)" />
      <circle cx="612" cy="210" r="96" fill="rgba(200,223,113,0.18)" />
      <circle cx="560" cy="820" r="132" fill="rgba(255,255,255,0.58)" />
      ${images}
      <rect x="38" y="930" width="692" height="56" rx="28" fill="rgba(255,255,255,0.82)" />
      <text x="62" y="966" font-family="Arial, sans-serif" font-size="18" fill="#17181c">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function buildFallbackImage({ selectedItems, option }) {
  return {
    imageDataUrl: buildSvgCollage(selectedItems, option?.title ?? 'WeaR wardrobe preview'),
    revisedPrompt: option?.title ? `Demo mode preview using ${option.title}.` : 'Demo mode preview.',
    mode: 'demo',
  };
}
