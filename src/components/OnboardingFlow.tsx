import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  baseProfile,
  fitModes,
  onboardingOccasions,
  onboardingStyleOptions,
  type UserProfile,
} from '../data/wearData';
import { cx } from '../lib/cx';
import { Panel, SectionKicker, SurfaceBadge, WindowDots } from './Chrome';

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

const confidenceGoals = [
  'Get dressed faster for work and plans.',
  'Look sharper and more body-aware.',
  'Reuse more of my wardrobe with confidence.',
  'Build stronger looks for going out.',
];

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-full border px-4 py-2.5 text-sm transition duration-300',
        active
          ? 'border-[rgba(143,150,255,0.4)] bg-[rgba(143,150,255,0.12)] text-[var(--text)] shadow-[0_0_0_6px_rgba(143,150,255,0.08)]'
          : 'border-[rgba(24,24,29,0.08)] bg-white/76 text-[var(--muted)] hover:text-[var(--text)]',
      )}
    >
      {label}
    </button>
  );
}

export function OnboardingFlow({
  onComplete,
}: {
  onComplete: (profile: UserProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(baseProfile);

  const steps = [
    { label: 'Welcome', title: 'A styling engine built from your own wardrobe.' },
    { label: 'Body', title: 'Tune the frame WeaR will style for.' },
    { label: 'Fit', title: 'Choose how clothes should sit on you.' },
    { label: 'Taste', title: 'Set the taste level, not just the trend.' },
    { label: 'Occasions', title: 'Tell WeaR where these outfits need to go.' },
    { label: 'Goal', title: 'Finish with the styling outcome you want.' },
  ];

  function togglePreference(field: 'stylePreferences' | 'occasions', value: string) {
    setProfile((current) => {
      const values = current[field];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return { ...current, [field]: nextValues };
    });
  }

  function getStepMessage(currentStep: number) {
    if (currentStep === 0 && !profile.name.trim()) {
      return 'Add your first name so WeaR can personalize the desktop experience.';
    }

    if (currentStep === 1) {
      const height = Number(profile.height);
      const weight = Number(profile.weight);

      if (!Number.isFinite(height) || height < 120 || height > 230) {
        return 'Enter a height between 120 cm and 230 cm.';
      }

      if (!Number.isFinite(weight) || weight < 35 || weight > 250) {
        return 'Enter a weight between 35 kg and 250 kg.';
      }
    }

    if (currentStep === 3 && profile.stylePreferences.length === 0) {
      return 'Choose at least one style direction so the recommendations feel like you.';
    }

    if (currentStep === 4 && profile.occasions.length === 0) {
      return 'Select at least one occasion so WeaR knows where these outfits need to land.';
    }

    if (currentStep === 5 && !profile.confidenceGoal.trim()) {
      return 'Pick the styling outcome you want WeaR to optimize for first.';
    }

    return '';
  }

  const stepMessage = getStepMessage(step);
  const canContinue = stepMessage.length === 0;

  function nextStep() {
    if (!canContinue) {
      return;
    }

    if (step === steps.length - 1) {
      onComplete(profile);
      return;
    }

    setStep((current) => current + 1);
  }

  function previousStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center px-4 py-5 lg:px-6">
      <Panel className="grid min-h-[calc(100vh-2.5rem)] w-full overflow-hidden lg:grid-cols-[0.86fr_1.14fr]" variant="glass">
        <div className="relative flex flex-col overflow-hidden border-b border-white/70 p-6 lg:border-b-0 lg:border-r lg:p-8 xl:p-10">
          <div className="flex items-center justify-between">
            <WindowDots />
            <SurfaceBadge tone="accent-soft">Onboarding</SurfaceBadge>
          </div>

          <div className="mt-10">
            <SectionKicker>WeaR</SectionKicker>
            <h1 className="font-display mt-5 max-w-[11ch] text-[2.8rem] leading-[0.97] tracking-[-0.07em] text-[var(--text)] xl:text-[4rem]">
              Dress the wardrobe you already own.
            </h1>
            <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-8 text-[var(--muted)]">
              This setup stays light. WeaR uses your proportions, fit preference, taste, and occasion needs to build stronger outfits from the clothes already in your closet.
            </p>
          </div>

          <div className="mt-10 grid gap-3">
            {steps.map((item, index) => (
              <div
                key={item.label}
                className={cx(
                  'rounded-[22px] border px-4 py-4 transition duration-300',
                  index === step
                    ? 'border-[rgba(143,150,255,0.36)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(17,18,23,0.06)]'
                    : 'border-[rgba(255,255,255,0.68)] bg-[rgba(255,255,255,0.46)]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{item.label}</p>
                    <p className="mt-2 text-[0.98rem] leading-6 text-[var(--text)]">{item.title}</p>
                  </div>
                  <span className="font-display text-[1.6rem] tracking-[-0.06em] text-[var(--text)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Panel className="mt-auto p-5" variant="solid">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Live summary</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <SurfaceBadge>{profile.path}</SurfaceBadge>
              <SurfaceBadge tone="accent">{profile.fitPreference}</SurfaceBadge>
              {profile.stylePreferences.slice(0, 2).map((item) => (
                <SurfaceBadge key={item}>{item}</SurfaceBadge>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--text)]">
              {profile.height} cm, {profile.weight} kg, {profile.shoulderLine}, {profile.legLine}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{profile.confidenceGoal}</p>
          </Panel>
        </div>

        <div className="flex min-h-[48rem] flex-col p-6 lg:p-8 xl:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <SectionKicker>Step {String(step + 1).padStart(2, '0')}</SectionKicker>
              <h2 className="mt-4 text-[2rem] leading-tight tracking-[-0.04em] text-[var(--text)] xl:text-[2.5rem]">
                {steps[step].title}
              </h2>
            </div>
            <span className="text-sm text-[var(--muted)]">{step + 1} / {steps.length}</span>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/60">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),rgba(197,223,99,0.96))]"
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={transition}
            />
          </div>

          <div className="mt-8 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={transition}
                className="h-full"
              >
                {step === 0 && (
                  <div className="grid h-full gap-4 xl:grid-cols-[1.02fr_0.98fr]">
                    <Panel className="flex flex-col justify-between p-6 xl:p-8">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Start clean</p>
                        <h3 className="mt-4 font-display text-[2.3rem] tracking-[-0.06em] text-[var(--text)]">
                          Welcome to WeaR
                        </h3>
                        <p className="mt-4 max-w-[26rem] text-[1rem] leading-8 text-[var(--muted)]">
                          WeaR is not here to push product first. It is here to read your wardrobe, understand your frame, and surface better outfits from what you already own.
                        </p>
                      </div>

                      <div className="mt-8 space-y-4">
                        <label className="block text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                          First name
                        </label>
                        <input
                          value={profile.name}
                          onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                          placeholder="Enter your first name"
                          className="h-14 w-full rounded-full border border-[rgba(24,24,29,0.08)] bg-white px-5 text-[var(--text)] outline-none ring-0 transition focus:border-[rgba(143,150,255,0.5)] focus:shadow-[0_0_0_8px_rgba(143,150,255,0.08)]"
                        />
                      </div>
                    </Panel>

                    <Panel className="p-6 xl:p-8" variant="solid">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Path</p>
                      <div className="mt-5 grid gap-3">
                        {(['Women', 'Men', 'Style-neutral'] as const).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setProfile((current) => ({ ...current, path: item }))}
                            className={cx(
                              'rounded-[22px] border px-5 py-4 text-left transition duration-300',
                              profile.path === item
                                ? 'border-[rgba(143,150,255,0.38)] bg-[rgba(143,150,255,0.12)]'
                                : 'border-[rgba(24,24,29,0.08)] bg-[rgba(248,244,238,0.7)]',
                            )}
                          >
                            <p className="text-lg text-[var(--text)]">{item}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                              {item === 'Style-neutral'
                                ? 'Let the outfit logic stay open and adapt to your style language.'
                                : `Tune styling signals for ${item.toLowerCase()} looks without losing flexibility.`}
                            </p>
                          </button>
                        ))}
                      </div>
                    </Panel>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <Panel className="p-6 xl:p-8">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Height (cm)</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={profile.height}
                            onChange={(event) => setProfile((current) => ({ ...current, height: event.target.value }))}
                            className="mt-3 h-14 w-full rounded-full border border-[rgba(24,24,29,0.08)] bg-white px-5 text-[var(--text)] outline-none focus:border-[rgba(143,150,255,0.5)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Weight (kg)</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={profile.weight}
                            onChange={(event) => setProfile((current) => ({ ...current, weight: event.target.value }))}
                            className="mt-3 h-14 w-full rounded-full border border-[rgba(24,24,29,0.08)] bg-white px-5 text-[var(--text)] outline-none focus:border-[rgba(143,150,255,0.5)]"
                          />
                        </div>
                      </div>

                      <div className="mt-8">
                        <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Shoulder line</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {['Balanced shoulder', 'Sharper shoulder', 'Softer shoulder'].map((item) => (
                            <ToggleChip
                              key={item}
                              label={item}
                              active={profile.shoulderLine === item}
                              onClick={() => setProfile((current) => ({ ...current, shoulderLine: item }))}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-8">
                        <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Leg line</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {['Longer leg line', 'Balanced line', 'Shorter leg line'].map((item) => (
                            <ToggleChip
                              key={item}
                              label={item}
                              active={profile.legLine === item}
                              onClick={() => setProfile((current) => ({ ...current, legLine: item }))}
                            />
                          ))}
                        </div>
                      </div>
                    </Panel>

                    <Panel className="p-6 xl:p-8" variant="solid">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">What this changes</p>
                      <div className="mt-5 space-y-4">
                        {[
                          'How strongly WeaR leans into longer lines versus cropped proportions',
                          'Whether structure should come from shoulders, waist, or drape',
                          'How volume is distributed so your look feels intentional, not accidental',
                        ].map((item) => (
                          <div key={item} className="rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-[rgba(248,244,238,0.78)] px-4 py-4">
                            <p className="text-[0.98rem] leading-7 text-[var(--text)]">{item}</p>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {fitModes.map((fit) => (
                      <button
                        key={fit}
                        type="button"
                        onClick={() => setProfile((current) => ({ ...current, fitPreference: fit }))}
                        className={cx(
                          'rounded-[24px] border p-6 text-left transition duration-300',
                          profile.fitPreference === fit
                            ? 'border-[rgba(143,150,255,0.38)] bg-[rgba(143,150,255,0.12)] shadow-[0_18px_48px_rgba(17,18,23,0.06)]'
                            : 'border-[rgba(24,24,29,0.08)] bg-white/82',
                        )}
                      >
                        <p className="font-display text-[2rem] tracking-[-0.06em] text-[var(--text)]">{fit}</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                          {fit === 'Slim' && 'Close through the body, cleaner shape, stronger line definition.'}
                          {fit === 'Regular' && 'Easy structure with controlled volume and classic balance.'}
                          {fit === 'Oversized' && 'More room, more drape, softer movement, still shaped with intent.'}
                          {fit === 'Mixed' && 'One piece can stay sharp while another carries volume.'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
                    <Panel className="p-6 xl:p-8">
                      <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Select your style language</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {onboardingStyleOptions.map((item) => (
                          <ToggleChip
                            key={item}
                            label={item}
                            active={profile.stylePreferences.includes(item)}
                            onClick={() => togglePreference('stylePreferences', item)}
                          />
                        ))}
                      </div>
                    </Panel>

                    <Panel className="p-6 xl:p-8" variant="solid">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Current mix</p>
                      <div className="mt-5 space-y-3">
                        {profile.stylePreferences.map((item) => (
                          <div key={item} className="rounded-[20px] bg-[rgba(248,244,238,0.86)] px-4 py-3 text-[var(--text)]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <Panel className="p-6 xl:p-8">
                      <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Where should WeaR help most?</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {onboardingOccasions.map((item) => (
                          <ToggleChip
                            key={item}
                            label={item}
                            active={profile.occasions.includes(item)}
                            onClick={() => togglePreference('occasions', item)}
                          />
                        ))}
                      </div>
                    </Panel>

                    <Panel className="p-6 xl:p-8" variant="solid">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Preview result</p>
                      <div className="mt-5 space-y-3">
                        {profile.occasions.map((item) => (
                          <div key={item} className="rounded-[20px] border border-[rgba(24,24,29,0.08)] bg-white px-4 py-3 text-[var(--text)]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                )}

                {step === 5 && (
                  <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <Panel className="p-6 xl:p-8">
                      <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Confidence goal</p>
                      <div className="mt-5 grid gap-3">
                        {confidenceGoals.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setProfile((current) => ({ ...current, confidenceGoal: item }))}
                            className={cx(
                              'rounded-[22px] border px-5 py-4 text-left transition duration-300',
                              profile.confidenceGoal === item
                                ? 'border-[rgba(143,150,255,0.38)] bg-[rgba(143,150,255,0.12)]'
                                : 'border-[rgba(24,24,29,0.08)] bg-white/82',
                            )}
                          >
                            <p className="text-[0.98rem] leading-7 text-[var(--text)]">{item}</p>
                          </button>
                        ))}
                      </div>
                    </Panel>

                    <Panel className="p-6 xl:p-8" variant="solid">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">You are ready</p>
                      <h3 className="mt-4 font-display text-[2rem] tracking-[-0.06em] text-[var(--text)]">
                        WeaR will open with wardrobe-first recommendations.
                      </h3>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {[profile.path, profile.fitPreference, ...profile.stylePreferences.slice(0, 2)].map((item) => (
                          <SurfaceBadge key={item} tone="accent">
                            {item}
                          </SurfaceBadge>
                        ))}
                      </div>
                      <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
                        Your dashboard will prioritize outfit generation from owned pieces, fit logic based on your frame, and saved looks grouped by real occasions.
                      </p>
                    </Panel>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="min-h-6 text-sm text-[var(--muted)]">
              {stepMessage || 'You can adjust all of this later in Style Profile.'}
            </div>

            <button
              type="button"
              onClick={previousStep}
              className={cx(
                'rounded-full border px-5 py-3 text-sm transition duration-300',
                step === 0
                  ? 'cursor-not-allowed border-[rgba(24,24,29,0.05)] text-[rgba(97,100,111,0.45)]'
                  : 'border-[rgba(24,24,29,0.08)] bg-white/74 text-[var(--text)] hover:-translate-y-[1px]',
              )}
              disabled={step === 0}
            >
              Back
            </button>

            <button type="button" onClick={nextStep} disabled={!canContinue} className="button-primary px-6 py-3 text-sm">
              {step === steps.length - 1 ? 'Enter WeaR' : 'Continue'}
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
