import { useState } from 'react';
import {
  alternateOutfits,
  resolveWardrobeImageSrc,
  todayOutfit,
  type MediaAsset,
  type UserProfile,
  type WardrobeItem,
} from '../../data/wearData';
import type { GenerationStatus } from '../../lib/generationApi';
import type { EventSession } from '../../lib/persistence';
import { MaterialIcon } from '../Chrome';
import { getWardrobeItemsForOutfit } from '../screens/wardrobeUtils';

/* ──────────────────────────────────────────────────────────────
   Data helpers (kept intact from previous implementation)
   ────────────────────────────────────────────────────────────── */

type HeroSuggestion = {
  id: string;
  title: string;
  vibe: string;
  note: string;
  sentence: string;
  pieces: WardrobeItem[];
  anchorLabel: string;
  dayPart: string;
  weatherCue: string;
  eventLabel: string;
};

function buildDayPart(now = new Date()) {
  const hour = now.getHours();
  if (hour < 11) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function buildWeatherCue(now = new Date()) {
  const month = now.getMonth();
  if ([11, 0, 1].includes(month)) return 'Cool air';
  if ([5, 6, 7].includes(month)) return 'Warm air';
  return 'Mild air';
}

function buildEventLabel(eventSummary?: string) {
  const cleaned = eventSummary?.trim();
  if (!cleaned) return 'Today';
  const shortLabel = cleaned.split(/[.!?]/)[0]?.trim() ?? cleaned;
  return shortLabel.length > 32 ? `${shortLabel.slice(0, 29)}...` : shortLabel;
}

function buildHeroSuggestions(wardrobe: WardrobeItem[], eventSession: EventSession): HeroSuggestion[] {
  const eventLabel = buildEventLabel(eventSession.eventSummary);
  const dayPart = buildDayPart();
  const weatherCue = buildWeatherCue();

  return [todayOutfit, ...alternateOutfits].map((outfit) => {
    const pieces = getWardrobeItemsForOutfit(wardrobe, outfit.pieces) as WardrobeItem[];
    const anchorLabel = pieces[0]?.name ?? outfit.pieces[0] ?? 'hero layer';
    const anchorCopy = anchorLabel.replace(/\b\w/g, (char) => char.toLowerCase());

    return {
      id: outfit.id,
      title: outfit.title,
      vibe: outfit.vibe,
      note: outfit.note,
      pieces,
      anchorLabel,
      dayPart,
      weatherCue,
      eventLabel,
      sentence:
        eventLabel === 'Today'
          ? `${dayPart}'s plan feels strongest with the ${anchorCopy}.`
          : `${eventLabel} calls for the ${anchorCopy}.`,
    } satisfies HeroSuggestion;
  });
}

function buildDecisionGroups(wardrobe: WardrobeItem[], heroSuggestion: HeroSuggestion) {
  const heroIds = new Set(heroSuggestion.pieces.map((piece) => piece.id));
  const frequentlyUsed = wardrobe.filter((item) => item.status === 'Repeat').slice(0, 6);
  const suggestedToday = wardrobe.filter((item) => heroIds.has(item.id)).slice(0, 4);
  const notWornRecently = wardrobe
    .filter((item) => item.status === 'Occasion' || !heroIds.has(item.id))
    .slice(0, 6);
  const reviewQueue = wardrobe.filter(
    (item) => item.detection?.state === 'auto-detected' || item.detection?.state === 'error',
  );

  return { suggestedToday, frequentlyUsed, notWornRecently, reviewQueue };
}

/* ──────────────────────────────────────────────────────────────
   MobileHeroHome — Home screen: "What should I wear?"
   Reference: home_refined_wear_2
   ────────────────────────────────────────────────────────────── */
export function MobileHeroHome({
  profile: _profile,
  wardrobe,
  mediaAssets,
  eventSession,
  generationStatus: _generationStatus,
  activeSuggestionIndex: _activeSuggestionIndex,
  onChangeSuggestionIndex: _onChangeSuggestionIndex,
  chatDraft,
  onDraftChange,
  onStartChat,
  onOpenPalette: _onOpenPalette,
  onOpenWardrobe: _onOpenWardrobe,
  onOpenSaved,
  onOpenProfile: _onOpenProfile,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  mediaAssets: MediaAsset[];
  eventSession: EventSession;
  generationStatus: GenerationStatus | null;
  activeSuggestionIndex: number;
  onChangeSuggestionIndex: (nextIndex: number) => void;
  /** Controlled draft — lifted to MobileWorkspace so it survives navigation */
  chatDraft: string;
  onDraftChange: (v: string) => void;
  /** Navigate to chat; if draft is non-empty, auto-send it */
  onStartChat: (draft: string) => void;
  onOpenPalette: () => void;
  onOpenWardrobe: () => void;
  onOpenSaved: () => void;
  onOpenProfile: () => void;
}) {
  void buildHeroSuggestions(wardrobe, eventSession); // kept for future use
  const weatherCue = buildWeatherCue();
  const recentItems = wardrobe.slice(0, 4);

  const FALLBACK_IMAGES = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCgcyMmfT-JkDqJGIYzMfSmjswjVxBXM11k_eGI9O0m-tUxobJdoKauFC-TQsgJKka8t7QyxRwZ9tDIHFXKdmGsworPxyZXafzKxZb0LlWQ636a9NvVNKaXd_0M6CTYBuer3GThMiDHqGAy4X3e1QKxN1Ehqq8-qsLg6dw5GZx6oic2WM1N36lMnhdIUBhMJTlGfuYKNV26N_zy6HJgCEhlXeP3ebW9OIy4tQ9JeEmfw8R_w6rDP6WTIYJSNGOdp46NfwKHPoBH77n',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhgt3Q5KWNwoDhflBgkrQmX54EvicYEFXltmQXNdKAnuub8-NNTVLCRZAcQHte5SjeKsw22IiSJiXWqyKc9YQ3RXk-jcuAImP2dB5lHgO0L2aeO3lGYHnW_-Arz1zDmGBUceWxvhCh_Py6PZv_szaFr0vP0Jo7FhHDYiNv85lulobQ-yJYLWouRxyUcIPTTZUcedI8BjsGtdqzlVcSSPfDLV0erOjBi158pyLcrkNp1lzdhDJbh0VWkXSX3eTDZ3qkSR8GOYbCfwgi',
  ];

  return (
    <div className="min-h-[100dvh] pb-tab-bar" style={{ paddingTop: 'calc(var(--mobile-header-height) + var(--safe-top, 0px) + 2rem)' }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(208,188,255,0.12) 0%, rgba(79,219,200,0.04) 50%, transparent 100%)' }}
      />

      <div className="relative z-10 px-6">
        {/* Weather/AI context pill */}
        <div className="mb-6 flex items-center gap-3 w-fit rounded-full border px-4 py-2"
             style={{ background: 'rgba(208,188,255,0.1)', borderColor: 'rgba(208,188,255,0.2)' }}>
          <MaterialIcon name="thermostat" size={16} className="text-[#d0bcff]" />
          <span className="text-xs font-semibold text-[#d0bcff]">
            {weatherCue} {weatherCue === 'Cool air' ? '— How about a light layer?' : weatherCue === 'Warm air' ? '— Stay cool today.' : '— Perfect dressing weather.'}
          </span>
        </div>

        {/* Hero heading */}
        <h1
          className="mb-8 text-4xl font-extrabold tracking-tight"
          style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
        >
          What should I wear?
        </h1>

        {/* Search input */}
        <div className="relative w-full group mb-10">
          <div
            className="absolute -inset-1 rounded-[1.75rem] opacity-0 transition-opacity duration-700 group-focus-within:opacity-30"
            style={{ background: 'linear-gradient(90deg, rgba(208,188,255,0.4), rgba(79,219,200,0.4))', filter: 'blur(16px)' }}
          />
          <div
            className="relative flex items-center gap-1 rounded-2xl p-2"
            style={{ background: 'rgba(32,31,31,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(73,68,84,0.2)' }}
          >
            <MaterialIcon name="auto_awesome" size={20} className="mx-2 flex-shrink-0 text-[#d0bcff]" />
            <input
              type="text"
              value={chatDraft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onStartChat(chatDraft); }}
              onFocus={() => { if (!chatDraft) onStartChat(''); }}
              placeholder="Tell me about your plans..."
              className="flex-grow bg-transparent text-base outline-none border-none px-1"
              style={{ color: '#e5e2e1', minWidth: 0 }}
            />
            <button
              type="button"
              onClick={() => onStartChat(chatDraft)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                background: '#d0bcff',
                color: '#3c0091',
                boxShadow: '0 0 14px rgba(208,188,255,0.4)',
              }}
              aria-label="Style me"
            >
              <MaterialIcon name="arrow_upward" size={20} />
            </button>
          </div>
        </div>

        {/* Quick action pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {[
            { label: 'Work Event', icon: 'work' },
            { label: 'Date Night', icon: 'favorite' },
            { label: 'Weekend Chill', icon: 'local_cafe' },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onStartChat(label)}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 hover:border-[rgba(208,188,255,0.3)]"
              style={{ background: 'var(--surface)', color: '#cbc3d7', border: '1px solid rgba(73,68,84,0.3)', minHeight: 'var(--touch-target)' }}
            >
              <MaterialIcon name={icon} size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Recent Curation */}
        <section className="mb-8">
          <div className="mb-6 flex items-center justify-between px-1">
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: '#cbc3d7', fontFamily: 'var(--font-headline)' }}
            >
              Recent curation
            </h2>
            <button
              type="button"
              onClick={onOpenSaved}
              className="text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#d0bcff]"
              style={{ color: '#958ea0' }}
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((i) => {
              const item = recentItems[i];
              const src = item ? resolveWardrobeImageSrc(item) : null;
              const fallback = FALLBACK_IMAGES[i];
              const imgSrc = src ?? fallback;
              const label = item?.name ?? (i === 0 ? 'Urban Minimalist' : 'Evening Gala');
              const time = i === 0 ? '2 hours ago' : 'Oct 12';

              return (
                <button
                  key={i}
                  type="button"
                  onClick={onOpenSaved}
                  className="group cursor-pointer text-left"
                >
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-3" style={{ background: 'var(--surface)' }}>
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={label}
                        className="w-full h-full object-cover transition-all duration-500 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: 'var(--surface-high)' }} />
                    )}
                  </div>
                  <h3
                    className="font-bold text-sm transition-colors group-hover:text-[#e5e2e1]"
                    style={{ color: '#cbc3d7' }}
                  >
                    {label}
                  </h3>
                  <p className="text-xs" style={{ color: '#958ea0' }}>{time}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Upload strip */}
        {mediaAssets.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {mediaAssets.slice(0, 4).map((asset) => (
                  <img
                    key={asset.id}
                    src={asset.previewUrl}
                    alt={asset.fileName}
                    className="h-9 w-9 rounded-full border-2 object-cover"
                    style={{ borderColor: '#131313' }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: '#958ea0' }}>
                {mediaAssets.length} upload{mediaAssets.length !== 1 ? 's' : ''} ready
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}



/* ──────────────────────────────────────────────────────────────
   MobileWardrobeGuide — Digital Closet screen
   Reference: wardrobe_editorial_concierge + wardrobe_refined_wear_2
   ────────────────────────────────────────────────────────────── */
export function MobileWardrobeGuide({
  wardrobe,
  mediaAssets,
  eventSession,
  activeSuggestionIndex,
  onOpenGenerate,
  onUploadNewItem,
  onCreateFromMedia,
}: {
  wardrobe: WardrobeItem[];
  mediaAssets: MediaAsset[];
  eventSession: EventSession;
  activeSuggestionIndex: number;
  onOpenGenerate: () => void;
  onUploadNewItem: (file: File) => Promise<void>;
  onCreateFromMedia?: (mediaAssetId: string, targetItemId?: string | null) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<'closet' | 'uploads' | 'review'>('closet');
  const [uploadError, setUploadError] = useState('');
  const suggestions = buildHeroSuggestions(wardrobe, eventSession);
  const activeSuggestion = suggestions[activeSuggestionIndex] ?? suggestions[0];
  const groups = buildDecisionGroups(wardrobe, activeSuggestion);

  const reviewQueue = wardrobe.filter(
    (item) => item.detection?.state === 'auto-detected' || item.detection?.state === 'error',
  );

  const AI_SUGGESTIONS_MAP = [
    { label: 'PERFECT FOR TODAY', tone: 'primary' as const },
    { label: 'Paired often', tone: 'teal' as const },
    { label: 'Not worn recently', tone: 'danger' as const },
    { label: null, tone: null },
  ];

  const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZkgapTQ9KtNzuIFkdsdvvX3BAoHyIWcYie2F3ER-TC40PrbAgpw3-iKnLsQapBSjrsdsFZz9usTXSuFx1rXJf2vDvuY6rzqJWLuT4WSTbIFcRB3PuuBxLVKYPByi2ZgtkPzB0kT682FKyV2e9fryANia8g62lOyQQDNH9b-TwP1GdJ18rYevhy1rLH-7cR0ChS1UYzpkxR7sMP1YAoIUA1pQDmnDadZQlI0tmAeGUP4kQFRwCNRqRsd54nViYjIz9kHxAD0OFjmCe';

  return (
    <div
      className="min-h-[100dvh] pb-tab-bar"
      style={{ paddingTop: 'calc(var(--mobile-header-height) + var(--safe-top, 0px) + 1rem)' }}
    >
      <div className="px-6">
        {/* Sub-header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1
              className="text-xl font-bold"
              style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
            >
              Digital Closet
            </h1>
            <span className="text-sm" style={{ color: '#958ea0' }}>
              {wardrobe.length || 142} Active Pieces
            </span>
          </div>
          {/* Daily insight chip */}
          <div
            className="flex items-center gap-2 w-fit rounded-full border px-4 py-2 mb-4"
            style={{ background: 'rgba(208,188,255,0.1)', borderColor: 'rgba(208,188,255,0.2)' }}
          >
            <MaterialIcon name="lightbulb" size={14} className="text-[#d0bcff]" />
            <span className="text-xs font-medium text-[#d0bcff]">
              Monochromatic pieces are trending this season
            </span>
          </div>
          {/* CTA */}
          <button
            type="button"
            onClick={onOpenGenerate}
            className="w-full rounded-full py-3 font-bold text-[#23005c] transition-all active:scale-98"
            style={{
              background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
              boxShadow: '0 10px 20px -5px rgba(160,120,255,0.4)',
            }}
          >
            Style Today's Look
          </button>
        </div>

        {/* Segmented tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-full" style={{ background: 'var(--surface)' }}>
          {(['closet', 'uploads', 'review'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="flex-1 rounded-full py-2 text-xs font-semibold capitalize transition-all"
              style={{
                background: activeTab === tab ? 'var(--surface-high)' : 'transparent',
                color: activeTab === tab ? '#e5e2e1' : '#958ea0',
              }}
            >
              {tab === 'review' ? 'Review Queue' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'review' && reviewQueue.length > 0 && (
                <span className="ml-1 text-[#ffb4ab]">({reviewQueue.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* CLOSET TAB */}
        {activeTab === 'closet' && (
          <div className="space-y-6">
            {/* Most Frequent */}
            {groups.frequentlyUsed.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#cbc3d7' }}>
                    Most Frequent
                  </h3>
                  <MaterialIcon name="arrow_forward" size={16} className="text-[#958ea0]" />
                </div>
                <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                  {groups.frequentlyUsed.map((item, i) => {
                    const src = resolveWardrobeImageSrc(item);
                    return (
                      <div key={item.id} className="relative flex-shrink-0" style={{ width: '7rem' }}>
                        <div
                          className="aspect-square rounded-2xl overflow-hidden"
                          style={{ background: 'var(--surface)' }}
                        >
                          {src ? (
                            <img src={src} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${item.palette ?? 'from-gray-700 to-gray-800'}`} />
                          )}
                        </div>
                        {i === 0 && (
                          <div
                            className="absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ background: '#d0bcff', color: '#23005c' }}
                          >
                            TOP
                          </div>
                        )}
                        <p className="mt-1.5 text-xs font-medium truncate" style={{ color: '#cbc3d7' }}>{item.name}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Daily Suggestion hero */}
            {activeSuggestion.pieces.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#cbc3d7' }}>
                  Daily Suggestion
                </h3>
                <div
                  className="relative overflow-hidden cursor-pointer"
                  style={{ aspectRatio: '4/3', borderRadius: '1.5rem', background: 'var(--surface)' }}
                  onClick={onOpenGenerate}
                >
                  {(() => {
                    const heroSrc = resolveWardrobeImageSrc(activeSuggestion.pieces[0]!) ?? HERO_IMG;
                    return (
                      <img src={heroSrc} alt={activeSuggestion.title} className="w-full h-full object-cover" />
                    );
                  })()}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    <div>
                      <div
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 mb-2 text-xs font-bold uppercase tracking-widest"
                        style={{ background: 'rgba(79,219,200,0.9)', color: '#003731' }}
                      >
                        <MaterialIcon name="auto_awesome" size={12} filled />
                        AI STYLIST PICK
                      </div>
                      <p className="text-sm font-semibold text-white">{activeSuggestion.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenGenerate(); }}
                      className="rounded-full px-4 py-2 text-xs font-bold text-[#23005c]"
                      style={{ background: '#d0bcff' }}
                    >
                      Wear It
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Everything Else grid */}
            {groups.notWornRecently.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#cbc3d7' }}>
                  Everything Else
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {groups.notWornRecently.slice(0, 6).map((item, i) => {
                    const src = resolveWardrobeImageSrc(item);
                    const badge = AI_SUGGESTIONS_MAP[i % AI_SUGGESTIONS_MAP.length];
                    const isPerfect = badge?.tone === 'primary';

                    return (
                      <div
                        key={item.id}
                        className="relative overflow-hidden"
                        style={{
                          borderRadius: '1.25rem',
                          background: 'var(--surface)',
                          ...(isPerfect ? {
                            transform: 'scale(1.03)',
                            boxShadow: '0 0 0 2px #d0bcff, 0 20px 40px rgba(208,188,255,0.2)',
                          } : {}),
                        }}
                      >
                        <div className="aspect-square overflow-hidden" style={{ borderRadius: '1.25rem 1.25rem 0 0' }}>
                          {src ? (
                            <img src={src} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${item.palette ?? 'from-gray-700 to-gray-800'}`} />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold truncate" style={{ color: '#e5e2e1' }}>{item.name}</p>
                          {badge?.label && (
                            <div
                              className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                              style={{
                                background: badge.tone === 'primary'
                                  ? 'rgba(208,188,255,0.2)'
                                  : badge.tone === 'teal'
                                    ? 'rgba(79,219,200,0.15)'
                                    : 'rgba(255,180,171,0.15)',
                                color: badge.tone === 'primary'
                                  ? '#d0bcff'
                                  : badge.tone === 'teal'
                                    ? '#4fdbc8'
                                    : '#ffb4ab',
                              }}
                            >
                              {badge.label}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {wardrobe.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                style={{ color: '#958ea0' }}
              >
                <MaterialIcon name="checkroom" size={48} className="mb-4 opacity-30" />
                <p className="text-sm">Your wardrobe is empty.</p>
                <p className="text-xs mt-1">Upload items to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* UPLOADS TAB */}
        {activeTab === 'uploads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: '#958ea0' }}>{mediaAssets.length} uploaded photos</p>
              <label
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
                style={{ background: 'var(--surface-high)', color: '#e5e2e1', border: '1px solid rgba(73,68,84,0.3)', minHeight: 'var(--touch-target)' }}
              >
                <MaterialIcon name="add" size={16} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      await onUploadNewItem(file);
                      setUploadError('');
                    } catch (error) {
                      setUploadError(error instanceof Error ? error.message : 'Upload failed.');
                    }
                    event.target.value = '';
                  }}
                />
              </label>
            </div>

            {uploadError && (
              <div className="rounded-2xl p-3 text-sm" style={{ background: 'rgba(147,0,10,0.2)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.2)' }}>
                {uploadError}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {mediaAssets.length > 0 ? (
                mediaAssets.map((asset) => (
                  <div key={asset.id} className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer" style={{ background: 'var(--surface)' }}>
                    <img src={asset.previewUrl} alt={asset.fileName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      {onCreateFromMedia && (
                        <button
                          type="button"
                          onClick={() => void onCreateFromMedia(asset.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full px-3 py-1 text-xs font-bold"
                          style={{ background: '#d0bcff', color: '#23005c' }}
                        >
                          Review
                        </button>
                      )}
                    </div>
                    {asset.linkedItemId && (
                      <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center"
                           style={{ background: '#4fdbc8' }}>
                        <MaterialIcon name="check" size={12} className="text-[#003731]" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center" style={{ color: '#958ea0' }}>
                  <MaterialIcon name="photo_camera" size={48} className="mb-4 opacity-30" />
                  <p className="text-sm">No uploads yet.</p>
                  <p className="text-xs mt-1">Upload your wardrobe photos to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEW QUEUE TAB */}
        {activeTab === 'review' && (
          <div className="space-y-3">
            {reviewQueue.length > 0 ? (
              reviewQueue.map((item) => {
                const src = resolveWardrobeImageSrc(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl p-4"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: 'var(--surface-high)' }}>
                      {src ? (
                        <img src={src} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${item.palette ?? 'from-gray-700 to-gray-800'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#e5e2e1' }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#958ea0' }}>
                        {item.detection?.state === 'error' ? 'Detection failed' : 'Auto-detected — confirm?'}
                      </p>
                    </div>
                    <div
                      className="rounded-full px-3 py-1 text-xs font-bold uppercase"
                      style={{
                        background: item.detection?.state === 'error' ? 'rgba(255,180,171,0.15)' : 'rgba(230,199,122,0.15)',
                        color: item.detection?.state === 'error' ? '#ffb4ab' : '#e6c77a',
                      }}
                    >
                      {item.detection?.state === 'error' ? 'Error' : 'Review'}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: '#958ea0' }}>
                <MaterialIcon name="check_circle" size={48} className="mb-4 opacity-30" />
                <p className="text-sm">No items need review.</p>
                <p className="text-xs mt-1">All your wardrobe items are confirmed.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed right-6" style={{ bottom: 'calc(var(--tab-bar-height) + max(var(--safe-bottom), 0px) + 1rem)' }}>
        <label
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-[0_10px_20px_rgba(160,120,255,0.4)] transition-transform active:scale-95"
          style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)' }}
          aria-label="Add wardrobe item"
        >
          <MaterialIcon name="add" size={28} className="text-[#23005c]" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                await onUploadNewItem(file);
              } catch {
                /* ignore */
              }
              event.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}
