import { EditorView } from "@codemirror/view";
import type { Tab } from "../types";

/**
 * Save the cursor position of the currently active tab.
 */
export const saveCursorPosition = (
  activeId: string | null,
  tabs: Tab[],
  editorView: EditorView | null,
  cursorPositions: Record<string, number>
): void => {
  if (!activeId || !editorView) return;
  const key = tabs.find(t => t.id === activeId)?.path || activeId;
  cursorPositions[key] = editorView.state.selection.main.head;
};
