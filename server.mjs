import { createServer } from 'node:http';
import {
  buildFallbackChat,
  buildFallbackImage,
  buildFallbackOptions,
  extractImageResult,
  extractOutputText,
  optionCountForItems,
  parseJsonFromText,
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
    return buildFallbackChat(body);
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

  const outputText = extractOutputText(payload);
  const parsed = parseJsonFromText(outputText);

  return {
    reply: parsed.reply,
    summary: parsed.summary,
    mode: 'openai',
  };
}

async function handleOptions(body) {
  const fallbackOptions = buildFallbackOptions(body.selectedItems, body.eventSummary);

  if (!OPENAI_API_KEY) {
    return {
      options: fallbackOptions,
      mode: 'demo',
    };
  }

  const desiredOptions = optionCountForItems(Array.isArray(body.selectedItems) ? body.selectedItems.length : 0);
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

  const outputText = extractOutputText(payload);
  const parsed = parseJsonFromText(outputText);

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
    return buildFallbackImage(body);
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

  const imageResult = extractImageResult(payload);

  if (!imageResult) {
    return buildFallbackImage(body);
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

    const outputText = extractOutputText(payload);
    const parsed = parseJsonFromText(outputText);
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
