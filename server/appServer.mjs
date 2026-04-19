import { createServer } from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildFallbackChat,
  buildFallbackImage,
  buildFallbackOptions,
  optionCountForItems,
  parseJsonFromText,
} from './wardrobeEngine.mjs';
import { buildFallbackIdentification } from './wardrobeIdentify.mjs';
import {
  chatOutputSchema,
  optionsOutputSchema,
  identificationOutputSchema,
  chatRequestSchema,
  optionsRequestSchema,
  imageRequestSchema,
  identifyRequestSchema,
  signupRequestSchema,
  loginRequestSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  profileBodySchema,
  wardrobeBodySchema,
  collectionsBodySchema,
  eventSessionBodySchema,
  mediaUploadRequestSchema,
  mediaPatchRequestSchema,
} from './appSchemas.mjs';
import { createLocalDevAdapter } from './localDataAdapter.mjs';

const port = Number(process.env.PORT ?? 8787);
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434').replace(/\/+$/, '');
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? 'gemma3:latest';
const LOGIC_MODEL = process.env.OLLAMA_LOGIC_MODEL ?? 'qwen2.5-coder:7b';
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? 'gemma3:latest';
const IMAGE_RENDERER = process.env.LOCAL_IMAGE_RENDERER ?? 'wardrobe-collage';
const REQUEST_TIMEOUT_MS = Number(process.env.LOCAL_AI_TIMEOUT_MS ?? 120000);
const SESSION_COOKIE = 'wear_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const adapter = createLocalDevAdapter(appRoot);

const chatJsonSchema = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['reply', 'summary'],
};

const optionsJsonSchema = {
  type: 'object',
  properties: {
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          vibe: { type: 'string' },
          rationale: { type: 'string' },
          itemIds: {
            type: 'array',
            items: { type: 'string' },
          },
          eventFit: { type: 'string' },
        },
        required: ['id', 'title', 'vibe', 'rationale', 'itemIds', 'eventFit'],
      },
    },
  },
  required: ['options'],
};

const identificationJsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    category: {
      type: 'string',
      enum: ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'],
    },
    color: { type: 'string' },
    fit: { type: 'string' },
    material: { type: 'string' },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    styleNote: { type: 'string' },
    confidence: { type: 'number' },
    note: { type: 'string' },
  },
  required: ['name', 'category', 'color', 'fit', 'material', 'tags', 'styleNote', 'confidence', 'note'],
};

function cookieHeader(value, maxAgeSeconds = SESSION_MAX_AGE) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function clearCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function parseCookies(cookieHeaderValue) {
  return String(cookieHeaderValue ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...rest] = part.split('=');
      acc[key] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});
}

function json(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function sendBinary(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    ...headers,
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
    const raw = await response.text();
    const payload = raw ? JSON.parse(raw) : {};

    if (!response.ok) {
      throw new Error(payload.error ?? payload.message ?? 'Local AI request failed.');
    }

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseLlmOutput(text, schema) {
  try {
    const parsed = parseJsonFromText(text);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function extractBase64Image(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    return null;
  }

  const [, encoded] = dataUrl.split(',', 2);
  return encoded || null;
}

function modelCandidates(modelName) {
  const baseName = String(modelName ?? '').split(':')[0];
  return new Set([modelName, baseName, `${baseName}:latest`]);
}

function hasModel(models, modelName) {
  const candidates = modelCandidates(modelName);
  return models.some((model) => candidates.has(model.name) || candidates.has(model.model));
}

async function getAiStatus() {
  try {
    const payload = await fetchJson(`${OLLAMA_BASE_URL}/api/tags`, { method: 'GET' });
    const models = Array.isArray(payload.models) ? payload.models : [];
    const required = [
      { label: 'chat', value: CHAT_MODEL },
      { label: 'logic', value: LOGIC_MODEL },
      { label: 'vision', value: VISION_MODEL },
    ];
    const missing = required.filter((entry) => !hasModel(models, entry.value));

    if (missing.length > 0) {
      return {
        connected: false,
        textModel: `${CHAT_MODEL} + ${LOGIC_MODEL}`,
        imageModel: IMAGE_RENDERER,
        message: `Ollama is running, but these required local models are missing: ${missing
          .map((entry) => `${entry.label}=${entry.value}`)
          .join(', ')}.`,
      };
    }

    return {
      connected: true,
      textModel: `${CHAT_MODEL} + ${LOGIC_MODEL}`,
      imageModel: IMAGE_RENDERER,
      message:
        'Local Ollama models are active for event chat, outfit logic, and upload identification. Outfit previews use an on-device collage render.',
    };
  } catch (error) {
    return {
      connected: false,
      textModel: `${CHAT_MODEL} + ${LOGIC_MODEL}`,
      imageModel: IMAGE_RENDERER,
      message:
        error instanceof Error
          ? `Local AI is unavailable right now: ${error.message}`
          : 'Local AI is unavailable right now.',
    };
  }
}

async function ollamaGenerate({ model, prompt, format, images }) {
  const payload = await fetchJson(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    body: JSON.stringify({
      model,
      prompt,
      format,
      images,
      stream: false,
    }),
  });

  return typeof payload.response === 'string' ? payload.response.trim() : '';
}

function fallbackIdsForIndex(selectedItems, index) {
  return selectedItems
    .slice(index)
    .concat(selectedItems.slice(0, index))
    .slice(0, Math.min(4, selectedItems.length))
    .map((item) => item.id);
}

function sanitizeOptions(options, selectedItems) {
  const allowedIds = new Set(selectedItems.map((item) => item.id));

  return options
    .map((option, index) => {
      const itemIds = Array.from(new Set(option.itemIds.filter((itemId) => allowedIds.has(itemId))));
      return {
        ...option,
        itemIds: itemIds.length > 0 ? itemIds : fallbackIdsForIndex(selectedItems, index),
      };
    })
    .filter((option) => option.itemIds.length > 0);
}

async function handleChat(body) {
  const fallback = buildFallbackChat(body);
  const prompt = [
    'You are WeaR, a premium wardrobe-first personal stylist.',
    'Style only from the owned pieces listed below.',
    'Do not suggest shopping or new garments.',
    'Respond with concise event-aware guidance and a short summary string.',
    'Return JSON only.',
    '',
    `Profile: ${JSON.stringify(body.profile ?? {})}`,
    `Selected items: ${JSON.stringify(body.selectedItems ?? [])}`,
    `Conversation: ${JSON.stringify(body.messages ?? [])}`,
    `Latest user message: ${body.userMessage}`,
  ].join('\n');

  try {
    const outputText = await ollamaGenerate({
      model: CHAT_MODEL,
      prompt,
      format: chatJsonSchema,
    });
    const validated = parseLlmOutput(outputText, chatOutputSchema);

    if (!validated) {
      return fallback;
    }

    return {
      reply: validated.reply,
      summary: validated.summary,
      mode: 'local',
    };
  } catch {
    return fallback;
  }
}

async function handleOptions(body) {
  const selectedItems = Array.isArray(body.selectedItems) ? body.selectedItems : [];
  const fallbackOptions = buildFallbackOptions(selectedItems, body.eventSummary);
  const desiredOptions = optionCountForItems(selectedItems.length);

  if (desiredOptions === 0) {
    return {
      options: [],
      mode: 'demo',
    };
  }

  const prompt = [
    'You are WeaR, a wardrobe-first outfit engine.',
    'Use only the selected owned items.',
    `Return exactly ${desiredOptions} outfit options when possible.`,
    'Each option must keep itemIds limited to the allowed ids.',
    'Do not invent ids.',
    '',
    `Allowed item ids: ${JSON.stringify(selectedItems.map((item) => item.id))}`,
    `Profile: ${JSON.stringify(body.profile ?? {})}`,
    `Event summary: ${body.eventSummary ?? ''}`,
    `Conversation: ${JSON.stringify(body.messages ?? [])}`,
    `Selected items: ${JSON.stringify(selectedItems)}`,
  ].join('\n');

  try {
    const outputText = await ollamaGenerate({
      model: LOGIC_MODEL,
      prompt,
      format: optionsJsonSchema,
    });
    const validated = parseLlmOutput(outputText, optionsOutputSchema);
    const sanitized = sanitizeOptions(validated?.options ?? [], selectedItems).slice(0, desiredOptions);

    if (sanitized.length === 0) {
      return {
        options: fallbackOptions,
        mode: 'demo',
      };
    }

    return {
      options: sanitized,
      mode: 'local',
    };
  } catch {
    return {
      options: fallbackOptions,
      mode: 'demo',
    };
  }
}

async function handleImage(body) {
  return buildFallbackImage(body);
}

async function handleIdentify(userId, body) {
  const fallback = buildFallbackIdentification({
    fileName: body.fileName,
    existingItem: body.existingItem,
  });

  const sourceDataUrl =
    body.imageDataUrl ||
    (body.mediaAssetId ? await adapter.readMediaDataUrl(userId, body.mediaAssetId).catch(() => null) : null);
  const imageBase64 = extractBase64Image(sourceDataUrl);

  if (!imageBase64) {
    return fallback;
  }

  const prompt = [
    'You are WeaR, a wardrobe-intelligence assistant.',
    'Identify the main garment visible in the image.',
    'Be practical and concise.',
    'Return JSON only.',
    'Rules:',
    '- category must be one of: Tops, Bottoms, Shoes, Outerwear, Accessories',
    '- confidence must be between 0 and 1',
    '- tags must be short strings',
    '',
    `Existing wardrobe context: ${JSON.stringify(body.existingItem ?? null)}`,
    `Uploaded file name: ${body.fileName ?? ''}`,
  ].join('\n');

  try {
    const outputText = await ollamaGenerate({
      model: VISION_MODEL,
      prompt,
      format: identificationJsonSchema,
      images: [imageBase64],
    });
    const validated = parseLlmOutput(outputText, identificationOutputSchema);

    if (!validated) {
      return fallback;
    }

    return { ...validated, mode: 'local' };
  } catch {
    return fallback;
  }
}

function parseMediaPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'api' || segments[1] !== 'media' || !segments[2]) {
    return null;
  }

  return {
    mediaId: segments[2],
    action: segments[3] ?? null,
  };
}

async function readBody(req, schema, res) {
  const raw = await readJson(req);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    json(res, 400, { error: 'Invalid request body.', details: parsed.error.issues });
    return null;
  }
  return parsed.data;
}

async function requireAuth(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const currentSession = await adapter.getSession(cookies[SESSION_COOKIE]);

  if (!currentSession) {
    json(res, 401, { error: 'Authentication required.' }, { 'Set-Cookie': clearCookieHeader() });
    return null;
  }

  return currentSession;
}

export const server = createServer(async (req, res) => {
  if (!req.url) {
    json(res, 404, { error: 'Not found.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    json(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, 'http://127.0.0.1');
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && (pathname === '/api/ai/status' || pathname === '/api/openai/status')) {
      json(res, 200, await getAiStatus());
      return;
    }

    if (req.method === 'GET' && pathname === '/api/auth/session') {
      const cookies = parseCookies(req.headers.cookie);
      const currentSession = await adapter.getSession(cookies[SESSION_COOKIE]);
      json(res, 200, currentSession ? { authenticated: true, ...currentSession } : { authenticated: false, user: null });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/signup') {
      const body = await readBody(req, signupRequestSchema, res);
      if (!body) return;
      const user = await adapter.createUser(body);
      const session = await adapter.createSession(user.id);
      json(
        res,
        200,
        { authenticated: true, user: session.user, expiresAt: session.expiresAt },
        { 'Set-Cookie': cookieHeader(session.token) },
      );
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await readBody(req, loginRequestSchema, res);
      if (!body) return;
      const user = await adapter.authenticateUser(body);
      if (!user) {
        json(res, 401, { error: 'Incorrect email or password.' });
        return;
      }
      const session = await adapter.createSession(user.id);
      json(
        res,
        200,
        { authenticated: true, user: session.user, expiresAt: session.expiresAt },
        { 'Set-Cookie': cookieHeader(session.token) },
      );
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/logout') {
      const cookies = parseCookies(req.headers.cookie);
      await adapter.destroySession(cookies[SESSION_COOKIE]);
      json(res, 200, { authenticated: false, user: null }, { 'Set-Cookie': clearCookieHeader() });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/request-password-reset') {
      const body = await readBody(req, passwordResetRequestSchema, res);
      if (!body) return;
      json(res, 200, await adapter.requestPasswordReset(body.email));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/reset-password') {
      const body = await readBody(req, passwordResetConfirmSchema, res);
      if (!body) return;
      const user = await adapter.resetPassword(body.token, body.password);
      const session = await adapter.createSession(user.id);
      json(
        res,
        200,
        { authenticated: true, user: session.user, expiresAt: session.expiresAt },
        { 'Set-Cookie': cookieHeader(session.token) },
      );
      return;
    }

    if (req.method === 'GET' && pathname === '/api/me/profile') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      json(res, 200, await adapter.getProfile(currentSession.user.id));
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/me/profile') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, profileBodySchema, res);
      if (!body) return;
      const payload = await adapter.saveProfile(currentSession.user.id, body.profile, { onboarded: body.onboarded });
      if (body.importedLegacyData) {
        await adapter.markImportedLegacyData(currentSession.user.id);
        payload.importedLegacyData = true;
      }
      json(res, 200, payload);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/me/wardrobe') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      json(res, 200, { wardrobe: await adapter.getWardrobe(currentSession.user.id) });
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/me/wardrobe') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, wardrobeBodySchema, res);
      if (!body) return;
      json(res, 200, { wardrobe: await adapter.saveWardrobe(currentSession.user.id, body.wardrobe) });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/me/collections') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      json(res, 200, { collections: await adapter.getCollections(currentSession.user.id) });
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/me/collections') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, collectionsBodySchema, res);
      if (!body) return;
      json(res, 200, { collections: await adapter.saveCollections(currentSession.user.id, body.collections) });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/me/event-session') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      json(res, 200, await adapter.getEventSession(currentSession.user.id));
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/me/event-session') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, eventSessionBodySchema, res);
      if (!body) return;
      json(res, 200, await adapter.saveEventSession(currentSession.user.id, body));
      return;
    }

    if (req.method === 'GET' && pathname === '/api/media') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      json(res, 200, { media: await adapter.listMediaAssets(currentSession.user.id) });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/media/upload') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, mediaUploadRequestSchema, res);
      if (!body) return;
      json(res, 200, await adapter.createMediaAsset(currentSession.user.id, body));
      return;
    }

    if (pathname.startsWith('/api/media/')) {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const mediaRoute = parseMediaPath(pathname);
      if (!mediaRoute) {
        json(res, 404, { error: 'Not found.' });
        return;
      }

      if (req.method === 'GET' && mediaRoute.action === 'content') {
        const file = await adapter.getMediaContent(currentSession.user.id, mediaRoute.mediaId);
        if (!file) {
          json(res, 404, { error: 'Media asset not found.' });
          return;
        }

        sendBinary(res, 200, file.buffer, {
          'Content-Type': file.mimeType,
          'Cache-Control': 'private, max-age=600',
        });
        return;
      }

      if (req.method === 'PATCH' && !mediaRoute.action) {
        const body = await readBody(req, mediaPatchRequestSchema, res);
        if (!body) return;
        json(res, 200, await adapter.updateMediaAsset(currentSession.user.id, mediaRoute.mediaId, body));
        return;
      }

      if (req.method === 'DELETE' && !mediaRoute.action) {
        await adapter.deleteMediaAsset(currentSession.user.id, mediaRoute.mediaId);
        json(res, 200, { ok: true });
        return;
      }
    }

    if (req.method === 'POST' && pathname === '/api/wardrobe/chat') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, chatRequestSchema, res);
      if (!body) return;
      json(res, 200, await handleChat(body));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/wardrobe/options') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, optionsRequestSchema, res);
      if (!body) return;
      json(res, 200, await handleOptions(body));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/wardrobe/identify') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, identifyRequestSchema, res);
      if (!body) return;
      json(res, 200, await handleIdentify(currentSession.user.id, body));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/wardrobe/generate-image') {
      const currentSession = await requireAuth(req, res);
      if (!currentSession) return;
      const body = await readBody(req, imageRequestSchema, res);
      if (!body) return;
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
