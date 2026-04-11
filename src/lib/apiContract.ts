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
  mode: 'openai' | 'demo';
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
  mode: 'openai' | 'demo';
};

// ─── Image generation ────────────────────────────────────────────────────────

export type ApiImageResponse = {
  imageDataUrl: string;
  revisedPrompt?: string;
  mode: 'openai' | 'demo';
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
  mode: 'openai' | 'mock';
};

// ─── Error ───────────────────────────────────────────────────────────────────

export type ApiErrorResponse = {
  error: string;
};
