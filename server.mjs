import { createServer } from 'node:http';
import {
  buildFallbackChat as buildFallbackChatHelper,
  buildFallbackImage as buildFallbackImageHelper,
  buildFallbackOptions as buildFallbackOptionsHelper,
  extractImageResult as extractImageResultHelper,
  extractOutputText as extractOutputTextHelper,
  optionCountForItems as optionCountForItemsHelper,
  parseJsonFromText as parseJsonFromTextHelper,
} from './server/wardrobeEngine.mjs';
import { buildFallbackIdentification } from './server/wardrobeIdentify.mjs';

const port = Number(process.env.PORT ?? 8787);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? 'gpt-5.2-chat-latest';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-5';

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const textParts = [];

  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === 'output_text' && content.text) {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join('\n').trim();
}

function extractImageResult(payload) {
  for (const output of payload.output ?? []) {
    if (output.type === 'image_generation_call' && output.result) {
      return {
        imageBase64: output.result,
        revisedPrompt: output.revised_prompt ?? '',
      };
    }
  }

  return null;
}

function parseJsonFromText(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in model output.');
  }

  return JSON.parse(text.slice(start, end + 1));
}

function optionCountForItems(itemCount) {
  if (itemCount <= 2) return 1;
  if (itemCount <= 5) return 2;
  return 3;
}

function buildFallbackOptions(selectedItems, eventSummary) {
  const total = optionCountForItems(selectedItems.length);

  return Array.from({ length: total }, (_, index) => {
    const rotated = selectedItems
      .slice(index)
      .concat(selectedItems.slice(0, index))
      .slice(0, Math.min(4, selectedItems.length));

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

function buildFallbackChat({ userMessage, selectedItems }) {
  const selectedNames = selectedItems.slice(0, 3).map((item) => item.name).join(', ');

  return {
    reply:
      `Got it. I’ll treat this as the active event context and keep the styling relevant to it. ` +
      (selectedNames ? `I’ll prioritize pieces like ${selectedNames}.` : 'Upload or select wardrobe photos and I’ll tighten the recommendation further.'),
    summary: userMessage,
    mode: 'demo',
  };
}

function buildSvgCollage(selectedItems, title) {
  const items = selectedItems
    .filter((item) => typeof item.imageDataUrl === 'string' && item.imageDataUrl.startsWith('data:image'))
    .slice(0, 4);

  if (items.length === 0) {
    return '';
  }

  const slots = [
    { x: 48, y: 44, width: 260, height: 328, rotation: -6 },
    { x: 332, y: 36, width: 244, height: 312, rotation: 4 },
    { x: 114, y: 380, width: 230, height: 286, rotation: -3 },
    { x: 364, y: 360, width: 210, height: 254, rotation: 5 },
  ];

  const images = items
    .map((item, index) => {
      const slot = slots[index];
      return `
        <g transform="translate(${slot.x} ${slot.y}) rotate(${slot.rotation} ${slot.width / 2} ${slot.height / 2})">
          <rect x="0" y="0" width="${slot.width}" height="${slot.height}" rx="28" fill="rgba(255,255,255,0.94)" />
          <image href="${item.imageDataUrl}" x="12" y="12" width="${slot.width - 24}" height="${slot.height - 24}" preserveAspectRatio="xMidYMid slice" />
        </g>
      `;
    })
    .join('');

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

function buildFallbackImage({ selectedItems, option }) {
  const collage = buildSvgCollage(selectedItems, option?.title ?? 'WeaR wardrobe preview');

  return {
    imageDataUrl: collage,
    revisedPrompt: option?.title ? `Demo mode preview using ${option.title}.` : 'Demo mode preview.',
    mode: 'demo',
  };
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function openAIResponses(body) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'OpenAI request failed.');
  }

  return payload;
}

async function handleChat(body) {
  if (!OPENAI_API_KEY) {
    return buildFallbackChatHelper(body);
  }

  const prompt = [
    'You are WeaR, a premium wardrobe-first personal stylist.',
    'You help users style outfits only from clothes they already own.',
    'Respond with concise event-aware styling guidance.',
    'Then provide a short summary string capturing the event context.',
    'Return strict JSON with keys: reply, summary.',
    '',
    `Profile: ${JSON.stringify(body.profile)}`,
    `Selected items: ${JSON.stringify(body.selectedItems)}`,
    `Conversation so far: ${JSON.stringify(body.messages)}`,
    `New user message: ${body.userMessage}`,
  ].join('\n');

  const payload = await openAIResponses({
    model: TEXT_MODEL,
    input: prompt,
  });

  const outputText = extractOutputTextHelper(payload);
  const parsed = parseJsonFromTextHelper(outputText);

  return {
    reply: parsed.reply,
    summary: parsed.summary,
    mode: 'openai',
  };
}

async function handleOptions(body) {
  const fallbackOptions = buildFallbackOptionsHelper(body.selectedItems, body.eventSummary);

  if (!OPENAI_API_KEY) {
    return {
      options: fallbackOptions,
      mode: 'demo',
    };
  }

  const desiredOptions = optionCountForItemsHelper(Array.isArray(body.selectedItems) ? body.selectedItems.length : 0);
  const prompt = [
    'You are WeaR, a wardrobe-first fashion styling engine.',
    'Use only the provided owned wardrobe items.',
    `Return exactly ${desiredOptions} outfit options when possible.`,
    'Each option must be event-relevant and must only reference provided item ids.',
    'Return strict JSON with shape: {"options":[{"id":"string","title":"string","vibe":"string","rationale":"string","itemIds":["id"],"eventFit":"string"}]}',
    '',
    `Profile: ${JSON.stringify(body.profile)}`,
    `Event summary: ${body.eventSummary}`,
    `Chat messages: ${JSON.stringify(body.messages)}`,
    `Selected items: ${JSON.stringify(body.selectedItems)}`,
  ].join('\n');

  const payload = await openAIResponses({
    model: TEXT_MODEL,
    input: prompt,
  });

  const outputText = extractOutputTextHelper(payload);
  const parsed = parseJsonFromTextHelper(outputText);

  return {
    options: Array.isArray(parsed.options) && parsed.options.length > 0 ? parsed.options : fallbackOptions,
    mode: 'openai',
  };
}

async function handleImage(body) {
  const selectedItems = Array.isArray(body.selectedItems) ? body.selectedItems : [];
  const imageInputs = selectedItems
    .filter((item) => typeof item.imageDataUrl === 'string' && item.imageDataUrl.startsWith('data:image'))
    .map((item) => ({
      type: 'input_image',
      image_url: item.imageDataUrl,
    }));

  if (!OPENAI_API_KEY || imageInputs.length === 0) {
    return buildFallbackImageHelper(body);
  }

  const instruction = [
    'Create a premium editorial outfit visualization for the selected wardrobe pieces.',
    'Use only the attached wardrobe photos as the clothing source of truth.',
    'Do not invent extra garments not supported by the attached images.',
    'The result should feel premium, fashion-forward, polished, and event-relevant.',
    'Prefer a clean full-look composition on a person or mannequin against a refined neutral background.',
    `Event context: ${body.eventSummary}`,
    `Selected option: ${JSON.stringify(body.option)}`,
    `Profile: ${JSON.stringify(body.profile)}`,
  ].join('\n');

  const payload = await openAIResponses({
    model: IMAGE_MODEL,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: instruction },
          ...imageInputs,
        ],
      },
    ],
    tools: [
      {
        type: 'image_generation',
        size: '1024x1536',
        quality: 'high',
        background: 'auto',
        input_fidelity: 'high',
      },
    ],
  });

  const imageResult = extractImageResultHelper(payload);

  if (!imageResult) {
    return buildFallbackImageHelper(body);
  }

  return {
    imageDataUrl: `data:image/png;base64,${imageResult.imageBase64}`,
    revisedPrompt: imageResult.revisedPrompt,
    mode: 'openai',
  };
}

async function handleIdentify(body) {
  const fallback = buildFallbackIdentification({
    fileName: body.fileName,
    existingItem: body.existingItem,
  });
  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';

  if (!OPENAI_API_KEY || !imageDataUrl.startsWith('data:image')) {
    return fallback;
  }

  const prompt = [
    'You are WeaR, a wardrobe-intelligence assistant.',
    'Analyze the provided clothing image and identify the garment as accurately as possible.',
    'Return strict JSON only with keys:',
    'name, category, color, fit, material, tags, styleNote, confidence, note, mode',
    'Rules:',
    '- category must be one of: Tops, Bottoms, Shoes, Outerwear, Accessories',
    '- confidence must be a number between 0 and 1',
    '- tags must be an array of short strings',
    "- mode must be 'openai'",
    '- keep styleNote concise and fashion-aware',
    '',
    `Existing wardrobe context: ${JSON.stringify(body.existingItem ?? null)}`,
    `Uploaded file name: ${body.fileName ?? ''}`,
  ].join('\n');

  try {
    const payload = await openAIResponses({
      model: TEXT_MODEL,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageDataUrl },
          ],
        },
      ],
    });

    const outputText = extractOutputTextHelper(payload);
    const parsed = parseJsonFromTextHelper(outputText);
    const category = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'].includes(parsed.category)
      ? parsed.category
      : fallback.category;
    const confidence = Number.isFinite(parsed.confidence)
      ? Math.max(0, Math.min(1, Number(parsed.confidence)))
      : fallback.confidence;

    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : fallback.name,
      category,
      color: typeof parsed.color === 'string' && parsed.color.trim() ? parsed.color.trim() : fallback.color,
      fit: typeof parsed.fit === 'string' && parsed.fit.trim() ? parsed.fit.trim() : fallback.fit,
      material:
        typeof parsed.material === 'string' && parsed.material.trim() ? parsed.material.trim() : fallback.material,
      tags:
        Array.isArray(parsed.tags) && parsed.tags.length > 0
          ? parsed.tags.map((tag) => String(tag).trim()).filter(Boolean)
          : fallback.tags,
      styleNote:
        typeof parsed.styleNote === 'string' && parsed.styleNote.trim()
          ? parsed.styleNote.trim()
          : fallback.styleNote,
      confidence,
      note:
        typeof parsed.note === 'string' && parsed.note.trim()
          ? parsed.note.trim()
          : 'Live OpenAI identification result. Review the detected details before saving.',
      mode: 'openai',
    };
  } catch {
    return fallback;
  }
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    json(res, 404, { error: 'Not found.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    json(res, 200, { ok: true });
    return;
  }

  try {
    if (req.method === 'GET' && req.url === '/api/openai/status') {
      json(res, 200, {
        connected: Boolean(OPENAI_API_KEY),
        textModel: TEXT_MODEL,
        imageModel: IMAGE_MODEL,
        message: OPENAI_API_KEY
          ? 'OpenAI account connected through backend environment variables.'
          : 'No OPENAI_API_KEY found. The app will fall back to demo optioning and preview behavior.',
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/wardrobe/chat') {
      const body = await readJson(req);
      json(res, 200, await handleChat(body));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/wardrobe/options') {
      const body = await readJson(req);
      json(res, 200, await handleOptions(body));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/wardrobe/identify') {
      const body = await readJson(req);
      json(res, 200, await handleIdentify(body));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/wardrobe/generate-image') {
      const body = await readJson(req);
      json(res, 200, await handleImage(body));
      return;
    }

    json(res, 404, { error: 'Not found.' });
  } catch (error) {
    json(res, 500, {
      error: error instanceof Error ? error.message : 'Unexpected server error.',
    });
  }
});

server.listen(port, () => {
  console.log(`WeaR API listening on http://127.0.0.1:${port}`);
});
