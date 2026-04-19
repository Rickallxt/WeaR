import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { startTransition, useEffect, useRef, useState } from 'react';
import type { MediaAsset, UserProfile, WardrobeItem } from '../../data/wearData';
import type {
  EventChatMessage,
  GeneratedWardrobeImage,
  GeneratedWardrobeOption,
  GenerationStatus,
} from '../../lib/generationApi';
import type { EventSession } from '../../lib/persistence';

type ChatEntry = EventChatMessage & { mode?: 'local' | 'demo' };
type FlowPhase = 'event' | 'wardrobe';

import {
  requestEventChat,
  requestWardrobeImage,
  requestWardrobeOptions,
} from '../../lib/generationApi';
import { Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { DemoWardrobeRack } from '../DemoWardrobeRack';

const INITIAL_MESSAGE: ChatEntry = {
  role: 'assistant',
  content: "Hey — what's the plan? Tell me about the occasion: vibe, dress code, weather, how dressed up you need to be.",
};

const QUICK_CHIPS = [
  'Work meeting',
  'Date night',
  'Rooftop dinner',
  'Wedding guest',
  'Weekend brunch',
  'Smart casual out',
  'Black tie event',
  'Travel day',
];

function buildDemoOptions(selectedItems: WardrobeItem[]) {
  const count = selectedItems.length;
  const optionCount = count <= 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3;

  return Array.from({ length: optionCount }, (_, index) => {
    const rotating = selectedItems.slice(index).concat(selectedItems.slice(0, index)).slice(0, Math.min(4, count));

    return {
      id: `demo-${index + 1}`,
      title: ['Event-ready edit', 'Sharper alternate', 'Relaxed fallback'][index] ?? `Option ${index + 1}`,
      vibe: ['Clean and polished', 'More dressed', 'More relaxed'][index] ?? 'Balanced',
      rationale:
        index === 0
          ? 'Uses the strongest pieces first and keeps the silhouette clean for the event context.'
          : index === 1
            ? 'Turns the same wardrobe into a sharper option with more structure and contrast.'
            : 'Keeps the look wearable and comfortable while staying aligned with the event.',
      itemIds: rotating.map((item) => item.id),
      eventFit: 'Built from selected wardrobe photos and event context.',
    } satisfies GeneratedWardrobeOption;
  });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span
        className="h-2 w-2 rounded-full bg-[var(--muted)] opacity-50 [animation:bounce_1.2s_ease-in-out_infinite]"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="h-2 w-2 rounded-full bg-[var(--muted)] opacity-50 [animation:bounce_1.2s_ease-in-out_infinite]"
        style={{ animationDelay: '200ms' }}
      />
      <span
        className="h-2 w-2 rounded-full bg-[var(--muted)] opacity-50 [animation:bounce_1.2s_ease-in-out_infinite]"
        style={{ animationDelay: '400ms' }}
      />
    </div>
  );
}

export function GenerateScreen({
  profile,
  wardrobe,
  exampleItems,
  status,
  mediaAssets = [],
  initialEventSession,
  onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems,
  onEventSessionChange,
  onCreateFromMedia,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  exampleItems: WardrobeItem[];
  status: GenerationStatus | null;
  mediaAssets?: MediaAsset[];
  initialEventSession?: EventSession;
  onUploadPhoto: (itemId: string, file: File) => Promise<void>;
  onUploadNewItem: (file: File) => Promise<void>;
  onAddExampleItems: (itemIds: string[]) => void;
  onEventSessionChange?: (session: EventSession) => void;
  onCreateFromMedia?: (mediaAssetId: string, targetItemId?: string | null) => Promise<void>;
}) {
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<FlowPhase>(() =>
    (initialEventSession?.messages.length ?? 0) > 1 ? 'wardrobe' : 'event',
  );
  const [step, setStep] = useState<'select' | 'options' | 'result'>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exampleSelection, setExampleSelection] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>(
    (initialEventSession?.messages as ChatEntry[] | undefined) ?? [INITIAL_MESSAGE],
  );
  const [optionsMode, setOptionsMode] = useState<'local' | 'demo' | null>(null);
  const [eventSummary, setEventSummary] = useState(initialEventSession?.eventSummary ?? '');
  const [options, setOptions] = useState<GeneratedWardrobeOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedWardrobeImage | null>(null);
  const [loadingAction, setLoadingAction] = useState<'chat' | 'options' | 'image' | null>(null);
  const [error, setError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const uploadedItems = wardrobe.filter((item) => Boolean(item.imageDataUrl));
  const pendingItems = wardrobe.filter((item) => !item.imageDataUrl);
  const selectedItems = wardrobe.filter((item) => selectedIds.includes(item.id));
  const existingIds = wardrobe.map((item) => item.id);
  const selectedOption = options.find((item) => item.id === selectedOptionId) ?? null;
  const hasEventContext = messages.length > 1;

  // Keep a ref so the session-save effect never needs the callback in its dep array
  const onEventSessionChangeRef = useRef(onEventSessionChange);
  onEventSessionChangeRef.current = onEventSessionChange;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingAction]);

  useEffect(() => {
    onEventSessionChangeRef.current?.({ messages, eventSummary });
  }, [messages, eventSummary]);

  useEffect(() => {
    if (selectedItems.length === 0 && step !== 'select') {
      resetGenerationFlow();
    }
  }, [selectedItems.length, step]);

  // Auto-focus textarea when phase changes to event
  useEffect(() => {
    if (phase === 'event') {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [phase]);

  function resetGenerationFlow(nextStep: 'select' | 'options' | 'result' = 'select') {
    setOptions([]);
    setSelectedOptionId('');
    setGeneratedImage(null);
    setStep(nextStep);
  }

  function handleClearSession() {
    onEventSessionChange?.({ messages: [INITIAL_MESSAGE], eventSummary: '' });
    setMessages([INITIAL_MESSAGE]);
    setEventSummary('');
    resetGenerationFlow();
    setError('');
    setPhase('event');
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function handleSendChat(overrideInput?: string) {
    const trimmed = (overrideInput ?? chatInput).trim();
    if (!trimmed || loadingAction !== null) return;

    const nextMessages: ChatEntry[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setChatInput('');
    setLoadingAction('chat');
    setError('');

    try {
      const response = await requestEventChat({
        profile,
        selectedItems,
        messages,
        userMessage: trimmed,
      });

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.reply, mode: response.mode },
      ]);
      setEventSummary(response.summary);
    } catch {
      const fallbackReply =
        "Got it — I'll keep that in mind when building options. Now let's pick which pieces you're working with.";
      setMessages((current) => [...current, { role: 'assistant', content: fallbackReply }]);
      setEventSummary(trimmed);
    } finally {
      setLoadingAction(null);
    }
  }

  function handleChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  }

  function handleChipClick(chip: string) {
    setChatInput(chip);
    handleSendChat(chip);
  }

  async function handleBuildOptions() {
    if (selectedItems.length === 0) {
      setError('Select at least one wardrobe piece first.');
      return;
    }

    setLoadingAction('options');
    setError('');

    try {
      const response = await requestWardrobeOptions({
        profile,
        selectedItems,
        eventSummary,
        messages,
      });

      const nextOptions = response.options.length > 0 ? response.options : buildDemoOptions(selectedItems);
      setOptions(nextOptions);
      setOptionsMode(response.mode);
      setSelectedOptionId(nextOptions[0]?.id ?? '');
      startTransition(() => setStep(nextOptions.length > 0 ? 'options' : 'select'));
    } catch {
      const fallback = buildDemoOptions(selectedItems);
      setOptions(fallback);
      setSelectedOptionId(fallback[0]?.id ?? '');
      startTransition(() => setStep(fallback.length > 0 ? 'options' : 'select'));
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleGenerateImage() {
    if (!selectedOption) {
      setError('Choose an outfit option first.');
      return;
    }

    setLoadingAction('image');
    setGeneratedImage(null);
    setError('');

    try {
      const response = await requestWardrobeImage({
        profile,
        selectedItems,
        option: selectedOption,
        eventSummary,
      });

      setGeneratedImage(response);
      startTransition(() => setStep('result'));
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'Unable to generate the outfit image right now.');
    } finally {
      setLoadingAction(null);
    }
  }

  function toggleSelection(itemId: string) {
    resetGenerationFlow();
    setSelectedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  function toggleExampleSelection(itemId: string) {
    setExampleSelection((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  function handleAddSelectedExamples() {
    const nextIds = exampleSelection.filter((itemId) => !existingIds.includes(itemId));
    if (nextIds.length === 0) return;
    onAddExampleItems(nextIds);
    setSelectedIds((current) => Array.from(new Set([...current, ...nextIds])));
    setExampleSelection([]);
    setError('');
  }

  async function handleItemUpload(itemId: string, file: File) {
    setError('');
    try {
      await onUploadPhoto(itemId, file);
      resetGenerationFlow();
      setSelectedIds((current) => (current.includes(itemId) ? current : [...current, itemId]));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload that wardrobe photo.');
    }
  }

  async function handleNewUpload(file: File) {
    setError('');
    try {
      await onUploadNewItem(file);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to analyze that uploaded piece.');
    }
  }

  // ── Phase 1: Event intake ────────────────────────────────────────────────
  if (phase === 'event') {
    return (
      <motion.div
        key="event-phase"
        initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex min-h-[80dvh] flex-col items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-[640px]">
          {/* Header */}
          <div className="mb-10 text-center">
            <p className="section-kicker mb-5">WeaR styling</p>
            <h1 className="font-display text-[clamp(1.8rem,7vw,2.618rem)] leading-[0.96] tracking-[-0.05em] text-[var(--text)] xl:text-[4.236rem]">
              What&apos;s the occasion?
            </h1>
            <p className="mt-5 text-[1.1rem] leading-[1.618] text-[var(--muted)]">
              Tell me where you&apos;re headed — I&apos;ll figure out the wardrobe.
            </p>
          </div>

          {/* Chat thread (only visible after first exchange) */}
          <AnimatePresence>
            {messages.length > 1 ? (
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                animate={reduceMotion ? undefined : { opacity: 1, height: 'auto' }}
                className="mb-5 space-y-3 overflow-hidden rounded-[24px] p-5 shadow-[0_18px_50px_rgba(17,18,23,0.08)] backdrop-blur-2xl"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}
              >
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--text)] text-[0.6rem] font-bold tracking-wider text-white">
                        W
                      </div>
                    ) : null}
                    <div
                      className={`max-w-[82%] rounded-[18px] px-4 py-3 text-[0.95rem] leading-[1.65] ${
                        message.role === 'assistant'
                          ? 'text-[var(--text)]'
                          : 'bg-[var(--text)] text-white'
                      }`}
                      style={message.role === 'assistant' ? { background: 'var(--surface-high)' } : undefined}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {loadingAction === 'chat' ? (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--text)] text-[0.6rem] font-bold tracking-wider text-white">
                      W
                    </div>
                    <div className="rounded-[18px] px-4" style={{ background: 'var(--surface-high)' }}>
                      <TypingDots />
                    </div>
                  </div>
                ) : null}

                <div ref={chatEndRef} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Input box */}
          <Panel className="p-4" variant="glass">
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              rows={3}
              placeholder="e.g. Rooftop dinner, warm evening, smart casual — want to look sharp but not overdressed"
              className="w-full resize-none bg-transparent text-[1rem] leading-[1.7] text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[0.75rem] text-[var(--muted)]">Enter to send · Shift+Enter for new line</p>
              <button
                type="button"
                onClick={() => handleSendChat()}
                disabled={chatInput.trim().length === 0 || loadingAction !== null}
                className="button-primary px-5 py-2.5 text-[0.9rem]"
              >
                {loadingAction === 'chat' ? 'Thinking…' : 'Send'}
              </button>
            </div>
          </Panel>

          {/* Quick chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                disabled={loadingAction !== null}
                className="rounded-full border border-[rgba(24,24,29,0.09)] px-4 py-2 text-[0.85rem] text-[var(--text)] shadow-[0_8px_22px_rgba(17,18,23,0.05)] backdrop-blur-xl transition duration-200 hover:-translate-y-[2px] disabled:opacity-50"
                style={{ background: 'var(--surface)' }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Continue to wardrobe CTA (appears after first exchange) */}
          <AnimatePresence>
            {hasEventContext && loadingAction === null ? (
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="mt-8 flex flex-col items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => setPhase('wardrobe')}
                  className="button-primary px-8 py-3.5 text-[1rem]"
                >
                  Pick your pieces →
                </button>
                <p className="text-[0.78rem] text-[var(--muted)]">
                  You can keep chatting from the next screen too
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // ── Phase 2: Wardrobe generation ─────────────────────────────────────────
  return (
    <motion.div
      key="wardrobe-phase"
      initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8"
    >
      {/* Page header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <SectionKicker>Generate</SectionKicker>
          <h1 className="mt-4 font-display text-[clamp(1.8rem,7vw,2.618rem)] leading-[0.96] tracking-[-0.06em] text-[var(--text)] xl:text-[4.236rem]">
            Choose your pieces.
          </h1>
          {eventSummary ? (
            <p className="mt-4 max-w-[44rem] text-[1rem] leading-[1.75] text-[var(--muted)]">
              Event: {eventSummary}
            </p>
          ) : (
            <p className="mt-4 max-w-[44rem] text-[1rem] leading-[1.75] text-[var(--muted)]">
              Select pieces from your wardrobe and WeaR will build outfit options tailored to your event.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Step indicators */}
          {(['select', 'options', 'result'] as const).map((s, i) => (
            <SurfaceBadge key={s} tone={step === s ? 'accent' : 'default'}>
              {i + 1}. {s === 'select' ? 'Pieces' : s === 'options' ? 'Options' : 'Look'}
            </SurfaceBadge>
          ))}
          <SurfaceBadge tone={status?.connected ? 'live' : 'fallback'}>
            {status?.connected ? 'AI live' : 'Demo mode'}
          </SurfaceBadge>
        </div>
      </div>

      {error ? (
        <Panel className="px-5 py-4" variant="solid">
          <p className="text-[0.9rem] text-[var(--text)]">{error}</p>
        </Panel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* ── Left: wardrobe + steps ──────────────────────────────────── */}
        <div className="space-y-6">

          {/* Step 1: Select wardrobe */}
          <Panel className="p-6 xl:p-8" variant="glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionKicker>Step 1 — Your pieces</SectionKicker>
                <p className="mt-3 text-[1.618rem] leading-[1.2] tracking-[-0.03em] text-[var(--text)]">
                  Which items are you working with?
                </p>
              </div>
              <button
                type="button"
                onClick={handleBuildOptions}
                disabled={selectedItems.length === 0 || loadingAction !== null}
                className="button-primary text-[0.9rem]"
              >
                {loadingAction === 'options' ? 'Building…' : `Build options${selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}`}
              </button>
            </div>

            {uploadedItems.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-[rgba(24,24,29,0.12)] px-6 py-8" style={{ background: 'var(--surface)' }}>
                <p className="text-[1rem] text-[var(--text)]">No wardrobe photos yet.</p>
                <p className="mt-2 max-w-[34rem] text-[0.9rem] leading-[1.7] text-[var(--muted)]">
                  Upload photos of your pieces below, or add example items to try the flow.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-[0.75rem] uppercase tracking-[0.22em] text-[var(--muted-strong)]">Your wardrobe</p>
                  <SurfaceBadge tone="accent-soft">{uploadedItems.length} ready</SurfaceBadge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {uploadedItems.map((item) => {
                    const selected = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-[24px] border transition duration-200 ${
                          selected
                            ? 'border-[rgba(152,161,255,0.4)] bg-[rgba(152,161,255,0.06)] shadow-[0_0_0_3px_rgba(152,161,255,0.18)]'
                            : 'border-[rgba(41,44,53,0.08)]'
                        }`}
                        style={selected ? undefined : { background: 'var(--surface-strong)' }}
                      >
                        <button type="button" onClick={() => toggleSelection(item.id)} className="w-full p-4 text-left">
                          <div className="overflow-hidden rounded-[18px]">
                            <WardrobeMosaic items={[item]} label={selected ? 'Selected ✓' : 'Tap to select'} />
                          </div>
                          <div className="mt-3">
                            <p className="text-[0.97rem] font-medium text-[var(--text)]">{item.name}</p>
                            <p className="mt-1 text-[0.82rem] text-[var(--muted)]">{item.category} · {item.fit}</p>
                          </div>
                        </button>
                        <div className="px-4 pb-4">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(24,24,29,0.08)] px-4 py-2 text-[0.8rem] text-[var(--muted)] transition duration-200" style={{ background: 'var(--surface-high)' }}>
                            Replace photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                await handleItemUpload(item.id, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload new + pending */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[0.75rem] uppercase tracking-[0.22em] text-[var(--muted-strong)]">Add pieces</p>
                {pendingItems.length > 0 ? (
                  <SurfaceBadge>{pendingItems.length} waiting for photos</SurfaceBadge>
                ) : null}
              </div>
              <div className="rounded-[22px] border border-[rgba(24,24,29,0.07)] p-5" style={{ background: 'var(--surface)' }}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-[0.97rem] text-[var(--text)]">Upload a new piece</p>
                    <p className="mt-1.5 text-[0.85rem] leading-[1.65] text-[var(--muted)]">
                      WeaR auto-identifies it and opens a review step before saving.
                    </p>
                  </div>
                  <label className="button-secondary cursor-pointer text-[0.9rem]">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleNewUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {pendingItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-[rgba(41,44,53,0.08)] p-4"
                      style={{ background: 'var(--surface-strong)' }}
                    >
                      <WardrobeMosaic items={[item]} label="Awaiting photo" />
                      <div className="mt-3">
                        <p className="text-[0.97rem] text-[var(--text)]">{item.name}</p>
                        <p className="mt-1 text-[0.82rem] text-[var(--muted)]">{item.category}</p>
                      </div>
                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(24,24,29,0.08)] px-4 py-2 text-[0.8rem] text-[var(--muted)] transition duration-200" style={{ background: 'var(--surface-high)' }}>
                        Upload photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            await handleItemUpload(item.id, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Canva-style attachment tray — reopen uploaded photos without re-uploading */}
            {mediaAssets.length > 0 ? (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[0.75rem] uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                    Attachment library
                  </p>
                  <SurfaceBadge tone="accent-soft">{mediaAssets.length} ready</SurfaceBadge>
                </div>
                <div className="flex gap-3 overflow-x-auto rounded-[18px] border border-[rgba(24,24,29,0.07)] p-3" style={{ background: 'var(--surface)' }}>
                  {mediaAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => onCreateFromMedia?.(asset.id)}
                      className="group relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[14px] bg-[var(--surface)] transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(17,18,23,0.12)]"
                      style={{ border: '1px solid var(--line)' }}
                      title={asset.fileName}
                    >
                      <img src={asset.previewUrl} alt={asset.fileName} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center rounded-[14px] bg-[rgba(17,18,23,0)] transition duration-200 group-hover:bg-[rgba(17,18,23,0.18)]">
                        <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-white opacity-0 transition duration-200 group-hover:opacity-100">
                          Add
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">Tap a photo to add it as a new wardrobe piece</p>
              </div>
            ) : null}

            <div className="mt-6">
              <DemoWardrobeRack
                items={exampleItems}
                selectedIds={exampleSelection}
                existingIds={existingIds}
                onToggle={toggleExampleSelection}
                onAddSelected={handleAddSelectedExamples}
                compact
              />
            </div>
          </Panel>

          {/* Step 2: Options */}
          <AnimatePresence>
            {step !== 'select' ? (
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Panel className="p-6 xl:p-8" variant="soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <SectionKicker>Step 2 — Options</SectionKicker>
                      <p className="mt-3 text-[1.5rem] leading-tight tracking-[-0.03em] text-[var(--text)]">
                        Which path feels right?
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {optionsMode ? (
                        <SurfaceBadge tone={optionsMode === 'local' ? 'accent' : 'default'}>
                          {optionsMode === 'local' ? 'AI options' : 'Demo options'}
                        </SurfaceBadge>
                      ) : null}
                      <button type="button" onClick={() => resetGenerationFlow()} className="button-secondary text-[0.9rem]">
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={!selectedOption || loadingAction !== null}
                        className="button-primary text-[0.9rem]"
                      >
                        {loadingAction === 'image' ? 'Generating…' : 'Generate look'}
                      </button>
                    </div>
                  </div>

                  {options.length === 0 ? (
                    <div className="mt-6 rounded-[22px] border border-dashed border-[rgba(24,24,29,0.12)] px-5 py-6 text-[0.9rem] leading-[1.7] text-[var(--muted)]" style={{ background: 'var(--surface)' }}>
                      Couldn't build options. Add more pieces or refine your event context and try again.
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 xl:grid-cols-3">
                      {options.map((option) => {
                        const optionItems = wardrobe.filter((item) => option.itemIds.includes(item.id));
                        const active = selectedOptionId === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedOptionId(option.id)}
                            className="text-left"
                          >
                            <Panel
                              className={`h-full p-4 transition duration-200 ${active ? 'ring-2 ring-[rgba(152,161,255,0.4)]' : ''}`}
                              variant={active ? 'glass' : 'solid'}
                            >
                              <WardrobeMosaic items={optionItems} label={option.vibe} />
                              <p className="mt-4 text-[0.97rem] font-medium text-[var(--text)]">{option.title}</p>
                              <p className="mt-2 text-[0.85rem] leading-[1.6] text-[var(--muted)]">{option.rationale}</p>
                            </Panel>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Step 3: Generated look */}
          <AnimatePresence>
            {step === 'result' && generatedImage ? (
              <motion.div
                initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Panel className="p-6 xl:p-8" variant="glass">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <SectionKicker>Step 3 — The look</SectionKicker>
                      <p className="mt-3 text-[1.5rem] leading-tight tracking-[-0.03em] text-[var(--text)]">
                        Your outfit for {eventSummary || 'the occasion'}.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep('options')} className="button-secondary text-[0.9rem]">
                        Back
                      </button>
                      <SurfaceBadge tone="accent">
                        {generatedImage.mode === 'local' ? 'Local render' : 'Preview'}
                      </SurfaceBadge>
                    </div>
                  </div>
                  <div className="mt-6 overflow-hidden rounded-[26px] p-3" style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}>
                    <img
                      src={generatedImage.imageDataUrl}
                      alt="Generated WeaR outfit"
                      className="h-[36rem] w-full rounded-[20px] object-cover"
                    />
                  </div>
                  {generatedImage.revisedPrompt ? (
                    <p className="mt-4 text-[0.85rem] leading-[1.6] text-[var(--muted)]">{generatedImage.revisedPrompt}</p>
                  ) : null}
                </Panel>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ── Right: event chat ────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Chat panel */}
          <Panel className="flex flex-col p-6" variant="solid">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionKicker>Event context</SectionKicker>
                <p className="mt-3 text-[1.2rem] leading-tight tracking-[-0.02em] text-[var(--text)]">
                  {hasEventContext ? 'Locked in.' : "Tell me where you're going."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSession}
                  className="rounded-full border border-[rgba(24,24,29,0.08)] px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.2em] text-[var(--muted-strong)] transition duration-200"
                  style={{ background: 'var(--surface)' }}
                >
                  New event
                </button>
              </div>
            </div>

            {/* Message thread */}
            <div className="mt-5 max-h-[24rem] min-h-[6rem] space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' ? (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--text)] text-[0.55rem] font-bold tracking-wider text-white">
                      W
                    </div>
                  ) : null}
                  <div
                    className={`max-w-[84%] rounded-[16px] px-4 py-2.5 text-[0.9rem] leading-[1.6] ${
                      message.role === 'assistant'
                        ? 'text-[var(--text)]'
                        : 'bg-[var(--text)] text-white'
                    }`}
                    style={message.role === 'assistant' ? { background: 'var(--surface-high)' } : undefined}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loadingAction === 'chat' ? (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--text)] text-[0.55rem] font-bold tracking-wider text-white">
                    W
                  </div>
                  <div className="rounded-[16px] px-4" style={{ background: 'var(--surface-high)' }}>
                    <TypingDots />
                  </div>
                </div>
              ) : null}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="mt-4 space-y-2.5">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                rows={2}
                placeholder="Add more context — temperature, formality, specific constraints…"
                className="w-full resize-none rounded-[18px] border border-[rgba(24,24,29,0.08)] px-4 py-3 text-[0.9rem] text-[var(--text)] outline-none transition duration-200 placeholder:text-[var(--muted)] focus:border-[rgba(152,161,255,0.5)]"
                style={{ background: 'var(--surface-strong)' }}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.72rem] text-[var(--muted)]">Enter · Shift+Enter for newline</p>
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  disabled={chatInput.trim().length === 0 || loadingAction !== null}
                  className="button-primary text-[0.85rem] px-4 py-2"
                >
                  {loadingAction === 'chat' ? 'Thinking…' : 'Send'}
                </button>
              </div>
            </div>
          </Panel>

          {/* Active context summary */}
          {eventSummary ? (
            <Panel className="p-5" variant="soft">
              <SectionKicker>Active event</SectionKicker>
              <p className="mt-3 text-[0.95rem] leading-[1.7] text-[var(--text)]">{eventSummary}</p>
              {selectedItems.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <SurfaceBadge key={item.id}>{item.name}</SurfaceBadge>
                  ))}
                </div>
              ) : null}
            </Panel>
          ) : null}

          {/* Model info */}
          <Panel className="p-5" variant="soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <SectionKicker>Backend</SectionKicker>
                <p className="mt-2 text-[0.9rem] text-[var(--text)]">
                  {status?.connected ? 'Local AI connected' : 'Demo mode active'}
                </p>
              </div>
              <SurfaceBadge tone={status?.connected ? 'live' : 'fallback'}>
                {status?.textModel ?? 'Checking…'}
              </SurfaceBadge>
            </div>
          </Panel>
        </div>
      </div>
    </motion.div>
  );
}
