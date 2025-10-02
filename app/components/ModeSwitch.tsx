'use client';

import { useCallback } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Mode } from './types';

interface ModeSwitchProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  disabled?: boolean;
  autoAdvance: boolean;
  onToggleAutoAdvance: () => void;
}

const options: Array<{ value: Mode; label: string; shortcut: string }> = [
  {
    value: 'one-hand',
    label: 'One Hand',
    shortcut: '⌘⇧ ,',
  },
  {
    value: 'two-hands',
    label: 'Two Hands',
    shortcut: '⌘⇧ .',
  },
];

export default function ModeSwitch({
  mode,
  onModeChange,
  disabled = false,
  autoAdvance,
  onToggleAutoAdvance,
}: ModeSwitchProps) {
  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      const currentIndex = options.findIndex((option) => option.value === mode);
      if (currentIndex === -1) {
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const nextIndex = (currentIndex - 1 + options.length) % options.length;
        onModeChange(options[nextIndex].value);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        onModeChange(options[nextIndex].value);
      }
    },
    [disabled, mode, onModeChange],
  );

  return (
    <section
      className="rounded-3xl bg-[#e0e5ec] p-6 shadow-[8px_8px_16px_#c8cdd8,-8px_-8px_16px_#f5f7fb]"
      role="radiogroup"
      aria-label="Typing mode"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Mode
        </h2>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-400">
          <button
            type="button"
            onClick={onToggleAutoAdvance}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec] ${
              autoAdvance
                ? 'bg-indigo-500/90 text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.3)]'
                : 'bg-[#e0e5ec] text-slate-500 shadow-[inset_3px_3px_6px_#c8cdd8,inset_-3px_-3px_6px_#f5f7fb]'
            }`}
          >
            Auto {autoAdvance ? 'ON' : 'OFF'}
          </button>
          {disabled && <span>Timing…</span>}
        </div>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        {options.map((option) => {
          const isActive = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              disabled={disabled}
              role="radio"
              aria-checked={isActive}
              className={`flex-1 rounded-2xl px-5 py-5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec] ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.25)]'
                  : 'bg-[#e0e5ec] text-slate-600 shadow-[inset_3px_3px_6px_#c8cdd8,inset_-3px_-3px_6px_#f5f7fb] hover:text-indigo-500'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold">{option.label}</span>
                <span className="rounded-full border border-slate-300/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {option.shortcut}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
