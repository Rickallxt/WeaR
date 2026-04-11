import { startTransition, useEffect, useState } from 'react';
import type { UserProfile, WardrobeItem } from '../../data/wearData';
import type {
  EventChatMessage,
  GeneratedWardrobeImage,
  GeneratedWardrobeOption,
  GenerationStatus,
} from '../../lib/generationApi';
import {
  requestEventChat,
  requestWardrobeImage,
  requestWardrobeOptions,
} from '../../lib/generationApi';
import { Panel, SectionKicker, SurfaceBadge, WardrobeMosaic } from '../Chrome';
import { DemoWardrobeRack } from '../DemoWardrobeRack';

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

function stepLabel(step: 'select' | 'options' | 'result') {
  return {
    select: 'Select wardrobe photos',
    options: 'Pick the strongest outfit path',
    result: 'Review the composed look',
  }[step];
}

export function GenerateScreen({
  profile,
  wardrobe,
  exampleItems,
  status,
  onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  exampleItems: WardrobeItem[];
  status: GenerationStatus | null;
  onUploadPhoto: (itemId: string, file: File) => Promise<void>;
  onUploadNewItem: (file: File) => Promise<void>;
  onAddExampleItems: (itemIds: string[]) => void;
}) {
  const [step, setStep] = useState<'select' | 'options' | 'result'>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exampleSelection, setExampleSelection] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<EventChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Tell me about the event, dress code, weather, and the feeling you want. I'll use that context to sharpen wardrobe-only recommendations.",
    },
  ]);
  const [eventSummary, setEventSummary] = useState('No event context added yet.');
  const [options, setOptions] = useState<GeneratedWardrobeOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedWardrobeImage | null>(null);
  const [loadingAction, setLoadingAction] = useState<'chat' | 'options' | 'image' | null>(null);
  const [error, setError] = useState('');

  const uploadedItems = wardrobe.filter((item) => Boolean(item.imageDataUrl));
  const pendingItems = wardrobe.filter((item) => !item.imageDataUrl);
  const selectedItems = wardrobe.filter((item) => selectedIds.includes(item.id));
  const existingIds = wardrobe.map((item) => item.id);
  const selectedOption = options.find((item) => item.id === selectedOptionId) ?? null;
  const statusLabel = status ? (status.connected ? 'OpenAI connected' : 'Demo fallback ready') : 'Checking AI connection';
  const modelLabel = status?.textModel ?? 'Loading backend status';

  function resetGenerationFlow(nextStep: 'select' | 'options' | 'result' = 'select') {
    setOptions([]);
    setSelectedOptionId('');
    setGeneratedImage(null);
    setStep(nextStep);
  }

  useEffect(() => {
    if (selectedItems.length === 0 && step !== 'select') {
      resetGenerationFlow();
    }
  }, [selectedItems.length, step]);

  async function handleSendChat() {
    const trimmed = chatInput.trim();
    if (!trimmed) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: trimmed } satisfies EventChatMessage];
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

      setMessages((current) => [...current, { role: 'assistant', content: response.reply }]);
      setEventSummary(response.summary);
    } catch (chatError) {
      const fallbackReply =
        "I can still help: focus on the dress code, weather, and how polished you want to feel. I'll use that context when generating the wardrobe options.";
      setMessages((current) => [...current, { role: 'assistant', content: fallbackReply }]);
      setEventSummary(trimmed);
      setError(chatError instanceof Error ? chatError.message : 'Unable to reach the event chat right now.');
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleBuildOptions() {
    if (selectedItems.length === 0) {
      setError('Select at least one uploaded wardrobe photo first.');
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
      setSelectedOptionId(nextOptions[0]?.id ?? '');
      startTransition(() => setStep(nextOptions.length > 0 ? 'options' : 'select'));
    } catch (optionsError) {
      const fallback = buildDemoOptions(selectedItems);
      setOptions(fallback);
      setSelectedOptionId(fallback[0]?.id ?? '');
      setError(optionsError instanceof Error ? optionsError.message : 'Unable to build options right now.');
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

    if (nextIds.length === 0) {
      return;
    }

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
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload that wardrobe photo right now.');
    }
  }

  async function handleNewUpload(file: File) {
    setError('');

    try {
      await onUploadNewItem(file);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Unable to analyze that uploaded wardrobe piece right now.',
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <SectionKicker>Generate from wardrobe</SectionKicker>
          <h1 className="mt-4 font-display text-[2.5rem] leading-[0.97] tracking-[-0.06em] text-[var(--text)] xl:text-[3.4rem]">
            Choose owned pieces, add context, then generate the look.
          </h1>
          <p className="mt-4 max-w-[44rem] text-[1rem] leading-8 text-[var(--muted)]">
            Select already mapped wardrobe photos, upload a new item, or pull in curated example pieces. Then add event context so WeaR can build wardrobe-only outfit paths and a composed image.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SurfaceBadge tone={status?.connected ? 'accent' : 'default'}>{statusLabel}</SurfaceBadge>
          <SurfaceBadge>{uploadedItems.length} wardrobe visuals</SurfaceBadge>
          <SurfaceBadge>{selectedItems.length} selected items</SurfaceBadge>
        </div>
      </div>

      <Panel className="p-5" variant="soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <SectionKicker>Current flow</SectionKicker>
            <p className="mt-3 text-[1.08rem] text-[var(--text)]">{stepLabel(step)}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              WeaR only builds options from your owned wardrobe photos. Event context sharpens the recommendation, but shopping stays out of the primary path.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SurfaceBadge tone={step === 'select' ? 'accent' : 'default'}>1. Select</SurfaceBadge>
            <SurfaceBadge tone={step === 'options' ? 'accent' : 'default'}>2. Options</SurfaceBadge>
            <SurfaceBadge tone={step === 'result' ? 'accent' : 'default'}>3. Image</SurfaceBadge>
          </div>
        </div>
      </Panel>

      {error ? (
        <Panel className="px-4 py-3" variant="solid">
          <p className="text-sm text-[var(--text)]">{error}</p>
        </Panel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <Panel className="p-6 xl:p-8" variant="glass">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionKicker>Step 1</SectionKicker>
                <p className="mt-4 text-[1.4rem] text-[var(--text)]">Build the owned wardrobe set for this generation</p>
              </div>
              <button
                type="button"
                onClick={handleBuildOptions}
                disabled={selectedItems.length === 0 || loadingAction !== null}
                className="button-primary text-sm"
              >
                {loadingAction === 'options' ? 'Building options...' : 'Next'}
              </button>
            </div>

            {uploadedItems.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-[rgba(24,24,29,0.14)] bg-[rgba(255,255,255,0.56)] px-6 py-8">
                <p className="text-[1.08rem] text-[var(--text)]">No wardrobe photos uploaded yet.</p>
                <p className="mt-3 max-w-[34rem] text-sm leading-7 text-[var(--muted)]">
                  Start by attaching clear photos of the pieces you already own, or add curated example items to demo the workflow before you upload your full wardrobe.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Uploaded wardrobe library</p>
                  <SurfaceBadge tone="accent-soft">{uploadedItems.length} ready for generation</SurfaceBadge>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {uploadedItems.map((item) => (
                    <Panel key={item.id} className="p-4" variant="solid">
                      <button type="button" onClick={() => toggleSelection(item.id)} className="w-full text-left">
                        <div className="cursor-pointer transition duration-300 hover:-translate-y-[2px]">
                          <WardrobeMosaic items={[item]} label={selectedIds.includes(item.id) ? 'Selected' : 'Owned'} />
                        </div>
                      </button>
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[1rem] text-[var(--text)]">{item.name}</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">{item.category} / {item.fit}</p>
                        </div>
                        <SurfaceBadge tone={selectedIds.includes(item.id) ? 'accent' : 'default'}>
                          {selectedIds.includes(item.id) ? 'Chosen' : 'Ready'}
                        </SurfaceBadge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <SurfaceBadge>
                          {item.source === 'upload' ? 'Uploaded' : item.source === 'example' ? 'Example' : 'Curated'}
                        </SurfaceBadge>
                        <SurfaceBadge tone={item.detection?.state === 'reviewed' ? 'accent' : 'accent-soft'}>
                          {item.detection?.state === 'auto-detected'
                            ? 'Auto-detected'
                            : item.detection?.state ?? 'Curated'}
                        </SurfaceBadge>
                        {item.detection ? (
                          <SurfaceBadge>{Math.round(item.detection.confidence * 100)}% match</SurfaceBadge>
                        ) : null}
                      </div>

                      <label className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-[rgba(24,24,29,0.08)] bg-[rgba(248,244,238,0.86)] px-4 py-2 text-sm text-[var(--text)] transition duration-300 hover:-translate-y-[1px]">
                        Replace photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return;
                            }

                            await handleItemUpload(item.id, file);
                            event.target.value = '';
                          }}
                        />
                      </label>
                    </Panel>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Expand the wardrobe set</p>
                <SurfaceBadge>{pendingItems.length} waiting for photos</SurfaceBadge>
              </div>
              <div className="mt-4 rounded-[24px] border border-[rgba(24,24,29,0.08)] bg-white/78 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-[1rem] text-[var(--text)]">Upload a fresh wardrobe piece</p>
                    <p className="mt-2 max-w-[32rem] text-sm leading-7 text-[var(--muted)]">
                      WeaR auto-identifies the item, then opens a review step so you can confirm category, color, fit, and material before saving it.
                    </p>
                  </div>
                  <label className="button-secondary cursor-pointer text-sm">
                    Upload new item
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }

                        await handleNewUpload(file);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
              {pendingItems.length === 0 ? (
                <div className="mt-4 rounded-[24px] border border-dashed border-[rgba(24,24,29,0.12)] bg-white/72 px-5 py-5 text-sm leading-7 text-[var(--muted)]">
                  Your current mapped wardrobe is already visually ready. Add new uploads or curated example items if you want more combination range.
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {pendingItems.map((item) => (
                    <Panel key={item.id} className="p-4" variant="solid">
                      <WardrobeMosaic items={[item]} label="Awaiting photo" />
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[1rem] text-[var(--text)]">{item.name}</p>
                          <p className="mt-2 text-sm text-[var(--muted)]">{item.category} / {item.fit}</p>
                        </div>
                        <SurfaceBadge>No photo</SurfaceBadge>
                      </div>

                      <label className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-[rgba(24,24,29,0.08)] bg-[rgba(248,244,238,0.86)] px-4 py-2 text-sm text-[var(--text)] transition duration-300 hover:-translate-y-[1px]">
                        Upload photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return;
                            }

                            await handleItemUpload(item.id, file);
                            event.target.value = '';
                          }}
                        />
                      </label>
                    </Panel>
                  ))}
                </div>
              )}
            </div>

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

          {step !== 'select' ? (
            <Panel className="p-6 xl:p-8" variant="soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SectionKicker>Step 2</SectionKicker>
                  <p className="mt-4 text-[1.4rem] text-[var(--text)]">Choose the outfit option to generate</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => resetGenerationFlow()} className="button-secondary text-sm">
                    Back to selection
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={!selectedOption || loadingAction !== null}
                    className="button-primary text-sm"
                  >
                    {loadingAction === 'image' ? 'Generating image...' : 'Generate image'}
                  </button>
                </div>
              </div>

              {options.length === 0 ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-[rgba(24,24,29,0.14)] bg-white/72 px-5 py-6 text-sm leading-7 text-[var(--muted)]">
                  WeaR could not build an outfit path yet. Add more wardrobe photos or refine the event context and try again.
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
                          className={`h-full p-4 transition duration-300 ${active ? 'ring-2 ring-[rgba(152,161,255,0.42)]' : ''}`}
                          variant={active ? 'glass' : 'solid'}
                        >
                          <WardrobeMosaic items={optionItems} label={option.vibe} />
                          <p className="mt-4 text-[1rem] text-[var(--text)]">{option.title}</p>
                          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{option.rationale}</p>
                          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{option.eventFit}</p>
                        </Panel>
                      </button>
                    );
                  })}
                </div>
              )}
            </Panel>
          ) : null}

          {step === 'result' && generatedImage ? (
            <Panel className="p-6 xl:p-8" variant="glass">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SectionKicker>Step 3</SectionKicker>
                  <p className="mt-4 text-[1.4rem] text-[var(--text)]">Generated outfit image</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setStep('options')} className="button-secondary text-sm">
                    Back to options
                  </button>
                  <SurfaceBadge tone="accent">{generatedImage.mode === 'openai' ? 'OpenAI image generation' : 'Demo render'}</SurfaceBadge>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-white/80 bg-white/78 p-3">
                <img
                  src={generatedImage.imageDataUrl}
                  alt="Generated WeaR outfit concept"
                  className="h-[36rem] w-full rounded-[22px] object-cover"
                />
              </div>
              {generatedImage.revisedPrompt ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{generatedImage.revisedPrompt}</p>
              ) : null}
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Panel className="p-6" variant="glass">
            <SectionKicker>Generation backend</SectionKicker>
            <p className="mt-4 text-[1.08rem] text-[var(--text)]">{statusLabel}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {status?.message ?? 'Checking whether your OpenAI account is connected for live event reasoning and image generation.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SurfaceBadge tone="accent-soft">{modelLabel}</SurfaceBadge>
              <SurfaceBadge>{status?.imageModel ?? 'Image model pending'}</SurfaceBadge>
            </div>
          </Panel>

          <Panel className="p-6 xl:p-8" variant="solid">
            <div className="flex items-center justify-between gap-4">
              <div>
                <SectionKicker>Event chat</SectionKicker>
                <p className="mt-4 text-[1.35rem] text-[var(--text)]">Talk to WeaR about where you are going</p>
              </div>
              <SurfaceBadge tone="accent-soft">{modelLabel}</SurfaceBadge>
            </div>

            <div className="mt-6 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-[22px] px-4 py-4 ${message.role === 'assistant' ? 'bg-[rgba(248,244,238,0.86)]' : 'bg-[rgba(152,161,255,0.12)]'}`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    {message.role === 'assistant' ? 'WeaR' : 'You'}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text)]">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                rows={4}
                placeholder="I'm going to a rooftop dinner, warm weather, smart casual, and I want to look sharper but not overdressed."
                className="w-full rounded-[24px] border border-[rgba(24,24,29,0.08)] bg-white px-4 py-4 text-[var(--text)] outline-none focus:border-[rgba(152,161,255,0.5)]"
              />
              <button
                type="button"
                onClick={handleSendChat}
                disabled={chatInput.trim().length === 0 || loadingAction !== null}
                className="button-primary self-start text-sm"
              >
                {loadingAction === 'chat' ? 'Thinking...' : 'Send context'}
              </button>
            </div>
          </Panel>

          <Panel className="p-6" variant="soft">
            <SectionKicker>Active event summary</SectionKicker>
            <p className="mt-4 text-[1rem] leading-8 text-[var(--text)]">{eventSummary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => <SurfaceBadge key={item.id}>{item.name}</SurfaceBadge>)
              ) : (
                <SurfaceBadge>No wardrobe photos selected yet</SurfaceBadge>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
