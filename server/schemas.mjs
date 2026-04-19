import { z } from 'zod';

// ─── LLM output schemas ────────────────────────────────────────────────────
// These validate the parsed JSON coming back from AI model calls.

export const chatOutputSchema = z.object({
  reply: z.string().min(1),
  summary: z.string().min(1),
});

export const wardrobeOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  vibe: z.string(),
  rationale: z.string(),
  itemIds: z.array(z.string()),
  eventFit: z.string(),
});

export const optionsOutputSchema = z.object({
  options: z.array(wardrobeOptionSchema),
});

export const identificationOutputSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories']),
  color: z.string().min(1),
  fit: z.string().min(1),
  material: z.string().min(1),
  tags: z.array(z.string()),
  styleNote: z.string(),
  confidence: z.number().min(0).max(1),
  note: z.string(),
});

// ─── Request body schemas ──────────────────────────────────────────────────
// These validate incoming POST body shapes before we process them.

export const chatRequestSchema = z.object({
  profile: z.record(z.string(), z.unknown()).optional(),
  selectedItems: z.array(z.record(z.string(), z.unknown())).optional(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
  userMessage: z.string().min(1),
});

export const optionsRequestSchema = z.object({
  profile: z.record(z.string(), z.unknown()).optional(),
  selectedItems: z.array(z.record(z.string(), z.unknown())).min(1),
  eventSummary: z.string().optional(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
});

export const imageRequestSchema = z.object({
  profile: z.record(z.string(), z.unknown()).optional(),
  selectedItems: z.array(z.record(z.string(), z.unknown())).optional(),
  option: z.record(z.string(), z.unknown()).optional(),
  eventSummary: z.string().optional(),
});

export const identifyRequestSchema = z.object({
  imageDataUrl: z.string().optional(),
  fileName: z.string().optional(),
  existingItem: z.record(z.string(), z.unknown()).nullable().optional(),
});
