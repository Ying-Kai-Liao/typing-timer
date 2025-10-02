export interface CsvRecord {
  id: string;
  mode: string;
  typedText: string;
  elapsedMs: number;
  elapsedSeconds: string;
  timestampIso: string;
}

function escapeCell(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function toCsv(records: CsvRecord[]): string {
  const headers = ['id', 'mode', 'typedText', 'elapsedMs', 'elapsedSeconds', 'timestampIso'];
  const lines = [headers.join(',')];

  for (const record of records) {
    const row = headers
      .map((key) => {
        const value = record[key as keyof CsvRecord];
        return value === undefined || value === null ? '' : escapeCell(String(value));
      })
      .join(',');
    lines.push(row);
  }

  return lines.join('\n');
}

export function buildCsvBlob(records: CsvRecord[]): Blob {
  const csvString = toCsv(records);
  return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
}
