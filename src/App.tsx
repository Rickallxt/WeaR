export { default } from './AppEntry';
/*
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';

type StepItem = {
  step: string;
  title: string;
  description: string;
  detail: string;
};

type UseCaseCard = {
  audience: string;
  title: string;
  description: string;
  looks: string[];
  palette: string;
};

type BenefitItem = {
  stat: string;
  title: string;
  description: string;
};

type PreviewLook = {
  name: string;
  pieces: string[];
  note: string;
};

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const navigation = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Body + fit', href: '#body-fit' },
  { label: 'Looks', href: '#looks' },
  { label: 'Benefits', href: '#benefits' },
] as const;

const steps: StepItem[] = [
  {
    step: '01',
    title: 'Map the wardrobe',
    description: 'Upload, tag, or build your closet digitally from the pieces you already wear.',
    detail: 'Tops, trousers, layers, shoes, occasion pieces, and the items that usually get ignored.',
  },
  {
    step: '02',
    title: 'Tune the fit profile',
    description: 'Add height, weight, body shape, proportions, and how you actually like clothes to sit.',
    detail: 'Relaxed, sharp, oversized, clean, waist-led, long-line, or anything in between.',
  },
  {
    step: '03',
    title: 'Get styled looks',
    description: 'Receive outfit combinations built from your own wardrobe for moods, plans, and repeatable confidence.',
    detail: 'Work, nights out, travel days, clean basics, elevated minimal, or a stronger fashion moment.',
  },
];

const previewLooks: PreviewLook[] = [
  {
    name: 'Gallery night',
    pieces: ['Bone bomber', 'Black column trouser', 'Silver sneaker'],
    note: 'Lengthened silhouette, sharper shoulder line, zero new purchases.',
  },
  {
    name: 'Weekend city',
    pieces: ['Soft knit tank', 'Wide jean', 'Light trench'],
    note: 'Relaxed proportion balance with more shape through the waist.',
  },
  {
    name: 'Dinner late',
    pieces: ['Clean shirt', 'Dark skirt or trouser', 'Refined leather layer'],
    note: 'Low-effort polish pulled from what is already in rotation.',
  },
];

const useCases: UseCaseCard[] = [
  {
    audience: 'Women',
    title: 'Sharper silhouettes without shopping first',
    description: 'Build cleaner weekday looks, richer evening layers, and stronger shape from pieces already hanging in the wardrobe.',
    looks: ['Soft tailoring', 'After-dark minimal', 'Elevated casual'],
    palette: 'from-[#f6d7d1] via-[#fff8f2] to-[#eef0ff]',
  },
  {
    audience: 'Men',
    title: 'Better proportions from the closet you already have',
    description: 'Refine fit, balance volume, and repeat the pieces that work hardest without defaulting to the same outfit every time.',
    looks: ['Relaxed tailoring', 'City uniform', 'Weekend polish'],
    palette: 'from-[#d7e3f7] via-[#fbf7f0] to-[#eef8d1]',
  },
  {
    audience: 'Universal',
    title: 'Style by mood, plan, and confidence level',
    description: 'When the occasion changes, WeaR adapts the outfit logic without losing your personal taste or fit preferences.',
    looks: ['Travel day', 'Creative work', 'Dinner out'],
    palette: 'from-[#ece6ff] via-[#fffaf4] to-[#dff3eb]',
  },
];

const benefits: BenefitItem[] = [
  {
    stat: '3x',
    title: 'More outfit use',
    description: 'Unlock combinations that make existing pieces feel new instead of forgotten.',
  },
  {
    stat: '-less',
    title: 'Lower impulse buying',
    description: 'See what already works before adding more to the wardrobe.',
  },
  {
    stat: 'Body-led',
    title: 'Smarter fit choices',
    description: 'Silhouette suggestions adapt to proportions, preferred shape, and the way you actually wear clothes.',
  },
  {
    stat: 'Daily',
    title: 'Faster style decisions',
    description: 'Spend less time guessing and more time stepping out in a look that feels considered.',
  },
];

const loaderPaths = [
  {
    size: 136,
    color: 'rgba(143, 150, 255, 0.90)',
    blur: '0 24px 40px rgba(143, 150, 255, 0.28)',
    x: [0, 46, 88, 70, 12, -58, -106, -72, -14, 54, 104, 0],
    y: [-94, -64, -4, 60, 104, 78, 10, -58, -106, -82, -20, -94],
    scale: [1, 1.04, 0.98, 1.03, 1],
    delay: 0,
  },
  {
    size: 88,
    color: 'rgba(197, 223, 99, 0.86)',
    blur: '0 20px 34px rgba(197, 223, 99, 0.24)',
    x: [10, 52, 78, 46, -8, -58, -82, -44, 16, 60, 88, 10],
    y: [-58, -26, 20, 62, 82, 54, 6, -50, -74, -48, -4, -58],
    scale: [1, 0.96, 1.04, 0.98, 1],
    delay: 0.24,
  },
  {
    size: 54,
    color: 'rgba(255, 255, 255, 0.92)',
    blur: '0 16px 26px rgba(255, 255, 255, 0.40)',
    x: [0, 30, 56, 30, -10, -38, -56, -26, 12, 42, 62, 0],
    y: [-28, -10, 18, 42, 52, 30, 0, -32, -46, -22, 6, -28],
    scale: [1, 1.08, 0.95, 1.02, 1],
    delay: 0.48,
  },
];

const bodySignals = [
  'Height, weight, and proportion balance',
  'Body shape and shoulder-to-waist read',
  'Preferred fit from close to oversized',
  'Occasion, mood, and weather context',
];

const wardrobeSignals = [
  'Owned pieces mapped into categories',
  'Colors, textures, and layering range',
  'Most-worn items versus hidden gems',
  'What repeats well and what clashes',
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.9, delay, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cx('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      <p className="section-label">{eyebrow}</p>
      <h2 className="font-display mt-5 text-[2rem] leading-[1.02] tracking-[-0.04em] text-[var(--text)] sm:text-[2.6rem] lg:text-[3.3rem]">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-[var(--muted)] sm:text-[1.05rem]">
        {description}
      </p>
    </div>
  );
}

function EditorialFrame({
  label,
  palette,
  tall = false,
}: {
  label: string;
  palette: string;
  tall?: boolean;
}) {
  return (
    <div
      className={cx(
        'editorial-frame relative overflow-hidden rounded-[28px] border border-white/70',
        tall ? 'aspect-[4/5]' : 'aspect-[16/10]',
      )}
    >
      <div className={cx('absolute inset-0 bg-gradient-to-br', palette)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_44%)]" />
      <div className="absolute left-[14%] top-[12%] h-[62%] w-[34%] rounded-[999px] bg-white/54 blur-[2px]" />
      <div className="absolute left-[38%] top-[18%] h-[58%] w-[22%] rounded-[999px] bg-[rgba(20,20,24,0.08)]" />
      <div className="absolute left-[28%] top-[52%] h-[28%] w-[42%] rounded-[30px] bg-[rgba(255,255,255,0.64)]" />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-full border border-white/80 bg-white/68 px-4 py-3 text-[0.72rem] uppercase tracking-[0.3em] text-[var(--muted)] backdrop-blur-xl">
        <span>{label}</span>
        <span>Preview</span>
      </div>
    </div>
  );
}

function PageLoader({ visible }: { visible: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(248,244,238,0.95)] backdrop-blur-[18px]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.2 : 0.7, ease: smoothEase } }}
        >
          <div className="relative flex h-[320px] w-[320px] items-center justify-center sm:h-[360px] sm:w-[360px]">
            <motion.div
              className="absolute h-[280px] w-[280px] rounded-full border border-white/80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_58%)]"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={reduceMotion ? undefined : { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <div className="absolute h-[228px] w-[228px] rounded-full border border-[rgba(23,23,25,0.07)]" />
            <div className="absolute h-[156px] w-[156px] rounded-full border border-[rgba(143,150,255,0.16)]" />
            {loaderPaths.map((path) => (
              <motion.div
                key={path.size}
                className="absolute rounded-full border border-white/70"
                style={{
                  width: path.size,
                  height: path.size,
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), ${path.color})`,
                  boxShadow: path.blur,
                }}
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : {
                        x: path.x,
                        y: path.y,
                        scale: path.scale,
                        opacity: [0.92, 1, 0.88, 1],
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 5.8,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'loop',
                        ease: 'easeInOut',
                        delay: path.delay,
                      }
                }
              />
            ))}
            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
              <p className="section-label">Wardrobe intelligence</p>
              <div className="font-display text-[2.9rem] tracking-[-0.08em] text-[var(--text)] sm:text-[3.6rem]">
                WeaR
              </div>
              <p className="max-w-[13rem] text-sm leading-6 text-[var(--muted)]">
                Styling your own closet with sharper motion and calmer confidence.
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Navbar() {
  return (
    <div className="sticky top-4 z-40 px-5 md:px-10 xl:px-14">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between rounded-full border border-white/70 bg-[rgba(255,255,255,0.74)] px-4 py-3 shadow-[0_18px_60px_rgba(23,23,25,0.08)] backdrop-blur-2xl sm:px-6">
        <a
          href="#top"
          className="font-display text-[1.7rem] tracking-[-0.08em] text-[var(--text)]"
        >
          WeaR
        </a>
        <nav className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors duration-300 hover:text-[var(--text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#waitlist" className="button-secondary text-sm">
          Early access
        </a>
      </div>
    </div>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="top" className="relative px-5 pb-18 pt-12 md:px-10 md:pb-24 lg:pt-16 xl:px-14">
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <Reveal className="relative z-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(23,23,25,0.08)] bg-white/72 px-4 py-2 text-[0.72rem] uppercase tracking-[0.28em] text-[var(--muted)] backdrop-blur-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-2)] shadow-[0_0_0_6px_rgba(197,223,99,0.15)]" />
            Wardrobe-first styling
          </div>
          <h1 className="font-display mt-8 max-w-[12ch] text-balance text-[3.35rem] leading-[0.94] tracking-[-0.075em] text-[var(--text)] sm:text-[4.25rem] lg:text-[5.45rem] xl:text-[6.2rem]">
            Style what you already own.
          </h1>
          <p className="mt-7 max-w-[36rem] text-[1.07rem] leading-8 text-[var(--muted)] sm:text-[1.12rem]">
            WeaR maps your wardrobe, proportions, and fit preferences to build better outfits from the clothes already in your closet. Fashion-first, personal, and made for women and men who want sharper looks without buying more first.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a href="#waitlist" className="button-primary">
              Join early access
            </a>
            <a href="#preview" className="button-secondary">
              See the wardrobe flow
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            {['Body-led suggestions', 'Women + men', 'Shopping later, not first'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(23,23,25,0.08)] bg-white/70 px-4 py-2 backdrop-blur-xl"
              >
                {item}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="relative lg:pl-6" delay={0.12}>
          <motion.div
            className="glass-panel relative overflow-hidden rounded-[34px] p-4 sm:p-6 lg:p-8"
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={reduceMotion ? undefined : { duration: 7.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[rgba(143,150,255,0.14)] blur-[70px]" />
            <div className="absolute bottom-6 left-8 h-32 w-32 rounded-full bg-[rgba(197,223,99,0.18)] blur-[64px]" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Concept preview</p>
                <h2 className="mt-3 font-display text-[1.7rem] tracking-[-0.05em] text-[var(--text)] sm:text-[2rem]">
                  Your wardrobe, better styled
                </h2>
              </div>
              <div className="rounded-full border border-[rgba(23,23,25,0.08)] bg-white/78 px-4 py-2 text-sm text-[var(--muted)]">
                Owned pieces only
              </div>
            </div>

            <div className="mt-7 grid gap-4 xl:grid-cols-[1.03fr_0.97fr]">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <EditorialFrame label="Look study 01" palette="from-[#dfe3ff] via-[#fffaf5] to-[#f0f6d8]" tall />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  <EditorialFrame label="Waist balance" palette="from-[#efe3da] via-[#fffaf5] to-[#edf0ff]" />
                  <EditorialFrame label="Layer read" palette="from-[#dfeeed] via-[#fffaf5] to-[#f5e8ff]" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="soft-panel rounded-[30px] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">Live recommendation</p>
                      <h3 className="mt-2 text-xl font-medium text-[var(--text)]">Tonight, built from your own closet</h3>
                    </div>
                    <span className="rounded-full bg-[rgba(143,150,255,0.12)] px-3 py-1 text-sm text-[var(--text)]">
                      92% wardrobe use
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    {previewLooks.map((look) => (
                      <div
                        key={look.name}
                        className="rounded-[24px] border border-white/75 bg-white/78 p-4 shadow-[0_12px_30px_rgba(23,23,25,0.06)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{look.name}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {look.pieces.map((piece) => (
                                <span
                                  key={piece}
                                  className="rounded-full border border-[rgba(23,23,25,0.06)] bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-sm text-[var(--text)]"
                                >
                                  {piece}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{look.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="soft-panel rounded-[26px] p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Body read</p>
                    <p className="mt-3 text-lg text-[var(--text)]">Longer line + structured shoulder + softer waist emphasis</p>
                  </div>
                  <div className="soft-panel rounded-[26px] p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Purchase pressure</p>
                    <p className="mt-3 text-lg text-[var(--text)]">Secondary, subtle, and only after the wardrobe has been maximized.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function WardrobePreview() {
  return (
    <section id="preview" className="px-5 py-20 md:px-10 md:py-28 xl:px-14 xl:py-32">
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <SectionHeading
            eyebrow="Wardrobe intelligence"
            title="Personal style built from your closet, not a storefront"
            description="WeaR starts with what you already own, then layers in body proportions, fit taste, and occasion cues to generate combinations that actually feel like you."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <Reveal className="soft-panel rounded-[32px] p-6 sm:p-8" delay={0.06}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-[2rem] tracking-[-0.05em] text-[var(--text)]">What WeaR reads</h3>
              <span className="rounded-full bg-[rgba(197,223,99,0.14)] px-3 py-1 text-sm text-[var(--text)]">
                Input layer
              </span>
            </div>

            <div className="mt-7 grid gap-4">
              <div className="rounded-[24px] border border-white/80 bg-white/76 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Body + fit</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {bodySignals.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[rgba(23,23,25,0.06)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-sm text-[var(--text)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/80 bg-white/76 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Wardrobe + usage</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {wardrobeSignals.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[rgba(23,23,25,0.06)] bg-[rgba(255,255,255,0.9)] px-3 py-2 text-sm text-[var(--text)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(143,150,255,0.16),rgba(255,255,255,0.86))] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Primary rule</p>
                    <p className="mt-3 text-xl text-[var(--text)]">Use what exists first. Suggest new pieces later, lightly, and only when it actually improves the system.</p>
                  </div>
                  <span className="rounded-full border border-white/80 bg-white/84 px-3 py-1 text-sm text-[var(--text)]">
                    Wardrobe-first
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="glass-panel rounded-[32px] p-6 sm:p-8" delay={0.12}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-label">What comes back</p>
                <h3 className="mt-4 font-display text-[2rem] tracking-[-0.05em] text-[var(--text)] sm:text-[2.4rem]">
                  Better combinations, clearer silhouette logic
                </h3>
              </div>
              <div className="rounded-[22px] border border-white/75 bg-white/80 px-4 py-3 text-sm text-[var(--muted)]">
                Shopping later: 08%
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
              <div className="rounded-[28px] border border-white/75 bg-white/78 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Style return</p>
                <div className="mt-5 space-y-3">
                  {[
                    'Looks sorted by mood, occasion, and confidence level',
                    'Silhouette notes that explain why a combination works',
                    'Repeatable formulas for pieces you wear often',
                    'Clarity on what shapes flatter your frame most',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                      <p className="text-[0.98rem] leading-7 text-[var(--text)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(255,255,255,0.68))] p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <EditorialFrame label="Look board" palette="from-[#d8ddff] via-[#fff8f2] to-[#eef7d8]" tall />
                  <div className="flex flex-col gap-4">
                    <div className="rounded-[24px] border border-[rgba(23,23,25,0.06)] bg-white/90 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Silhouette read</p>
                      <p className="mt-3 text-lg text-[var(--text)]">A cleaner vertical line lands better than extra volume here.</p>
                    </div>
                    <div className="rounded-[24px] border border-[rgba(23,23,25,0.06)] bg-white/90 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Best match</p>
                      <p className="mt-3 text-lg text-[var(--text)]">Use the cropped layer with a longer trouser to balance proportion and shape.</p>
                    </div>
                    <div className="rounded-[24px] border border-[rgba(23,23,25,0.06)] bg-white/90 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Mood filter</p>
                      <p className="mt-3 text-lg text-[var(--text)]">Quiet luxury, clean night out, easy weekend, creative studio.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="px-5 py-20 md:px-10 md:py-28 xl:px-14 xl:py-32">
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Three clean steps from closet to sharper outfits"
            description="No cluttered setup. No product dump. Just the wardrobe you have, the body you dress, and styling help that feels modern."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {steps.map((item, index) => (
            <Reveal key={item.step} delay={0.08 * index}>
              <motion.article
                className="soft-panel h-full rounded-[30px] p-6 sm:p-8"
                whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
                transition={{ duration: 0.35, ease: smoothEase }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-display text-[2.3rem] tracking-[-0.06em] text-[var(--text)]">{item.step}</span>
                  <span className="rounded-full border border-white/80 bg-white/84 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    WeaR flow
                  </span>
                </div>
                <h3 className="mt-8 text-[1.55rem] leading-tight text-[var(--text)]">{item.title}</h3>
                <p className="mt-4 text-[1rem] leading-7 text-[var(--muted)]">{item.description}</p>
                <p className="mt-6 border-t border-[rgba(23,23,25,0.06)] pt-6 text-sm leading-6 text-[var(--text)]">
                  {item.detail}
                </p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BodyAndFitSection() {
  return (
    <section id="body-fit" className="px-5 py-20 md:px-10 md:py-28 xl:px-14 xl:py-32">
      <div className="mx-auto grid max-w-[1280px] gap-5 lg:grid-cols-[0.96fr_1.04fr]">
        <Reveal className="soft-panel rounded-[34px] p-6 sm:p-8 lg:p-10">
          <p className="section-label">Body + wardrobe intelligence</p>
          <h2 className="font-display mt-5 max-w-[11ch] text-[2.45rem] leading-[0.98] tracking-[-0.06em] text-[var(--text)] sm:text-[3rem] lg:text-[4rem]">
            Style based on your body and your wardrobe.
          </h2>
          <p className="mt-6 max-w-[34rem] text-[1.02rem] leading-8 text-[var(--muted)]">
            WeaR does not treat everyone like the same mannequin. It reads proportion, shape, preferred fit, and the clothing you already own to show which silhouettes feel cleaner, longer, sharper, or more balanced on your frame.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Reads</p>
              <p className="mt-3 text-lg text-[var(--text)]">Length, width, drape, waist emphasis, shoulder balance, and how volume interacts with your proportions.</p>
            </div>
            <div className="rounded-[28px] bg-white/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Responds</p>
              <p className="mt-3 text-lg text-[var(--text)]">With stronger combinations, cleaner shape decisions, and looks that feel more intentional on your body.</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="glass-panel rounded-[34px] p-6 sm:p-8 lg:p-10" delay={0.1}>
          <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
            <div className="rounded-[30px] border border-white/80 bg-white/78 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Profile input</p>
              <div className="mt-5 space-y-3">
                {[
                  ['Height', '173 cm'],
                  ['Weight', '68 kg'],
                  ['Shape', 'Balanced shoulder / softer waist'],
                  ['Fit preference', 'Clean relaxed'],
                  ['Occasion bias', 'Studio, dinner, travel'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 rounded-[20px] border border-[rgba(23,23,25,0.06)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
                  >
                    <span className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
                    <span className="text-sm text-[var(--text)]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[30px] bg-[linear-gradient(145deg,rgba(143,150,255,0.16),rgba(255,255,255,0.86))] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Silhouette note</p>
                <p className="mt-4 text-xl leading-8 text-[var(--text)]">
                  Keep the line long through the leg, hold the shoulder clean, and let the waist read without over-tightening the look.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <EditorialFrame label="Body read" palette="from-[#dbe3ff] via-[#fffaf4] to-[#f2f7db]" tall />
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/75 bg-white/86 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Best pieces to repeat</p>
                    <p className="mt-3 text-lg text-[var(--text)]">Cropped outerwear, long trouser, structured knit, refined sneaker.</p>
                  </div>
                  <div className="rounded-[24px] border border-white/75 bg-white/86 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Avoid overbuying</p>
                    <p className="mt-3 text-lg text-[var(--text)]">Most gaps are styling gaps, not product gaps. That is where WeaR starts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LooksSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="looks" className="px-5 py-20 md:px-10 md:py-28 xl:px-14 xl:py-32">
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <SectionHeading
            eyebrow="Use cases"
            title="For women, for men, and for every mood in between"
            description="WeaR stays wardrobe-first across style identities. The output shifts with the person, the plan, and the confidence level you want to wear that day."
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {useCases.map((card, index) => (
            <Reveal key={card.audience} delay={0.08 * index}>
              <motion.article
                className="glass-panel h-full rounded-[32px] p-5 sm:p-6"
                whileHover={reduceMotion ? undefined : { y: -7 }}
                transition={{ duration: 0.35, ease: smoothEase }}
              >
                <EditorialFrame label={card.audience} palette={card.palette} tall />
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-[rgba(255,255,255,0.86)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                    {card.audience}
                  </span>
                  <span className="text-sm text-[var(--muted)]">Wardrobe-based</span>
                </div>
                <h3 className="mt-5 text-[1.55rem] leading-tight text-[var(--text)]">{card.title}</h3>
                <p className="mt-4 text-[0.98rem] leading-7 text-[var(--muted)]">{card.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {card.looks.map((look) => (
                    <span
                      key={look}
                      className="rounded-full border border-[rgba(23,23,25,0.06)] bg-[rgba(255,255,255,0.84)] px-3 py-2 text-sm text-[var(--text)]"
                    >
                      {look}
                    </span>
                  ))}
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="benefits" className="px-5 py-20 md:px-10 md:py-28 xl:px-14 xl:py-32">
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <SectionHeading
            eyebrow="Why it matters"
            title="Smarter styling, less waste, more confidence"
            description="The value is not more products. It is more clarity, more wear, and a wardrobe that finally works harder for the person inside it."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((item, index) => (
            <Reveal key={item.title} delay={0.06 * index}>
              <motion.article
                className="soft-panel h-full rounded-[28px] p-6"
                whileHover={reduceMotion ? undefined : { y: -5 }}
                transition={{ duration: 0.35, ease: smoothEase }}
              >
                <p className="font-display text-[2.4rem] tracking-[-0.06em] text-[var(--text)]">{item.stat}</p>
                <h3 className="mt-6 text-[1.35rem] text-[var(--text)]">{item.title}</h3>
                <p className="mt-4 text-[0.98rem] leading-7 text-[var(--muted)]">{item.description}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WaitlistSection({
  email,
  onEmailChange,
  submitState,
  validationMessage,
  onSubmit,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  submitState: 'idle' | 'submitting' | 'success';
  validationMessage: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <section id="waitlist" className="px-5 py-20 md:px-10 md:py-28 xl:px-14 xl:py-32">
      <div className="mx-auto max-w-[1280px]">
        <Reveal className="glass-panel rounded-[38px] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="section-label">Early access</p>
              <h2 className="font-display mt-5 max-w-[10ch] text-[2.6rem] leading-[0.98] tracking-[-0.06em] text-[var(--text)] sm:text-[3.2rem] lg:text-[4.2rem]">
                Join the waitlist for WeaR.
              </h2>
              <p className="mt-6 max-w-[31rem] text-[1.04rem] leading-8 text-[var(--muted)]">
                Be first in when wardrobe-based recommendations, body-led silhouette insight, and occasion styling all arrive in one premium flow.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/80 bg-white/76 p-5 sm:p-6">
              <form className="space-y-4" onSubmit={onSubmit}>
                <label htmlFor="email" className="block text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                  Email address
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    className="min-h-14 flex-1 rounded-full border border-[rgba(23,23,25,0.08)] bg-[rgba(255,255,255,0.92)] px-5 text-[var(--text)] outline-none transition duration-300 placeholder:text-[rgba(95,98,112,0.7)] focus:border-[rgba(143,150,255,0.55)] focus:ring-4 focus:ring-[rgba(143,150,255,0.14)]"
                  />
                  <button
                    type="submit"
                    disabled={submitState === 'submitting' || submitState === 'success'}
                    className={cx(
                      'button-primary min-h-14 min-w-[11.5rem] justify-center',
                      submitState !== 'idle' && 'cursor-default',
                    )}
                  >
                    {submitState === 'submitting'
                      ? 'Saving your spot'
                      : submitState === 'success'
                        ? 'You are on the list'
                        : 'Request access'}
                  </button>
                </div>
                <div aria-live="polite" className="min-h-7 text-sm">
                  {validationMessage ? (
                    <p className={submitState === 'success' ? 'text-[var(--text)]' : 'text-[var(--muted)]'}>
                      {validationMessage}
                    </p>
                  ) : (
                    <p className="text-[var(--muted)]">For launch updates, private preview drops, and early onboarding.</p>
                  )}
                </div>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {['Women + men', 'Wardrobe-based', 'No product push first'].map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-[rgba(23,23,25,0.06)] bg-[rgba(248,245,240,0.85)] px-4 py-3 text-sm text-[var(--text)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 pb-10 pt-8 md:px-10 xl:px-14">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 rounded-[30px] border border-white/70 bg-[rgba(255,255,255,0.7)] px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-[2rem] tracking-[-0.07em] text-[var(--text)]">WeaR</p>
          <p className="mt-2 max-w-[28rem] text-sm leading-6 text-[var(--muted)]">
            Premium fashion-tech for styling the clothes you already own with more confidence, less waste, and cleaner decisions.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <a href="#preview" className="transition-colors duration-300 hover:text-[var(--text)]">
            Product
          </a>
          <a href="#looks" className="transition-colors duration-300 hover:text-[var(--text)]">
            Looks
          </a>
          <a href="#waitlist" className="transition-colors duration-300 hover:text-[var(--text)]">
            Waitlist
          </a>
        </div>
      </div>
    </footer>
  );
}

export function WearLandingPage() {
  const reduceMotion = useReducedMotion();
  const [showLoader, setShowLoader] = useState(true);
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowLoader(false);
    }, reduceMotion ? 850 : 2100);

    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion]);

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setValidationMessage('Add an email address to reserve early access.');
      setSubmitState('idle');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setValidationMessage('Use a valid email so we can send your invite.');
      setSubmitState('idle');
      return;
    }

    setSubmitState('submitting');
    setValidationMessage('');

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    setSubmitState('success');
    setValidationMessage('You are in. We will reach out with private access details soon.');
    setEmail(trimmedEmail);
  }

  return (
    <>
      <PageLoader visible={showLoader} />
      <main className="page-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="ambient ambient-three" />
        <Navbar />
        <Hero />
        <WardrobePreview />
        <HowItWorks />
        <BodyAndFitSection />
        <LooksSection />
        <BenefitsSection />
        <WaitlistSection
          email={email}
          onEmailChange={(value) => {
            setEmail(value);
            if (submitState === 'success') {
              setSubmitState('idle');
            }
            setValidationMessage('');
          }}
          submitState={submitState}
          validationMessage={validationMessage}
          onSubmit={handleWaitlistSubmit}
        />
        <Footer />
      </main>
    </>
  );
}

*/
