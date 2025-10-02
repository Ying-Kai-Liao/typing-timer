'use client';

import { useMemo } from 'react';
import type { ExperimentRecord, Mode } from './types';

interface ResultsLogProps {
  mode: Mode;
  records: ExperimentRecord[];
  onClearRecords: () => void;
  onDeleteRecord: (id: string) => void;
  onExportCsv: () => void;
}

interface AggregatedEntry {
  id: string;
  elapsedMs: number;
  elapsedLabel: string;
  timestamp: number;
}

interface AggregatedRow {
  word: string;
  oneHand: AggregatedEntry[];
  twoHands: AggregatedEntry[];
  latestTimestamp: number;
}

const neuromorphicShadow = 'shadow-[8px_8px_16px_#c8cdd8,-8px_-8px_16px_#f5f7fb]';
const neuromorphicInsetShadow = 'shadow-[inset_4px_4px_8px_#c8cdd8,inset_-4px_-4px_8px_#f5f7fb]';

function formatDuration(ms: number) {
  return `${(ms / 1000).toFixed(3)}s`;
}

function aggregateRecords(records: ExperimentRecord[]): AggregatedRow[] {
  const map = new Map<string, AggregatedRow>();

  for (const record of records) {
    const key = record.typedText;
    if (!map.has(key)) {
      map.set(key, {
        word: key,
        oneHand: [],
        twoHands: [],
        latestTimestamp: record.timestamp,
      });
    }

    const row = map.get(key)!;
    const target = record.mode === 'one-hand' ? row.oneHand : row.twoHands;
    target.push({
      id: record.id,
      elapsedMs: record.elapsedMs,
      elapsedLabel: formatDuration(record.elapsedMs),
      timestamp: record.timestamp,
    });

    if (record.timestamp > row.latestTimestamp) {
      row.latestTimestamp = record.timestamp;
    }
  }

  const rows = Array.from(map.values());
  for (const row of rows) {
    row.oneHand.sort((a, b) => b.timestamp - a.timestamp);
    row.twoHands.sort((a, b) => b.timestamp - a.timestamp);
  }

  rows.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  return rows;
}

function TimePill({
  entry,
  onDelete,
}: {
  entry: AggregatedEntry;
  onDelete: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onDelete(entry.id);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500"
    >
      <span>{entry.elapsedLabel}</span>
      <span aria-hidden>×</span>
      <span className="sr-only">Delete record</span>
    </button>
  );
}

export default function ResultsLog({
  mode,
  records,
  onClearRecords,
  onDeleteRecord,
  onExportCsv,
}: ResultsLogProps) {
  const hasRecords = records.length > 0;
  const rows = useMemo(() => aggregateRecords(records), [records]);

  return (
    <section className={`rounded-3xl bg-[#e0e5ec] p-6 ${neuromorphicShadow}`}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-600">Typing Timer</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Aligned by typed word for quick comparison
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={!hasRecords}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
              hasRecords
                ? 'bg-[#e0e5ec] text-slate-500 shadow-[inset_3px_3px_6px_#c8cdd8,inset_-3px_-3px_6px_#f5f7fb] hover:text-indigo-500'
                : 'cursor-not-allowed bg-[#e0e5ec] text-slate-300 shadow-[inset_3px_3px_6px_#c8cdd8,inset_-3px_-3px_6px_#f5f7fb]'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec]`}
          >
            Export
          </button>
          <button
            type="button"
            onClick={onClearRecords}
            disabled={!hasRecords}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
              hasRecords
                ? 'bg-[#e0e5ec] text-slate-500 shadow-[inset_3px_3px_6px_#c8cdd8,inset_-3px_-3px_6px_#f5f7fb] hover:text-rose-500'
                : 'cursor-not-allowed bg-[#e0e5ec] text-slate-300 shadow-[inset_3px_3px_6px_#c8cdd8,inset_-3px_-3px_6px_#f5f7fb]'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec]`}
          >
            Clear
          </button>
        </div>
      </header>

      {!hasRecords ? (
        <div className={`rounded-2xl bg-[#e0e5ec] px-5 py-8 text-center text-sm text-slate-500 ${neuromorphicInsetShadow}`}>
          No runs recorded yet. Start timing to populate the table.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[420px] w-full table-fixed border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="w-1/2 px-4">Word</th>
                <th
                  className={`w-1/4 px-4 text-center ${mode === 'one-hand' ? 'text-indigo-500' : ''}`}
                >
                  One Hand
                </th>
                <th
                  className={`w-1/4 px-4 text-center ${mode === 'two-hands' ? 'text-indigo-500' : ''}`}
                >
                  Two Hands
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.word} className="rounded-2xl bg-white text-sm text-slate-600 shadow">
                  <td className="rounded-l-2xl px-4 py-4 align-top text-base font-semibold text-slate-700">
                    {row.word}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {row.oneHand.length === 0 ? (
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-300">—</span>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-2">
                        {row.oneHand.map((entry) => (
                          <TimePill key={entry.id} entry={entry} onDelete={onDeleteRecord} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="rounded-r-2xl px-4 py-4 align-top">
                    {row.twoHands.length === 0 ? (
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-300">—</span>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-2">
                        {row.twoHands.map((entry) => (
                          <TimePill key={entry.id} entry={entry} onDelete={onDeleteRecord} />
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
