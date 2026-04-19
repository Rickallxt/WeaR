import type { UserProfile, WardrobeCategory, WardrobeItem } from '../data/wearData';
import type {
  ApiChatResponse,
  ApiGenerationStatus,
  ApiIdentificationResponse,
  ApiImageResponse,
  ApiOptionsResponse,
  ApiWardrobeOption,
} from './apiContract';

export type EventChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type GeneratedWardrobeOption = ApiWardrobeOption;

export type GenerationStatus = ApiGenerationStatus;

export type GeneratedWardrobeImage = ApiImageResponse;

export type WardrobeIdentification = ApiIdentificationResponse & {
  category: WardrobeCategory;
};

const API_ORIGIN =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? 'http://127.0.0.1:8787'
    : '';

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const url =
    typeof input === 'string' && input.startsWith('/')
      ? `${API_ORIGIN}${input}`
      : input;
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }

  return payload;
}

export function fetchGenerationStatus() {
  return requestJson<ApiGenerationStatus>('/api/ai/status');
}

export function requestEventChat({
  profile,
  selectedItems,
  messages,
  userMessage,
}: {
  profile: UserProfile;
  selectedItems: WardrobeItem[];
  messages: EventChatMessage[];
  userMessage: string;
}) {
  return requestJson<ApiChatResponse>('/api/wardrobe/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile,
      selectedItems,
      messages,
      userMessage,
    }),
  });
}

export function requestWardrobeOptions({
  profile,
  selectedItems,
  eventSummary,
  messages,
}: {
  profile: UserProfile;
  selectedItems: WardrobeItem[];
  eventSummary: string;
  messages: EventChatMessage[];
}) {
  return requestJson<ApiOptionsResponse>('/api/wardrobe/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile,
      selectedItems,
      eventSummary,
      messages,
    }),
  });
}

export function requestWardrobeImage({
  profile,
  selectedItems,
  option,
  eventSummary,
}: {
  profile: UserProfile;
  selectedItems: WardrobeItem[];
  option: GeneratedWardrobeOption;
  eventSummary: string;
}) {
  return requestJson<ApiImageResponse>('/api/wardrobe/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile,
      selectedItems,
      option,
      eventSummary,
    }),
  });
}

export function requestWardrobeIdentification({
  imageDataUrl,
  mediaAssetId,
  fileName,
  existingItem,
}: {
  imageDataUrl?: string;
  mediaAssetId?: string;
  fileName: string;
  existingItem?: Partial<WardrobeItem> | null;
}) {
  return requestJson<ApiIdentificationResponse>('/api/wardrobe/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageDataUrl,
      mediaAssetId,
      fileName,
      existingItem,
    }),
  });
}
