/**
 * Heading extraction utility for the Outline panel.
 * Parses Markdown text and extracts ATX-style headings (# to ######),
 * skipping headings inside fenced code blocks.
 */

export interface HeadingItem {
  /** Heading level (1-6) */
  level: number;
  /** Heading text (without # prefix) */
  text: string;
  /** 1-based line number */
  lineNumber: number;
  /** Character offset from start of document (for EditorView navigation) */
  from: number;
}

/**
 * Extract ATX-style headings from Markdown text.
 * Skips headings inside fenced code blocks (``` or ~~~).
 */
export function extractHeadings(text: string): HeadingItem[] {
  const lines = text.split("\n");
  const headings: HeadingItem[] = [];
  let inCodeBlock = false;
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track fenced code blocks (``` or ~~~)
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].trim(),
          lineNumber: i + 1,
          from: offset,
        });
      }
    }

    offset += line.length + 1; // +1 for newline character
  }

  return headings;
}
