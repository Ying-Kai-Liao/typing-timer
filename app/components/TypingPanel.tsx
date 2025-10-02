'use client';

import { type KeyboardEvent, useCallback, useMemo } from 'react';
import type { Mode } from './types';

interface TypingPanelProps {
  typedText: string;
  onTypedTextChange: (value: string) => void;
  isTiming: boolean;
  displayMs: number;
  onWhitespaceTrigger: () => void;
  mode: Mode;
}

const modeDescription: Record<Mode, string> = {
  'one-hand': 'Use only one hand on the keyboard for this run.',
  'two-hands': 'Use both hands on the keyboard for this run.',
};

export function TypingPanel({
  typedText,
  onTypedTextChange,
  isTiming,
  displayMs,
  onWhitespaceTrigger,
  mode,
}: TypingPanelProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const isEnter = event.key === 'Enter' || event.code === 'Enter';
      if (isEnter && !event.shiftKey) {
        event.preventDefault();
        onWhitespaceTrigger();
      }
    },
    [onWhitespaceTrigger],
  );

  const timeLabel = useMemo(() => {
    const seconds = displayMs / 1000;
    return seconds.toFixed(3);
  }, [displayMs]);

  return (
    <section className="w-full rounded-3xl bg-[#e0e5ec] p-8 shadow-[8px_8px_16px_#c8cdd8,-8px_-8px_16px_#f5f7fb]">
      <header className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold text-slate-600">Typing Panel</h2>
        <p className="text-sm text-slate-500">
          Press Enter to {isTiming ? 'stop' : 'start'} the timer. {modeDescription[mode]}
        </p>
        {isTiming ? (
          <p className="text-sm text-slate-500">
            Timing in progress… press Enter to stop.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Focus the input and{' '}
            <span className="rounded-full bg-indigo-500/10 px-2 py-1 font-semibold text-indigo-600">
              press Enter to begin timing
            </span>
            .
          </p>
        )}
      </header>
      <div className="mb-8 flex flex-col gap-3">
        <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="typed-word">
          Typed word
        </label>
        <textarea
          id="typed-word"
          rows={4}
          className="w-full rounded-2xl border border-slate-300/60 bg-white px-5 py-4 text-lg font-medium text-slate-600 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-0"
          value={typedText}
          onKeyDown={handleKeyDown}
          onChange={(event) => onTypedTextChange(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#e0e5ec] px-5 py-4 shadow-[inset_4px_4px_8px_#c8cdd8,inset_-4px_-4px_8px_#f5f7fb]">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Timer</span>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-indigo-500">{timeLabel}s</p>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Press Enter once to start, again to stop.
        </div>
      </div>
    </section>
  );
}

export default TypingPanel;
