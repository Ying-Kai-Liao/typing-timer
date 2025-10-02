# UI Component Structure

- `app/page.tsx`
  - Wrap whole experiment page; manage top-level state (mode, records, timing state).
  - Compose layout sections: header, controls, typing panel, results log.
- `ExperimentControls`
  - Props: `mode`, `onModeChange`, `targetWord`, `onTargetWordChange`, `disabled`.
  - Renders toggle between one-hand/two-hand, input for target word, clear log button.
- `TypingPanel`
  - Props: `mode`, `targetWord`, `typedText`, `onTypedTextChange`, `isTiming`, `onStartStop`.
  - Displays current timer, listens for whitespace key presses.
- `ResultsLog`
  - Props: `records` array (ordered newest first), `onClear`.
  - Renders simple table/list summarizing run data.

> Keep components local to `app/components/` folder; each component can be a client component with TypeScript and minimal styling (Tailwind or CSS modules as preferred later).
