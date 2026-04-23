import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  resolveWardrobeImageSrc,
  type MediaAsset,
  type SavedOutfit,
  type UserProfile,
  type WardrobeItem,
} from '../../data/wearData';
import {
  requestEventChat,
  requestWardrobeIdentification,
  requestWardrobeOptions,
  type EventChatMessage,
  type GeneratedWardrobeOption,
  type GenerationStatus,
} from '../../lib/generationApi';
import type { EventSession } from '../../lib/persistence';
import { MaterialIcon, SurfaceBadge } from '../Chrome';
import { OutfitsGrid } from './OutfitsGrid';

type StyleChatAttachmentSource = 'camera' | 'gallery' | 'wardrobe' | 'outfit';

type StyleChatAttachment = {
  id: string;
  source: StyleChatAttachmentSource;
  label: string;
  previewUrl?: string;
  mediaAssetId?: string;
  itemIds?: string[];
};

export type StyleChatComposerIntent =
  | {
      id: string;
      kind: 'wardrobe-items';
      itemIds: string[];
    }
  | {
      id: string;
      kind: 'outfit';
      label: string;
      previewUrl?: string;
      itemIds: string[];
    };

type GeneratedStyleLook = {
  id: string;
  title: string;
  vibe: string;
  rationale: string;
  eventFit: string;
  items: WardrobeItem[];
  mode: 'local' | 'demo';
  coverImageUrl?: string | null;
};

type StyleChatMessage =
  | {
      id: string;
      role: 'ai';
      text: string;
      looks?: GeneratedStyleLook[];
      uploadPrompt?: string;
    }
  | {
      id: string;
      role: 'user';
      text: string;
      attachments?: StyleChatAttachment[];
    };

const ENTRY_CHIPS = [
  { label: 'Meeting', icon: 'business_center' },
  { label: 'Dinner', icon: 'restaurant' },
  { label: 'Date', icon: 'favorite' },
] as const;

const CHAT_UPLOAD_CATEGORIES: WardrobeItem['category'][] = ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function daysSince(dateString?: string | null) {
  if (!dateString) return null;
  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) return null;
  return Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24));
}

function buildGreeting(name: string) {
  return `Hey ${name || 'there'}. What are we styling today?`;
}

function normalizeStoredMessages(messages: EventSession['messages']): EventChatMessage[] {
  return messages
    .filter((message): message is EventChatMessage => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

function toSessionMessages(messages: StyleChatMessage[]): EventSession['messages'] {
  return messages.map((message) => ({
    role: message.role === 'ai' ? 'assistant' : 'user',
    content: message.text,
  }));
}

function uploadPromptForCount(itemCount: number) {
  if (itemCount <= 0) {
    return 'Add 4 to 6 pieces from your wardrobe or upload a few photos so I can lock the look quickly.';
  }

  const needed = Math.max(2, 4 - itemCount);
  return `I can start with ${itemCount} piece${itemCount === 1 ? '' : 's'}, but add ${needed} more photo${needed === 1 ? '' : 's'} for a stronger outfit. Tops, bottoms, shoes, and one layer is the sweet spot.`;
}

function readSessionAsChat(profile: UserProfile, eventSession: EventSession): StyleChatMessage[] {
  if (eventSession.messages.length === 0) {
    return [
      {
        id: 'ai-greeting',
        role: 'ai',
        text: buildGreeting(profile.name),
      },
    ];
  }

  return eventSession.messages.map((message, index) => ({
    id: `session-${index}`,
    role: message.role === 'assistant' ? 'ai' : 'user',
    text: message.content,
  }));
}

function mergeAttachments(current: StyleChatAttachment[], incoming: StyleChatAttachment[]) {
  const next = new Map(current.map((attachment) => [attachment.id, attachment]));
  incoming.forEach((attachment) => next.set(attachment.id, attachment));
  return Array.from(next.values());
}

function buildAttachmentFromWardrobeItem(item: WardrobeItem): StyleChatAttachment {
  return {
    id: `wardrobe-${item.id}`,
    source: 'wardrobe',
    label: item.name,
    previewUrl: resolveWardrobeImageSrc(item) ?? undefined,
    itemIds: [item.id],
  };
}

function buildCoverImage(items: WardrobeItem[]) {
  return items.map((item) => resolveWardrobeImageSrc(item)).find(Boolean) ?? null;
}

function buildFallbackUploadItem(attachment: StyleChatAttachment, index: number): WardrobeItem {
  const category = CHAT_UPLOAD_CATEGORIES[index % CHAT_UPLOAD_CATEGORIES.length] ?? 'Tops';
  return {
    id: attachment.mediaAssetId ? `media-${attachment.mediaAssetId}` : `chat-${attachment.id}`,
    name: attachment.label.replace(/\.[^.]+$/u, '') || `Uploaded piece ${index + 1}`,
    category,
    fit: 'AI-read fit',
    material: 'Uploaded photo',
    color: 'Auto palette',
    tags: ['Session upload', 'Style chat'],
    palette: 'from-[#d0bcff] via-[#f7f1ff] to-[#4fdbc8]',
    status: index % 2 === 0 ? 'Core' : 'Occasion',
    imageUrl: attachment.previewUrl?.startsWith('data:image') ? null : attachment.previewUrl ?? null,
    imageDataUrl: attachment.previewUrl?.startsWith('data:image') ? attachment.previewUrl : null,
    mediaAssetId: attachment.mediaAssetId ?? null,
    source: 'upload',
    styleNote: 'Temporary upload attached inside the style chat composer.',
  };
}

function buildIdentifiedUploadItem(attachment: StyleChatAttachment, identified: Awaited<ReturnType<typeof requestWardrobeIdentification>>, index: number): WardrobeItem {
  return {
    id: attachment.mediaAssetId ? `media-${attachment.mediaAssetId}` : `chat-${attachment.id}`,
    name: identified.name,
    category: identified.category,
    fit: identified.fit,
    material: identified.material,
    color: identified.color,
    tags: identified.tags,
    palette: 'from-[#d0bcff] via-[#f6f2ff] to-[#4fdbc8]',
    status: index % 2 === 0 ? 'Core' : 'Occasion',
    imageUrl: attachment.previewUrl?.startsWith('data:image') ? null : attachment.previewUrl ?? null,
    imageDataUrl: attachment.previewUrl?.startsWith('data:image') ? attachment.previewUrl : null,
    mediaAssetId: attachment.mediaAssetId ?? null,
    source: 'upload',
    styleNote: identified.styleNote,
    detection: {
      state: 'auto-detected',
      mode: identified.mode,
      confidence: identified.confidence,
      note: identified.note,
    },
  };
}

function optionToLook(option: GeneratedWardrobeOption, selectedItems: WardrobeItem[], mode: 'local' | 'demo'): GeneratedStyleLook {
  const byId = new Map(selectedItems.map((item) => [item.id, item]));
  const items = option.itemIds.map((itemId) => byId.get(itemId)).filter((item): item is WardrobeItem => Boolean(item));
  return {
    id: option.id,
    title: option.title,
    vibe: option.vibe,
    rationale: option.rationale,
    eventFit: option.eventFit,
    items,
    mode,
    coverImageUrl: buildCoverImage(items),
  };
}

function dedupeItems(items: WardrobeItem[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: StyleChatAttachment;
  onRemove: (attachmentId: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-2xl border px-2.5 py-2"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(73,68,84,0.22)',
      }}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ background: 'var(--surface-high)' }}
      >
        {attachment.previewUrl ? (
          <img src={attachment.previewUrl} alt={attachment.label} className="h-full w-full object-cover" />
        ) : (
          <MaterialIcon name={attachment.source === 'outfit' ? 'view_carousel' : 'checkroom'} size={18} className="text-[#cbc3d7]" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold" style={{ color: '#e5e2e1' }}>
          {attachment.label}
        </p>
        <p className="text-[0.68rem] uppercase tracking-[0.2em]" style={{ color: '#958ea0' }}>
          {attachment.source === 'outfit' ? 'Saved outfit' : attachment.source === 'wardrobe' ? 'Wardrobe' : 'Upload'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="ml-auto flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        style={{ color: '#958ea0' }}
        aria-label={`Remove ${attachment.label}`}
      >
        <MaterialIcon name="close" size={18} />
      </button>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(79,219,200,0.22), rgba(208,188,255,0.18))',
          border: '1px solid rgba(79,219,200,0.28)',
        }}
      >
        <MaterialIcon name="auto_awesome" size={15} filled style={{ color: '#4fdbc8' }} />
      </div>
      <div
        className="flex items-center gap-1 rounded-[0.25rem_1.25rem_1.25rem_1.25rem] px-4 py-3"
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(73,68,84,0.22)',
        }}
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="block h-[0.35rem] w-[0.35rem] rounded-full"
            style={{
              background: '#958ea0',
              animation: `chat-bounce 1.2s ease-in-out ${index * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EntryChips({ onSend }: { onSend: (label: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {ENTRY_CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => onSend(chip.label)}
          className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(73,68,84,0.24)',
            color: '#e5e2e1',
          }}
        >
          <MaterialIcon name={chip.icon} size={16} />
          {chip.label}
        </button>
      ))}
    </div>
  );
}

function GeneratedStyleLookCard({
  look,
  onApprove,
  onReject,
}: {
  look: GeneratedStyleLook;
  onApprove: (look: GeneratedStyleLook) => void;
  onReject: (look: GeneratedStyleLook) => void;
}) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-[1.4rem] border"
      style={{
        background: 'rgba(19,19,19,0.82)',
        borderColor: 'rgba(73,68,84,0.24)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.24)',
      }}
    >
      <div className="relative overflow-hidden px-4 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,219,200,0.12),transparent_38%),radial-gradient(circle_at_left,rgba(208,188,255,0.12),transparent_42%)]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#4fdbc8' }}>
                {look.mode === 'local' ? 'AI wardrobe pick' : 'Fallback wardrobe pick'}
              </p>
              <h3
                className="mt-2 text-[1.05rem] font-bold leading-tight"
                style={{ color: '#f5f2ee', fontFamily: 'var(--font-headline)' }}
              >
                {look.title}
              </h3>
              <p className="mt-1 text-sm" style={{ color: '#b9b1c3' }}>
                {look.vibe}
              </p>
            </div>
            <SurfaceBadge tone={look.mode === 'local' ? 'live' : 'fallback'}>{look.mode === 'local' ? 'Local AI' : 'Fallback'}</SurfaceBadge>
          </div>

          <p className="mt-3 text-sm leading-6" style={{ color: '#d4ced9' }}>
            {look.rationale}
          </p>

          <div className="mt-3 rounded-2xl border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(73,68,84,0.16)' }}>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#958ea0' }}>
              Why it works
            </p>
            <p className="mt-1 text-sm" style={{ color: '#e5e2e1' }}>
              {look.eventFit}
            </p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {look.items.map((item) => {
                const src = resolveWardrobeImageSrc(item);
                return (
                  <div key={item.id} className="min-w-[4.6rem]">
                    <div
                      className="flex aspect-square items-end overflow-hidden rounded-2xl"
                      style={{ background: 'var(--surface-high)' }}
                    >
                      {src ? (
                        <img src={src} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${item.palette ?? 'from-[#232329] to-[#151519]'}`} />
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-[0.72rem] font-semibold" style={{ color: '#cbc3d7' }}>
                      {item.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onApprove(look)}
              className="rounded-full px-4 py-3 text-sm font-bold text-[#10211f] transition-transform active:scale-[0.98]"
              style={{
                minHeight: '2.75rem',
                background: 'linear-gradient(135deg, #4fdbc8 0%, #8ff3ea 100%)',
              }}
            >
              Yes, remember
            </button>
            <button
              type="button"
              onClick={() => onReject(look)}
              className="rounded-full px-4 py-3 text-sm font-bold transition-transform active:scale-[0.98]"
              style={{
                minHeight: '2.75rem',
                background: 'rgba(255,255,255,0.06)',
                color: '#e5e2e1',
                border: '1px solid rgba(73,68,84,0.24)',
              }}
            >
              No, adjust
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StyleAiMessage({
  message,
  showEntryChips,
  onChipTap,
  onApprove,
  onReject,
}: {
  message: Extract<StyleChatMessage, { role: 'ai' }>;
  showEntryChips: boolean;
  onChipTap: (label: string) => void;
  onApprove: (look: GeneratedStyleLook) => void;
  onReject: (look: GeneratedStyleLook) => void;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(79,219,200,0.22), rgba(208,188,255,0.18))',
          border: '1px solid rgba(79,219,200,0.28)',
        }}
      >
        <MaterialIcon name="auto_awesome" size={15} filled style={{ color: '#4fdbc8' }} />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="rounded-[0.25rem_1.25rem_1.25rem_1.25rem] px-3.5 py-3"
          style={{
            background: 'var(--surface)',
            border: '1px solid rgba(73,68,84,0.22)',
          }}
        >
          <p className="text-base leading-7" style={{ color: '#d9d4de' }}>
            {message.text}
          </p>
        </div>
        {showEntryChips ? <EntryChips onSend={onChipTap} /> : null}
        {message.uploadPrompt ? (
          <div
            className="mt-3 rounded-2xl border px-3.5 py-3 text-sm leading-6"
            style={{
              background: 'rgba(208,188,255,0.08)',
              borderColor: 'rgba(208,188,255,0.16)',
              color: '#d0bcff',
            }}
          >
            {message.uploadPrompt}
          </div>
        ) : null}
        {message.looks?.map((look) => (
          <GeneratedStyleLookCard key={look.id} look={look} onApprove={onApprove} onReject={onReject} />
        ))}
      </div>
    </div>
  );
}

function StyleUserMessage({ message }: { message: Extract<StyleChatMessage, { role: 'user' }> }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%]">
        <div
          className="rounded-[1.25rem_0.3rem_1.25rem_1.25rem] px-3.5 py-3"
          style={{
            background: 'linear-gradient(135deg, rgba(208,188,255,0.18), rgba(79,219,200,0.12))',
            border: '1px solid rgba(208,188,255,0.22)',
          }}
        >
          <p className="text-base leading-7" style={{ color: '#f4f0fb' }}>
            {message.text}
          </p>
        </div>
        {message.attachments?.length ? (
          <div className="mt-2 grid gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-2xl border px-3 py-2"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(73,68,84,0.2)',
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl"
                  style={{ background: 'var(--surface-high)' }}
                >
                  {attachment.previewUrl ? (
                    <img src={attachment.previewUrl} alt={attachment.label} className="h-full w-full object-cover" />
                  ) : (
                    <MaterialIcon name="checkroom" size={18} className="text-[#cbc3d7]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: '#e5e2e1' }}>
                    {attachment.label}
                  </p>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em]" style={{ color: '#958ea0' }}>
                    {attachment.source === 'outfit' ? 'Saved outfit' : attachment.source === 'wardrobe' ? 'Wardrobe' : 'Upload'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type MobileStyleChatV2Props = {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  eventSession: EventSession;
  generationStatus: GenerationStatus | null;
  composerIntent: StyleChatComposerIntent | null;
  staleLaundryItems: WardrobeItem[];
  onConsumeComposerIntent: (intentId: string) => void;
  onOpenWardrobePicker: () => void;
  onUploadChatAsset: (file: File) => Promise<MediaAsset>;
  onEventSessionChange: (session: EventSession) => void;
  onApproveLook: (payload: {
    title: string;
    vibe: string;
    rationale: string;
    items: WardrobeItem[];
    eventSummary: string;
    coverImageUrl?: string | null;
  }) => Promise<void>;
};

export function MobileStyleChatV2({
  profile,
  wardrobe,
  eventSession,
  generationStatus,
  composerIntent,
  staleLaundryItems,
  onConsumeComposerIntent,
  onOpenWardrobePicker,
  onUploadChatAsset,
  onEventSessionChange,
  onApproveLook,
}: MobileStyleChatV2Props) {
  const [messages, setMessages] = useState<StyleChatMessage[]>(() => readSessionAsChat(profile, eventSession));
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<StyleChatAttachment[]>([]);
  const [typing, setTyping] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [eventSummary, setEventSummary] = useState(eventSession.eventSummary);
  const [composerError, setComposerError] = useState('');
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const seenLaundryNudges = useRef<string>('');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, attachments, typing]);

  useEffect(() => {
    onEventSessionChange({
      eventSummary,
      messages: toSessionMessages(messages),
    });
  }, [eventSummary, messages, onEventSessionChange]);

  useEffect(() => {
    if (!composerIntent) return;

    const nextAttachments =
      composerIntent.kind === 'outfit'
        ? [
            {
              id: `outfit-${composerIntent.id}`,
              source: 'outfit' as const,
              label: composerIntent.label,
              previewUrl: composerIntent.previewUrl,
              itemIds: composerIntent.itemIds,
            },
          ]
        : composerIntent.itemIds
            .map((itemId) => wardrobe.find((item) => item.id === itemId))
            .filter((item): item is WardrobeItem => Boolean(item))
            .map(buildAttachmentFromWardrobeItem);

    setAttachments((current) => mergeAttachments(current, nextAttachments));
    onConsumeComposerIntent(composerIntent.id);
  }, [composerIntent, onConsumeComposerIntent, wardrobe]);

  useEffect(() => {
    const nudgeKey = staleLaundryItems.map((item) => item.id).join('|');
    if (!nudgeKey || seenLaundryNudges.current === nudgeKey) return;

    const labels = staleLaundryItems.slice(0, 2).map((item) => item.name).join(' and ');
    setMessages((current) => [
      ...current,
      {
        id: `laundry-${nudgeKey}`,
        role: 'ai',
        text: `${labels} ${staleLaundryItems.length > 1 ? 'have' : 'has'} been sitting in laundry for a while, so I will keep those out of today's picks until you bring them back.`,
      },
    ]);
    seenLaundryNudges.current = nudgeKey;
  }, [staleLaundryItems]);

  const hasUserMessages = messages.some((message) => message.role === 'user');

  async function handleFiles(files: FileList | null, source: 'gallery' | 'camera') {
    const pickedFiles = Array.from(files ?? []);
    if (pickedFiles.length === 0) return;

    setComposerError('');

    try {
      const nextAttachments = await Promise.all(
        pickedFiles.map(async (file) => {
          const mediaAsset = await onUploadChatAsset(file);
          return {
            id: `upload-${mediaAsset.id}`,
            source,
            label: file.name,
            previewUrl: mediaAsset.previewUrl,
            mediaAssetId: mediaAsset.id,
          } satisfies StyleChatAttachment;
        }),
      );

      setAttachments((current) => mergeAttachments(current, nextAttachments));
      setAttachMenuOpen(false);
    } catch (error) {
      setComposerError(error instanceof Error ? error.message : 'We could not attach that photo.');
    }
  }

  async function resolveSelectedItems(messageAttachments: StyleChatAttachment[]) {
    const selected: WardrobeItem[] = [];
    const photoAttachments = messageAttachments.filter((attachment) => attachment.source === 'camera' || attachment.source === 'gallery');

    for (const attachment of messageAttachments) {
      if (!attachment.itemIds?.length) continue;
      attachment.itemIds.forEach((itemId) => {
        const item = wardrobe.find((wardrobeItem) => wardrobeItem.id === itemId);
        if (item && !item.inLaundry) selected.push(item);
      });
    }

    const identifiedUploads = await Promise.all(
      photoAttachments.map(async (attachment, index) => {
        try {
          const identified = await requestWardrobeIdentification({
            mediaAssetId: attachment.mediaAssetId,
            imageDataUrl: attachment.previewUrl?.startsWith('data:image') ? attachment.previewUrl : undefined,
            fileName: attachment.label,
          });
          return buildIdentifiedUploadItem(attachment, identified, index);
        } catch {
          return buildFallbackUploadItem(attachment, index);
        }
      }),
    );

    return dedupeItems([...selected, ...identifiedUploads]).filter((item) => !item.inLaundry);
  }

  async function sendMessage(nextText?: string) {
    const trimmed = (nextText ?? draft).trim();
    const outgoingAttachments = attachments;
    const userText = trimmed || (outgoingAttachments.length > 0 ? 'Style these pieces.' : '');

    if (!userText && outgoingAttachments.length === 0) return;

    setComposerError('');
    setAttachMenuOpen(false);

    const userMessage: Extract<StyleChatMessage, { role: 'user' }> = {
      id: createId('user'),
      role: 'user',
      text: userText,
      attachments: outgoingAttachments.length ? outgoingAttachments : undefined,
    };

    const history = normalizeStoredMessages(toSessionMessages(messages));

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setAttachments([]);
    setTyping(true);

    try {
      const selectedItems = await resolveSelectedItems(outgoingAttachments);
      const chatPromise = requestEventChat({
        profile,
        selectedItems,
        messages: history,
        userMessage: userText,
      });

      if (selectedItems.length >= 2) {
        const [chatResponse, optionsResponse] = await Promise.all([
          chatPromise,
          requestWardrobeOptions({
            profile,
            selectedItems,
            eventSummary: userText,
            messages: history,
          }),
        ]);

        const looks = optionsResponse.options.map((option) => optionToLook(option, selectedItems, optionsResponse.mode));
        setEventSummary(chatResponse.summary || userText);
        setMessages((current) => [
          ...current,
          {
            id: createId('ai'),
            role: 'ai',
            text: chatResponse.reply,
            looks,
          },
        ]);
      } else {
        const chatResponse = await chatPromise;
        setEventSummary(chatResponse.summary || userText);
        setMessages((current) => [
          ...current,
          {
            id: createId('ai'),
            role: 'ai',
            text: chatResponse.reply,
            uploadPrompt: uploadPromptForCount(selectedItems.length),
          },
        ]);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: createId('ai'),
          role: 'ai',
          text:
            error instanceof Error
              ? `${error.message} I can keep going once you add a few wardrobe pieces or another photo.`
              : 'I lost the thread for a second. Add a few wardrobe pieces and I will rebuild the outfit.',
          uploadPrompt: uploadPromptForCount(0),
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  async function handleApprove(look: GeneratedStyleLook) {
    await onApproveLook({
      title: look.title,
      vibe: look.vibe,
      rationale: look.rationale,
      items: look.items,
      eventSummary: eventSummary || look.eventFit,
      coverImageUrl: look.coverImageUrl,
    });

    setMessages((current) => [
      ...current,
      {
        id: createId('ai'),
        role: 'ai',
        text: `Saved. I will remember ${look.title.toLowerCase()} and reuse that taste signal next time.`,
      },
    ]);
  }

  function handleReject(look: GeneratedStyleLook) {
    const needsMorePieces = look.items.length < 3;
    setMessages((current) => [
      ...current,
      {
        id: createId('ai'),
        role: 'ai',
        text: needsMorePieces
          ? 'I need a little more to work with. Add 2 to 3 more pieces so the next pass feels complete.'
          : 'Tell me what to change and I will tighten the next pass fast.',
        uploadPrompt: needsMorePieces ? uploadPromptForCount(look.items.length) : undefined,
      },
    ]);
  }

  return (
    <div
      className="flex h-[100dvh] min-h-0 flex-col overflow-hidden"
      style={{
        paddingTop: 'calc(var(--mobile-header-height, 3.5rem) + var(--safe-top, 0px) + 0.75rem)',
        paddingBottom: 'calc(var(--tab-bar-height, 5rem) + max(var(--safe-bottom, 0px), 0px) + 1rem)',
        boxSizing: 'border-box',
      }}
    >
      <div className="px-5">
        <div
          className="overflow-hidden rounded-[1.7rem] border px-4 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(19,19,22,0.94), rgba(16,16,18,0.88))',
            borderColor: 'rgba(73,68,84,0.18)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.28)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em]" style={{ color: '#4fdbc8' }}>
                Hero state
              </p>
              <h1
                className="mt-2 text-[1.65rem] font-bold tracking-tight"
                style={{ color: '#f4f0eb', fontFamily: 'var(--font-headline)' }}
              >
                {eventSummary || 'Start with the moment.'}
              </h1>
              <p className="mt-2 text-sm leading-6" style={{ color: '#b9b1c3' }}>
                One conversation. One decision. Your stylist will narrow the outfit without making you configure the app.
              </p>
            </div>
            <SurfaceBadge tone={generationStatus?.connected ? 'live' : 'fallback'}>
              {generationStatus?.connected ? 'Local AI' : 'Fallback'}
            </SurfaceBadge>
          </div>
        </div>
      </div>

      {/* `min-h-0` keeps the scroll region from pushing the composer below the visible phone viewport. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4">
        <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-4">
          {messages.map((message, index) =>
            message.role === 'ai' ? (
              <StyleAiMessage
                key={message.id}
                message={message}
                showEntryChips={index === 0 && !hasUserMessages}
                onChipTap={(label) => {
                  void sendMessage(label);
                }}
                onApprove={(look) => void handleApprove(look)}
                onReject={handleReject}
              />
            ) : (
              <StyleUserMessage key={message.id} message={message} />
            ),
          )}
          {typing ? <TypingBubble /> : null}
          <div ref={endRef} />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex-shrink-0 px-5">
        <div
          className="mx-auto max-w-[42rem] rounded-[1.7rem] border px-4 pb-4 pt-3"
          style={{
            background: 'rgba(32,31,31,0.72)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderColor: 'rgba(73,68,84,0.22)',
          }}
        >
          {attachments.length > 0 ? (
            <div className="mb-3 grid gap-2">
              {attachments.map((attachment) => (
                <AttachmentChip
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={(attachmentId) =>
                    setAttachments((current) => current.filter((item) => item.id !== attachmentId))
                  }
                />
              ))}
            </div>
          ) : null}

          {composerError ? (
            <div
              className="mb-3 rounded-2xl border px-3.5 py-3 text-sm"
              style={{
                background: 'rgba(255,180,171,0.08)',
                borderColor: 'rgba(255,180,171,0.16)',
                color: '#ffb4ab',
              }}
            >
              {composerError}
            </div>
          ) : null}

          <div className="flex items-end gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setAttachMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform active:scale-[0.97]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(73,68,84,0.22)',
                  color: '#d0bcff',
                }}
                aria-label="Add attachment"
              >
                <MaterialIcon name="add" size={22} />
              </button>

              <AnimatePresence>
                {attachMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-[calc(100%+0.75rem)] left-0 z-20 w-[17rem] overflow-hidden rounded-[1.3rem] border"
                    style={{
                      background: 'rgba(20,19,24,0.96)',
                      borderColor: 'rgba(73,68,84,0.24)',
                      boxShadow: '0 22px 48px rgba(0,0,0,0.32)',
                    }}
                  >
                    {[
                      {
                        id: 'wardrobe',
                        title: 'Choose from Wardrobe',
                        detail: 'Attach owned pieces without leaving chat.',
                        icon: 'checkroom',
                        action: () => {
                          setAttachMenuOpen(false);
                          onOpenWardrobePicker();
                        },
                      },
                      {
                        id: 'gallery',
                        title: 'Upload Photo',
                        detail: 'Bring in a fresh wardrobe image from your library.',
                        icon: 'photo_library',
                        action: () => {
                          setAttachMenuOpen(false);
                          galleryInputRef.current?.click();
                        },
                      },
                      {
                        id: 'camera',
                        title: 'Open Camera',
                        detail: 'Snap a piece right now and I will read it.',
                        icon: 'photo_camera',
                        action: () => {
                          setAttachMenuOpen(false);
                          cameraInputRef.current?.click();
                        },
                      },
                    ].map((action, index) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={action.action}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                        style={{
                          borderTop: index === 0 ? 'none' : '1px solid rgba(73,68,84,0.16)',
                        }}
                      >
                        <div
                          className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl"
                          style={{
                            background: action.id === 'camera' ? 'rgba(79,219,200,0.12)' : 'rgba(208,188,255,0.12)',
                            color: action.id === 'camera' ? '#4fdbc8' : '#d0bcff',
                          }}
                        >
                          <MaterialIcon name={action.icon} size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: '#f4f0eb' }}>
                            {action.title}
                          </p>
                          <p className="mt-1 text-xs leading-5" style={{ color: '#958ea0' }}>
                            {action.detail}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <label className="sr-only" htmlFor="style-chat-input">
              Tell WeaR about your plans
            </label>
            <textarea
              id="style-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Tell me about your plans..."
              rows={1}
              className="min-h-[2.75rem] flex-1 resize-none bg-transparent px-1 py-2 text-base outline-none placeholder:text-[#8d8696]"
              style={{ color: '#f4f0eb' }}
            />

            <button
              type="button"
              onClick={() => {
                void sendMessage();
              }}
              disabled={!draft.trim() && attachments.length === 0}
              className="flex h-11 w-11 items-center justify-center rounded-2xl transition-all active:scale-[0.97] disabled:opacity-45"
              style={{
                background: 'linear-gradient(135deg, rgba(208,188,255,0.96), rgba(160,120,255,0.96))',
                boxShadow: '0 12px 26px rgba(160,120,255,0.24)',
                color: '#23005c',
              }}
              aria-label="Send message"
            >
              <MaterialIcon name="north_east" size={22} filled />
            </button>
          </div>

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files, 'gallery');
              event.target.value = '';
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files, 'camera');
              event.target.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
}

function WardrobeStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'danger';
}) {
  return (
    <div
      className="rounded-[1.35rem] border px-4 py-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor:
          tone === 'accent'
            ? 'rgba(79,219,200,0.18)'
            : tone === 'danger'
              ? 'rgba(255,180,171,0.18)'
              : 'rgba(73,68,84,0.18)',
      }}
    >
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#958ea0' }}>
        {label}
      </p>
      <p className="mt-2 text-lg font-bold" style={{ color: '#f5f2ee', fontFamily: 'var(--font-headline)' }}>
        {value}
      </p>
    </div>
  );
}

function WardrobeItemCard({
  item,
  staleLaundry,
  onUse,
  onToggleLaundry,
}: {
  item: WardrobeItem;
  staleLaundry: boolean;
  onUse: () => void;
  onToggleLaundry: (nextValue: boolean) => void;
}) {
  const image = resolveWardrobeImageSrc(item);
  const laundryDays = daysSince(item.laundrySince);

  return (
    <div
      className="overflow-hidden rounded-[1.45rem] border"
      style={{
        background: 'rgba(19,19,19,0.82)',
        borderColor: item.inLaundry ? 'rgba(79,219,200,0.22)' : 'rgba(73,68,84,0.22)',
        opacity: item.inLaundry ? 0.84 : 1,
      }}
    >
      <div className="relative aspect-[0.94/1] overflow-hidden" style={{ background: 'var(--surface-high)' }}>
        {image ? (
          <img src={image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${item.palette ?? 'from-[#26262d] to-[#15151a]'}`} />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.55))]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {item.inLaundry ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em]"
              style={{
                background: 'rgba(79,219,200,0.14)',
                color: '#4fdbc8',
                border: '1px solid rgba(79,219,200,0.2)',
              }}
            >
              <MaterialIcon name="local_laundry_service" size={12} />
              In Laundry
            </span>
          ) : null}
          {staleLaundry ? (
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#ff8b7b] shadow-[0_0_0_6px_rgba(255,139,123,0.16)]" />
          ) : null}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
          <p className="mt-1 text-[0.72rem]" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {item.category} · {item.color}
            {item.inLaundry && laundryDays !== null ? ` · ${laundryDays} day${laundryDays === 1 ? '' : 's'} away` : ''}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        <button
          type="button"
          onClick={onUse}
          className="rounded-full px-3 py-2.5 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{
            minHeight: '2.75rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(73,68,84,0.22)',
            color: '#f5f2ee',
          }}
        >
          Use in chat
        </button>
        <button
          type="button"
          onClick={() => onToggleLaundry(!item.inLaundry)}
          className="rounded-full px-3 py-2.5 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{
            minHeight: '2.75rem',
            background: item.inLaundry ? 'rgba(79,219,200,0.12)' : 'rgba(208,188,255,0.12)',
            border: item.inLaundry ? '1px solid rgba(79,219,200,0.2)' : '1px solid rgba(208,188,255,0.18)',
            color: item.inLaundry ? '#4fdbc8' : '#d0bcff',
          }}
        >
          {item.inLaundry ? 'Back in closet' : 'Move to laundry'}
        </button>
      </div>
    </div>
  );
}

type MobileWardrobeGuideProps = {
  wardrobe: WardrobeItem[];
  outfits: SavedOutfit[];
  mediaAssets: MediaAsset[];
  onOpenChat: () => void;
  onUseWardrobeItems: (itemIds: string[]) => void;
  onUseOutfit: (outfit: SavedOutfit) => void;
  onDeleteOutfit: (outfit: SavedOutfit) => void;
  onUploadNewItem: (file: File) => Promise<void>;
  onCreateFromMedia: (mediaAssetId: string, targetItemId?: string | null) => Promise<void>;
  onToggleLaundry: (itemId: string, nextValue: boolean) => Promise<void>;
};

export function MobileWardrobeGuide({
  wardrobe,
  outfits,
  mediaAssets,
  onOpenChat,
  onUseWardrobeItems,
  onUseOutfit,
  onDeleteOutfit,
  onUploadNewItem,
  onCreateFromMedia,
  onToggleLaundry,
}: MobileWardrobeGuideProps) {
  const [activeTab, setActiveTab] = useState<'items' | 'outfits' | 'laundry'>('items');
  const [uploadError, setUploadError] = useState('');

  const availableItems = useMemo(
    () => wardrobe.filter((item) => !item.inLaundry),
    [wardrobe],
  );

  const reviewQueue = useMemo(
    () => wardrobe.filter((item) => item.detection?.state === 'auto-detected' || item.detection?.state === 'error'),
    [wardrobe],
  );

  const suggestedToday = useMemo(
    () => availableItems.filter((item) => item.status !== 'Occasion').slice(0, 4),
    [availableItems],
  );

  const notWornRecently = useMemo(
    () =>
      availableItems
        .slice()
        .sort((left, right) => (Date.parse(left.lastWornAt ?? '1970-01-01') || 0) - (Date.parse(right.lastWornAt ?? '1970-01-01') || 0))
        .slice(0, 6),
    [availableItems],
  );

  const inLaundryItems = useMemo(
    () => wardrobe.filter((item) => item.inLaundry),
    [wardrobe],
  );

  const frequentItems = useMemo(
    () => availableItems.filter((item) => item.status === 'Repeat').slice(0, 4),
    [availableItems],
  );

  return (
    <div
      className="min-h-[100dvh] pb-tab-bar"
      style={{
        paddingTop: 'calc(var(--mobile-header-height, 3.5rem) + var(--safe-top, 0px) + 0.75rem)',
        paddingBottom: 'calc(var(--tab-bar-height, 5rem) + max(var(--safe-bottom, 0px), 0px) + 1rem)',
      }}
    >
      <div className="space-y-5 px-5">
        <div
          className="overflow-hidden rounded-[1.7rem] border px-4 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(19,19,22,0.94), rgba(16,16,18,0.88))',
            borderColor: 'rgba(73,68,84,0.18)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em]" style={{ color: '#d0bcff' }}>
                Decision support
              </p>
              <h1
                className="mt-2 text-[1.6rem] font-bold tracking-tight"
                style={{ color: '#f4f0eb', fontFamily: 'var(--font-headline)' }}
              >
                Wardrobe, not warehouse.
              </h1>
              <p className="mt-2 text-sm leading-6" style={{ color: '#b9b1c3' }}>
                Keep your best pieces close, your reusable outfits ready, and anything in laundry out of the AI path.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenChat}
              className="flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#10211f] transition-transform active:scale-[0.98]"
              style={{
                minHeight: '2.75rem',
                background: 'linear-gradient(135deg, #4fdbc8 0%, #8ff3ea 100%)',
              }}
            >
              <MaterialIcon name="auto_awesome" size={16} />
              Chat now
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <WardrobeStat label="Available" value={String(availableItems.length)} tone="accent" />
            <WardrobeStat label="Outfits" value={String(outfits.length)} />
            <WardrobeStat label="Laundry" value={String(inLaundryItems.length)} tone={inLaundryItems.length ? 'danger' : 'default'} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-full border p-1" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(73,68,84,0.18)' }}>
          {(['items', 'outfits', 'laundry'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="rounded-full px-3 py-2.5 text-sm font-semibold capitalize transition-all"
                style={{
                  minHeight: '2.75rem',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: active ? '#f5f2ee' : '#958ea0',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === 'items' ? (
          <div className="space-y-5">
            {reviewQueue.length > 0 ? (
              <div
                className="rounded-[1.45rem] border px-4 py-4"
                style={{
                  background: 'rgba(255,180,171,0.06)',
                  borderColor: 'rgba(255,180,171,0.16)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#ffb4ab' }}>
                      Review queue
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: '#f4f0eb' }}>
                      {reviewQueue.length} piece{reviewQueue.length === 1 ? '' : 's'} still need confirmation before they become reliable AI picks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const firstPending = reviewQueue[0];
                      if (!firstPending?.mediaAssetId) return;
                      void onCreateFromMedia(firstPending.mediaAssetId, firstPending.id);
                    }}
                    className="rounded-full px-4 py-2 text-sm font-semibold transition-transform active:scale-[0.98]"
                    style={{
                      minHeight: '2.75rem',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#ffb4ab',
                      border: '1px solid rgba(255,180,171,0.16)',
                    }}
                  >
                    Review first
                  </button>
                </div>
              </div>
            ) : null}

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#4fdbc8' }}>
                    Suggested today
                  </p>
                  <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>
                    The strongest ready-to-use pieces right now.
                  </p>
                </div>
                <label
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    minHeight: '2.75rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(73,68,84,0.22)',
                    color: '#f5f2ee',
                  }}
                >
                  <MaterialIcon name="add" size={16} />
                  Add piece
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      try {
                        setUploadError('');
                        await onUploadNewItem(file);
                      } catch (error) {
                        setUploadError(error instanceof Error ? error.message : 'Upload failed.');
                      }
                      event.target.value = '';
                    }}
                  />
                </label>
              </div>

              {uploadError ? (
                <div
                  className="mb-3 rounded-2xl border px-3.5 py-3 text-sm"
                  style={{
                    background: 'rgba(255,180,171,0.08)',
                    borderColor: 'rgba(255,180,171,0.16)',
                    color: '#ffb4ab',
                  }}
                >
                  {uploadError}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                {suggestedToday.map((item) => (
                  <WardrobeItemCard
                    key={item.id}
                    item={item}
                    staleLaundry={false}
                    onUse={() => {
                      onUseWardrobeItems([item.id]);
                      onOpenChat();
                    }}
                    onToggleLaundry={(nextValue) => {
                      void onToggleLaundry(item.id, nextValue);
                    }}
                  />
                ))}
              </div>
            </section>

            {frequentItems.length > 0 ? (
              <section>
                <div className="mb-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#d0bcff' }}>
                    Frequently used
                  </p>
                  <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>
                    Reliable anchors when you need a fast decision.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {frequentItems.map((item) => (
                    <WardrobeItemCard
                      key={item.id}
                      item={item}
                      staleLaundry={false}
                      onUse={() => {
                        onUseWardrobeItems([item.id]);
                        onOpenChat();
                      }}
                      onToggleLaundry={(nextValue) => {
                        void onToggleLaundry(item.id, nextValue);
                      }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {mediaAssets.length > 0 ? (
              <section>
                <div className="mb-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#4fdbc8' }}>
                    Recent uploads
                  </p>
                  <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>
                    Turn uploaded photos into wardrobe pieces when you are ready.
                  </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {mediaAssets.slice(0, 6).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        void onCreateFromMedia(asset.id);
                      }}
                      className="min-w-[6.75rem] overflow-hidden rounded-[1.3rem] border text-left transition-transform active:scale-[0.98]"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(73,68,84,0.2)',
                      }}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img src={asset.previewUrl} alt={asset.fileName} className="h-full w-full object-cover" />
                      </div>
                      <div className="px-3 py-2">
                        <p className="truncate text-xs font-semibold" style={{ color: '#f5f2ee' }}>
                          {asset.fileName}
                        </p>
                        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.2em]" style={{ color: '#958ea0' }}>
                          Review
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {notWornRecently.length > 0 ? (
              <section>
                <div className="mb-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#d0bcff' }}>
                    Not worn recently
                  </p>
                  <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>
                    Quiet options to rotate back into the mix.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {notWornRecently.map((item) => (
                    <WardrobeItemCard
                      key={item.id}
                      item={item}
                      staleLaundry={false}
                      onUse={() => {
                        onUseWardrobeItems([item.id]);
                        onOpenChat();
                      }}
                      onToggleLaundry={(nextValue) => {
                        void onToggleLaundry(item.id, nextValue);
                      }}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'outfits' ? (
          <div className="space-y-4">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#4fdbc8' }}>
                Saved outfits
              </p>
              <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>
                Reuse what already worked and send it back into chat as one grouped attachment.
              </p>
            </div>
            <OutfitsGrid
              outfits={outfits}
              wardrobe={wardrobe}
              onUseInChat={(outfit) => {
                onUseOutfit(outfit);
                onOpenChat();
              }}
              onDelete={onDeleteOutfit}
            />
          </div>
        ) : null}

        {activeTab === 'laundry' ? (
          <div className="space-y-4">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em]" style={{ color: '#ffb4ab' }}>
                Laundry hold
              </p>
              <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>
                Anything marked here stays out of AI picks until you bring it back.
              </p>
            </div>
            {inLaundryItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {inLaundryItems.map((item) => (
                  <WardrobeItemCard
                    key={item.id}
                    item={item}
                    staleLaundry={(daysSince(item.laundrySince) ?? 0) > 7}
                    onUse={() => {
                      onUseWardrobeItems([item.id]);
                      onOpenChat();
                    }}
                    onToggleLaundry={(nextValue) => {
                      void onToggleLaundry(item.id, nextValue);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="rounded-[1.45rem] border px-5 py-8 text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(73,68,84,0.18)',
                }}
              >
                <MaterialIcon name="local_laundry_service" size={30} className="mb-3 text-[#4fdbc8]" />
                <p className="text-base font-semibold" style={{ color: '#f5f2ee' }}>
                  Nothing is in laundry right now.
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: '#958ea0' }}>
                  Mark pieces here whenever they leave the closet so the stylist does not recommend them by mistake.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
