/**
 * High-level table editing operations.
 *
 * Each function takes a ParsedTable, performs a mutation, and returns the
 * new table (immutably – the original is not modified).
 */

import type { ParsedTable, Alignment } from "./tableParser";

/** Deep-clone a parsed table */
function cloneTable(t: ParsedTable): ParsedTable {
  return {
    headers: [...t.headers],
    alignments: [...t.alignments],
    rows: t.rows.map((r) => [...r]),
    startLine: t.startLine,
    endLine: t.endLine,
  };
}

// ─── Row operations ─────────────────────────────────────────────

/** Insert an empty row above `rowIndex` (0 = first data row). */
export function insertRowAbove(table: ParsedTable, rowIndex: number): ParsedTable {
  const t = cloneTable(table);
  const empty = new Array(t.headers.length).fill("");
  t.rows.splice(rowIndex, 0, empty);
  t.endLine++;
  return t;
}

/** Insert an empty row below `rowIndex`. */
export function insertRowBelow(table: ParsedTable, rowIndex: number): ParsedTable {
  const t = cloneTable(table);
  const empty = new Array(t.headers.length).fill("");
  t.rows.splice(rowIndex + 1, 0, empty);
  t.endLine++;
  return t;
}

/** Delete a data row at `rowIndex`. */
export function deleteRow(table: ParsedTable, rowIndex: number): ParsedTable {
  if (table.rows.length <= 1) return table; // keep at least 1 row
  const t = cloneTable(table);
  t.rows.splice(rowIndex, 1);
  t.endLine--;
  return t;
}

// ─── Column operations ──────────────────────────────────────────

/** Insert an empty column to the left of `colIndex`. */
export function insertColumnLeft(table: ParsedTable, colIndex: number): ParsedTable {
  const t = cloneTable(table);
  t.headers.splice(colIndex, 0, "");
  t.alignments.splice(colIndex, 0, "none");
  for (const row of t.rows) {
    row.splice(colIndex, 0, "");
  }
  return t;
}

/** Insert an empty column to the right of `colIndex`. */
export function insertColumnRight(table: ParsedTable, colIndex: number): ParsedTable {
  const t = cloneTable(table);
  t.headers.splice(colIndex + 1, 0, "");
  t.alignments.splice(colIndex + 1, 0, "none");
  for (const row of t.rows) {
    row.splice(colIndex + 1, 0, "");
  }
  return t;
}

/** Delete the column at `colIndex`. */
export function deleteColumn(table: ParsedTable, colIndex: number): ParsedTable {
  if (table.headers.length <= 1) return table; // keep at least 1 column
  const t = cloneTable(table);
  t.headers.splice(colIndex, 1);
  t.alignments.splice(colIndex, 1);
  for (const row of t.rows) {
    row.splice(colIndex, 1);
  }
  return t;
}

// ─── Alignment ──────────────────────────────────────────────────

/** Set the alignment of `colIndex`. */
export function setColumnAlignment(
  table: ParsedTable,
  colIndex: number,
  alignment: Alignment
): ParsedTable {
  const t = cloneTable(table);
  t.alignments[colIndex] = alignment;
  return t;
}

// ─── New table generation ───────────────────────────────────────

/** Generate a new empty table snippet with the given dimensions. */
export function generateNewTable(rowCount: number, colCount: number): string {
  const header =
    "| " + Array.from({ length: colCount }, (_, i) => `Header${i + 1}`).join(" | ") + " |";
  const separator =
    "| " + Array.from({ length: colCount }, () => "---").join(" | ") + " |";
  const rows = Array.from({ length: rowCount }, () =>
    "| " + Array.from({ length: colCount }, () => "   ").join(" | ") + " |"
  );
  return [header, separator, ...rows].join("\n");
}
