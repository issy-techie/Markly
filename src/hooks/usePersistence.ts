import React, { useCallback, useEffect, useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";
import { readTextFile } from "@tauri-apps/plugin-fs";
import type { Tab, FileEntry, AppConfig } from "../types";
import { getFileName } from "../utils/pathHelpers";

interface UsePersistenceOptions {
  tabs: Tab[];
  activeId: string | null;
  projectRoot: string | null;
  expandedFolders: Set<string>;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  setProjectRoot: React.Dispatch<React.SetStateAction<string | null>>;
  setFileTree: React.Dispatch<React.SetStateAction<FileEntry[]>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  loadDirectory: (dirPath: string) => Promise<FileEntry[]>;
  loadChildren: (folderPath: string) => Promise<FileEntry[]>;
  createNewTab: () => void;
  editorViewRef: React.RefObject<EditorView | null>;
  cursorPositionsRef: React.RefObject<Record<string, number>>;
  addToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
  // Unified config.json management
  loadConfig: () => Promise<AppConfig | null>;
  saveConfig: (config: Partial<AppConfig>) => Promise<void>;
}

const LEGACY_STORAGE_KEY = "markly_app_state";
const DEBOUNCE_MS = 2000;

export const usePersistence = ({
  tabs,
  activeId,
  projectRoot,
  expandedFolders,
  setTabs,
  setActiveId,
  setProjectRoot,
  setFileTree,
  setExpandedFolders,
  loadDirectory,
  loadChildren,
  createNewTab,
  editorViewRef,
  cursorPositionsRef,
  addToast,
  loadConfig,
  saveConfig,
}: UsePersistenceOptions) => {
  const [isInitialized, setIsInitialized] = useState(false);
  // Pass loadConfig result to App.tsx (for applyConfig)
  const [loadedConfig, setLoadedConfig] = useState<AppConfig | null>(null);

  // Refs to always access the latest state inside listeners
  const tabsRef = useRef<Tab[]>([]);
  useEffect(() => { tabsRef.current = tabs; }, [tabs]);

  const activeIdRef = useRef<string | null>(null);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const projectRootRef = useRef<string | null>(null);
  useEffect(() => { projectRootRef.current = projectRoot; }, [projectRoot]);

  const expandedFoldersRef = useRef<Set<string>>(new Set());
  useEffect(() => { expandedFoldersRef.current = expandedFolders; }, [expandedFolders]);

  const isInitializedRef = useRef(false);
  useEffect(() => { isInitializedRef.current = isInitialized; }, [isInitialized]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Write session state to config.json ---
  const writeSessionToConfig = useCallback(async () => {
    await saveConfig({
      projectRoot: projectRootRef.current,
      openedPaths: tabsRef.current.map(t => t.path).filter((p): p is string => p !== null),
      activePath: tabsRef.current.find(t => t.id === activeIdRef.current)?.path || null,
      expandedFolders: Array.from(expandedFoldersRef.current),
      cursorPositions: cursorPositionsRef.current,
    });
  }, [saveConfig, cursorPositionsRef]);

  // --- Helper to update cursor position ---
  const updateCursorPosition = useCallback(() => {
    if (activeIdRef.current && editorViewRef.current) {
      const currentTabs = tabsRef.current;
      const currentActiveId = activeIdRef.current;
      const currentActiveTab = currentTabs.find(t => t.id === currentActiveId);
      const key = currentActiveTab?.path || currentActiveId;
      cursorPositionsRef.current[key] = editorViewRef.current.state.selection.main.head;
    }
  }, [editorViewRef, cursorPositionsRef]);

  // --- Debounced persistence trigger (called frequently) ---
  const persistAppState = useCallback(() => {
    if (!isInitializedRef.current) return;

    updateCursorPosition();

    // Debounced config.json write
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      writeSessionToConfig();
    }, DEBOUNCE_MS);
  }, [updateCursorPosition, writeSessionToConfig]);

  // --- Immediate write (for app exit) ---
  const flushAppState = useCallback(async () => {
    if (!isInitializedRef.current) return;

    updateCursorPosition();

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    await writeSessionToConfig();
  }, [updateCursorPosition, writeSessionToConfig]);

  // --- Restore data (from config.json, with localStorage as fallback) ---
  useEffect(() => {
    const restoreState = async () => {
      const config = await loadConfig();
      setLoadedConfig(config);

      // Determine the source of session state
      let sessionState: {
        projectRoot: string | null;
        openedPaths: string[];
        activePath: string | null;
        expandedFolders: string[];
        cursorPositions: Record<string, number>;
      } | null = null;

      if (config && config.openedPaths && config.openedPaths.length > 0) {
        // Session state found in config.json
        sessionState = {
          projectRoot: config.projectRoot ?? null,
          openedPaths: config.openedPaths,
          activePath: config.activePath ?? null,
          expandedFolders: config.expandedFolders ?? [],
          cursorPositions: config.cursorPositions ?? {},
        };
      } else {
        // Migration: load legacy format from localStorage
        const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (saved) {
          try {
            const legacy = JSON.parse(saved);
            sessionState = {
              projectRoot: legacy.projectRoot ?? null,
              openedPaths: legacy.openedPaths ?? [],
              activePath: legacy.activePath ?? null,
              expandedFolders: legacy.expandedFolders ?? [],
              cursorPositions: legacy.cursorPositions ?? {},
            };
            // Remove legacy data after successful migration
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        }
      }

      if (!sessionState || sessionState.openedPaths.length === 0) {
        createNewTab();
        setIsInitialized(true);
        return;
      }

      try {
        if (sessionState.cursorPositions) {
          cursorPositionsRef.current = sessionState.cursorPositions;
        }

        if (sessionState.projectRoot) {
          setProjectRoot(sessionState.projectRoot);
          const tree = await loadDirectory(sessionState.projectRoot);
          setFileTree(tree);

          // Restore expanded folders by loading their children (parent-first order)
          if (sessionState.expandedFolders && sessionState.expandedFolders.length > 0) {
            const sortedFolders = [...sessionState.expandedFolders].sort(
              (a, b) => a.length - b.length
            );
            for (const folderPath of sortedFolders) {
              try {
                await loadChildren(folderPath);
              } catch {
                // Folder may no longer exist; skip
              }
            }
            setExpandedFolders(new Set(sessionState.expandedFolders));
          }
        }

        const restoredTabs: Tab[] = [];
        for (const filePath of sessionState.openedPaths) {
          try {
            const content = await readTextFile(filePath);
            restoredTabs.push({
              id: crypto.randomUUID(),
              path: filePath,
              name: getFileName(filePath) || "Untitled",
              content,
              originalContent: content,
              isModified: false
            });
          } catch (e) {
            console.error("Failed to restore file:", filePath, e);
            addToast(`ファイルの復元に失敗: ${getFileName(filePath)}`, "warning");
          }
        }

        if (restoredTabs.length > 0) {
          setTabs(restoredTabs);
          const active = restoredTabs.find(t => t.path === sessionState.activePath) || restoredTabs[0];
          setActiveId(active.id);
        } else {
          createNewTab();
        }
      } catch {
        createNewTab();
      }
      setIsInitialized(true);
    };

    restoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return {
    persistAppState,
    flushAppState,
    isInitialized,
    tabsRef,
    loadedConfig,
  };
};
