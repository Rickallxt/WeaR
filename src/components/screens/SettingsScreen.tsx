import { useState } from 'react';
import type { AuthSession, UserProfile } from '../../data/wearData';
import { useTheme } from '../../lib/theme';
import { Panel, SectionKicker, SurfaceBadge } from '../Chrome';
import { ScreenHeader } from './shared';

export function SettingsScreen({
  profile,
  session,
  resetToken = '',
  onRequestPasswordReset,
  onSignOut,
  onProfileSave: _onProfileSave,
}: {
  profile: UserProfile;
  session?: AuthSession;
  resetToken?: string;
  onRequestPasswordReset?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  onProfileSave?: (profile: UserProfile, onboarded?: boolean) => Promise<void>;
}) {
  const [resetRequested, setResetRequested] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { theme, setTheme, themes } = useTheme();

  async function handleRequestReset() {
    if (!onRequestPasswordReset) return;
    setResetRequested(true);
    try {
      await onRequestPasswordReset();
    } finally {
      setResetRequested(false);
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
    <div className="space-y-6">
      <ScreenHeader
        eyebrow="Settings"
        title="Account and preferences"
        description="Security, theme, and personalization controls."
      />

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <Panel className="p-6 xl:p-8" variant="solid">
            <SectionKicker>Account</SectionKicker>
            <div className="mt-5 grid gap-4">
              {[
                ['Name', session?.user?.name ?? profile.name],
                ['Email', session?.user?.email ?? '—'],
                ['Primary fit mode', profile.fitPreference],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[20px] px-4 py-4" style={{ background: 'var(--surface-muted)' }}>
                  <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{label}</p>
                  <p className="mt-2 text-[1rem]" style={{ color: 'var(--text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6" variant="glass">
            <SectionKicker>Security</SectionKicker>
            <div className="mt-5 space-y-4">
              {onRequestPasswordReset ? (
                <div>
                  <button
                    type="button"
                    onClick={handleRequestReset}
                    disabled={resetRequested}
                    className="button-secondary w-full text-sm"
                  >
                    {resetRequested ? 'Sending reset token...' : 'Reset password'}
                  </button>
                  {resetToken ? (
                    <div
                      className="mt-4 rounded-[20px] px-4 py-3"
                      style={{ border: '1px solid rgba(200,223,113,0.4)', background: 'rgba(200,223,113,0.12)' }}
                    >
                      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>Local-dev reset token</p>
                      <p className="mt-2 break-all text-sm leading-7" style={{ color: 'var(--text)' }}>{resetToken}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {onSignOut ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="button-ghost w-full text-sm"
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </button>
              ) : null}

              {session?.expiresAt ? (
                <p className="text-xs leading-6" style={{ color: 'var(--muted)' }}>
                  Session expires {new Date(session.expiresAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6">
          {/* ── Appearance / theme selector ── */}
          <Panel className="p-6 xl:p-8" variant="solid">
            <div className="flex items-center justify-between gap-3">
              <SectionKicker>Appearance</SectionKicker>
              <SurfaceBadge tone="accent">{themes.find((t) => t.id === theme)?.label ?? 'Light'}</SurfaceBadge>
            </div>
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--muted)' }}>
              Choose a colour theme for the entire app. Changes apply immediately.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
              {themes.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-left transition-all"
                    style={{
                      border: active ? '2px solid var(--accent)' : '1px solid var(--line)',
                      background: active ? 'var(--surface)' : 'transparent',
                      boxShadow: active ? '0 0 0 4px rgba(118, 102, 255, 0.12)' : 'none',
                    }}
                    aria-pressed={active}
                  >
                    {/* Colour swatch */}
                    <span
                      className="h-7 w-7 shrink-0 rounded-full border-2 border-white/60"
                      style={{ background: `linear-gradient(135deg, ${t.preview[0]} 50%, ${t.preview[1]} 50%)` }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: active ? 'var(--text)' : 'var(--muted)' }}
                    >
                      {t.label}
                    </span>
                    {active ? (
                      <span className="ml-auto animate-check-pop text-[0.8rem]" style={{ color: 'var(--accent)' }}>
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6 xl:p-8" variant="glass">
            <SectionKicker>Personalization</SectionKicker>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['Occasion-first recommendations', 'On'],
                ['Saved look reminders', 'Weekly'],
                ['New item prompts', 'Secondary'],
                ['Experimental styling', 'On'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] px-4 py-4"
                  style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}
                >
                  <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{label}</p>
                  <p className="mt-3 text-[1rem]" style={{ color: 'var(--text)' }}>{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6 xl:p-8" variant="soft">
            <SectionKicker>Wardrobe preferences</SectionKicker>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Hide shopping-first suggestions', 'Prioritize repeats', 'Save strongest silhouettes', 'Show occasion filters'].map((item) => (
                <SurfaceBadge key={item} tone="accent">
                  {item}
                </SurfaceBadge>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
