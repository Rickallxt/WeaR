import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MaterialIcon, Panel, SurfaceBadge } from '../Chrome';
import type { AuthSession, UserProfile, WardrobeItem } from '../../data/wearData';
import { useTheme } from '../../lib/theme';
import { OutfitsGrid, type SavedOutfitRecord } from './OutfitsGrid';

export type AvatarSheetView = 'overview' | 'profile' | 'outfits' | 'settings';

export function AvatarSheet({
  open,
  profile,
  session,
  wardrobe,
  outfits,
  userAvatarUrl,
  initialView = 'overview',
  onClose,
  onUseOutfit,
  onDeleteOutfit,
  onEditOutfit,
  onRequestPasswordReset,
  onSignOut,
}: {
  open: boolean;
  profile: UserProfile;
  session: AuthSession;
  wardrobe: WardrobeItem[];
  outfits: SavedOutfitRecord[];
  userAvatarUrl?: string | null;
  initialView?: AvatarSheetView;
  onClose: () => void;
  onUseOutfit: (outfit: SavedOutfitRecord) => void;
  onDeleteOutfit: (outfit: SavedOutfitRecord) => void;
  onEditOutfit?: (outfit: SavedOutfitRecord) => void;
  onRequestPasswordReset?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
}) {
  const reduceMotion = useReducedMotion();
  const { theme, setTheme, themes } = useTheme();
  const [activeView, setActiveView] = useState<AvatarSheetView>(initialView);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset to the requested entry point so avatar taps always reopen predictably.
      setActiveView(initialView);
    }
  }, [open, initialView]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const accountEmail = session.user?.email ?? 'No email on session';
  const styleSignals = useMemo(
    () => profile.stylePreferences.slice(0, 6),
    [profile.stylePreferences],
  );

  async function handlePasswordReset() {
    if (!onRequestPasswordReset) return;
    setResettingPassword(true);
    try {
      await onRequestPasswordReset();
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleSignOut() {
    if (!onSignOut) return;
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[84]"
            style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed inset-y-0 right-0 z-[85] flex w-full max-w-[28rem] flex-col overflow-hidden"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--panel-glass) 92%, transparent), color-mix(in srgb, var(--surface-strong) 92%, transparent))',
              borderLeft: '1px solid var(--panel-border-glass)',
              boxShadow: 'var(--shadow-strong)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Account panel"
            initial={reduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0.72 }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0.72 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.95 }}
          >
            <div
              className="border-b px-5 pb-4 pt-4"
              style={{ borderColor: 'var(--line)', paddingTop: 'calc(var(--safe-top, 0px) + 1rem)' }}
            >
              <div className="flex items-center gap-3">
                {activeView !== 'overview' ? (
                  <button
                    type="button"
                    onClick={() => setActiveView('overview')}
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
                    style={{ background: 'var(--surface-high)', border: '1px solid var(--line)', color: 'var(--muted-strong)' }}
                    aria-label="Back"
                  >
                    <MaterialIcon name="arrow_back" size={18} />
                  </button>
                ) : (
                  <div className="w-11" />
                )}

                <div className="min-w-0 flex-1 text-center">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
                    {viewEyebrow(activeView)}
                  </p>
                  <h2
                    className="mt-1 truncate text-[1.15rem] font-bold tracking-[-0.04em]"
                    style={{ color: 'var(--text)', fontFamily: 'var(--font-headline)' }}
                  >
                    {viewTitle(activeView)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95"
                  style={{ background: 'var(--surface-high)', border: '1px solid var(--line)', color: 'var(--muted-strong)' }}
                  aria-label="Close account panel"
                >
                  <MaterialIcon name="close" size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-[calc(var(--safe-bottom,0px)+1.25rem)] pt-5">
              {activeView === 'overview' ? (
                <div className="space-y-5">
                  <Panel className="overflow-hidden border border-[var(--line)] p-5" variant="glass">
                    <div
                      className="absolute inset-x-5 top-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 36%, transparent), transparent)' }}
                    />
                    <div className="relative flex items-start gap-4">
                      <div
                        className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                        style={{
                          background:
                            'linear-gradient(135deg, color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent-2) 14%, transparent))',
                          border: '1px solid color-mix(in srgb, var(--accent) 26%, transparent)',
                        }}
                      >
                        {userAvatarUrl ? (
                          <img src={userAvatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                        ) : (
                          <MaterialIcon name="person" size={30} style={{ color: 'var(--accent)' }} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <SurfaceBadge tone="live">AI concierge</SurfaceBadge>
                          <SurfaceBadge tone="accent-soft">{profile.fitPreference} fit</SurfaceBadge>
                        </div>
                        <h3
                          className="mt-3 truncate text-[1.35rem] font-bold tracking-[-0.05em]"
                          style={{ color: 'var(--text)', fontFamily: 'var(--font-headline)' }}
                        >
                          {profile.name}
                        </h3>
                        <p className="mt-1 text-sm leading-6" style={{ color: 'var(--muted)' }}>
                          {profile.confidenceGoal}
                        </p>
                        <p className="mt-3 truncate text-sm font-medium" style={{ color: 'var(--muted-strong)' }}>
                          {accountEmail}
                        </p>
                      </div>
                    </div>
                  </Panel>

                  <div className="grid grid-cols-2 gap-3">
                    <SummaryCard label="Saved outfits" value={`${outfits.length}`} detail="Reusable looks" icon="bookmark" />
                    <SummaryCard label="Approved looks" value={`${profile.approvedLooks.length}`} detail="Taste memory" icon="favorite" />
                  </div>

                  <div className="grid gap-3">
                    <NavTile
                      icon="person"
                      title="Profile"
                      description="Body signals, style preferences, and taste memory."
                      onClick={() => setActiveView('profile')}
                    />
                    <NavTile
                      icon="bookmark"
                      title="Saved outfits"
                      description="Reopen the looks you want ready in one tap."
                      tone="accent"
                      onClick={() => setActiveView('outfits')}
                      trailing={`${outfits.length}`}
                    />
                    <NavTile
                      icon="settings"
                      title="Settings"
                      description="Appearance, password reset, and account actions."
                      onClick={() => setActiveView('settings')}
                    />
                    <button
                      type="button"
                      onClick={() => void handleSignOut()}
                      disabled={!onSignOut || signingOut}
                      className="w-full rounded-[1.35rem] border px-4 py-4 text-left transition-transform active:scale-[0.99] disabled:opacity-60"
                      style={{
                        background: 'color-mix(in srgb, var(--danger) 10%, var(--surface))',
                        borderColor: 'color-mix(in srgb, var(--danger) 24%, transparent)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                          style={{ background: 'color-mix(in srgb, var(--danger) 14%, transparent)', color: 'var(--danger)' }}
                        >
                          <MaterialIcon name="logout" size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
                            {signingOut ? 'Signing out…' : 'Sign out'}
                          </p>
                          <p className="mt-1 text-sm leading-6" style={{ color: 'var(--muted)' }}>
                            Close the current session on this device.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : null}

              {activeView === 'profile' ? (
                <div className="space-y-5">
                  <Panel className="overflow-hidden border border-[var(--line)] p-5" variant="solid">
                    <div className="flex flex-wrap items-center gap-2">
                      <SurfaceBadge tone="accent-soft">{profile.path}</SurfaceBadge>
                      <SurfaceBadge tone="live">{profile.occasions.length} focus moments</SurfaceBadge>
                    </div>
                    <h3
                      className="mt-4 text-[1.25rem] font-bold tracking-[-0.04em]"
                      style={{ color: 'var(--text)', fontFamily: 'var(--font-headline)' }}
                    >
                      Style profile
                    </h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>
                      WeaR uses these signals to reduce decision time and keep every recommendation personal.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Metric label="Height" value={`${profile.height} cm`} />
                      <Metric label="Weight" value={`${profile.weight} kg`} />
                      <Metric label="Shoulders" value={profile.shoulderLine} />
                      <Metric label="Leg line" value={profile.legLine} />
                    </div>
                  </Panel>

                  <Panel className="overflow-hidden border border-[var(--line)] p-5" variant="soft">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
                      Style signals
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {styleSignals.map((preference) => (
                        <span
                          key={preference}
                          className="rounded-full border px-3 py-2 text-xs font-semibold"
                          style={{ background: 'var(--surface-high)', borderColor: 'var(--line)', color: 'var(--muted-strong)' }}
                        >
                          {preference}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1.2rem] border px-4 py-4" style={{ background: 'var(--surface-high)', borderColor: 'var(--line)' }}>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
                        Confidence goal
                      </p>
                      <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text)' }}>
                        {profile.confidenceGoal}
                      </p>
                    </div>
                  </Panel>

                  <Panel className="overflow-hidden border border-[var(--line)] p-5" variant="soft">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
                      What the AI remembers
                    </p>
                    <div className="mt-4 grid gap-3">
                      <InfoRow icon="favorite" label="Approved looks" value={`${profile.approvedLooks.length}`} />
                      <InfoRow icon="photo_camera" label="Face photos" value={`${profile.facePhotos.length}`} />
                      <InfoRow icon="auto_awesome" label="Taste notes" value={`${profile.tasteNotes.length}`} />
                    </div>
                  </Panel>
                </div>
              ) : null}

              {activeView === 'outfits' ? (
                <div className="space-y-4">
                  <Panel className="overflow-hidden border border-[var(--line)] p-4" variant="solid">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
                      Saved outfits
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>
                      These are the looks worth repeating. Send one back into chat to refine it for today.
                    </p>
                  </Panel>

                  <OutfitsGrid
                    outfits={outfits}
                    wardrobe={wardrobe}
                    onUseInChat={(outfit) => {
                      onUseOutfit(outfit);
                      onClose();
                    }}
                    onDelete={onDeleteOutfit}
                    onEdit={onEditOutfit}
                  />
                </div>
              ) : null}

              {activeView === 'settings' ? (
                <div className="space-y-5">
                  <Panel className="overflow-hidden border border-[var(--line)]" variant="solid">
                    <div className="px-5 pb-3 pt-5">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
                        Account
                      </p>
                    </div>
                    <SettingsRow icon="mail" label="Email" value={accountEmail} />
                    <button
                      type="button"
                      onClick={() => void handlePasswordReset()}
                      disabled={!onRequestPasswordReset || resettingPassword}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ borderTop: '1px solid var(--line)' }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          {resettingPassword ? 'Sending reset email…' : 'Change password'}
                        </p>
                        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                          Request a secure password reset link.
                        </p>
                      </div>
                      <MaterialIcon name="arrow_forward" size={18} style={{ color: 'var(--muted-strong)' }} />
                    </button>
                  </Panel>

                  <Panel className="overflow-hidden border border-[var(--line)] p-5" variant="soft">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
                      Appearance
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {themes.map((option) => {
                        const active = option.id === theme;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setTheme(option.id)}
                            className="rounded-[1.2rem] border px-4 py-4 text-left transition-transform active:scale-[0.99]"
                            style={{
                              background: active ? 'color-mix(in srgb, var(--accent) 12%, var(--surface-high))' : 'var(--surface-high)',
                              borderColor: active ? 'color-mix(in srgb, var(--accent) 28%, transparent)' : 'var(--line)',
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full border"
                                style={{
                                  background: `linear-gradient(135deg, ${option.preview[0]} 50%, ${option.preview[1]} 50%)`,
                                  borderColor: 'var(--line)',
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--text)' }}>
                                  {option.label}
                                </p>
                                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                                  {option.dark ? 'Dark editorial glow' : 'Soft editorial daylight'}
                                </p>
                              </div>
                              {active ? <MaterialIcon name="check_circle" size={18} style={{ color: 'var(--accent)' }} filled /> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Panel>

                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    disabled={!onSignOut || signingOut}
                    className="button-secondary w-full justify-between rounded-[1.25rem] border px-4 py-4 text-left"
                    style={{
                      background: 'color-mix(in srgb, var(--danger) 10%, var(--surface))',
                      borderColor: 'color-mix(in srgb, var(--danger) 24%, transparent)',
                      color: 'var(--danger)',
                    }}
                  >
                    <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
                    <MaterialIcon name="logout" size={18} />
                  </button>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function NavTile({
  icon,
  title,
  description,
  trailing,
  tone = 'default',
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  trailing?: string;
  tone?: 'default' | 'accent';
  onClick: () => void;
}) {
  const accent = tone === 'accent';
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[1.35rem] border px-4 py-4 text-left transition-transform active:scale-[0.99]"
      style={{
        background: accent ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'var(--surface)',
        borderColor: accent ? 'color-mix(in srgb, var(--accent) 26%, transparent)' : 'var(--line)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
          style={{
            background: accent
              ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--accent-2) 12%, transparent))'
              : 'var(--surface-high)',
            color: accent ? 'var(--accent)' : 'var(--muted-strong)',
          }}
        >
          <MaterialIcon name={icon} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {title}
            </p>
            {trailing ? <SurfaceBadge tone={accent ? 'accent' : 'accent-soft'}>{trailing}</SurfaceBadge> : null}
          </div>
          <p className="mt-1 text-sm leading-6" style={{ color: 'var(--muted)' }}>
            {description}
          </p>
        </div>
        <MaterialIcon name="arrow_forward" size={18} style={{ color: 'var(--muted-strong)' }} />
      </div>
    </button>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <Panel className="border border-[var(--line)] p-4" variant="soft">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
        <MaterialIcon name={icon} size={16} style={{ color: 'var(--accent-2)' }} />
      </div>
      <p
        className="mt-3 text-[1.35rem] font-bold tracking-[-0.04em]"
        style={{ color: 'var(--text)', fontFamily: 'var(--font-headline)' }}
      >
        {value}
      </p>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        {detail}
      </p>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border px-4 py-4" style={{ background: 'var(--surface-high)', borderColor: 'var(--line)' }}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold leading-6" style={{ color: 'var(--text)' }}>
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-[1.15rem] border px-4 py-3"
      style={{ background: 'var(--surface-high)', borderColor: 'var(--line)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}
        >
          <MaterialIcon name={icon} size={18} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </p>
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--muted-strong)' }}>
        {value}
      </p>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="min-w-0 flex-1">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
        <p className="mt-2 truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
          {value}
        </p>
      </div>
      <MaterialIcon name={icon} size={18} style={{ color: 'var(--muted-strong)' }} />
    </div>
  );
}

function viewTitle(view: AvatarSheetView) {
  if (view === 'profile') return 'Profile';
  if (view === 'outfits') return 'Saved Outfits';
  if (view === 'settings') return 'Settings';
  return 'Account';
}

function viewEyebrow(view: AvatarSheetView) {
  if (view === 'profile') return 'Style memory';
  if (view === 'outfits') return 'Reusable looks';
  if (view === 'settings') return 'Account and appearance';
  return 'Personal space';
}
