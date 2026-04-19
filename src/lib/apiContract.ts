/**
 * Shared API contract types used by both the browser client (generationApi.ts)
 * and validated against by the Node server (server.mjs).
 *
 * These are the canonical shapes for every request body and response payload
 * crossing the /api/* boundary. If you change a field here, update both the
 * server handler and the client function that consumes it.
 */

// ─── Status ──────────────────────────────────────────────────────────────────

export type ApiGenerationStatus = {
  connected: boolean;
  textModel: string;
  imageModel: string;
  message: string;
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type ApiChatResponse = {
  reply: string;
  summary: string;
  mode: 'local' | 'demo';
};

// ─── Options ─────────────────────────────────────────────────────────────────

export type ApiWardrobeOption = {
  id: string;
  title: string;
  vibe: string;
  rationale: string;
  itemIds: string[];
  eventFit: string;
};

export type ApiOptionsResponse = {
  options: ApiWardrobeOption[];
  mode: 'local' | 'demo';
};

// ─── Image generation ────────────────────────────────────────────────────────

export type ApiImageResponse = {
  imageDataUrl: string;
  revisedPrompt?: string;
  mode: 'local' | 'demo';
};

// ─── Identification ──────────────────────────────────────────────────────────

export type ApiIdentificationResponse = {
  name: string;
  category: 'Tops' | 'Bottoms' | 'Shoes' | 'Outerwear' | 'Accessories';
  color: string;
  fit: string;
  material: string;
  tags: string[];
  styleNote: string;
  confidence: number;
  note: string;
  mode: 'local' | 'mock';
};

// ─── Error ───────────────────────────────────────────────────────────────────

export type ApiErrorResponse = {
  error: string;
};

// User account and persistence

export type ApiUserAccount = {
  id: string;
  email: string;
  name: string;
  onboarded: boolean;
  createdAt: string;
  importedLegacyData: boolean;
};

export type ApiSessionResponse =
  | {
      authenticated: true;
      user: ApiUserAccount;
      expiresAt?: string;
      session?: { expiresAt?: string };
    }
  | {
      authenticated: false;
      user: null;
    };

export type ApiProfileResponse = {
  profile: Record<string, unknown> | null;
  onboarded: boolean;
  importedLegacyData: boolean;
};

export type ApiWardrobeResponse = {
  wardrobe: Record<string, unknown>[];
};

export type ApiCollectionsResponse = {
  collections: Record<string, unknown>[];
};

export type ApiEventSessionResponse = {
  messages: { role: string; content: string; mode?: string }[];
  eventSummary: string;
};

export type ApiMediaAsset = {
  id: string;
  ownerUserId: string;
  kind: 'wardrobe-upload' | 'generated-look';
  createdAt: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  linkedItemId: string | null;
  previewUrl: string;
  originalUrl: string;
};

export type ApiMediaListResponse = {
  media: ApiMediaAsset[];
};

export type ApiPasswordResetResponse = {
  ok: boolean;
  devResetToken?: string;
  expiresAt?: string;
};
