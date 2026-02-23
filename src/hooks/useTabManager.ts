import React, { useState } from "react";
import type { EditorView } from "@codemirror/view";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { save, ask } from "@tauri-apps/plugin-dialog";
import type { Tab } from "../types";
import { IMAGE_EXTENSIONS } from "../constants";
import { saveCursorPosition } from "../utils/cursor";
import { getFileName } from "../utils/pathHelpers";

interface UseTabManagerOptions {
  addToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
  refreshTree: () => Promise<void>;
  editorViewRef: React.RefObject<EditorView | null>;
  cursorPositionsRef: React.RefObject<Record<string, number>>;
}

export const useTabManager = ({
  addToast,
  refreshTree,
  editorViewRef,
  cursorPositionsRef,
}: UseTabManagerOptions) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeId) || null;

  const openTargetFile = async (filePath: string) => {
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    // Skip image files; don't open in editor
    if (IMAGE_EXTENSIONS.includes(ext)) return;

    const existing = tabs.find((t) => t.path === filePath);
    if (existing) {
      saveCursorPosition(activeId, tabs, editorViewRef.current, cursorPositionsRef.current);
      setActiveId(existing.id);
      return;
    }
    try {
      const content = await readTextFile(filePath);
      const newTab: Tab = {
        id: crypto.randomUUID(),
        path: filePath,
        name: getFileName(filePath) || "Untitled",
        content,
        originalContent: content,
        isModified: false,
      };
      setTabs(prev => [...prev, newTab]);
      saveCursorPosition(activeId, tabs, editorViewRef.current, cursorPositionsRef.current);
      setActiveId(newTab.id);
    } catch (e) {
      console.error("Failed to open file:", e);
      addToast("ファイルを開けませんでした", "error");
    }
  };

  const createNewTab = () => {
    const newId = crypto.randomUUID();
    setTabs(prev => [...prev, {
      id: newId, path: null, name: "Untitled.md",
      content: "# Untitled\n", originalContent: "# Untitled\n", isModified: false
    }]);
    saveCursorPosition(activeId, tabs, editorViewRef.current, cursorPositionsRef.current);
    setActiveId(newId);
  };

  const closeTab = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = tabs.find(t => t.id === id);
    if (target?.isModified) {
      const ok = await ask(`${target.name} を保存せずに閉じますか？`, { title: "Markly", kind: "warning" });
      if (!ok) return;
    }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeId === id) {
      saveCursorPosition(activeId, tabs, editorViewRef.current, cursorPositionsRef.current);
      setActiveId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const saveFile = async () => {
    if (!activeTab) return;
    let filePath = activeTab.path;
    if (!filePath) {
      filePath = await save({ filters: [{ name: "Markdown", extensions: ["md"] }] });
    }
    if (filePath) {
      await writeTextFile(filePath, activeTab.content);
      setTabs(prev => prev.map(t =>
        t.id === activeTab.id
          ? { ...t, path: filePath, name: getFileName(filePath!), originalContent: activeTab.content, isModified: false }
          : t
      ));
      refreshTree();
    }
  };

  return {
    tabs, setTabs,
    activeId, setActiveId,
    activeTab,
    openTargetFile,
    createNewTab,
    closeTab,
    saveFile,
  };
};
