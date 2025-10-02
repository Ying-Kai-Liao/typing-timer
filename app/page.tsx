'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ModeSwitch from './components/ModeSwitch';
import ResultsLog from './components/ResultsLog';
import TypingPanel from './components/TypingPanel';
import type { ExperimentRecord, Mode } from './components/types';
import { buildCsvBlob } from './utils/csv';

export default function Home() {
  const [mode, setMode] = useState<Mode>('two-hands');
  const [typedText, setTypedText] = useState('');
  const [records, setRecords] = useState<ExperimentRecord[]>([]);
  const [isTiming, setIsTiming] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [displayMs, setDisplayMs] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    let frameId: number | undefined;

    const update = () => {
      if (startTime !== null) {
        setDisplayMs(performance.now() - startTime);
        frameId = requestAnimationFrame(update);
      }
    };

    if (isTiming && startTime !== null) {
      frameId = requestAnimationFrame(update);
    }

    return () => {
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isTiming, startTime]);

  const hasRecords = records.length > 0;

  const handleWhitespaceTrigger = useCallback(() => {
    if (!isTiming) {
      const now = performance.now();
      setStartTime(now);
      setIsTiming(true);
      setDisplayMs(0);
      setTypedText('');
      return;
    }

    if (startTime === null) {
      return;
    }

    const elapsed = performance.now() - startTime;
    const capturedText = typedText.trim();

    setIsTiming(false);
    setStartTime(null);
    setDisplayMs(elapsed);

    if (!capturedText) {
      return;
    }

    const newRecord: ExperimentRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode,
      elapsedMs: Math.round(elapsed),
      typedText: capturedText,
      timestamp: Date.now(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    setTypedText('');
    if (autoAdvance) {
      setMode((prevMode) => (prevMode === 'one-hand' ? 'two-hands' : 'one-hand'));
    }
  }, [autoAdvance, isTiming, mode, startTime, typedText]);

  const handleModeChange = useCallback((nextMode: Mode) => {
    setMode(nextMode);
  }, []);

  const handleClearRecords = useCallback(() => {
    setRecords([]);
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  }, []);

  const handleExportCsv = useCallback(() => {
    if (records.length === 0) {
      return;
    }

    const csvRecords = [...records]
      .reverse()
      .map((record) => ({
        id: record.id,
        mode: record.mode,
        typedText: record.typedText,
        elapsedMs: record.elapsedMs,
        elapsedSeconds: (record.elapsedMs / 1000).toFixed(3),
        timestampIso: new Date(record.timestamp).toISOString(),
      }));

    const blob = buildCsvBlob(csvRecords);
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:]/g, '-');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `typing-timer-results-${timestamp}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [records]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.metaKey || !event.shiftKey || event.repeat || isTiming) {
        return;
      }

      if (event.code === 'Comma') {
        event.preventDefault();
        handleModeChange('one-hand');
      } else if (event.code === 'Period') {
        event.preventDefault();
        handleModeChange('two-hands');
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, [handleModeChange, isTiming]);

  const statusLabel = useMemo(() => {
    if (isTiming) {
      return 'Timing in progress';
    }
    if (hasRecords) {
      return 'Ready for next run';
    }
    return 'Awaiting first run';
  }, [hasRecords, isTiming]);

  return (
    <div className="min-h-screen bg-[#e0e5ec] px-4 py-10 font-sans text-slate-700">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-3xl bg-[#e0e5ec] p-8 shadow-[8px_8px_16px_#c8cdd8,-8px_-8px_16px_#f5f7fb]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-600">
                Experiment — One Hand vs Two Hand Typing
              </h1>
              <p className="text-sm leading-relaxed text-slate-500">
                Measure how long it takes to type using one hand versus two hands.<br />Focus the typing input, press Enter to start, type, then press Enter again to stop.
              </p>
            </div>
            <div className="rounded-full bg-[#e0e5ec] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 shadow-[inset_4px_4px_8px_#c8cdd8,inset_-4px_-4px_8px_#f5f7fb]">
              {statusLabel}
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <ModeSwitch
              mode={mode}
              onModeChange={handleModeChange}
              disabled={isTiming}
              autoAdvance={autoAdvance}
              onToggleAutoAdvance={() => setAutoAdvance((prev) => !prev)}
            />

            <TypingPanel
              mode={mode}
              typedText={typedText}
              onTypedTextChange={setTypedText}
              isTiming={isTiming}
              displayMs={displayMs}
              onWhitespaceTrigger={handleWhitespaceTrigger}
            />
          </div>
          <div className="flex-shrink-0 lg:w-[420px] xl:w-[460px]">
            <ResultsLog
              mode={mode}
              records={records}
              onClearRecords={handleClearRecords}
              onDeleteRecord={handleDeleteRecord}
              onExportCsv={handleExportCsv}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
