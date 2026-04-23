import { useState } from 'react';
import type { AuthSession, MediaAsset, SavedOutfit, ScreenKey, UserProfile, WardrobeItem } from '../../data/wearData';
import { normalizeScreenKey, resolveWardrobeImageSrc } from '../../data/wearData';
import type { GenerationStatus } from '../../lib/generationApi';
import type { EventSession } from '../../lib/persistence';
import { BottomTabBar } from './BottomTabBar';
import { MobileHeader } from './MobileHeader';
import { AvatarSheet, type AvatarSheetView } from './AvatarSheet';
import { MobileStyleChatV2, MobileWardrobeGuide, type StyleChatComposerIntent } from './MobileZeroUI';
import { WardrobePickerSheet } from './WardrobePickerSheet';

function staleLaundryItemsFor(wardrobe: WardrobeItem[]) {
  const now = Date.now();
  return wardrobe.filter((item) => {
    if (!item.inLaundry || !item.laundrySince) return false;
    const parsed = Date.parse(item.laundrySince);
    return Number.isFinite(parsed) && now - parsed >= 7 * 24 * 60 * 60 * 1000;
  });
}

function resolveOutfitPreviewUrl(outfit: SavedOutfit, wardrobe: WardrobeItem[]) {
  if (outfit.coverImageDataUrl) {
    return outfit.coverImageDataUrl;
  }

  const firstMatch = outfit.itemIds
    .map((itemId) => wardrobe.find((item) => item.id === itemId))
    .find((item): item is WardrobeItem => Boolean(item));

  return firstMatch ? resolveWardrobeImageSrc(firstMatch) ?? undefined : undefined;
}

export function MobileWorkspace({
  session,
  profile,
  wardrobe,
  outfits,
  mediaAssets,
  eventSession,
  generationStatus,
  activeScreen,
  onScreenChange,
  onUploadNewItem,
  onUploadChatAsset,
  onCreateFromMedia,
  onEventSessionChange,
  onApproveLook,
  onToggleLaundry,
  onDeleteOutfit,
  onRequestPasswordReset,
  onSignOut,
}: {
  session: AuthSession;
  profile: UserProfile;
  wardrobe: WardrobeItem[];
  outfits: SavedOutfit[];
  mediaAssets: MediaAsset[];
  eventSession: EventSession;
  generationStatus: GenerationStatus | null;
  activeScreen: ScreenKey;
  onScreenChange: (screen: ScreenKey) => void;
  onUploadNewItem: (file: File) => Promise<void>;
  onUploadChatAsset: (file: File) => Promise<MediaAsset>;
  onCreateFromMedia: (mediaAssetId: string, targetItemId?: string | null) => Promise<void>;
  onEventSessionChange: (session: EventSession) => void;
  onApproveLook: (payload: {
    title: string;
    vibe: string;
    rationale: string;
    items: WardrobeItem[];
    eventSummary: string;
    coverImageUrl?: string | null;
  }) => Promise<void>;
  onToggleLaundry: (itemId: string, nextValue: boolean) => Promise<void>;
  onDeleteOutfit: (outfit: SavedOutfit) => void;
  onRequestPasswordReset: (email: string) => Promise<{ devResetToken?: string }>;
  onSignOut: () => Promise<void>;
}) {
  const normalizedScreen = normalizeScreenKey(activeScreen);
  const mobileScreen = normalizedScreen === 'wardrobe' ? 'wardrobe' : 'chat';
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarInitialView, setAvatarInitialView] = useState<AvatarSheetView>('overview');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSeedIds, setPickerSeedIds] = useState<string[]>([]);
  const [composerIntent, setComposerIntent] = useState<StyleChatComposerIntent | null>(null);

  const userAvatarUrl = profile.facePhotos[0]?.imageDataUrl ?? null;
  const staleLaundryItems = staleLaundryItemsFor(wardrobe);

  function openAvatarSheet(view: AvatarSheetView = 'overview') {
    setAvatarInitialView(view);
    setAvatarOpen(true);
  }

  function queueWardrobeItemsForChat(itemIds: string[]) {
    setPickerSeedIds(itemIds);
    setComposerIntent({
      id: `wardrobe-${Date.now()}`,
      kind: 'wardrobe-items',
      itemIds,
    });
    onScreenChange('chat');
  }

  function queueOutfitForChat(outfit: SavedOutfit) {
    setComposerIntent({
      id: `outfit-${outfit.id}-${Date.now()}`,
      kind: 'outfit',
      label: outfit.name,
      previewUrl: resolveOutfitPreviewUrl(outfit, wardrobe),
      itemIds: outfit.itemIds,
    });
    onScreenChange('chat');
  }

  return (
    <div className="relative min-h-[100dvh] w-full" style={{ background: 'var(--bg)' }}>
      <MobileHeader
        title={mobileScreen === 'wardrobe' ? 'Wardrobe' : 'WeaR'}
        userAvatarUrl={userAvatarUrl}
        onAvatarPress={() => openAvatarSheet('overview')}
        avatarLabel={`${profile.name} account panel`}
      />

      {/* Mobile collapses every non-wardrobe route back into chat so legacy screen keys do not blank the shell. */}
      <main>
        <section hidden={mobileScreen !== 'chat'} style={{ display: mobileScreen === 'chat' ? 'block' : 'none' }}>
          <MobileStyleChatV2
            profile={profile}
            wardrobe={wardrobe}
            eventSession={eventSession}
            generationStatus={generationStatus}
            composerIntent={composerIntent}
            staleLaundryItems={staleLaundryItems}
            onConsumeComposerIntent={(intentId) =>
              setComposerIntent((current) => (current?.id === intentId ? null : current))
            }
            onOpenWardrobePicker={() => setPickerOpen(true)}
            onUploadChatAsset={onUploadChatAsset}
            onEventSessionChange={onEventSessionChange}
            onApproveLook={onApproveLook}
          />
        </section>

        <section hidden={mobileScreen !== 'wardrobe'} style={{ display: mobileScreen === 'wardrobe' ? 'block' : 'none' }}>
          <MobileWardrobeGuide
            wardrobe={wardrobe}
            outfits={outfits}
            mediaAssets={mediaAssets}
            onOpenChat={() => onScreenChange('chat')}
            onUseWardrobeItems={queueWardrobeItemsForChat}
            onUseOutfit={queueOutfitForChat}
            onDeleteOutfit={onDeleteOutfit}
            onUploadNewItem={onUploadNewItem}
            onCreateFromMedia={onCreateFromMedia}
            onToggleLaundry={onToggleLaundry}
          />
        </section>
      </main>

      <BottomTabBar activeScreen={mobileScreen} onSelect={onScreenChange} />

      <WardrobePickerSheet
        open={pickerOpen}
        wardrobe={wardrobe}
        selectedItemIds={pickerSeedIds}
        onClose={() => setPickerOpen(false)}
        onConfirm={(itemIds) => {
          setPickerSeedIds(itemIds);
          setPickerOpen(false);
          queueWardrobeItemsForChat(itemIds);
        }}
      />

      <AvatarSheet
        open={avatarOpen}
        initialView={avatarInitialView}
        profile={profile}
        session={session}
        wardrobe={wardrobe}
        outfits={outfits}
        userAvatarUrl={userAvatarUrl}
        onClose={() => setAvatarOpen(false)}
        onUseOutfit={queueOutfitForChat}
        onDeleteOutfit={onDeleteOutfit}
        onRequestPasswordReset={async () => {
          await onRequestPasswordReset(session.user?.email ?? '');
        }}
        onSignOut={onSignOut}
      />
    </div>
  );
}
