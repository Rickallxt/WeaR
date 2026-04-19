import { useEffect, useRef, useState } from 'react';
import type { ScreenKey } from '../data/wearData';

interface Command {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenKey) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: "Home — today's look and AI status",
      shortcut: 'G D',
      action: () => { onNavigate('dashboard'); onClose(); },
      keywords: ['home', 'overview', 'morning', 'daily'],
    },
    {
      id: 'wardrobe',
      label: 'Wardrobe',
      description: 'Browse, upload, and manage your pieces',
      shortcut: 'G W',
      action: () => { onNavigate('wardrobe'); onClose(); },
      keywords: ['closet', 'pieces', 'upload', 'photos', 'items'],
    },
    {
      id: 'generate',
      label: 'Start a Look',
      description: 'Generate an outfit from your wardrobe',
      shortcut: 'G G',
      action: () => { onNavigate('generate'); onClose(); },
      keywords: ['outfit', 'generate', 'occasion', 'create', 'look'],
    },
    {
      id: 'saved',
      label: 'Saved Looks',
      description: 'Browse pinned outfits and collections',
      shortcut: 'G S',
      action: () => { onNavigate('saved'); onClose(); },
      keywords: ['saved', 'pinned', 'collections', 'bookmarks', 'pins'],
    },
    {
      id: 'studio',
      label: 'Studio',
      description: 'AI-assisted wardrobe studio',
      action: () => { onNavigate('studio'); onClose(); },
      keywords: ['ai', 'experimental', 'studio', 'compose'],
    },
    {
      id: 'profile',
      label: 'Style Profile',
      description: 'Style preferences and fit mode',
      action: () => { onNavigate('profile'); onClose(); },
      keywords: ['profile', 'fit', 'preferences', 'occasions', 'style'],
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Account, theme, and personalization',
      shortcut: 'G ,',
      action: () => { onNavigate('settings'); onClose(); },
      keywords: ['settings', 'account', 'theme', 'dark mode', 'preferences', 'appearance'],
    },
  ];

  const filtered = query.trim()
    ? commands.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        );
      })
    : commands;

  // Reset index and query when palette opens; defer to avoid setState-in-effect warning
  useEffect(() => {
    if (open) {
      const id1 = window.setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
      }, 0);
      const id2 = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => {
        window.clearTimeout(id1);
        window.clearTimeout(id2);
      };
    }
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      filtered[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[13vh]"
      style={{ background: 'rgba(0,0,0,0.54)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="command-palette-enter w-full max-w-[560px] overflow-hidden rounded-[24px] mx-4"
        style={{
          border: '1px solid var(--line)',
          background: 'var(--surface-strong)',
          boxShadow: '0 48px 120px rgba(0,0,0,0.36)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
      >
        {/* Search */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--muted)' }}
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search commands and screens..."
            className="flex-1 bg-transparent text-[0.96rem] outline-none"
            style={{ color: 'var(--text)' }}
            aria-label="Search commands"
          />
          <kbd
            className="hidden items-center gap-1 rounded-[8px] border px-2 py-1 text-[0.65rem] font-medium sm:flex"
            style={{ borderColor: 'var(--line)', color: 'var(--muted)', background: 'var(--surface)' }}
          >
            esc
          </kbd>
        </div>

        {/* Command list */}
        {filtered.length > 0 ? (
          <ul className="scrollbar-thin max-h-[340px] overflow-y-auto p-2" role="listbox">
            {filtered.map((cmd, i) => {
              const isSelected = i === selectedIndex;
              return (
                <li key={cmd.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left transition-colors"
                    style={
                      isSelected
                        ? { background: 'var(--accent)', color: 'white' }
                        : { color: 'var(--text)' }
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.9rem] font-medium leading-snug">{cmd.label}</p>
                      <p
                        className="mt-0.5 truncate text-xs leading-snug"
                        style={isSelected ? { color: 'rgba(255,255,255,0.72)' } : { color: 'var(--muted)' }}
                      >
                        {cmd.description}
                      </p>
                    </div>
                    {cmd.shortcut ? (
                      <kbd
                        className="shrink-0 rounded-[6px] border px-2 py-0.5 text-[0.6rem] font-medium tracking-wider"
                        style={
                          isSelected
                            ? { background: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.24)', color: 'rgba(255,255,255,0.82)' }
                            : { background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--muted)' }
                        }
                      >
                        {cmd.shortcut}
                      </kbd>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
            No commands match &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
          <p className="text-xs font-medium tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            WeaR
          </p>
        </div>
      </div>
    </div>
  );
}
