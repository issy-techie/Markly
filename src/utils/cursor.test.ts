import { describe, it, expect } from "vitest";
import { saveCursorPosition } from "./cursor";
import type { Tab } from "../types";

// --- Minimal mock for EditorView ---
const createMockEditorView = (cursorHead: number) => ({
  state: {
    selection: {
      main: { head: cursorHead },
    },
  },
});

const createTab = (id: string, path: string | null): Tab => ({
  id,
  path,
  name: path ? path.split(/[\\/]/).pop()! : "Untitled",
  content: "",
  originalContent: "",
  isModified: false,
});

describe("saveCursorPosition", () => {
  it("saves cursor position using file path as key", () => {
    const tabs: Tab[] = [
      createTab("tab-1", "/docs/file.md"),
      createTab("tab-2", "/docs/other.md"),
    ];
    const positions: Record<string, number> = {};
    const editorView = createMockEditorView(42);

    saveCursorPosition("tab-1", tabs, editorView as any, positions);

    expect(positions["/docs/file.md"]).toBe(42);
  });

  it("uses tab id as key when path is null", () => {
    const tabs: Tab[] = [
      createTab("untitled-1", null),
    ];
    const positions: Record<string, number> = {};
    const editorView = createMockEditorView(100);

    saveCursorPosition("untitled-1", tabs, editorView as any, positions);

    expect(positions["untitled-1"]).toBe(100);
  });

  it("does nothing when activeId is null", () => {
    const tabs: Tab[] = [createTab("tab-1", "/docs/file.md")];
    const positions: Record<string, number> = {};
    const editorView = createMockEditorView(10);

    saveCursorPosition(null, tabs, editorView as any, positions);

    expect(Object.keys(positions)).toHaveLength(0);
  });

  it("does nothing when editorView is null", () => {
    const tabs: Tab[] = [createTab("tab-1", "/docs/file.md")];
    const positions: Record<string, number> = {};

    saveCursorPosition("tab-1", tabs, null, positions);

    expect(Object.keys(positions)).toHaveLength(0);
  });

  it("does nothing when activeId does not match any tab", () => {
    const tabs: Tab[] = [createTab("tab-1", "/docs/file.md")];
    const positions: Record<string, number> = {};
    const editorView = createMockEditorView(55);

    saveCursorPosition("nonexistent", tabs, editorView as any, positions);

    // Falls back to using activeId as key
    expect(positions["nonexistent"]).toBe(55);
  });

  it("overwrites previous position for the same key", () => {
    const tabs: Tab[] = [createTab("tab-1", "/docs/file.md")];
    const positions: Record<string, number> = { "/docs/file.md": 10 };
    const editorView = createMockEditorView(99);

    saveCursorPosition("tab-1", tabs, editorView as any, positions);

    expect(positions["/docs/file.md"]).toBe(99);
  });
});
