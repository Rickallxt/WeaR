export type ChatAttachment = {
  id: string;
  type: 'image' | 'wardrobe-item';
  label: string;
  previewUrl: string;
  file?: File;
  wardrobeItemId?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: ChatAttachment[];
  timestamp: number;
};
