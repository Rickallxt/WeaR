import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8).max(128);
const unknownRecord = z.record(z.string(), z.unknown());
const chatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  mode: z.string().optional(),
});

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

export const signupRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const profileBodySchema = z.object({
  profile: unknownRecord.nullable(),
  onboarded: z.boolean().optional(),
  importedLegacyData: z.boolean().optional(),
});

export const wardrobeBodySchema = z.object({
  wardrobe: z.array(unknownRecord),
});

export const collectionsBodySchema = z.object({
  collections: z.array(unknownRecord),
});

export const eventSessionBodySchema = z.object({
  messages: z.array(chatMessageSchema),
  eventSummary: z.string(),
});

export const mediaUploadRequestSchema = z.object({
  imageDataUrl: z.string().min(1),
  fileName: z.string().min(1),
  kind: z.enum(['wardrobe-upload', 'generated-look']).default('wardrobe-upload'),
  linkedItemId: z.string().nullable().optional(),
});

export const mediaPatchRequestSchema = z.object({
  linkedItemId: z.string().nullable().optional(),
});

export const chatRequestSchema = z.object({
  profile: unknownRecord.optional(),
  selectedItems: z.array(unknownRecord).optional(),
  messages: z.array(chatMessageSchema).optional(),
  userMessage: z.string().min(1),
});

export const optionsRequestSchema = z.object({
  profile: unknownRecord.optional(),
  selectedItems: z.array(unknownRecord).min(1),
  eventSummary: z.string().optional(),
  messages: z.array(chatMessageSchema).optional(),
});

export const imageRequestSchema = z.object({
  profile: unknownRecord.optional(),
  selectedItems: z.array(unknownRecord).optional(),
  option: unknownRecord.optional(),
  eventSummary: z.string().optional(),
});

export const identifyRequestSchema = z.object({
  imageDataUrl: z.string().optional(),
  mediaAssetId: z.string().optional(),
  fileName: z.string().optional(),
  existingItem: unknownRecord.nullable().optional(),
});
