import { useState } from 'react';
import {
  colorTendencies,
  styleLogic,
  type AuthSession,
  type SavedCollection,
  type UserProfile,
  type WardrobeItem,
} from '../../data/wearData';
import { useTheme } from '../../lib/theme';
import { MaterialIcon } from '../Chrome';
import { getWardrobeItemsForOutfit } from '../screens/wardrobeUtils';

function buildNewCollection(wardrobe: WardrobeItem[]): SavedCollection {
  return {
    id: `mobile-sc-${Date.now()}`,
    title: 'Wear again',
    count: 0,
    vibe: 'Daily ease',
    palette: 'from-[#ece2db] via-[#f7f2ed] to-[#dfe4ff]',
    pins: wardrobe.slice(0, 3).map((item) => item.name),
  };
}

/* ──────────────────────────────────────────────────────────────
   MobileSavedLooks — Saved collections screen
   Reference: saved_looks_wear
   ────────────────────────────────────────────────────────────── */
export function MobileSavedLooks({
  wardrobe,
  collections,
  onCollectionsChange,
  onOpenGenerate,
}: {
  wardrobe: WardrobeItem[];
  collections: SavedCollection[];
  onCollectionsChange: (collections: SavedCollection[]) => void;
  onOpenGenerate: () => void;
}) {
  const heroCollection = collections[0];
  const pinnedItems = heroCollection
    ? (getWardrobeItemsForOutfit(wardrobe, heroCollection.pins) as WardrobeItem[])
    : [];

  const COLLECTION_GRADIENTS = [
    'from-[#2a1a4a] via-[#1a1540] to-[#0e0e1a]',
    'from-[#0e2a2a] via-[#0a1f1f] to-[#0e1212]',
    'from-[#2a2010] via-[#1f180a] to-[#131008]',
    'from-[#1a0a2a] via-[#150820] to-[#0e0e18]',
  ];

  return (
    <div
      className="min-h-[100dvh] pb-tab-bar"
      style={{ paddingTop: 'calc(var(--mobile-header-height) + var(--safe-top, 0px) + 1rem)' }}
    >
      <div className="px-6 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
            >
              Saved Looks
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>
              {collections.length} collection{collections.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenGenerate}
            className="rounded-full px-5 py-2.5 font-bold text-sm text-[#23005c] transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
              boxShadow: '0 8px 16px -4px rgba(160,120,255,0.4)',
            }}
          >
            Build Look
          </button>
        </div>

        {/* Hero collection card */}
        {heroCollection ? (
          <div
            className="relative overflow-hidden rounded-3xl cursor-pointer"
            style={{ aspectRatio: '16/9' }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${heroCollection.palette ?? COLLECTION_GRADIENTS[0]}`} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
            {pinnedItems.slice(0, 3).map((item, i) => (
              item.imageDataUrl || item.imageUrl ? (
                <img
                  key={item.id}
                  src={item.imageUrl ?? item.imageDataUrl ?? ''}
                  alt={item.name}
                  className="absolute object-cover rounded-2xl"
                  style={{
                    width: '38%',
                    height: '80%',
                    top: '10%',
                    left: `${10 + i * 25}%`,
                    transform: `rotate(${[-8, 0, 8][i] ?? 0}deg)`,
                    zIndex: i + 1,
                    border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  }}
                />
              ) : null
            ))}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {heroCollection.vibe}
              </p>
              <div className="flex items-end justify-between">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-headline)' }}>
                  {heroCollection.title}
                </h2>
                <span className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                  {heroCollection.count} looks
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-3xl p-10 text-center"
            style={{ background: 'var(--surface)', border: '2px dashed rgba(73,68,84,0.3)', aspectRatio: '16/9' }}
          >
            <MaterialIcon name="collections_bookmark" size={40} className="mb-4 opacity-30" style={{ color: '#cbc3d7' }} />
            <p className="text-sm font-semibold mb-1" style={{ color: '#cbc3d7' }}>No looks saved yet</p>
            <p className="text-xs" style={{ color: '#958ea0' }}>Start pinning combinations you love</p>
          </div>
        )}

        {/* Collections grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Collections</p>
            <button
              type="button"
              onClick={() => onCollectionsChange([...collections, buildNewCollection(wardrobe)])}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--surface-high)', color: '#e5e2e1', border: '1px solid rgba(73,68,84,0.3)', minHeight: 'var(--touch-target)' }}
            >
              <MaterialIcon name="add" size={14} />
              New
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {collections.map((collection, i) => (
              <div
                key={collection.id}
                className="relative overflow-hidden rounded-2xl cursor-pointer"
                style={{ aspectRatio: '1/1.1' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.palette ?? COLLECTION_GRADIENTS[i % COLLECTION_GRADIENTS.length]}`} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs uppercase tracking-widest font-bold mb-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {collection.vibe}
                  </p>
                  <p className="text-sm font-bold text-white truncate" style={{ fontFamily: 'var(--font-headline)' }}>
                    {collection.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {collection.count} looks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCollectionsChange(collections.filter((c) => c.id !== collection.id))}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                  aria-label="Remove collection"
                >
                  <MaterialIcon name="close" size={14} className="text-white" />
                </button>
              </div>
            ))}

            {/* New collection placeholder */}
            <button
              type="button"
              onClick={() => onCollectionsChange([...collections, buildNewCollection(wardrobe)])}
              className="flex flex-col items-center justify-center rounded-2xl transition-all hover:opacity-90"
              style={{
                aspectRatio: '1/1.1',
                border: '2px dashed rgba(73,68,84,0.4)',
                background: 'var(--surface)',
                color: '#958ea0',
              }}
            >
              <MaterialIcon name="add" size={28} className="mb-2 opacity-40" />
              <span className="text-xs font-semibold">New Collection</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MobileProfile — Style profile screen
   ────────────────────────────────────────────────────────────── */
export function MobileProfile({
  profile,
  onOpenSettings,
}: {
  profile: UserProfile;
  onOpenSettings: () => void;
}) {
  return (
    <div
      className="min-h-[100dvh] pb-tab-bar"
      style={{ paddingTop: 'calc(var(--mobile-header-height) + var(--safe-top, 0px) + 1rem)' }}
    >
      <div className="px-6 space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div
            className="h-16 w-16 flex-shrink-0 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(208,188,255,0.2), rgba(79,219,200,0.1))',
              border: '2px solid rgba(208,188,255,0.3)',
            }}
          >
            <MaterialIcon name="person" size={30} className="text-[#d0bcff]" />
          </div>
          <div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
            >
              {profile.name}
            </h1>
            <div
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold"
              style={{ background: 'rgba(208,188,255,0.1)', borderColor: 'rgba(208,188,255,0.2)', color: '#d0bcff' }}
            >
              <MaterialIcon name="auto_awesome" size={12} filled />
              {profile.fitPreference} fit
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full transition-all hover:opacity-80"
            style={{ background: 'var(--surface-high)', border: '1px solid rgba(73,68,84,0.3)', color: '#cbc3d7' }}
            aria-label="Settings"
          >
            <MaterialIcon name="settings" size={20} />
          </button>
        </div>

        {/* Style metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Height', value: `${profile.height} cm` },
            { label: 'Weight', value: `${profile.weight} kg` },
            { label: 'Shoulders', value: profile.shoulderLine },
            { label: 'Leg line', value: profile.legLine },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl px-4 py-4"
              style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: '#958ea0' }}>{label}</p>
              <p
                className="mt-2 text-lg font-bold"
                style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
              >{value}</p>
            </div>
          ))}
        </div>

        {/* Style preferences */}
        <section>
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#cbc3d7' }}>
            Style Signals
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.stylePreferences.map((pref) => (
              <div
                key={pref}
                className="rounded-full border px-4 py-2 text-xs font-semibold"
                style={{ background: 'var(--surface)', borderColor: 'rgba(73,68,84,0.3)', color: '#cbc3d7' }}
              >
                {pref}
              </div>
            ))}
          </div>
        </section>

        {/* Color tendencies */}
        <section>
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#cbc3d7' }}>
            Color Palette
          </p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {colorTendencies.map((item) => (
              <div key={item.name} className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="h-12 w-12 rounded-full border-2"
                  style={{ background: item.hex, borderColor: 'rgba(73,68,84,0.3)' }}
                />
                <p className="text-xs font-semibold text-center" style={{ color: '#cbc3d7' }}>{item.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What WeaR learns */}
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>
            What WeaR Learns
          </p>
          {styleLogic.slice(0, 2).map((item) => (
            <div
              key={item}
              className="rounded-2xl px-4 py-4 text-sm leading-relaxed"
              style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.15)', color: '#cbc3d7' }}
            >
              {item}
            </div>
          ))}
        </section>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-full py-3 text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'var(--surface-high)',
              color: '#e5e2e1',
              border: '1px solid rgba(73,68,84,0.3)',
              minHeight: 'var(--touch-target)',
            }}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className="rounded-full py-3 text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'var(--surface)',
              color: '#958ea0',
              border: '1px solid rgba(73,68,84,0.2)',
              minHeight: 'var(--touch-target)',
            }}
          >
            Export Wardrobe
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MobileSettings — Account & appearance screen
   ────────────────────────────────────────────────────────────── */
export function MobileSettings({
  profile,
  session,
  onRequestPasswordReset,
  onSignOut,
}: {
  profile: UserProfile;
  session: AuthSession;
  onRequestPasswordReset?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
}) {
  const { theme, setTheme, themes } = useTheme();
  const [resetting, setResetting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleReset() {
    if (!onRequestPasswordReset) return;
    setResetting(true);
    try { await onRequestPasswordReset(); }
    finally { setResetting(false); }
  }

  async function handleSignOut() {
    if (!onSignOut) return;
    setSigningOut(true);
    try { await onSignOut(); }
    finally { setSigningOut(false); }
  }

  return (
    <div
      className="min-h-[100dvh] pb-tab-bar"
      style={{ paddingTop: 'calc(var(--mobile-header-height) + var(--safe-top, 0px) + 1rem)' }}
    >
      <div className="px-6 space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
          >
            Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#958ea0' }}>Account & appearance</p>
        </div>

        {/* Account section */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}
        >
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Account</p>
          </div>

          {/* Email row */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}
          >
            <div>
              <p className="text-xs" style={{ color: '#958ea0' }}>Email</p>
              <p className="mt-0.5 text-sm font-medium" style={{ color: '#e5e2e1' }}>
                {session.user?.email ?? '—'}
              </p>
            </div>
            <MaterialIcon name="mail" size={18} className="text-[#958ea0]" />
          </div>

          {/* Password reset row */}
          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={resetting}
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-80"
            style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}
          >
            <p className="text-sm font-medium" style={{ color: '#e5e2e1' }}>
              {resetting ? 'Sending reset email...' : 'Change Password'}
            </p>
            <MaterialIcon name="arrow_forward" size={18} className="text-[#958ea0]" />
          </button>

          {/* Sign out row */}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-80"
            style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}
          >
            <p className="text-sm font-medium" style={{ color: '#ffb4ab' }}>
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </p>
            <MaterialIcon name="logout" size={18} className="text-[#ffb4ab]" />
          </button>
        </section>

        {/* Appearance section */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}
        >
          <div className="px-5 pt-4 pb-3">
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Appearance</p>
          </div>
          <div
            className="grid grid-cols-2 gap-2 px-3 pb-3"
            style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}
          >
            {themes.map((item) => {
              const active = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className="rounded-xl px-4 py-4 text-left transition-all active:scale-95"
                  style={{
                    background: active ? 'rgba(208,188,255,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(208,188,255,0.3)' : '1px solid rgba(73,68,84,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-8 w-8 flex-shrink-0 rounded-full border"
                      style={{
                        background: `linear-gradient(135deg, ${item.preview[0]} 50%, ${item.preview[1]} 50%)`,
                        borderColor: 'rgba(73,68,84,0.3)',
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: active ? '#d0bcff' : '#e5e2e1' }}>
                        {item.label}
                      </p>
                      <p className="text-xs" style={{ color: '#958ea0' }}>
                        {item.dark ? 'Dark' : 'Light'}
                      </p>
                    </div>
                    {active && (
                      <MaterialIcon name="check_circle" size={16} className="ml-auto text-[#d0bcff]" filled />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Style goal */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}
        >
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Style Goal</p>
          </div>
          <div
            className="px-5 py-4 text-sm leading-relaxed"
            style={{ borderTop: '1px solid rgba(73,68,84,0.15)', color: '#cbc3d7' }}
          >
            {profile.confidenceGoal}
          </div>
        </section>

        {/* App info */}
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.15)' }}
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(208,188,255,0.12)' }}
          >
            <MaterialIcon name="auto_awesome" size={20} className="text-[#d0bcff]" filled />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#958ea0' }}>
            WeaR stays wardrobe-first. The app opens into a decision, not a menu.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MobileMeScreen — unified Profile + Saved + Settings
   Replaces 3 separate nav destinations with one "Me" tab
   ────────────────────────────────────────────────────────────── */
type MeSubTab = 'profile' | 'saved' | 'settings';

const SUB_TABS: { id: MeSubTab; label: string; icon: string }[] = [
  { id: 'profile',  label: 'Profile',  icon: 'person'   },
  { id: 'saved',    label: 'Saved',    icon: 'bookmark' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export function MobileMeScreen({
  profile,
  session,
  wardrobe,
  collections,
  initialTab = 'profile',
  onCollectionsChange,
  onOpenGenerate,
  onRequestPasswordReset,
  onSignOut,
}: {
  profile: UserProfile;
  session: AuthSession;
  wardrobe: WardrobeItem[];
  collections: SavedCollection[];
  initialTab?: MeSubTab;
  onCollectionsChange: (collections: SavedCollection[]) => void;
  onOpenGenerate: () => void;
  onRequestPasswordReset?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<MeSubTab>(initialTab);

  return (
    <div
      className="min-h-[100dvh] pb-tab-bar"
      style={{ paddingTop: 'calc(var(--mobile-header-height) + var(--safe-top, 0px) + 0.75rem)' }}
    >
      {/* Sub-tab pill bar */}
      <div className="px-5 pb-4">
        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--surface)' }}>
          {SUB_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95"
                style={{
                  background: active ? 'var(--surface-highest)' : 'transparent',
                  color: active ? '#e5e2e1' : '#6b6478',
                  minHeight: '2.5rem',
                }}
              >
                <MaterialIcon name={tab.icon} size={14} filled={active} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {activeTab === 'profile' && (
          <MeProfileTab profile={profile} onGoSettings={() => setActiveTab('settings')} />
        )}
        {activeTab === 'saved' && (
          <MeSavedTab
            wardrobe={wardrobe}
            collections={collections}
            onCollectionsChange={onCollectionsChange}
            onOpenGenerate={onOpenGenerate}
          />
        )}
        {activeTab === 'settings' && (
          <MeSettingsTab
            profile={profile}
            session={session}
            onRequestPasswordReset={onRequestPasswordReset}
            onSignOut={onSignOut}
          />
        )}
      </div>
    </div>
  );
}

/* ── Profile sub-tab ── */
function MeProfileTab({ profile, onGoSettings }: { profile: UserProfile; onGoSettings: () => void }) {
  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 flex-shrink-0 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(208,188,255,0.2), rgba(79,219,200,0.1))', border: '2px solid rgba(208,188,255,0.3)' }}
        >
          <MaterialIcon name="person" size={30} className="text-[#d0bcff]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold tracking-tight truncate" style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}>
            {profile.name}
          </h2>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold"
               style={{ background: 'rgba(208,188,255,0.1)', borderColor: 'rgba(208,188,255,0.2)', color: '#d0bcff' }}>
            <MaterialIcon name="auto_awesome" size={12} filled />
            {profile.fitPreference} fit
          </div>
        </div>
        <button type="button" onClick={onGoSettings}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all hover:opacity-80"
          style={{ background: 'var(--surface-high)', border: '1px solid rgba(73,68,84,0.3)', color: '#cbc3d7' }}>
          <MaterialIcon name="settings" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Height', value: `${profile.height} cm` },
          { label: 'Weight', value: `${profile.weight} kg` },
          { label: 'Shoulders', value: profile.shoulderLine },
          { label: 'Leg line', value: profile.legLine },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl px-4 py-4"
               style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: '#958ea0' }}>{label}</p>
            <p className="mt-2 text-lg font-bold" style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}>{value}</p>
          </div>
        ))}
      </div>

      <section>
        <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#cbc3d7' }}>Style Signals</p>
        <div className="flex flex-wrap gap-2">
          {profile.stylePreferences.map((pref) => (
            <div key={pref} className="rounded-full border px-4 py-2 text-xs font-semibold"
                 style={{ background: 'var(--surface)', borderColor: 'rgba(73,68,84,0.3)', color: '#cbc3d7' }}>
              {pref}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#cbc3d7' }}>Color Palette</p>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {colorTendencies.map((item) => (
            <div key={item.name} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="h-11 w-11 rounded-full border-2"
                   style={{ background: item.hex, borderColor: 'rgba(73,68,84,0.3)' }} />
              <p className="text-xs font-semibold text-center" style={{ color: '#cbc3d7' }}>{item.name}</p>
            </div>
          ))}
        </div>
      </section>

      <button type="button" onClick={onGoSettings}
        className="w-full rounded-full py-3 text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: 'var(--surface-high)', color: '#e5e2e1', border: '1px solid rgba(73,68,84,0.3)', minHeight: 'var(--touch-target)' }}>
        Edit Profile
      </button>
    </div>
  );
}

/* ── Saved sub-tab ── */
function MeSavedTab({
  wardrobe, collections, onCollectionsChange, onOpenGenerate,
}: {
  wardrobe: WardrobeItem[]; collections: SavedCollection[];
  onCollectionsChange: (c: SavedCollection[]) => void; onOpenGenerate: () => void;
}) {
  const GRADIENTS = [
    'from-[#2a1a4a] via-[#1a1540] to-[#0e0e1a]',
    'from-[#0e2a2a] via-[#0a1f1f] to-[#0e1212]',
    'from-[#2a2010] via-[#1f180a] to-[#131008]',
    'from-[#1a0a2a] via-[#150820] to-[#0e0e18]',
  ];
  const hero = collections[0];
  const pins = hero ? (getWardrobeItemsForOutfit(wardrobe, hero.pins) as WardrobeItem[]) : [];

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}>Saved Looks</h2>
          <p className="mt-0.5 text-xs" style={{ color: '#958ea0' }}>{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={onOpenGenerate}
          className="rounded-full px-4 py-2 text-sm font-bold text-[#23005c] transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)', boxShadow: '0 6px 14px -4px rgba(160,120,255,0.4)' }}>
          Build Look
        </button>
      </div>

      {hero ? (
        <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: '16/9' }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${hero.palette ?? GRADIENTS[0]}`} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
          {pins.slice(0, 3).map((item, i) =>
            item.imageUrl || item.imageDataUrl ? (
              <img key={item.id} src={item.imageUrl ?? item.imageDataUrl ?? ''} alt={item.name}
                className="absolute object-cover rounded-2xl"
                style={{ width: '38%', height: '80%', top: '10%', left: `${10 + i * 25}%`, transform: `rotate(${[-8, 0, 8][i] ?? 0}deg)`, zIndex: i + 1, border: '2px solid rgba(255,255,255,0.1)' }} />
            ) : null
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{hero.vibe}</p>
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-headline)' }}>{hero.title}</h3>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl p-10 text-center"
             style={{ background: 'var(--surface)', border: '2px dashed rgba(73,68,84,0.3)', aspectRatio: '16/9' }}>
          <MaterialIcon name="collections_bookmark" size={36} className="mb-3 opacity-30" style={{ color: '#cbc3d7' }} />
          <p className="text-sm font-semibold mb-1" style={{ color: '#cbc3d7' }}>No looks saved yet</p>
          <p className="text-xs" style={{ color: '#958ea0' }}>Generate combinations you love</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Collections</p>
          <button type="button" onClick={() => onCollectionsChange([...collections, buildNewCollection(wardrobe)])}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95"
            style={{ background: 'var(--surface-high)', color: '#e5e2e1', border: '1px solid rgba(73,68,84,0.3)' }}>
            <MaterialIcon name="add" size={14} /> New
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {collections.map((col, i) => (
            <div key={col.id} className="relative overflow-hidden rounded-2xl cursor-pointer" style={{ aspectRatio: '1/1.1' }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${col.palette ?? GRADIENTS[i % GRADIENTS.length]}`} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs uppercase tracking-widest font-bold mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{col.vibe}</p>
                <p className="text-sm font-bold text-white truncate" style={{ fontFamily: 'var(--font-headline)' }}>{col.title}</p>
              </div>
              <button type="button" onClick={() => onCollectionsChange(collections.filter((c) => c.id !== col.id))}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }} aria-label="Remove">
                <MaterialIcon name="close" size={14} className="text-white" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onCollectionsChange([...collections, buildNewCollection(wardrobe)])}
            className="flex flex-col items-center justify-center rounded-2xl transition-all hover:opacity-90"
            style={{ aspectRatio: '1/1.1', border: '2px dashed rgba(73,68,84,0.4)', background: 'var(--surface)', color: '#958ea0' }}>
            <MaterialIcon name="add" size={26} className="mb-1 opacity-40" />
            <span className="text-xs font-semibold">New Collection</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Settings sub-tab ── */
function MeSettingsTab({
  profile, session, onRequestPasswordReset, onSignOut,
}: {
  profile: UserProfile; session: AuthSession;
  onRequestPasswordReset?: () => Promise<void>; onSignOut?: () => Promise<void>;
}) {
  const { theme, setTheme, themes } = useTheme();
  const [resetting, setResetting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="space-y-5 pb-4">
      <section className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}>
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Account</p>
        </div>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}>
          <div>
            <p className="text-xs" style={{ color: '#958ea0' }}>Email</p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: '#e5e2e1' }}>{session.user?.email ?? '—'}</p>
          </div>
          <MaterialIcon name="mail" size={18} className="text-[#958ea0]" />
        </div>
        <button type="button" disabled={resetting}
          onClick={async () => { setResetting(true); try { await onRequestPasswordReset?.(); } finally { setResetting(false); } }}
          className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-80"
          style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}>
          <p className="text-sm font-medium" style={{ color: '#e5e2e1' }}>{resetting ? 'Sending...' : 'Change Password'}</p>
          <MaterialIcon name="arrow_forward" size={18} className="text-[#958ea0]" />
        </button>
        <button type="button" disabled={signingOut}
          onClick={async () => { setSigningOut(true); try { await onSignOut?.(); } finally { setSigningOut(false); } }}
          className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-80"
          style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}>
          <p className="text-sm font-medium" style={{ color: '#ffb4ab' }}>{signingOut ? 'Signing out...' : 'Sign Out'}</p>
          <MaterialIcon name="logout" size={18} className="text-[#ffb4ab]" />
        </button>
      </section>

      <section className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}>
        <div className="px-5 pt-4 pb-3">
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Appearance</p>
        </div>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3" style={{ borderTop: '1px solid rgba(73,68,84,0.15)' }}>
          {themes.map((item) => {
            const active = item.id === theme;
            return (
              <button key={item.id} type="button" onClick={() => setTheme(item.id)}
                className="rounded-xl px-4 py-4 text-left transition-all active:scale-95"
                style={{ background: active ? 'rgba(208,188,255,0.12)' : 'transparent', border: active ? '1px solid rgba(208,188,255,0.3)' : '1px solid rgba(73,68,84,0.2)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="h-8 w-8 flex-shrink-0 rounded-full border"
                    style={{ background: `linear-gradient(135deg, ${item.preview[0]} 50%, ${item.preview[1]} 50%)`, borderColor: 'rgba(73,68,84,0.3)' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: active ? '#d0bcff' : '#e5e2e1' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#958ea0' }}>{item.dark ? 'Dark' : 'Light'}</p>
                  </div>
                  {active && <MaterialIcon name="check_circle" size={16} className="ml-auto text-[#d0bcff]" filled />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid rgba(73,68,84,0.2)' }}>
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#cbc3d7' }}>Style Goal</p>
        </div>
        <div className="px-5 py-4 text-sm leading-relaxed" style={{ borderTop: '1px solid rgba(73,68,84,0.15)', color: '#cbc3d7' }}>
          {profile.confidenceGoal}
        </div>
      </section>
    </div>
  );
}
