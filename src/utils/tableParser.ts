/**
 * Markdown table parser and formatter.
 *
 * Parses a block of Markdown text (pipe-delimited table) into a structured
 * representation and provides formatting back to aligned Markdown text.
 */

export type Alignment = "left" | "center" | "right" | "none";

export interface ParsedTable {
  /** Header row cells (trimmed text) */
  headers: string[];
  /** Alignment per column derived from the separator row */
  alignments: Alignment[];
  /** Data rows (each row is an array of trimmed cell text) */
  rows: string[][];
  /** Start line offset (0-based) within the source text */
  startLine: number;
  /** End line offset (exclusive, 0-based) within the source text */
  endLine: number;
}

/** Check if a line looks like a table separator row: e.g. `| --- | :---: |` */
function isSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") && !trimmed.includes("---")) return false;
  // Remove leading/trailing pipes then check each cell
  const inner = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  const cells = inner.split("|");
  if (cells.length === 0) return false;
  return cells.every((cell) => /^\s*:?-{3,}:?\s*$/.test(cell));
}

/** Parse alignment from a separator cell like `:---:`, `---`, `:---`, `---:` */
function parseAlignment(cell: string): Alignment {
  const trimmed = cell.trim();
  const left = trimmed.startsWith(":");
  const right = trimmed.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  if (left) return "left";
  return "none";
}

/** Split a table row into cells, handling leading/trailing pipes */
function splitRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((c) => c.trim());
}

/**
 * Given an array of document lines and a cursor line number (0-based),
 * find and parse the Markdown table that the cursor is inside of.
 *
 * Returns `null` if the cursor is not inside a table.
 */
export function parseTableAtCursor(
  lines: string[],
  cursorLine: number
): ParsedTable | null {
  // 1. Walk upward from cursor to find the start of the table block
  let start = cursorLine;
  while (start > 0 && isTableLine(lines[start - 1])) {
    start--;
  }
  // 2. Walk downward to find the end
  let end = cursorLine;
  while (end < lines.length - 1 && isTableLine(lines[end + 1])) {
    end++;
  }
  end++; // exclusive

  // Need at least 3 lines: header, separator, 1+ data rows
  // (Actually 2 lines minimum: header + separator is valid with 0 data rows)
  if (end - start < 2) return null;

  // The second line must be a separator
  if (!isSeparatorRow(lines[start + 1])) return null;

  // First line must look like a table row
  if (!isTableLine(lines[start])) return null;

  const headers = splitRow(lines[start]);
  const separatorCells = splitRow(lines[start + 1]);
  const alignments = separatorCells.map(parseAlignment);

  // Normalize column count to header length
  const colCount = headers.length;
  while (alignments.length < colCount) alignments.push("none");

  const rows: string[][] = [];
  for (let i = start + 2; i < end; i++) {
    const cells = splitRow(lines[i]);
    // Pad or trim to match column count
    while (cells.length < colCount) cells.push("");
    rows.push(cells.slice(0, colCount));
  }

  return { headers, alignments, rows, startLine: start, endLine: end };
}

/** Quick check whether a line looks like part of a table (contains a pipe) */
function isTableLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes("|") && (trimmed.startsWith("|") || trimmed.includes(" | "));
}

/**
 * Format a ParsedTable back into aligned Markdown text.
 * Pads each column to the widest cell and aligns separator markers.
 */
export function formatTable(table: ParsedTable): string {
  const { headers, alignments, rows } = table;
  const colCount = headers.length;

  // Calculate the max width per column
  const widths: number[] = [];
  for (let c = 0; c < colCount; c++) {
    let max = headers[c].length;
    for (const row of rows) {
      if (row[c] && row[c].length > max) max = row[c].length;
    }
    // Minimum width of 3 for separator dashes
    widths.push(Math.max(max, 3));
  }

  const padCell = (text: string, width: number) => text.padEnd(width);

  // Header row
  const headerLine =
    "| " + headers.map((h, i) => padCell(h, widths[i])).join(" | ") + " |";

  // Separator row
  const sepLine =
    "| " +
    widths
      .map((w, i) => {
        const a = alignments[i] || "none";
        const dashes = "-".repeat(w);
        if (a === "center") return ":" + "-".repeat(w - 2) + ":";
        if (a === "right") return "-".repeat(w - 1) + ":";
        if (a === "left") return ":" + "-".repeat(w - 1);
        return dashes;
      })
      .join(" | ") +
    " |";

  // Data rows
  const dataLines = rows.map(
    (row) =>
      "| " + row.map((cell, i) => padCell(cell, widths[i])).join(" | ") + " |"
  );

  return [headerLine, sepLine, ...dataLines].join("\n");
}
