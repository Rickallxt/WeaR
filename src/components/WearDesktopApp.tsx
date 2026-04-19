import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { startTransition, useEffect, useRef, useState } from 'react';
import { exampleWardrobeItems } from '../data/exampleWardrobe';
import { baseProfile, navItems, savedCollections, wardrobeItems, type SavedCollection, type ScreenKey, type UserProfile, type WardrobeItem } from '../data/wearData';
import { buildWardrobeItem } from '../lib/wardrobeDrafts';
import { readFileAsDataUrl } from '../lib/fileData';
import {
  loadCollections,
  loadOnboarded,
  loadProfile,
  loadWardrobe,
  saveCollections,
  saveOnboarded,
  saveProfile,
  saveWardrobe,
} from '../lib/persistence';
import {
  fetchGenerationStatus,
  requestWardrobeIdentification,
  type GenerationStatus,
  type WardrobeIdentification,
} from '../lib/generationApi';
import {
  checkNewAchievements,
  loadUnlockedAchievements,
  saveUnlockedAchievements,
  type Achievement,
  type AchievementId,
} from '../lib/achievements';
import { Panel, SurfaceBadge } from './Chrome';
import { AchievementToast } from './AchievementToast';
import { CommandPalette } from './CommandPalette';
import { ItemReviewModal } from './ItemReviewModal';
import { OnboardingFlow } from './OnboardingFlow';
import { Sidebar } from './Sidebar';
import { SplashScreen } from './SplashScreen';
import { GenerateScreen } from './screens/GenerateScreen';
import {
  DashboardScreen,
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
};

function createDraftFromIdentification({
  detection,
  imageDataUrl,
  existingItem,
  targetItemId,
}: {
  detection: WardrobeIdentification;
  imageDataUrl: string;
  existingItem?: WardrobeItem | null;
  targetItemId: string | null;
}) {
  return buildWardrobeItem({
    id: existingItem?.id ?? targetItemId ?? `upload-${Date.now()}`,
    imageSrc: imageDataUrl,
    detection,
    source: 'upload',
    existingItem,
  });
}

function AppHeader({
  activeScreen,
  wardrobe,
  generationStatus,
  onGoHome,
  onGoGenerate,
  onOpenPalette,
}: {
  activeScreen: ScreenKey;
  wardrobe: WardrobeItem[];
  generationStatus: GenerationStatus | null;
  onGoHome: () => void;
  onGoGenerate: () => void;
  onOpenPalette: () => void;
}) {
  const activeMeta = navItems.find((item) => item.key === activeScreen);
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl || item.imageUrl)).length;
  const connectionLabel = generationStatus
    ? generationStatus.connected
      ? 'Local AI ready'
      : 'Fallback mode'
    : 'Checking local AI';

  return (
    <div
      className="flex flex-col gap-4 px-5 py-5 xl:flex-row xl:items-center xl:justify-between xl:px-6"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>WeaR app shell</p>
        <p className="mt-2 text-[1.02rem]" style={{ color: 'var(--text)' }}>{activeMeta?.caption}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <SurfaceBadge tone={generationStatus?.connected ? 'accent' : 'default'}>{connectionLabel}</SurfaceBadge>
        <SurfaceBadge>{uploadedCount}/{wardrobe.length} item photos mapped</SurfaceBadge>
        <button
          type="button"
          onClick={onOpenPalette}
          className="button-secondary text-sm"
          title="Open command palette"
        >
          <span className="mr-2 opacity-60">⌘</span>K
        </button>
        <button type="button" onClick={onGoHome} className="button-secondary text-sm">
          Open dashboard
        </button>
        <button type="button" onClick={onGoGenerate} className="button-primary text-sm">
          Generate from wardrobe
        </button>
      </div>
    </div>
  );
}

function DesktopWorkspace({
  profile,
  wardrobe,
  collections,
  generationStatus,
  activeScreen,
  onScreenChange,
  onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems,
  onCollectionsChange,
  onOpenPalette,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  collections: SavedCollection[];
  generationStatus: GenerationStatus | null;
  activeScreen: ScreenKey;
  onScreenChange: (screen: ScreenKey) => void;
  onUploadPhoto: (itemId: string, file: File) => Promise<void>;
  onUploadNewItem: (file: File) => Promise<void>;
  onAddExampleItems: (itemIds: string[]) => void;
  onCollectionsChange: (collections: SavedCollection[]) => void;
  onOpenPalette: () => void;
}) {
  function renderScreen() {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            profile={profile}
            wardrobe={wardrobe}
            generationStatus={generationStatus}
            onGoGenerate={() => onScreenChange('generate')}
            onGoWardrobe={() => onScreenChange('wardrobe')}
          />
        );
      case 'wardrobe':
        return (
          <WardrobeScreen
            wardrobe={wardrobe}
            exampleItems={exampleWardrobeItems}
            onUploadPhoto={onUploadPhoto}
            onUploadNewItem={onUploadNewItem}
            onAddExampleItems={onAddExampleItems}
          />
        );
      case 'generate':
        return (
          <GenerateScreen
            profile={profile}
            wardrobe={wardrobe}
            status={generationStatus}
            exampleItems={exampleWardrobeItems}
            onUploadPhoto={onUploadPhoto}
            onUploadNewItem={onUploadNewItem}
            onAddExampleItems={onAddExampleItems}
          />
        );
      case 'studio':
        return <StudioScreen profile={profile} wardrobe={wardrobe} />;
      case 'profile':
        return <ProfileScreen profile={profile} />;
      case 'saved':
        return (
          <SavedLooksScreen
            wardrobe={wardrobe}
            collections={collections}
            onCollectionsChange={onCollectionsChange}
          />
        );
      default:
        return <SettingsScreen profile={profile} />;
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1640px] items-center justify-center px-4 py-5 lg:px-6">
      <Panel className="flex min-h-[calc(100vh-2.5rem)] w-full flex-col overflow-hidden lg:flex-row" variant="glass">
        <Sidebar
          activeScreen={activeScreen}
          onSelect={onScreenChange}
          profile={profile}
          onOpenPalette={onOpenPalette}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            activeScreen={activeScreen}
            wardrobe={wardrobe}
            generationStatus={generationStatus}
            onGoHome={() => onScreenChange('dashboard')}
            onGoGenerate={() => onScreenChange('generate')}
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

export function WearDesktopApp() {
  const reduceMotion = useReducedMotion();
  const [showSplash, setShowSplash] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(() => loadOnboarded());
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile() ?? baseProfile);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => loadWardrobe() ?? wardrobeItems);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('dashboard');
  const [collections, setCollections] = useState<SavedCollection[]>(() => loadCollections() ?? savedCollections);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [uploadReview, setUploadReview] = useState<UploadReviewState | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);
  const unlockedRef = useRef<Set<AchievementId>>(loadUnlockedAchievements());
  const achievementQueueRef = useRef<Achievement[]>([]);

  // Splash timer
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowSplash(false);
    }, reduceMotion ? 850 : 2100);
    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion]);

  // Generation status
  useEffect(() => {
    let ignore = false;
    fetchGenerationStatus()
      .then((status) => { if (!ignore) setGenerationStatus(status); })
      .catch(() => {
        if (!ignore) {
          setGenerationStatus({
            connected: false,
            textModel: 'Fallback mode',
            imageModel: 'Local collage render',
            message: 'Local AI backend not connected yet.',
          });
        }
      });
    return () => { ignore = true; };
  }, []);

  // Persistence
  useEffect(() => { saveOnboarded(isOnboarded); }, [isOnboarded]);
  useEffect(() => { saveProfile(profile); }, [profile]);
  useEffect(() => { saveWardrobe(wardrobe); }, [wardrobe]);
  useEffect(() => { saveCollections(collections); }, [collections]);

  // Achievement checks on wardrobe change — defer setState to avoid cascading renders
  useEffect(() => {
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

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (e.key === 'Escape' && paletteOpen) {
        setPaletteOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paletteOpen]);

  function handleDismissAchievement() {
    setPendingAchievement(null);
    const next = achievementQueueRef.current.shift();
    if (next) {
      window.setTimeout(() => setPendingAchievement(next), 300);
    }
  }

  function handleOnboardingComplete(nextProfile: UserProfile) {
    setProfile(nextProfile);
    startTransition(() => {
      setIsOnboarded(true);
      setActiveScreen('dashboard');
    });
  }

  function handleScreenChange(screen: ScreenKey) {
    startTransition(() => { setActiveScreen(screen); });
  }

  function scheduleUploadMessage(message: string) {
    setUploadMessage(message);
    window.clearTimeout((scheduleUploadMessage as unknown as { timer?: number }).timer);
    (scheduleUploadMessage as unknown as { timer?: number }).timer = window.setTimeout(() => {
      setUploadMessage('');
    }, 2600);
  }

  async function runUploadReview({ targetItemId, file }: { targetItemId: string | null; file: File }) {
    const imageDataUrl = await readFileAsDataUrl(file);
    const existingItem = targetItemId ? wardrobe.find((item) => item.id === targetItemId) ?? null : null;
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
      fileName: file.name,
      imageDataUrl,
      draft: createDraftFromIdentification({ detection: fallbackDetection, imageDataUrl, existingItem, targetItemId }),
      helperText: 'WeaR is reading the upload to detect its category, color, fit, and material.',
    });

    try {
      const detection = await requestWardrobeIdentification({ imageDataUrl, fileName: file.name, existingItem });
      setUploadReview({
        visible: true,
        targetItemId,
        stage: 'review',
        fileName: file.name,
        imageDataUrl,
        draft: createDraftFromIdentification({ detection, imageDataUrl, existingItem, targetItemId }),
        helperText: detection.note,
      });
    } catch (error) {
      setUploadReview({
        visible: true,
        targetItemId,
        stage: 'error',
        fileName: file.name,
        imageDataUrl,
        draft: createDraftFromIdentification({ detection: fallbackDetection, imageDataUrl, existingItem, targetItemId }),
        helperText:
          error instanceof Error
            ? `${error.message} Review the fallback details and adjust anything that looks off.`
            : 'Detection hit an error, so WeaR switched to a manual review fallback.',
      });
    }
  }

  async function handleUploadPhoto(itemId: string, file: File) {
    await runUploadReview({ targetItemId: itemId, file });
  }

  async function handleUploadNewItem(file: File) {
    await runUploadReview({ targetItemId: null, file });
  }

  function handleAddExampleItems(itemIds: string[]) {
    const nextItems = exampleWardrobeItems.filter((item) => itemIds.includes(item.id));
    if (nextItems.length === 0) return;
    startTransition(() => {
      setWardrobe((current) =>
        current.concat(nextItems.filter((item) => !current.some((existing) => existing.id === item.id))),
      );
    });
    scheduleUploadMessage(`${nextItems.length} example item${nextItems.length > 1 ? 's' : ''} added to your wardrobe.`);
  }

  function handleReviewChange(patch: Partial<WardrobeItem>) {
    setUploadReview((current) => {
      if (!current) return current;
      return { ...current, draft: { ...current.draft, ...patch } };
    });
  }

  function handleReviewConfirm() {
    if (!uploadReview) return;
    const reviewedItem: WardrobeItem = {
      ...uploadReview.draft,
      source: 'upload',
      detection: {
        state: 'reviewed',
        mode: uploadReview.draft.detection?.mode ?? 'manual',
        confidence: uploadReview.draft.detection?.confidence ?? 0.7,
        note: uploadReview.helperText,
      },
    };
    startTransition(() => {
      setWardrobe((current) => {
        if (uploadReview.targetItemId) {
          return current.map((item) => (item.id === uploadReview.targetItemId ? reviewedItem : item));
        }
        return [reviewedItem, ...current];
      });
    });
    scheduleUploadMessage(`${reviewedItem.name} saved to your wardrobe.`);
    setUploadReview(null);
  }

  return (
    <main className="desktop-canvas relative min-h-screen overflow-hidden">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <SplashScreen visible={showSplash} />

      {!showSplash &&
        (isOnboarded ? (
          <DesktopWorkspace
            profile={profile}
            wardrobe={wardrobe}
            collections={collections}
            generationStatus={generationStatus}
            activeScreen={activeScreen}
            onScreenChange={handleScreenChange}
            onUploadPhoto={handleUploadPhoto}
            onUploadNewItem={handleUploadNewItem}
            onAddExampleItems={handleAddExampleItems}
            onCollectionsChange={setCollections}
            onOpenPalette={() => setPaletteOpen(true)}
          />
        ) : (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ))}

      <ItemReviewModal
        state={
          uploadReview ?? {
            visible: false,
            targetItemId: null,
            stage: 'processing',
            fileName: '',
            imageDataUrl: '',
            draft: wardrobe[0] ?? wardrobeItems[0],
            helperText: '',
          }
        }
        onClose={() => setUploadReview(null)}
        onChange={handleReviewChange}
        onConfirm={handleReviewConfirm}
      />

      {/* Command palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={handleScreenChange}
      />

      {/* Achievement toast */}
      <AchievementToast achievement={pendingAchievement} onDismiss={handleDismissAchievement} />

      {/* Upload confirmation toast */}
      <AnimatePresence>
        {uploadMessage ? (
          <motion.div
            className="fixed bottom-5 left-1/2 z-[125] -translate-x-1/2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Panel className="px-5 py-3" variant="solid">
              <p className="text-sm" style={{ color: 'var(--text)' }}>{uploadMessage}</p>
            </Panel>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed bottom-5 right-5">
        <SurfaceBadge tone="accent">Wardrobe-first recommendations</SurfaceBadge>
      </div>
    </main>
  );
}
