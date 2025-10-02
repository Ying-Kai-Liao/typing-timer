# Typing Timer Experiment Plan

## Goal
Build a Next.js page that measures the time it takes for a participant to type a target word, comparing one-hand versus two-hand typing.

## User Scenario
1. Participant loads the experiment page.
2. The conductor selects whether the run is "One Hand" or "Two Hands" using a toggle.
3. The participant is shown the target word to type.
4. When the participant presses whitespace (spacebar or enter) the timer starts.
5. The participant types the word and presses whitespace again to stop the timer.
6. The recorded duration, selected mode, timestamp, and typed text are appended to a visible log.
7. The log can be cleared without refreshing the page (in-memory only).

## Requirements
- Support desktop keyboard input only; mobile is out of scope.
- No backend or database; results persist only for the current browser session.
- Use existing Next.js app (`app/page.tsx`) and TypeScript.
- Keep UI minimal: input area, toggle, timer display, results table/log.
- Handle erroneous whitespace presses (e.g., double start/stop) gracefully.

## Implementation Outline
1. **Data model**
   - `mode` (`"one-hand" | "two-hands"`).
   - `isTiming` boolean and `startTime` (number) for tracking current run.
   - `records`: array of `{ id, mode, elapsedMs, typedText, timestamp }`.
   - `targetWord`: default string configurable within the UI.
2. **UI structure**
   - Top section with experiment title and brief instructions.
   - Toggle/segment control for One-hand vs Two-hands (default Two-hands?).
   - Input component showing the target word (read only) and a text field for participant input.
   - Timer display and status indicator (e.g., "Waiting", "Timing...").
   - Results log rendered as a table or list with columns: Mode, Typed Text, Time (ms), Timestamp.
   - Action buttons: `Clear Log`, optional `Reset Run`.
3. **Interaction flow**
   - Listen for whitespace keydown (`Space`, `Enter`) while input focused.
   - On first whitespace while idle: record `startTime`, set `isTiming=true`, clear current input.
   - On whitespace while timing: stop timer, compute `elapsedMs`, push to `records`, reset `isTiming`.
   - If whitespace received but `isTiming` is false and no `startTime`, ignore.
   - Allow editing `targetWord`; changing it resets current run.
4. **Handling edge cases**
   - Prevent empty typed text entries from being logged when stopping.
   - Provide feedback if stop occurs without start (ignore event).
   - Disable toggle while timing to prevent mode changes mid-run.

## Validation
- Manual: run `npm run dev`, follow scenario steps, ensure log updates correctly.
- Automated: not required for initial implementation; consider adding component tests later if time permits.

## Open Questions
- Should multiple target words be supported? (Assume single word input with ability to change manually.)
- Any need to export results? (Out of scope for now.)

## Next Steps
- Shape component structure (layout, state hooks).
- Implement timing logic and key handlers.
- Style for readability.
- Perform manual validation.
