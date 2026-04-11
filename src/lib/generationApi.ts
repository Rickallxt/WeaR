import type { UserProfile, WardrobeCategory, WardrobeItem } from '../data/wearData';

export type EventChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type GeneratedWardrobeOption = {
  id: string;
  title: string;
  vibe: string;
  rationale: string;
  itemIds: string[];
  eventFit: string;
};

export type GenerationStatus = {
  connected: boolean;
  textModel: string;
  imageModel: string;
  message: string;
};

export type GeneratedWardrobeImage = {
  imageDataUrl: string;
  revisedPrompt?: string;
  mode: 'openai' | 'demo';
};

export type WardrobeIdentification = {
  name: string;
  category: WardrobeCategory;
  color: string;
  fit: string;
  material: string;
  tags: string[];
  styleNote: string;
  confidence: number;
  note: string;
  mode: 'openai' | 'mock';
};

async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.');
  }

  return payload;
}

export function fetchGenerationStatus() {
  return requestJson<GenerationStatus>('/api/openai/status');
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
  return requestJson<{
    reply: string;
    summary: string;
    mode: 'openai' | 'demo';
  }>('/api/wardrobe/chat', {
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
  return requestJson<{
    options: GeneratedWardrobeOption[];
    mode: 'openai' | 'demo';
  }>('/api/wardrobe/options', {
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
  return requestJson<GeneratedWardrobeImage>('/api/wardrobe/generate-image', {
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
  fileName,
  existingItem,
}: {
  imageDataUrl: string;
  fileName: string;
  existingItem?: Partial<WardrobeItem> | null;
}) {
  return requestJson<WardrobeIdentification>('/api/wardrobe/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageDataUrl,
      fileName,
      existingItem,
    }),
  });
}
