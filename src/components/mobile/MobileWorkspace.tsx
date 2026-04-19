import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import type {
  AuthSession,
  MediaAsset,
  SavedCollection,
  ScreenKey,
  UserProfile,
  WardrobeItem,
} from '../../data/wearData';
import type { GenerationStatus } from '../../lib/generationApi';
import type { EventSession } from '../../lib/persistence';
import type { ChatAttachment, ChatMessage } from '../../lib/chatState';
import { requestEventChat } from '../../lib/generationApi';
import { BottomTabBar } from './BottomTabBar';
import { MobileChatScreen } from './MobileChatScreen';
import { MobileMeScreen } from './MobileCompanionScreens';
import { MobileHeader } from './MobileHeader';
import { MobileHeroHome, MobileWardrobeGuide } from './MobileZeroUI';

export function MobileWorkspace({
  session,
  profile,
  wardrobe,
  collections,
  mediaAssets,
  eventSession,
  generationStatus,
  activeScreen,
  onScreenChange,
  onUploadPhoto: _onUploadPhoto,
  onUploadNewItem,
  onAddExampleItems: _onAddExampleItems,
  onCreateFromMedia,
  onDeleteMediaAsset: _onDeleteMediaAsset,
  onCollectionsChange,
  onEventSessionChange: _onEventSessionChange,
  onProfileSave: _onProfileSave,
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
  /* ── Suggestion carousel (wardrobe screen) ── */
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  /* ── Chat state — persists across navigation ── */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [chatAttachments, setChatAttachments] = useState<ChatAttachment[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  /**
   * Called when user submits from the home bar or taps a quick-action pill.
   * If draft is empty → just navigate. If draft has content → send it as the
   * first message immediately and navigate.
   */
  function handleStartChat(draft: string) {
    if (!draft.trim()) {
      onScreenChange('generate');
      return;
    }
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: draft.trim(),
      attachments: chatAttachments.length > 0 ? [...chatAttachments] : undefined,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatDraft('');
    setChatAttachments([]);
    setIsAiTyping(true);
    onScreenChange('generate');

    /* Fire AI request in background */
    void sendAiReply(draft.trim(), chatAttachments, chatMessages);
  }

  /**
   * Called when the user hits Send inside MobileChatScreen.
   */
  function handleChatSend() {
    if (!chatDraft.trim() && chatAttachments.length === 0) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatDraft.trim(),
      attachments: chatAttachments.length > 0 ? [...chatAttachments] : undefined,
      timestamp: Date.now(),
    };
    const historySnapshot = [...chatMessages];
    const draftSnapshot = chatDraft.trim();
    const attachSnapshot = [...chatAttachments];

    setChatMessages((prev) => [...prev, userMsg]);
    setChatDraft('');
    setChatAttachments([]);
    setIsAiTyping(true);

    void sendAiReply(draftSnapshot, attachSnapshot, historySnapshot);
  }

  async function sendAiReply(
    userMessage: string,
    attachments: ChatAttachment[],
    history: ChatMessage[],
  ) {
    try {
      const selectedItems = wardrobe.filter((item) =>
        attachments.some((a) => a.wardrobeItemId === item.id),
      );
      const response = await requestEventChat({
        profile,
        selectedItems,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        userMessage,
      });
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.reply,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now — try again in a moment, or browse your wardrobe directly.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  }

  function renderScreen(): ReactNode {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <MobileHeroHome
            profile={profile}
            wardrobe={wardrobe}
            mediaAssets={mediaAssets}
            eventSession={eventSession}
            generationStatus={generationStatus}
            activeSuggestionIndex={activeSuggestionIndex}
            onChangeSuggestionIndex={setActiveSuggestionIndex}
            chatDraft={chatDraft}
            onDraftChange={setChatDraft}
            onStartChat={handleStartChat}
            onOpenPalette={onOpenPalette}
            onOpenWardrobe={() => onScreenChange('wardrobe')}
            onOpenSaved={() => onScreenChange('saved')}
            onOpenProfile={() => onScreenChange('profile')}
          />
        );

      case 'wardrobe':
        return (
          <MobileWardrobeGuide
            wardrobe={wardrobe}
            mediaAssets={mediaAssets}
            eventSession={eventSession}
            activeSuggestionIndex={activeSuggestionIndex}
            onOpenGenerate={() => onScreenChange('generate')}
            onUploadNewItem={onUploadNewItem}
            onCreateFromMedia={onCreateFromMedia}
          />
        );

      case 'studio': // no dedicated mobile studio — fall through to chat
      case 'generate':
        return (
          <MobileChatScreen
            profile={profile}
            wardrobe={wardrobe}
            messages={chatMessages}
            draft={chatDraft}
            attachments={chatAttachments}
            isTyping={isAiTyping}
            onDraftChange={setChatDraft}
            onAttachmentsChange={setChatAttachments}
            onSend={handleChatSend}
            onUploadFile={(file) => { void onUploadNewItem(file); }}
          />
        );

      case 'profile':
        return (
          <MobileMeScreen
            profile={profile}
            session={session}
            wardrobe={wardrobe}
            collections={collections}
            initialTab="profile"
            onCollectionsChange={onCollectionsChange}
            onOpenGenerate={() => onScreenChange('generate')}
            onRequestPasswordReset={async () => {
              await onRequestPasswordReset(session.user?.email ?? '');
            }}
            onSignOut={onSignOut}
          />
        );

      case 'saved':
        return (
          <MobileMeScreen
            profile={profile}
            session={session}
            wardrobe={wardrobe}
            collections={collections}
            initialTab="saved"
            onCollectionsChange={onCollectionsChange}
            onOpenGenerate={() => onScreenChange('generate')}
            onRequestPasswordReset={async () => {
              await onRequestPasswordReset(session.user?.email ?? '');
            }}
            onSignOut={onSignOut}
          />
        );

      default:
        return (
          <MobileMeScreen
            profile={profile}
            session={session}
            wardrobe={wardrobe}
            collections={collections}
            initialTab="settings"
            onCollectionsChange={onCollectionsChange}
            onOpenGenerate={() => onScreenChange('generate')}
            onRequestPasswordReset={async () => {
              await onRequestPasswordReset(session.user?.email ?? '');
            }}
            onSignOut={onSignOut}
          />
        );
    }
  }

  return (
    <div className="relative min-h-[100dvh] w-full" style={{ background: 'var(--bg)' }}>
      {/* Top header — always visible */}
      <MobileHeader userAvatarUrl={null} onMenuPress={onOpenPalette} />

      {/* Screen content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[100dvh]"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom tab bar */}
      <BottomTabBar activeScreen={activeScreen} onSelect={onScreenChange} />
    </div>
  );
}
