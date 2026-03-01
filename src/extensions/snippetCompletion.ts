import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
  type Completion,
} from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import type { Snippet } from "../types";

/**
 * Process snippet content, replacing dynamic tokens.
 * - {{DATE}} → current date in YYYY-MM-DD format
 */
function processSnippetContent(content: string): string {
  return content.replace(
    /\{\{DATE\}\}/g,
    new Date().toISOString().slice(0, 10)
  );
}

/**
 * Creates a CompletionSource that provides user snippet completions.
 * Triggers when the user types "/" at the start of a line or after whitespace.
 */
function snippetCompletionSource(
  snippets: Snippet[]
): (context: CompletionContext) => CompletionResult | null {
  return (context: CompletionContext): CompletionResult | null => {
    const line = context.state.doc.lineAt(context.pos);
    const textBefore = line.text.slice(0, context.pos - line.from);

    // Find a "/" trigger preceded by start-of-line or whitespace
    const triggerMatch = textBefore.match(/(?:^|[\s])\/([a-zA-Z0-9_-]*)$/);
    if (!triggerMatch) return null;

    const typedPrefix = triggerMatch[1];
    // Calculate the "from" position (where the "/" character is)
    const completionFrom = context.pos - typedPrefix.length - 1;

    // Filter snippets matching the typed prefix
    const options: Completion[] = snippets
      .filter(
        (s) =>
          s.prefix.toLowerCase().startsWith(typedPrefix.toLowerCase()) ||
          s.label.toLowerCase().includes(typedPrefix.toLowerCase())
      )
      .map((s) => ({
        label: `/${s.prefix}`,
        displayLabel: s.label,
        detail: `/${s.prefix}`,
        info: s.content.length > 80 ? s.content.slice(0, 80) + "..." : s.content,
        type: "snippet" as const,
        boost: 1,
        apply: (
          view: EditorView,
          _completion: Completion,
          from: number,
          to: number
        ) => {
          const processed = processSnippetContent(s.content);

          // Handle $1 cursor placeholder
          const placeholderIndex = processed.indexOf("$1");
          let insertText = processed;
          let cursorOffset = processed.length;

          if (placeholderIndex !== -1) {
            insertText = processed.replace("$1", "");
            cursorOffset = placeholderIndex;
          }

          view.dispatch({
            changes: { from, to, insert: insertText },
            selection: { anchor: from + cursorOffset },
          });
        },
      }));

    if (options.length === 0) return null;

    return {
      from: completionFrom,
      options,
      filter: false,
    };
  };
}

/**
 * Creates a CodeMirror extension for snippet autocompletion.
 * Pass the user's snippets array; the extension will provide
 * completions when "/" is typed.
 */
export function createSnippetCompletionExtension(snippets: Snippet[]) {
  return autocompletion({
    override: [snippetCompletionSource(snippets)],
    activateOnTyping: true,
    closeOnBlur: true,
    maxRenderedOptions: 20,
  });
}
