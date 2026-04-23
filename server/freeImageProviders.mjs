import { readFile } from 'node:fs/promises';
import { basename, isAbsolute, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_URL_RE = /^data:(image\/[^;]+);base64,(.+)$/u;

function normalizeBaseUrl(value, fallback) {
  return String(value || fallback).replace(/\/+$/, '');
}

function configuredProvider(env = process.env) {
  return String(env.IMAGE_PROVIDER ?? env.FREE_IMAGE_PROVIDER ?? 'local-collage').trim().toLowerCase();
}

function isDataImage(value) {
  return typeof value === 'string' && DATA_URL_RE.test(value);
}

function parseDataUrl(dataUrl) {
  const match = DATA_URL_RE.exec(String(dataUrl ?? ''));
  if (!match) {
    throw new Error('Expected an image data URL.');
  }

  return {
    mimeType: match[1],
    base64: match[2],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function collectGarmentReferences(selectedItems = []) {
  return selectedItems
    .map((item) => item?.imageDataUrl)
    .filter(isDataImage)
    .slice(0, 4);
}

function collectPersonReferences(profile = {}) {
  const facePhotos = Array.isArray(profile?.facePhotos) ? profile.facePhotos : [];
  return [
    profile?.fullBodyPhoto?.imageDataUrl,
    profile?.bodyReferencePhoto?.imageDataUrl,
    profile?.fitReferencePhoto?.imageDataUrl,
    ...facePhotos.map((photo) => photo?.imageDataUrl),
  ].filter(isDataImage);
}

export function buildLocalImagePrompt({ selectedItems = [], option = {}, eventSummary = '', profile = {} }) {
  const itemNames = selectedItems
    .map((item) => item?.name)
    .filter(Boolean)
    .slice(0, 6)
    .join(', ');
  const tasteNotes = Array.isArray(profile?.tasteNotes) ? profile.tasteNotes.slice(-4).join('; ') : '';

  return [
    'Create a premium editorial outfit preview for the WeaR personal stylist app.',
    'Use only the provided wardrobe pieces as references when reference images are available.',
    'If no full-body person reference is provided, render a neutral fashion mannequin or editorial flat-lay rather than inventing a real user identity.',
    'Keep garment colors, textures, and silhouettes faithful to the uploaded wardrobe photos.',
    'Avoid text, logos, shopping suggestions, distorted hands, extra limbs, and unrealistic body proportions.',
    `Outfit: ${option?.title ?? 'selected wardrobe outfit'}.`,
    `Vibe: ${option?.vibe ?? 'polished daily styling'}.`,
    `Event: ${eventSummary || option?.eventFit || 'daily outfit recommendation'}.`,
    itemNames ? `Wardrobe pieces: ${itemNames}.` : '',
    tasteNotes ? `User taste memory: ${tasteNotes}.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function replaceTokens(value, replacements) {
  if (typeof value === 'string') {
    return Object.entries(replacements).reduce((next, [token, replacement]) => next.replaceAll(token, replacement), value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => replaceTokens(entry, replacements));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceTokens(entry, replacements)]));
  }

  return value;
}

async function uploadComfyImage({ baseUrl, dataUrl, label, fetchImpl }) {
  const { mimeType, buffer } = parseDataUrl(dataUrl);
  const extension = mimeType.split('/')[1] || 'png';
  const fileName = `wear-${label}-${Date.now()}-${randomUUID()}.${extension}`;
  const formData = new FormData();

  formData.append('image', new Blob([buffer], { type: mimeType }), fileName);
  formData.append('type', 'input');
  formData.append('overwrite', 'true');

  const response = await fetchImpl(`${baseUrl}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ComfyUI image upload failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.name ?? fileName;
}

async function fetchImageAsDataUrl(url, fetchImpl) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Generated image fetch failed: ${response.status}`);
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0] || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

function extractComfyImageRef(historyPayload, promptId) {
  const promptHistory = historyPayload?.[promptId] ?? Object.values(historyPayload ?? {})[0];
  const outputs = promptHistory?.outputs ?? {};

  for (const output of Object.values(outputs)) {
    const images = Array.isArray(output?.images) ? output.images : [];
    const firstImage = images[0];
    if (firstImage?.filename) {
      return firstImage;
    }
  }

  return null;
}

async function pollComfyResult({ baseUrl, promptId, fetchImpl, timeoutMs, pollMs }) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const response = await fetchImpl(`${baseUrl}/history/${encodeURIComponent(promptId)}`);
    if (response.ok) {
      const historyPayload = await response.json();
      const imageRef = extractComfyImageRef(historyPayload, promptId);

      if (imageRef) {
        const viewUrl = new URL(`${baseUrl}/view`);
        viewUrl.searchParams.set('filename', imageRef.filename);
        viewUrl.searchParams.set('subfolder', imageRef.subfolder ?? '');
        viewUrl.searchParams.set('type', imageRef.type ?? 'output');
        return fetchImageAsDataUrl(viewUrl.toString(), fetchImpl);
      }
    }

    await new Promise((resolvePoll) => setTimeout(resolvePoll, pollMs));
  }

  throw new Error('ComfyUI generation timed out.');
}

async function generateWithComfyUi({ env, appRoot, prompt, selectedItems, profile, fetchImpl }) {
  const workflowPath = env.COMFYUI_WORKFLOW_PATH;
  if (!workflowPath) {
    throw new Error('COMFYUI_WORKFLOW_PATH is required for the ComfyUI image provider.');
  }

  const baseUrl = normalizeBaseUrl(env.COMFYUI_BASE_URL, 'http://127.0.0.1:8188');
  const garmentReferences = collectGarmentReferences(selectedItems);
  const personReference = collectPersonReferences(profile)[0] ?? '';
  const resolvedWorkflowPath = isAbsolute(workflowPath) ? workflowPath : resolve(appRoot, workflowPath);
  const workflow = JSON.parse(await readFile(resolvedWorkflowPath, 'utf8'));
  const personImage = personReference
    ? await uploadComfyImage({ baseUrl, dataUrl: personReference, label: 'person', fetchImpl })
    : '';
  const garmentImages = [];

  for (const [index, dataUrl] of garmentReferences.entries()) {
    garmentImages.push(await uploadComfyImage({ baseUrl, dataUrl, label: `garment-${index + 1}`, fetchImpl }));
  }

  const replacements = {
    __WEAR_PROMPT__: prompt,
    __WEAR_NEGATIVE_PROMPT__:
      env.COMFYUI_NEGATIVE_PROMPT ??
      'text, watermark, extra limbs, distorted hands, duplicated body, incorrect clothing, low quality',
    __WEAR_PERSON_IMAGE__: personImage,
    __WEAR_GARMENT_IMAGE__: garmentImages[0] ?? '',
    __WEAR_GARMENT_IMAGE_1__: garmentImages[0] ?? '',
    __WEAR_GARMENT_IMAGE_2__: garmentImages[1] ?? '',
    __WEAR_GARMENT_IMAGE_3__: garmentImages[2] ?? '',
    __WEAR_GARMENT_IMAGE_4__: garmentImages[3] ?? '',
  };
  const promptWorkflow = replaceTokens(workflow, replacements);
  const clientId = `wear-${randomUUID()}`;

  const queueResponse = await fetchImpl(`${baseUrl}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      prompt: promptWorkflow,
    }),
  });

  if (!queueResponse.ok) {
    const details = await queueResponse.text().catch(() => '');
    throw new Error(`ComfyUI prompt queue failed: ${details || queueResponse.status}`);
  }

  const queued = await queueResponse.json();
  if (!queued.prompt_id) {
    throw new Error('ComfyUI did not return a prompt_id.');
  }

  return {
    imageDataUrl: await pollComfyResult({
      baseUrl,
      promptId: queued.prompt_id,
      fetchImpl,
      timeoutMs: Number(env.COMFYUI_TIMEOUT_MS ?? env.LOCAL_IMAGE_TIMEOUT_MS ?? 180000),
      pollMs: Number(env.COMFYUI_POLL_MS ?? 1500),
    }),
    revisedPrompt: `ComfyUI ${basename(resolvedWorkflowPath)} generated ${garmentImages.length} wardrobe reference(s).`,
    mode: 'local',
  };
}

async function imageResultToDataUrl(payload, baseUrl, fetchImpl) {
  const firstDataEntry = Array.isArray(payload?.data) ? payload.data[0] : null;
  const base64Result = firstDataEntry?.b64_json ?? payload?.b64_json ?? payload?.image_base64;

  if (typeof base64Result === 'string' && base64Result.trim()) {
    return base64Result.startsWith('data:image')
      ? base64Result
      : `data:image/png;base64,${base64Result}`;
  }

  const imageList = Array.isArray(payload?.images) ? payload.images : [];
  if (typeof imageList[0] === 'string' && imageList[0].trim()) {
    return imageList[0].startsWith('data:image')
      ? imageList[0]
      : `data:image/png;base64,${imageList[0]}`;
  }

  const imageUrl = firstDataEntry?.url ?? payload?.url;
  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    const resolvedUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : imageUrl;
    return fetchImageAsDataUrl(resolvedUrl, fetchImpl);
  }

  throw new Error('LocalAI did not return an image payload.');
}

async function generateWithLocalAi({ env, prompt, selectedItems, fetchImpl }) {
  const baseUrl = normalizeBaseUrl(env.LOCALAI_BASE_URL, 'http://127.0.0.1:8080');
  const garmentReferences = collectGarmentReferences(selectedItems);
  const firstReference = garmentReferences[0] ? parseDataUrl(garmentReferences[0]) : null;
  const payload = {
    prompt,
    size: env.LOCALAI_IMAGE_SIZE ?? env.LOCAL_IMAGE_SIZE ?? '1024x1024',
  };

  if (env.LOCALAI_IMAGE_MODEL) {
    payload.model = env.LOCALAI_IMAGE_MODEL;
  }

  if (env.LOCALAI_IMAGE_STEPS) {
    payload.step = Number(env.LOCALAI_IMAGE_STEPS);
  }

  // LocalAI backends vary: diffusers img2img accepts `file`, while Flux Kontext examples use `ref_images`.
  if (firstReference && env.LOCALAI_USE_REFERENCES !== 'false') {
    payload.file = firstReference.base64;
    payload.ref_images = garmentReferences;
  }

  const response = await fetchImpl(`${baseUrl}/v1/images/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`LocalAI image generation failed: ${details || response.status}`);
  }

  return {
    imageDataUrl: await imageResultToDataUrl(await response.json(), baseUrl, fetchImpl),
    revisedPrompt: `LocalAI generated an outfit preview from ${garmentReferences.length} wardrobe reference(s).`,
    mode: 'local',
  };
}

export async function generateWithFreeImageProvider({
  env = process.env,
  appRoot,
  body,
  selectedItems,
  fetchImpl = fetch,
}) {
  const provider = configuredProvider(env);
  const prompt = buildLocalImagePrompt({
    ...body,
    selectedItems,
  });

  if (provider === 'comfyui') {
    return generateWithComfyUi({ env, appRoot, prompt, selectedItems, profile: body.profile, fetchImpl });
  }

  if (provider === 'localai') {
    return generateWithLocalAi({ env, prompt, selectedItems, fetchImpl });
  }

  if (provider === 'auto') {
    try {
      return await generateWithComfyUi({ env, appRoot, prompt, selectedItems, profile: body.profile, fetchImpl });
    } catch {
      return generateWithLocalAi({ env, prompt, selectedItems, fetchImpl });
    }
  }

  throw new Error(`Image provider "${provider}" is not a free local provider.`);
}

export async function getFreeImageProviderStatus({ env = process.env, fetchImpl = fetch }) {
  const provider = configuredProvider(env);

  if (provider === 'comfyui' || provider === 'auto') {
    const baseUrl = normalizeBaseUrl(env.COMFYUI_BASE_URL, 'http://127.0.0.1:8188');
    try {
      const response = await fetchImpl(`${baseUrl}/system_stats`);
      if (response.ok) {
        return {
          provider,
          label: provider === 'auto' ? 'ComfyUI/LocalAI auto' : 'ComfyUI workflow',
          message:
            'Free local image provider is configured for ComfyUI. WeaR will run the workflow and fall back to collage if generation fails.',
        };
      }
      if (provider !== 'auto') {
        return {
          provider,
          label: 'ComfyUI workflow',
          message: 'ComfyUI is configured but did not return a healthy status; outfit images will fall back to the local collage renderer.',
        };
      }
    } catch {
      if (provider !== 'auto') {
        return {
          provider,
          label: 'ComfyUI workflow',
          message: 'ComfyUI is configured but not reachable; outfit images will fall back to the local collage renderer.',
        };
      }
    }
  }

  if (provider === 'localai' || provider === 'auto') {
    const baseUrl = normalizeBaseUrl(env.LOCALAI_BASE_URL, 'http://127.0.0.1:8080');
    try {
      const response = await fetchImpl(`${baseUrl}/v1/models`);
      if (response.ok) {
        return {
          provider,
          label: provider === 'auto' ? 'ComfyUI/LocalAI auto' : 'LocalAI images',
          message:
            'Free local image provider is configured for LocalAI. WeaR will use it before falling back to collage.',
        };
      }
      return {
        provider,
        label: provider === 'auto' ? 'ComfyUI/LocalAI auto' : 'LocalAI images',
        message: 'LocalAI is configured but did not return a healthy status; outfit images will fall back to the local collage renderer.',
      };
    } catch {
      return {
        provider,
        label: provider === 'auto' ? 'ComfyUI/LocalAI auto' : 'LocalAI images',
        message: 'LocalAI is configured but not reachable; outfit images will fall back to the local collage renderer.',
      };
    }
  }

  return {
    provider,
    label: 'Wardrobe collage',
    message: 'Image previews use the built-in free local collage renderer. Set IMAGE_PROVIDER=localai or comfyui to enable local AI images.',
  };
}
