import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { startTransition, useEffect, useRef, useState } from 'react';
import { exampleWardrobeItems } from '../data/exampleWardrobe';
import {
  baseProfile,
  savedCollections,
  withProfileDefaults,
  wardrobeItems,
  type AuthSession,
  type MediaAsset,
  type SavedCollection,
  type SavedOutfit,
  type ScreenKey,
  type UserProfile,
  type WardrobeItem,
} from '../data/wearData';
import { buildWardrobeItem } from '../lib/wardrobeDrafts';
import {
  deleteMediaAsset,
  getCollections,
  getEventSession,
  getMediaAssets,
  getProfile,
  getSession,
  getWardrobe,
  requestPasswordReset,
  resetPassword,
  saveCollections,
  saveEventSession,
  saveProfile,
  saveWardrobe,
  signIn,
  signOut,
  signUp,
  updateMediaAsset,
  uploadMediaAsset,
  type AppSession,
} from '../lib/appClient';
import {
  clearLegacySnapshot,
  hasLegacySnapshot,
  loadOutfits,
  migrateCollectionsToOutfits,
  readLegacySnapshot,
  saveOutfits,
  type EventSession,
} from '../lib/persistence';
import { fetchGenerationStatus, requestWardrobeIdentification, type GenerationStatus, type WardrobeIdentification } from '../lib/generationApi';
import {
  checkNewAchievements,
  loadUnlockedAchievements,
  saveUnlockedAchievements,
  type Achievement,
  type AchievementId,
} from '../lib/achievements';
import { Panel, SurfaceBadge } from './Chrome';
import { AchievementToast } from './AchievementToast';
import { AuthScreen } from './AuthScreen';
import { CommandPalette } from './CommandPalette';
import { ItemReviewModal } from './ItemReviewModal';
import { LegacyImportPrompt } from './LegacyImportPrompt';
import { MobileWorkspace } from './mobile/MobileWorkspace';
import { OnboardingFlow } from './OnboardingFlow';
import { PresentationStage } from './PresentationStage';
import { Sidebar } from './Sidebar';
import { SplashScreen } from './SplashScreen';
import { useMobileLayout } from '../hooks/useMobileLayout';
import {
  DashboardScreen,
  GenerateScreen,
  ProfileScreen,
  SavedLooksScreen,
  SettingsScreen,
  StudioScreen,
  WardrobeScreen,
} from './screens/DesktopScreens';

type UploadReviewState = {
  visible: boolean;
  targetItemId: string | null;
  stage: 'processing' | 'review' | 'error';
  fileName: string;
  imageDataUrl: string;
  draft: WardrobeItem;
  helperText: string;
  mediaAsset: MediaAsset | null;
};

function createDraftFromIdentification({
  detection,
  imageSrc,
  existingItem,
  targetItemId,
  mediaAssetId,
}: {
  detection: WardrobeIdentification;
  imageSrc: string;
  existingItem?: WardrobeItem | null;
  targetItemId: string | null;
  mediaAssetId?: string | null;
}) {
  return buildWardrobeItem({
    id: existingItem?.id ?? targetItemId ?? `upload-${Date.now()}`,
    imageSrc,
    detection,
    source: 'upload',
    existingItem,
    mediaAssetId,
  });
}

function AppHeader({
  session,
  generationStatus,
  onSignOut,
  onOpenPalette,
}: {
  session: AuthSession;
  generationStatus: GenerationStatus | null;
  onSignOut: () => Promise<void>;
  onOpenPalette: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-6 py-3.5"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      {/* Left: WeaR brand + AI status */}
      <div className="flex items-center gap-3">
        <span
          className="text-xl font-extrabold tracking-tighter"
          style={{
            fontFamily: 'var(--font-headline)',
            background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          WeaR
        </span>
        <SurfaceBadge tone={generationStatus?.connected ? 'live' : 'fallback'}>
          {generationStatus?.connected ? 'AI live' : 'Offline'}
        </SurfaceBadge>
      </div>

      {/* Right: palette shortcut hint + user avatar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenPalette}
          className="button-secondary text-xs px-3 py-1.5"
          title="Command palette (Ctrl+K)"
        >
          ⌘K
        </button>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-opacity hover:opacity-80"
          style={{
            background: 'rgba(208,188,255,0.15)',
            border: '1px solid rgba(208,188,255,0.25)',
            color: '#d0bcff',
          }}
          title={`${session.user?.name ?? 'Account'} — Sign out`}
          aria-label="User menu"
        >
          {session.user?.name?.[0]?.toUpperCase() ?? 'W'}
        </button>
      </div>
    </div>
  );
}

function DesktopWorkspace({
  session,
  profile,
  wardrobe,
  collections,
  mediaAssets,
  eventSession,
  generationStatus,
  activeScreen,
  onScreenChange,
  onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems,
  onCreateFromMedia,
  onDeleteMediaAsset,
  onCollectionsChange,
  onEventSessionChange,
  onProfileSave,
  onSignOut,
  onRequestPasswordReset,
  onOpenPalette,
}: {
  session: AuthSession;
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  collections: SavedCollection[];
  mediaAssets: MediaAsset[];
  eventSession: EventSession;
  generationStatus: GenerationStatus | null;
  activeScreen: ScreenKey;
  onScreenChange: (screen: ScreenKey) => void;
  onUploadPhoto: (itemId: string, file: File) => Promise<void>;
  onUploadNewItem: (file: File) => Promise<void>;
  onAddExampleItems: (itemIds: string[]) => void;
  onCreateFromMedia: (mediaAssetId: string, targetItemId?: string | null) => Promise<void>;
  onDeleteMediaAsset: (mediaAssetId: string) => Promise<void>;
  onCollectionsChange: (collections: SavedCollection[]) => void;
  onEventSessionChange: (session: EventSession) => void;
  onProfileSave: (profile: UserProfile, onboarded?: boolean) => Promise<void>;
  onSignOut: () => Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<{ devResetToken?: string }>;
  onOpenPalette: () => void;
}) {
  const [resetToken, setResetToken] = useState('');

  function renderScreen() {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            profile={profile}
            wardrobe={wardrobe}
            mediaAssets={mediaAssets}
            eventSession={eventSession}
            generationStatus={generationStatus}
            onGoGenerate={() => onScreenChange('generate')}
            onGoWardrobe={() => onScreenChange('wardrobe')}
          />
        );
      case 'wardrobe':
        return (
          <WardrobeScreen
            wardrobe={wardrobe}
            mediaAssets={mediaAssets}
            exampleItems={exampleWardrobeItems}
            onUploadPhoto={onUploadPhoto}
            onUploadNewItem={onUploadNewItem}
            onAddExampleItems={onAddExampleItems}
            onCreateFromMedia={onCreateFromMedia}
            onDeleteMediaAsset={onDeleteMediaAsset}
          />
        );
      case 'generate':
      case 'chat':
        return (
          <GenerateScreen
            profile={profile}
            wardrobe={wardrobe}
            exampleItems={exampleWardrobeItems}
            mediaAssets={mediaAssets}
            status={generationStatus}
            initialEventSession={eventSession}
            onEventSessionChange={onEventSessionChange}
            onUploadPhoto={onUploadPhoto}
            onUploadNewItem={onUploadNewItem}
            onAddExampleItems={onAddExampleItems}
            onCreateFromMedia={onCreateFromMedia}
          />
        );
      case 'studio':
        return <StudioScreen profile={profile} wardrobe={wardrobe} />;
      case 'profile':
        return <ProfileScreen profile={profile} />;
      case 'saved':
        return <SavedLooksScreen wardrobe={wardrobe} collections={collections} onCollectionsChange={onCollectionsChange} />;
      default:
        return (
          <SettingsScreen
            profile={profile}
            session={session}
            resetToken={resetToken}
            onRequestPasswordReset={async () => {
              const response = await onRequestPasswordReset(session.user?.email ?? '');
              setResetToken(response.devResetToken ?? '');
            }}
            onSignOut={onSignOut}
            onProfileSave={onProfileSave}
          />
        );
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1640px] items-center justify-center px-4 py-5 lg:px-6">
      <Panel className="flex min-h-[calc(100vh-2.5rem)] w-full flex-col overflow-hidden lg:flex-row" variant="glass">
        <Sidebar activeScreen={activeScreen} onSelect={onScreenChange} profile={profile} onOpenPalette={onOpenPalette} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            session={session}
            generationStatus={generationStatus}
            onSignOut={onSignOut}
            onOpenPalette={onOpenPalette}
          />

          <div className="flex-1 overflow-y-auto px-5 py-5 xl:px-6 xl:py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScreen}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function WearAppRuntime() {
  const reduceMotion = useReducedMotion();
  const isMobile = useMobileLayout();
  const isPresent = new URLSearchParams(location.search).get('present') === '1';
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<AuthSession>({ authenticated: false, user: null });
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [devResetToken, setDevResetToken] = useState('');
  const [profile, setProfile] = useState<UserProfile>(baseProfile);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [collections, setCollections] = useState<SavedCollection[]>(savedCollections);
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [eventSession, setEventSession] = useState<EventSession>({ messages: [], eventSummary: '' });
  const [activeScreen, setActiveScreen] = useState<ScreenKey>(isMobile ? 'chat' : 'generate');
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [uploadReview, setUploadReview] = useState<UploadReviewState | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showLegacyPrompt, setShowLegacyPrompt] = useState(false);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const unlockedRef = useRef<Set<AchievementId>>(loadUnlockedAchievements());
  const achievementQueueRef = useRef<Achievement[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowSplash(false), reduceMotion ? 850 : 1800);
    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion]);

  useEffect(() => {
    fetchGenerationStatus()
      .then(setGenerationStatus)
      .catch(() =>
        setGenerationStatus({
          connected: false,
          textModel: 'Fallback mode',
          imageModel: 'Local collage render',
          message: 'Local AI backend not connected yet.',
        }),
      );
  }, []);

  useEffect(() => {
    // ?demo=1 — bypass auth for design preview / screenshots
    if (new URLSearchParams(location.search).get('demo') === '1') {
      setSession({ authenticated: true, user: { id: 'demo', email: 'demo@wear.app', name: 'Demo User', onboarded: true, createdAt: new Date().toISOString(), importedLegacyData: false } });
      setWardrobe(wardrobeItems);
      setAuthChecking(false);
      return;
    }

    let ignore = false;

    async function bootstrap() {
      try {
        const nextSession = await getSession();
        if (ignore) return;
        setSession(nextSession);
        if (nextSession.authenticated) {
          await loadUserData();
        }
      } catch (error) {
        if (!ignore) {
          setAuthError(error instanceof Error ? error.message : 'Unable to restore session.');
        }
      } finally {
        if (!ignore) {
          setAuthChecking(false);
        }
      }
    }

    void bootstrap();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (
      session.authenticated &&
      !session.user?.importedLegacyData &&
      hasLegacySnapshot() &&
      wardrobe.length === 0 &&
      !showSplash
    ) {
      setShowLegacyPrompt(true);
    }
  }, [session, wardrobe.length, showSplash]);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Achievement checks on wardrobe change — defer setState to avoid cascading renders
  useEffect(() => {
    if (wardrobe.length === 0) return;
    const stats = {
      totalPieces: wardrobe.length,
      piecesWithPhotos: wardrobe.filter((i) => Boolean(i.imageDataUrl || i.imageUrl)).length,
      generationCount: 0,
      repeatCount: wardrobe.filter((i) => i.status === 'Repeat').length,
    };
    const newOnes = checkNewAchievements(stats, unlockedRef.current);
    if (newOnes.length === 0) return;
    newOnes.forEach((a) => unlockedRef.current.add(a.id));
    saveUnlockedAchievements(unlockedRef.current);
    achievementQueueRef.current.push(...newOnes);
    const id = window.setTimeout(() => {
      setPendingAchievement((current) => {
        if (current) return current;
        return achievementQueueRef.current.shift() ?? null;
      });
    }, 600);
    return () => window.clearTimeout(id);
  }, [wardrobe]);

  async function loadUserData() {
    const [profilePayload, wardrobePayload, collectionPayload, eventSessionPayload, mediaPayload] = await Promise.all([
      getProfile(),
      getWardrobe<WardrobeItem>(),
      getCollections<SavedCollection>(),
      getEventSession(),
      getMediaAssets(),
    ]);

    const normalizedProfile = withProfileDefaults(profilePayload.profile as Partial<UserProfile> | null);
    const nextCollections = collectionPayload.length > 0 ? collectionPayload : savedCollections;
    const storedOutfits = loadOutfits(wardrobePayload);
    const nextOutfits = storedOutfits ?? migrateCollectionsToOutfits(collectionPayload, wardrobePayload);

    if (!storedOutfits && nextOutfits.length > 0) {
      saveOutfits(nextOutfits);
    }

    setProfile(normalizedProfile);
    setWardrobe(wardrobePayload);
    setCollections(nextCollections);
    setOutfits(nextOutfits);
    setEventSession(eventSessionPayload);
    setMediaAssets(mediaPayload);
  }

  function scheduleUploadMessage(message: string) {
    setUploadMessage(message);
    window.clearTimeout((scheduleUploadMessage as unknown as { timer?: number }).timer);
    (scheduleUploadMessage as unknown as { timer?: number }).timer = window.setTimeout(() => {
      setUploadMessage('');
    }, 2600);
  }

  async function persistProfile(nextProfile: UserProfile, onboarded?: boolean) {
    const normalizedProfile = withProfileDefaults(nextProfile);
    setProfile(normalizedProfile);
    await saveProfile(normalizedProfile as unknown as Record<string, unknown>, {
      onboarded,
    });
    setSession((current) =>
      current.authenticated && current.user
        ? { ...current, user: { ...current.user, name: normalizedProfile.name, onboarded: onboarded ?? current.user.onboarded } }
        : current,
    );
  }

  async function persistCollections(nextCollections: SavedCollection[]) {
    setCollections(nextCollections);
    await saveCollections(nextCollections as unknown[]);
  }

  function persistOutfits(nextOutfits: SavedOutfit[]) {
    setOutfits(nextOutfits);
    saveOutfits(nextOutfits);
  }

  async function persistEventSession(nextSession: EventSession) {
    setEventSession(nextSession);
    await saveEventSession(nextSession);
  }

  async function persistWardrobe(nextWardrobe: WardrobeItem[]) {
    setWardrobe(nextWardrobe);
    await saveWardrobe(nextWardrobe as unknown[]);
  }

  function sameOutfitItems(left: string[], right: string[]) {
    if (left.length !== right.length) return false;
    const leftSorted = [...left].sort();
    const rightSorted = [...right].sort();
    return leftSorted.every((itemId, index) => itemId === rightSorted[index]);
  }

  async function handleApproveLook(payload: {
    title: string;
    vibe: string;
    rationale: string;
    items: WardrobeItem[];
    eventSummary: string;
    coverImageUrl?: string | null;
  }) {
    const approvedAt = new Date().toISOString();
    const itemIds = payload.items.map((item) => item.id);
    const approvedLook = {
      id: `approved-${Date.now()}`,
      title: payload.title,
      eventSummary: payload.eventSummary,
      itemIds,
      imageDataUrl: payload.coverImageUrl ?? undefined,
      approvedAt,
    };

    const nextProfile = withProfileDefaults({
      ...profile,
      approvedLooks: [approvedLook, ...profile.approvedLooks].slice(0, 30),
      tasteNotes: Array.from(new Set([payload.vibe, payload.rationale, ...profile.tasteNotes].filter(Boolean))).slice(0, 18),
    });

    await persistProfile(nextProfile);

    // Reusing the same SavedOutfit record for a repeated item combination keeps wear history stable
    // instead of creating duplicate outfit groups every time the user approves the same look again.
    const existingOutfit = outfits.find((outfit) => sameOutfitItems(outfit.itemIds, itemIds));
    const nextOutfit: SavedOutfit = existingOutfit
      ? {
          ...existingOutfit,
          name: payload.title,
          vibe: payload.vibe || existingOutfit.vibe,
          coverImageDataUrl: payload.coverImageUrl ?? existingOutfit.coverImageDataUrl,
          timesWorn: existingOutfit.timesWorn + 1,
          lastWornAt: approvedAt,
        }
      : {
          id: `outfit-${Date.now()}`,
          name: payload.title,
          itemIds,
          createdAt: approvedAt,
          coverImageDataUrl: payload.coverImageUrl ?? undefined,
          vibe: payload.vibe,
          timesWorn: 1,
          lastWornAt: approvedAt,
        };

    persistOutfits([nextOutfit, ...outfits.filter((outfit) => outfit.id !== existingOutfit?.id)]);

    const usedItemIds = new Set(itemIds);
    await persistWardrobe(
      wardrobe.map((item) =>
        usedItemIds.has(item.id)
          ? {
              ...item,
              lastWornAt: approvedAt,
            }
          : item,
      ),
    );
  }

  async function handleToggleLaundry(itemId: string, nextValue: boolean) {
    const toggledAt = new Date().toISOString();
    await persistWardrobe(
      wardrobe.map((item) =>
        item.id === itemId
          ? {
              ...item,
              inLaundry: nextValue,
              laundrySince: nextValue ? item.laundrySince ?? toggledAt : undefined,
            }
          : item,
      ),
    );
  }

  async function handleAuthAction(action: () => Promise<AppSession>) {
    setAuthLoading(true);
    setAuthError('');
    try {
      const nextSession = await action();
      setSession(nextSession);
      setDevResetToken('');
      if (nextSession.authenticated) {
        await loadUserData();
        setActiveScreen(isMobile ? 'chat' : 'generate');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to complete that action.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await handleAuthAction(() => signOut());
    setProfile(baseProfile);
    setWardrobe([]);
    setCollections(savedCollections);
    setOutfits([]);
    setMediaAssets([]);
    setEventSession({ messages: [], eventSummary: '' });
    setActiveScreen(isMobile ? 'chat' : 'generate');
  }

  async function runUploadReviewFromMedia({
    targetItemId,
    mediaAsset,
    existingItem,
  }: {
    targetItemId: string | null;
    mediaAsset: MediaAsset;
    existingItem?: WardrobeItem | null;
  }) {
    const fallbackDetection: WardrobeIdentification = {
      name: existingItem?.name ?? 'Uploaded wardrobe piece',
      category: existingItem?.category ?? 'Tops',
      color: existingItem?.color ?? 'Stone',
      fit: existingItem?.fit ?? 'Regular clean',
      material: existingItem?.material ?? 'Cotton blend',
      tags: existingItem?.tags ?? ['Uploaded piece'],
      styleNote: existingItem?.styleNote ?? 'Review the uploaded item and adjust the detected details before saving.',
      confidence: 0.62,
      note: 'Mock fallback used while the upload finishes processing.',
      mode: 'mock',
    };

    setUploadReview({
      visible: true,
      targetItemId,
      stage: 'processing',
      fileName: mediaAsset.fileName,
      imageDataUrl: mediaAsset.previewUrl,
      draft: createDraftFromIdentification({
        detection: fallbackDetection,
        imageSrc: mediaAsset.previewUrl,
        existingItem,
        targetItemId,
        mediaAssetId: mediaAsset.id,
      }),
      helperText: 'WeaR is reading the upload to detect its category, color, fit, and material.',
      mediaAsset,
    });

    try {
      const detection = await requestWardrobeIdentification({
        mediaAssetId: mediaAsset.id,
        fileName: mediaAsset.fileName,
        existingItem,
      });

      setUploadReview({
        visible: true,
        targetItemId,
        stage: 'review',
        fileName: mediaAsset.fileName,
        imageDataUrl: mediaAsset.previewUrl,
        draft: createDraftFromIdentification({
          detection,
          imageSrc: mediaAsset.previewUrl,
          existingItem,
          targetItemId,
          mediaAssetId: mediaAsset.id,
        }),
        helperText: detection.note,
        mediaAsset,
      });
    } catch (error) {
      setUploadReview({
        visible: true,
        targetItemId,
        stage: 'error',
        fileName: mediaAsset.fileName,
        imageDataUrl: mediaAsset.previewUrl,
        draft: createDraftFromIdentification({
          detection: fallbackDetection,
          imageSrc: mediaAsset.previewUrl,
          existingItem,
          targetItemId,
          mediaAssetId: mediaAsset.id,
        }),
        helperText:
          error instanceof Error
            ? `${error.message} Review the fallback details and adjust anything that looks off.`
            : 'Detection hit an error, so WeaR switched to a manual review fallback.',
        mediaAsset,
      });
    }
  }

  async function handleUploadPhoto(itemId: string, file: File) {
    const mediaAsset = await uploadMediaAsset(file, { kind: 'wardrobe-upload' });
    setMediaAssets((current) => [mediaAsset, ...current]);
    const existingItem = wardrobe.find((item) => item.id === itemId) ?? null;
    await runUploadReviewFromMedia({ targetItemId: itemId, mediaAsset, existingItem });
  }

  async function handleUploadNewItem(file: File) {
    const mediaAsset = await uploadMediaAsset(file, { kind: 'wardrobe-upload' });
    setMediaAssets((current) => [mediaAsset, ...current]);
    await runUploadReviewFromMedia({ targetItemId: null, mediaAsset });
  }

  async function handleUploadChatAsset(file: File) {
    const mediaAsset = await uploadMediaAsset(file, { kind: 'wardrobe-upload' });
    setMediaAssets((current) => [mediaAsset, ...current]);
    return mediaAsset;
  }

  async function handleCreateFromMedia(mediaAssetId: string, targetItemId: string | null = null) {
    const mediaAsset = mediaAssets.find((asset) => asset.id === mediaAssetId);
    if (!mediaAsset) return;
    const existingItem = targetItemId ? wardrobe.find((item) => item.id === targetItemId) ?? null : null;
    await runUploadReviewFromMedia({ targetItemId, mediaAsset, existingItem });
  }

  function handleAddExampleItems(itemIds: string[]) {
    const nextItems = exampleWardrobeItems.filter((item) => itemIds.includes(item.id));
    if (nextItems.length === 0) return;

    startTransition(() => {
      const nextWardrobe = wardrobe.concat(nextItems.filter((item) => !wardrobe.some((existing) => existing.id === item.id)));
      void persistWardrobe(nextWardrobe);
    });
    scheduleUploadMessage(`${nextItems.length} example item${nextItems.length > 1 ? 's' : ''} added to your wardrobe.`);
  }

  function handleReviewChange(patch: Partial<WardrobeItem>) {
    setUploadReview((current) => {
      if (!current) return current;

      const nextDraft = {
        ...current.draft,
        ...patch,
      };

      if (Object.prototype.hasOwnProperty.call(patch, 'imageDataUrl')) {
        nextDraft.imageUrl = patch.imageDataUrl ?? null;
        nextDraft.mediaAssetId = null;
      }

      return {
        ...current,
        draft: nextDraft,
        mediaAsset: Object.prototype.hasOwnProperty.call(patch, 'imageDataUrl') ? null : current.mediaAsset,
      };
    });
  }

  async function handleReviewConfirm() {
    if (!uploadReview) {
      return;
    }

    const reviewedItem: WardrobeItem = {
      ...uploadReview.draft,
      source: 'upload',
      detection: {
        state: 'reviewed',
        mode: uploadReview.draft.detection?.mode ?? 'manual',
        confidence: uploadReview.draft.detection?.confidence ?? 0.7,
        note: uploadReview.helperText,
      },
      imageUrl: uploadReview.draft.imageUrl ?? uploadReview.imageDataUrl,
      mediaAssetId: uploadReview.mediaAsset?.id ?? uploadReview.draft.mediaAssetId ?? null,
    };

    let nextWardrobe: WardrobeItem[];
    if (uploadReview.targetItemId) {
      nextWardrobe = wardrobe.map((item) => (item.id === uploadReview.targetItemId ? reviewedItem : item));
    } else {
      nextWardrobe = [reviewedItem, ...wardrobe];
    }

    await persistWardrobe(nextWardrobe);

    if (uploadReview.mediaAsset) {
      const updatedAsset = await updateMediaAsset(uploadReview.mediaAsset.id, { linkedItemId: reviewedItem.id });
      setMediaAssets((current) => current.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset)));
    }

    scheduleUploadMessage(`${reviewedItem.name} saved to your wardrobe.`);
    setUploadReview(null);
  }

  async function handleDeleteMediaAsset(mediaAssetId: string) {
    const targetAsset = mediaAssets.find((asset) => asset.id === mediaAssetId);
    if (targetAsset?.linkedItemId) {
      scheduleUploadMessage('That upload is linked to a wardrobe item. Replace the photo first before removing it.');
      return;
    }

    await deleteMediaAsset(mediaAssetId);
    setMediaAssets((current) => current.filter((asset) => asset.id !== mediaAssetId));
  }

  async function handleLegacyImport() {
    const snapshot = readLegacySnapshot();
    setLegacyLoading(true);
    try {
      if (snapshot.profile) {
        await saveProfile(snapshot.profile as unknown as Record<string, unknown>, {
          onboarded: snapshot.onboarded,
          importedLegacyData: true,
        });
        setProfile(withProfileDefaults(snapshot.profile));
      }
      if (snapshot.wardrobe) {
        await saveWardrobe(snapshot.wardrobe as unknown[]);
        setWardrobe(snapshot.wardrobe);
      }
      if (snapshot.collections) {
        await saveCollections(snapshot.collections as unknown[]);
        setCollections(snapshot.collections);
      }
      if (snapshot.outfits) {
        persistOutfits(snapshot.outfits);
      } else if (snapshot.collections && snapshot.wardrobe) {
        persistOutfits(migrateCollectionsToOutfits(snapshot.collections, snapshot.wardrobe));
      }
      if (snapshot.eventSession) {
        await saveEventSession(snapshot.eventSession);
        setEventSession(snapshot.eventSession);
      }
      clearLegacySnapshot();
      setSession((current) =>
        current.authenticated && current.user
          ? { ...current, user: { ...current.user, importedLegacyData: true, onboarded: snapshot.onboarded || current.user.onboarded } }
          : current,
      );
      setShowLegacyPrompt(false);
    } finally {
      setLegacyLoading(false);
    }
  }

  function handleDismissAchievement() {
    setPendingAchievement(null);
    const next = achievementQueueRef.current.shift();
    if (next) {
      window.setTimeout(() => setPendingAchievement(next), 300);
    }
  }

  const legacySnapshot = readLegacySnapshot();

  const appContent = (
    <main className={`relative overflow-hidden${isPresent ? ' h-full w-full' : ' desktop-canvas min-h-screen'}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <SplashScreen visible={showSplash} />

      {!showSplash && !authChecking ? (
        session.authenticated && session.user ? (
          session.user.onboarded ? (
            isMobile ? (
              <MobileWorkspace
                session={session}
                profile={profile}
                wardrobe={wardrobe}
                outfits={outfits}
                mediaAssets={mediaAssets}
                eventSession={eventSession}
                generationStatus={generationStatus}
                activeScreen={activeScreen}
                onScreenChange={(screen) => startTransition(() => setActiveScreen(screen))}
                onUploadNewItem={handleUploadNewItem}
                onUploadChatAsset={handleUploadChatAsset}
                onCreateFromMedia={handleCreateFromMedia}
                onEventSessionChange={(nextSession) => void persistEventSession(nextSession)}
                onApproveLook={handleApproveLook}
                onToggleLaundry={handleToggleLaundry}
                onDeleteOutfit={(outfit) => persistOutfits(outfits.filter((entry) => entry.id !== outfit.id))}
                onSignOut={handleSignOut}
                onRequestPasswordReset={requestPasswordReset}
              />
            ) : (
              <DesktopWorkspace
                session={session}
                profile={profile}
                wardrobe={wardrobe}
                collections={collections}
                mediaAssets={mediaAssets}
                eventSession={eventSession}
                generationStatus={generationStatus}
                activeScreen={activeScreen}
                onScreenChange={(screen) => startTransition(() => setActiveScreen(screen))}
                onUploadPhoto={handleUploadPhoto}
                onUploadNewItem={handleUploadNewItem}
                onAddExampleItems={handleAddExampleItems}
                onCreateFromMedia={handleCreateFromMedia}
                onDeleteMediaAsset={handleDeleteMediaAsset}
                onCollectionsChange={(nextCollections) => void persistCollections(nextCollections)}
                onEventSessionChange={(nextSession) => void persistEventSession(nextSession)}
                onProfileSave={(nextProfile, onboarded) => persistProfile(nextProfile, onboarded)}
                onSignOut={handleSignOut}
                onRequestPasswordReset={requestPasswordReset}
                onOpenPalette={() => setPaletteOpen(true)}
              />
            )
          ) : (
            <OnboardingFlow
                onComplete={(nextProfile) => {
                  void persistProfile(nextProfile, true);
                  setSession((current) =>
                    current.authenticated && current.user
                      ? { ...current, user: { ...current.user, onboarded: true, name: nextProfile.name } }
                      : current,
                  );
                  startTransition(() => setActiveScreen(isMobile ? 'chat' : 'generate'));
                }}
              />
          )
        ) : (
          <AuthScreen
            loading={authLoading}
            error={authError}
            devResetToken={devResetToken}
            onSignIn={(email, password) => handleAuthAction(() => signIn(email, password))}
            onSignUp={(email, password) => handleAuthAction(() => signUp(email, password))}
            onRequestPasswordReset={async (email) => {
              setAuthLoading(true);
              setAuthError('');
              try {
                const response = await requestPasswordReset(email);
                setDevResetToken(response.devResetToken ?? '');
              } catch (error) {
                setAuthError(error instanceof Error ? error.message : 'Unable to request a password reset.');
              } finally {
                setAuthLoading(false);
              }
            }}
            onResetPassword={(token, password) => handleAuthAction(() => resetPassword(token, password))}
          />
        )
      ) : null}

      <ItemReviewModal
        state={
          uploadReview ?? {
            visible: false,
            targetItemId: null,
            stage: 'processing',
            fileName: '',
            imageDataUrl: '',
            draft: wardrobe[0] ?? exampleWardrobeItems[0],
            helperText: '',
            mediaAsset: null,
          }
        }
        onClose={() => setUploadReview(null)}
        onChange={handleReviewChange}
        onConfirm={() => void handleReviewConfirm()}
      />

      {showLegacyPrompt ? (
        <LegacyImportPrompt
          wardrobeCount={legacySnapshot.wardrobe?.length ?? 0}
          collectionsCount={legacySnapshot.collections?.length ?? 0}
          hasProfile={Boolean(legacySnapshot.profile)}
          onImport={handleLegacyImport}
          onSkip={() => setShowLegacyPrompt(false)}
          loading={legacyLoading}
        />
      ) : null}

      {/* Command palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(screen) => startTransition(() => setActiveScreen(screen))}
      />

      {/* Achievement toast */}
      <AchievementToast achievement={pendingAchievement} onDismiss={handleDismissAchievement} />

      {/* Upload confirmation toast */}
      <AnimatePresence>
        {uploadMessage ? (
          <motion.div className="fixed bottom-5 left-1/2 z-[125] -translate-x-1/2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <Panel className="px-5 py-3" variant="solid">
              <p className="text-sm text-[var(--text)]">{uploadMessage}</p>
            </Panel>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );

  return isPresent ? (
    <PresentationStage>{appContent}</PresentationStage>
  ) : appContent;
}
