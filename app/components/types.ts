export type Mode = "one-hand" | "two-hands";

export interface ExperimentRecord {
  id: string;
  mode: Mode;
  elapsedMs: number;
  typedText: string;
  timestamp: number;
}
