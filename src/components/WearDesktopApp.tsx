import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { startTransition, useEffect, useState } from 'react';
import { exampleWardrobeItems } from '../data/exampleWardrobe';
import { baseProfile, navItems, wardrobeItems, type ScreenKey, type UserProfile, type WardrobeItem } from '../data/wearData';
import { buildWardrobeItem } from '../lib/wardrobeDrafts';
import { readFileAsDataUrl } from '../lib/fileData';
import {
  fetchGenerationStatus,
  requestWardrobeIdentification,
  type GenerationStatus,
  type WardrobeIdentification,
} from '../lib/generationApi';
import { Panel, SurfaceBadge } from './Chrome';
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
    imageDataUrl,
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
}: {
  activeScreen: ScreenKey;
  wardrobe: WardrobeItem[];
  generationStatus: GenerationStatus | null;
  onGoHome: () => void;
  onGoGenerate: () => void;
}) {
  const activeMeta = navItems.find((item) => item.key === activeScreen);
  const uploadedCount = wardrobe.filter((item) => Boolean(item.imageDataUrl)).length;
  const connectionLabel = generationStatus
    ? generationStatus.connected
      ? 'OpenAI connected'
      : 'Demo mode'
    : 'Checking AI connection';

  return (
    <div className="flex flex-col gap-4 border-b border-white/70 px-5 py-5 xl:flex-row xl:items-center xl:justify-between xl:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">WeaR app shell</p>
        <p className="mt-2 text-[1.02rem] text-[var(--text)]">{activeMeta?.caption}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <SurfaceBadge tone={generationStatus?.connected ? 'accent' : 'default'}>{connectionLabel}</SurfaceBadge>
        <SurfaceBadge>{uploadedCount}/{wardrobe.length} item photos mapped</SurfaceBadge>
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
  generationStatus,
  activeScreen,
  onScreenChange,
  onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems,
}: {
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  generationStatus: GenerationStatus | null;
  activeScreen: ScreenKey;
  onScreenChange: (screen: ScreenKey) => void;
  onUploadPhoto: (itemId: string, file: File) => Promise<void>;
  onUploadNewItem: (file: File) => Promise<void>;
  onAddExampleItems: (itemIds: string[]) => void;
}) {
  function renderScreen() {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen profile={profile} wardrobe={wardrobe} />;
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
        return <SavedLooksScreen wardrobe={wardrobe} />;
      default:
        return <SettingsScreen profile={profile} />;
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1640px] items-center justify-center px-4 py-5 lg:px-6">
      <Panel className="flex min-h-[calc(100vh-2.5rem)] w-full flex-col overflow-hidden lg:flex-row" variant="glass">
        <Sidebar activeScreen={activeScreen} onSelect={onScreenChange} profile={profile} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            activeScreen={activeScreen}
            wardrobe={wardrobe}
            generationStatus={generationStatus}
            onGoHome={() => onScreenChange('dashboard')}
            onGoGenerate={() => onScreenChange('generate')}
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
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(baseProfile);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(wardrobeItems);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('dashboard');
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [uploadReview, setUploadReview] = useState<UploadReviewState | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowSplash(false);
    }, reduceMotion ? 850 : 2100);

    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion]);

  useEffect(() => {
    let ignore = false;

    fetchGenerationStatus()
      .then((status) => {
        if (!ignore) {
          setGenerationStatus(status);
        }
      })
      .catch(() => {
        if (!ignore) {
          setGenerationStatus({
            connected: false,
            textModel: 'Demo mode',
            imageModel: 'Demo render',
            message: 'OpenAI backend not connected yet.',
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  function handleOnboardingComplete(nextProfile: UserProfile) {
    setProfile(nextProfile);
    startTransition(() => {
      setIsOnboarded(true);
      setActiveScreen('dashboard');
    });
  }

  function handleScreenChange(screen: ScreenKey) {
    startTransition(() => {
      setActiveScreen(screen);
    });
  }

  function scheduleUploadMessage(message: string) {
    setUploadMessage(message);
    window.clearTimeout((scheduleUploadMessage as unknown as { timer?: number }).timer);
    (scheduleUploadMessage as unknown as { timer?: number }).timer = window.setTimeout(() => {
      setUploadMessage('');
    }, 2600);
  }

  async function runUploadReview({
    targetItemId,
    file,
  }: {
    targetItemId: string | null;
    file: File;
  }) {
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
      draft: createDraftFromIdentification({
        detection: fallbackDetection,
        imageDataUrl,
        existingItem,
        targetItemId,
      }),
      helperText: 'WeaR is reading the upload to detect its category, color, fit, and material.',
    });

    try {
      const detection = await requestWardrobeIdentification({
        imageDataUrl,
        fileName: file.name,
        existingItem,
      });

      setUploadReview({
        visible: true,
        targetItemId,
        stage: 'review',
        fileName: file.name,
        imageDataUrl,
        draft: createDraftFromIdentification({
          detection,
          imageDataUrl,
          existingItem,
          targetItemId,
        }),
        helperText: detection.note,
      });
    } catch (error) {
      setUploadReview({
        visible: true,
        targetItemId,
        stage: 'error',
        fileName: file.name,
        imageDataUrl,
        draft: createDraftFromIdentification({
          detection: fallbackDetection,
          imageDataUrl,
          existingItem,
          targetItemId,
        }),
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

    if (nextItems.length === 0) {
      return;
    }

    startTransition(() => {
      setWardrobe((current) =>
        current.concat(nextItems.filter((item) => !current.some((existing) => existing.id === item.id))),
      );
    });
    scheduleUploadMessage(`${nextItems.length} example item${nextItems.length > 1 ? 's' : ''} added to your wardrobe.`);
  }

  function handleReviewChange(patch: Partial<WardrobeItem>) {
    setUploadReview((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        draft: {
          ...current.draft,
          ...patch,
        },
      };
    });
  }

  function handleReviewConfirm() {
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
            generationStatus={generationStatus}
            activeScreen={activeScreen}
            onScreenChange={handleScreenChange}
            onUploadPhoto={handleUploadPhoto}
            onUploadNewItem={handleUploadNewItem}
            onAddExampleItems={handleAddExampleItems}
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

      <AnimatePresence>
        {uploadMessage ? (
          <motion.div
            className="fixed bottom-5 left-1/2 z-[125] -translate-x-1/2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Panel className="px-5 py-3" variant="solid">
              <p className="text-sm text-[var(--text)]">{uploadMessage}</p>
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
