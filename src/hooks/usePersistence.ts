import React, { useCallback, useEffect, useRef, useState } from "react";
import type { EditorView } from "@codemirror/view";
import { readTextFile } from "@tauri-apps/plugin-fs";
import type { Tab, FileEntry, AppConfig, SessionData } from "../types";
import { getFileName } from "../utils/pathHelpers";
import { isProjectLocked, acquireLock, releaseLock, startHeartbeat } from "../utils/lockFile";

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
  editorViewRef: React.RefObject<EditorView | null>;
  cursorPositionsRef: React.RefObject<Record<string, number>>;
  addToast: (message: string, type: "success" | "error" | "warning" | "info") => void;
  // Unified config.json management
  loadConfig: () => Promise<AppConfig | null>;
  saveConfig: (config: Partial<AppConfig>) => Promise<void>;
  flushSaveConfig: () => Promise<void>;
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
  editorViewRef,
  cursorPositionsRef,
  addToast,
  loadConfig,
  saveConfig,
  flushSaveConfig,
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

  // Lock management refs
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedProjectRef = useRef<string | null>(null);

  // --- Write session state to config.json under sessions[projectRoot] ---
  const writeSessionToConfig = useCallback(async () => {
    const currentProjectRoot = projectRootRef.current;
    if (!currentProjectRoot) return;

    const sessionData: SessionData = {
      openedPaths: tabsRef.current.map(t => t.path).filter((p): p is string => p !== null),
      activePath: tabsRef.current.find(t => t.id === activeIdRef.current)?.path || null,
      expandedFolders: Array.from(expandedFoldersRef.current),
      cursorPositions: cursorPositionsRef.current,
    };

    await saveConfig({
      lastProjectRoot: currentProjectRoot,
      sessions: { [currentProjectRoot]: sessionData },
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
    await flushSaveConfig();

    // Release lock and stop heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (lockedProjectRef.current) {
      await releaseLock(lockedProjectRef.current);
      lockedProjectRef.current = null;
    }
  }, [updateCursorPosition, writeSessionToConfig, flushSaveConfig]);

  // --- Save current session immediately (for project switching) ---
  const saveCurrentSession = useCallback(async () => {
    if (!isInitializedRef.current) return;
    updateCursorPosition();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    await writeSessionToConfig();
  }, [updateCursorPosition, writeSessionToConfig]);

  // --- Load session data for a specific project from config.json ---
  const loadSessionForProject = useCallback(async (targetRoot: string): Promise<SessionData | null> => {
    const config = await loadConfig();
    return config?.sessions?.[targetRoot] ?? null;
  }, [loadConfig]);

  // --- Acquire lock for a project and start heartbeat ---
  const acquireProjectLock = useCallback(async (targetRoot: string) => {
    await acquireLock(targetRoot);
    lockedProjectRef.current = targetRoot;
    heartbeatRef.current = startHeartbeat(targetRoot);
  }, []);

  // --- Release current lock and stop heartbeat ---
  const releaseCurrentLock = useCallback(async () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (lockedProjectRef.current) {
      await releaseLock(lockedProjectRef.current);
      lockedProjectRef.current = null;
    }
  }, []);

  // --- Restore data (from config.json, with localStorage as fallback) ---
  useEffect(() => {
    const restoreState = async () => {
      const config = await loadConfig();
      setLoadedConfig(config);

      // Determine which project to restore
      let targetProjectRoot: string | null = null;
      let sessionData: SessionData | null = null;

      if (config) {
        const lastRoot = config.lastProjectRoot;
        if (lastRoot) {
          // Check if the last project is locked by another instance
          const locked = await isProjectLocked(lastRoot);
          if (!locked) {
            targetProjectRoot = lastRoot;
            sessionData = config.sessions?.[lastRoot] ?? null;
          }
          // If locked, targetProjectRoot stays null -> start fresh
        }
      }

      // Fallback: check localStorage for legacy migration
      if (!sessionData && !targetProjectRoot) {
        const saved = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (saved) {
          try {
            const legacy = JSON.parse(saved);
            const legacyRoot = legacy.projectRoot ?? null;
            if (legacyRoot) {
              const locked = await isProjectLocked(legacyRoot);
              if (!locked) {
                targetProjectRoot = legacyRoot;
                sessionData = {
                  openedPaths: legacy.openedPaths ?? [],
                  activePath: legacy.activePath ?? null,
                  expandedFolders: legacy.expandedFolders ?? [],
                  cursorPositions: legacy.cursorPositions ?? {},
                };
              }
            }
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        }
      }

      if (!sessionData || !targetProjectRoot || sessionData.openedPaths.length === 0) {
        setIsInitialized(true);
        return;
      }

      try {
        // Acquire lock and start heartbeat
        await acquireLock(targetProjectRoot);
        lockedProjectRef.current = targetProjectRoot;
        heartbeatRef.current = startHeartbeat(targetProjectRoot);

        if (sessionData.cursorPositions) {
          cursorPositionsRef.current = sessionData.cursorPositions;
        }

        setProjectRoot(targetProjectRoot);
        const tree = await loadDirectory(targetProjectRoot);
        setFileTree(tree);

        // Restore expanded folders by loading their children (parent-first order)
        if (sessionData.expandedFolders && sessionData.expandedFolders.length > 0) {
          const sortedFolders = [...sessionData.expandedFolders].sort(
            (a, b) => a.length - b.length
          );
          for (const folderPath of sortedFolders) {
            try {
              await loadChildren(folderPath);
            } catch {
              // Folder may no longer exist; skip
            }
          }
          setExpandedFolders(new Set(sessionData.expandedFolders));
        }

        const restoredTabs: Tab[] = [];
        for (const filePath of sessionData.openedPaths) {
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
          const active = restoredTabs.find(t => t.path === sessionData!.activePath) || restoredTabs[0];
          setActiveId(active.id);
        }
      } catch {
        // Session restoration failed; start with no tabs
      }
      setIsInitialized(true);
    };

    restoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup debounce timer and heartbeat on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  return {
    persistAppState,
    flushAppState,
    isInitialized,
    tabsRef,
    loadedConfig,
    // Project switching helpers
    saveCurrentSession,
    loadSessionForProject,
    acquireProjectLock,
    releaseCurrentLock,
  };
};
