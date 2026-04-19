import { useEffect, useState } from 'react';
import { useMobileLayout } from '../hooks/useMobileLayout';
import { MaterialIcon } from './Chrome';

type AuthMode = 'signin' | 'signup' | 'request-reset' | 'reset';

export function AuthScreen({
  loading,
  error,
  devResetToken,
  onSignIn,
  onSignUp,
  onRequestPasswordReset,
  onResetPassword,
}: {
  loading: boolean;
  error: string;
  devResetToken: string;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<void>;
  onResetPassword: (token: string, password: string) => Promise<void>;
}) {
  const isMobile = useMobileLayout();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (mode === 'request-reset' && devResetToken) {
      const timeoutId = window.setTimeout(() => {
        setToken(devResetToken);
        setMode('reset');
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [devResetToken, mode]);

  async function handleSubmit() {
    if (mode === 'signin') { await onSignIn(email, password); return; }
    if (mode === 'signup') { await onSignUp(email, password); return; }
    if (mode === 'request-reset') {
      await onRequestPasswordReset(email);
      if (devResetToken) { setToken(devResetToken); setMode('reset'); }
      return;
    }
    await onResetPassword(token, password);
  }

  const submitLabel = loading
    ? 'Working...'
    : mode === 'signin'
      ? 'Enter Your Atelier'
      : mode === 'signup'
        ? 'Create Account'
        : mode === 'request-reset'
          ? 'Send Reset Email'
          : 'Update Password';

  /* ── Shared form fields ── */
  const formFields = (
    <div className="space-y-4">
      {/* Email */}
      <label className="block">
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#cbc3d7' }}>
          Email
        </span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input mt-2"
          placeholder="you@wear.app"
          type="email"
          autoComplete="email"
          onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
        />
      </label>

      {/* Password */}
      {mode !== 'request-reset' && (
        <label className="block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#cbc3d7' }}>
              {mode === 'reset' ? 'New Password' : 'Password'}
            </span>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => setMode('request-reset')}
                className="text-xs transition-colors hover:text-[#d0bcff]"
                style={{ color: '#958ea0' }}
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="Minimum 8 characters"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
          />
        </label>
      )}

      {/* Reset token */}
      {mode === 'reset' && (
        <label className="block">
          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#cbc3d7' }}>Reset Token</span>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="field-input mt-2"
            placeholder="Paste token from email"
          />
        </label>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(147,0,10,0.2)',
            border: '1px solid rgba(255,180,171,0.2)',
            color: '#ffb4ab',
          }}
        >
          {error}
        </div>
      )}

      {/* Dev token display */}
      {devResetToken && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(79,219,200,0.1)', border: '1px solid rgba(79,219,200,0.2)' }}
        >
          <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#4fdbc8' }}>Dev reset token</p>
          <p className="break-all text-sm" style={{ color: '#e5e2e1' }}>{devResetToken}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 font-bold text-[#23005c] transition-all active:scale-98"
        style={{
          background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
          boxShadow: '0 10px 20px -5px rgba(160,120,255,0.4)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {submitLabel}
        {!loading && <MaterialIcon name="arrow_forward" size={18} />}
      </button>

      {/* Token button for request-reset */}
      {mode === 'request-reset' && (
        <button
          type="button"
          onClick={() => setMode('reset')}
          className="w-full rounded-full py-3 text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: 'var(--surface-high)',
            color: '#e5e2e1',
            border: '1px solid rgba(73,68,84,0.3)',
          }}
        >
          I already have a token
        </button>
      )}
    </div>
  );

  /* ────────────────────────────────────────────────────────────
     MOBILE LAYOUT — sign_in_personal_atelier
     ────────────────────────────────────────────────────────── */
  if (isMobile) {
    /* Determine the heading + secondary action based on current mode */
    const modeLabel =
      mode === 'signup' ? 'Create account' :
      mode === 'request-reset' ? 'Forgot password' :
      mode === 'reset' ? 'New password' :
      'Sign in';

    return (
      <div
        className="relative flex min-h-screen flex-col overflow-hidden"
        style={{
          background: '#131313',
          backgroundImage: 'radial-gradient(#2a2a2a 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Ambient blobs */}
        <div
          className="pointer-events-none fixed right-0 top-0 h-[28rem] w-[28rem] rounded-full"
          style={{ background: 'rgba(208,188,255,0.12)', filter: 'blur(80px)', transform: 'translate(35%, -35%)', opacity: 0.9 }}
        />
        <div
          className="pointer-events-none fixed bottom-0 left-0 h-[22rem] w-[22rem] rounded-full"
          style={{ background: 'rgba(79,219,200,0.08)', filter: 'blur(80px)', transform: 'translate(-35%, 35%)' }}
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">

            {/* Brand */}
            <div className="mb-10 text-center">
              <div
                className="mb-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(79,219,200,0.08)', borderColor: 'rgba(79,219,200,0.25)', color: '#4fdbc8' }}
              >
                <MaterialIcon name="auto_awesome" size={10} filled />
                AI Stylist
              </div>
              <h1
                className="mt-3 text-[3.25rem] font-extrabold tracking-tighter"
                style={{
                  fontFamily: 'var(--font-headline)',
                  background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                }}
              >
                WeaR
              </h1>
              <p className="mt-2.5 text-sm" style={{ color: '#958ea0' }}>Your personal atelier</p>
            </div>

            {/* Form card */}
            <div
              className="rounded-3xl p-6"
              style={{
                background: 'rgba(28,27,27,0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(73,68,84,0.22)',
              }}
            >
              <p className="mb-5 text-xs font-bold uppercase tracking-widest" style={{ color: '#cbc3d7' }}>
                {modeLabel}
              </p>
              {formFields}
            </div>

            {/* Secondary action — toggles between sign-in and create-account */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="text-sm" style={{ color: '#6b6478' }}>
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm font-semibold transition-colors hover:text-[#d0bcff]"
                  style={{ color: '#cbc3d7' }}
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </div>
            )}

            {/* Back to sign-in link for reset flows */}
            {(mode === 'request-reset' || mode === 'reset') && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm transition-colors hover:text-[#d0bcff]"
                  style={{ color: '#958ea0' }}
                >
                  ← Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     DESKTOP LAYOUT — 2-column
     ────────────────────────────────────────────────────────── */
  return (
    <div
      className="flex min-h-screen w-full overflow-hidden"
      style={{ background: '#131313', backgroundImage: 'radial-gradient(#2a2a2a 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
    >
      {/* Left editorial panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: '#0e0e0e', borderRight: '1px solid rgba(73,68,84,0.2)' }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-0 left-0 h-[30rem] w-[30rem] rounded-full opacity-20"
             style={{ background: 'rgba(208,188,255,0.12)', filter: 'blur(80px)', transform: 'translate(-30%, -30%)' }} />

        <div className="relative z-10">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--surface-high)', border: '1px solid var(--line)' }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#d0bcff', border: '1px solid rgba(208,188,255,0.3)' }} />
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#4fdbc8', border: '1px solid rgba(79,219,200,0.3)' }} />
              </div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(79,219,200,0.1)', borderColor: 'rgba(79,219,200,0.3)', color: '#4fdbc8' }}
              >
                <MaterialIcon name="auto_awesome" size={10} filled />
                Editorial AI Concierge
              </div>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: '#958ea0' }}>WeaR access</p>
            <h1
              className="text-[3.5rem] font-extrabold tracking-tight leading-[0.92]"
              style={{ color: '#e5e2e1', fontFamily: 'var(--font-headline)' }}
            >
              Open your wardrobe ritual.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed" style={{ color: '#958ea0' }}>
              Sign in to reopen your uploads, saved looks, event context, and AI styling flow without starting from zero.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            'Daily-ready dashboard with recent uploads and continue actions.',
            'Reusable media library that works like an attachment tray.',
            'Wardrobe-first AI recommendations from your own pieces.',
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl px-4 py-4 text-sm leading-relaxed"
              style={{ background: 'rgba(28,27,27,0.6)', border: '1px solid rgba(73,68,84,0.2)', color: '#cbc3d7' }}
            >
              <MaterialIcon name="check" size={16} className="text-[#4fdbc8] flex-shrink-0 mt-0.5" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:px-16">
        <div className="w-full max-w-[28rem]">
          {/* Logo (visible only on mobile or small desktop) */}
          <div className="mb-8 lg:mb-10">
            <h1
              className="text-4xl font-extrabold tracking-tighter"
              style={{
                fontFamily: 'var(--font-headline)',
                background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              WeaR
            </h1>
          </div>

          {/* Mode tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {([
              ['signin', 'Sign in'],
              ['signup', 'Create account'],
              ['request-reset', 'Forgot password'],
            ] as [AuthMode, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
                style={{
                  background: mode === key ? 'rgba(208,188,255,0.15)' : 'transparent',
                  border: mode === key ? '1px solid rgba(208,188,255,0.3)' : '1px solid rgba(73,68,84,0.3)',
                  color: mode === key ? '#d0bcff' : '#958ea0',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div
            className="rounded-3xl p-7"
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(73,68,84,0.2)',
            }}
          >
            <p
              className="mb-5 text-xs uppercase tracking-widest font-bold"
              style={{ color: '#cbc3d7' }}
            >
              {mode === 'signup' ? 'Create account' : mode === 'signin' ? 'Sign in' : mode === 'reset' ? 'Reset password' : 'Request reset'}
            </p>
            {formFields}
          </div>
        </div>
      </div>
    </div>
  );
}
