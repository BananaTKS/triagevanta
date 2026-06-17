type Cell = string | number | null | undefined;

/** Serialize rows to RFC-4180-ish CSV, quoting fields that need it. */
export function toCsv(headers: string[], rows: Cell[][]): string {
  const escape = (value: Cell): string => {
    const s = value == null ? "" : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}
