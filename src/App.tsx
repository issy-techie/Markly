import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from "react";
import { EditorView, type ViewUpdate } from "@codemirror/view";
import { undo, redo } from "@codemirror/commands";
import mermaid from "mermaid";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open, ask, save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { readTextFile, writeTextFile, readDir, rename, remove, copyFile, mkdir, exists, writeFile } from "@tauri-apps/plugin-fs";
import "./App.css";

import type { FileEntry, Tab, ContextMenuConfig, TabContextMenuConfig, Language } from "./types";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS, VIDEO_MIME_MAP, getMarkdownReference } from "./constants";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { isProjectLocked } from "./utils/lockFile";
import { saveCursorPosition } from "./utils/cursor";
import { confirmAndExit } from "./utils/appLifecycle";
import { generateExportHTML } from "./utils/exportUtils";
import { getFileName, getDirName, getExtension, joinPath, normalizePath } from "./utils/pathHelpers";
import { useConfig } from "./hooks/useConfig";
import { useSearch } from "./hooks/useSearch";
import { useResize } from "./hooks/useResize";
import { useToast } from "./hooks/useToast";
import { useFileTree } from "./hooks/useFileTree";
import { useTabManager } from "./hooks/useTabManager";
import { useTabDragDrop } from "./hooks/useTabDragDrop";
import { usePersistence } from "./hooks/usePersistence";
import { useScrollSync } from "./hooks/useScrollSync";
import { useProjectSearch } from "./hooks/useProjectSearch";
import { useInputDialog } from "./hooks/useInputDialog";
import ToastContainer from "./components/Toast";
import Sidebar from "./components/Sidebar/Sidebar";
import TabBar from "./components/Editor/TabBar";
import EditorPane from "./components/Editor/EditorPane";
import StatusBar from "./components/Editor/StatusBar";
import type { EditorStats } from "./components/Editor/StatusBar";
import OutlinePanel from "./components/Editor/OutlinePanel";
import { extractHeadings } from "./utils/headingExtractor";
import { parseTableAtCursor, formatTable } from "./utils/tableParser";
import type { ParsedTable } from "./utils/tableParser";
import {
  insertRowAbove, insertRowBelow, deleteRow,
  insertColumnLeft, insertColumnRight, deleteColumn,
  setColumnAlignment, generateNewTable,
} from "./utils/tableOperations";
import type { Alignment } from "./utils/tableParser";
import TableToolbar from "./components/Editor/TableToolbar";
import PreviewPane from "./components/Preview/PreviewPane";
import SearchDialog from "./components/Dialogs/SearchDialog";
import SettingsDialog from "./components/Dialogs/SettingsDialog";
import AboutDialog from "./components/Dialogs/AboutDialog";
import ContextMenu from "./components/Dialogs/ContextMenu";
import TabContextMenu from "./components/Dialogs/TabContextMenu";
import InputDialog from "./components/Dialogs/InputDialog";
import { getTranslations, LANGUAGE_OPTIONS } from "./i18n";
import { I18nContext } from "./hooks/useI18n";

// Mermaid initialization
mermaid.initialize({ startOnLoad: true, theme: "default" });

function App() {
  // --- UI state ---
  const [contextMenu, setContextMenu] = useState<ContextMenuConfig | null>(null);
  const [tabContextMenu, setTabContextMenu] = useState<TabContextMenuConfig | null>(null);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showProjectSearch, setShowProjectSearch] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [refActiveCategory, setRefActiveCategory] = useState("headings");

  // --- Table editing state ---
  const [tableContext, setTableContext] = useState<{
    table: ParsedTable;
    cursorRowIndex: number;
    cursorColIndex: number;
    top: number;
    left: number;
  } | null>(null);

  // --- Shared refs ---
  const cursorPositionsRef = useRef<Record<string, number>>({});
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const pendingRestoreRef = useRef<{ cursor: number; scroll?: number } | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  // Counter incremented when CM editor is created; forces useScrollSync to re-run
  const [editorMountCount, setEditorMountCount] = useState(0);

  // --- Editor stats for status bar ---
  const defaultStats: EditorStats = { line: 1, col: 0, charCount: 0, lineCount: 1, wordCount: 0, selectionLength: 0 };
  const [editorStats, setEditorStats] = useState<EditorStats>(defaultStats);
  const editorStatsRef = useRef<EditorStats>(defaultStats);

  // --- Custom hooks ---
  const { toasts, addToast, removeToast } = useToast();

  const configErrorHandler = useCallback((message: string) => {
    addToast(message, "error");
  }, [addToast]);

  const {
    isDark,
    language, setLanguage,
    lineBreaks, setLineBreaks,
    lineWrapping, setLineWrapping,
    scrollSync, setScrollSync,
    editorFontFamily, setEditorFontFamily,
    editorFontSize, setEditorFontSize,
    previewFontFamily, setPreviewFontFamily,
    previewFontSize, setPreviewFontSize,
    loadConfig,
    saveConfig,
    flushSaveConfig,
    toggleTheme,
  } = useConfig({ onError: configErrorHandler });

  // i18n translations — memoized to avoid re-creating on every render
  const t = useMemo(() => getTranslations(language ?? "ja"), [language]);

  // Localized markdown reference data
  const markdownRef = useMemo(() => getMarkdownReference(language ?? "ja"), [language]);

  // Language selection handler for first-launch screen
  const handleSelectLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    saveConfig({ language: lang });
  }, [setLanguage, saveConfig]);

  const {
    sidebarWidth,
    editorWidthPercent,
    openTabsHeight,
    isResizing,
    sidebarRef,
    handleMouseDown,
    applyConfig,
  } = useResize({ saveConfig, lineBreaks, lineWrapping });

  const {
    fileTree, setFileTree,
    projectRoot, setProjectRoot,
    expandedFolders, setExpandedFolders,
    isRefreshing,
    loadingFolders,
    loadDirectory,
    loadChildren,
    refreshTree,
    findNodeChildren,
  } = useFileTree({ addToast });

  const {
    tabs, setTabs,
    activeId, setActiveId,
    activeTab,
    selectedTabIds,
    openTargetFile,
    createNewTab,
    closeTab,
    closeOtherTabs,
    closeTabsToTheLeft,
    closeTabsToTheRight,
    closeAllTabs,
    closeSelectedTabs,
    saveFile,
    reorderTabs,
    reorderMultipleTabs,
    toggleSelectTab,
    rangeSelectTabs,
    clearSelection,
  } = useTabManager({ addToast, refreshTree, editorViewRef, cursorPositionsRef });

  const {
    draggedIndex,
    draggedIds,
    dropTargetIndex,
    dropPosition,
    dragClientX,
    dragClientY,
    draggedTotalWidth,
    handleTabMouseDown,
  } = useTabDragDrop({ tabs, selectedTabIds, reorderTabs, reorderMultipleTabs });

  const {
    showSearchDialog, setShowSearchDialog,
    searchQuery, setSearchQuery,
    replaceQuery, setReplaceQuery,
    searchCaseSensitive, setSearchCaseSensitive,
    searchUseRegex, setSearchUseRegex,
    matchCount,
    currentMatchIndex,
    searchDialogPos,
    highlightAndGoToMatch,
    replaceCurrentMatch,
    replaceAllMatches,
    handleDialogDragStart,
  } = useSearch(editorViewRef);

  const { inputDialogConfig, promptUser, handleInputConfirm, handleInputCancel } = useInputDialog();

  const {
    query: projectSearchQuery, setQuery: setProjectSearchQuery,
    caseSensitive: projectSearchCaseSensitive, setCaseSensitive: setProjectSearchCaseSensitive,
    useRegex: projectSearchUseRegex, setUseRegex: setProjectSearchUseRegex,
    results: projectSearchResults,
    totalMatches: projectSearchTotalMatches,
    isSearching: projectSearchIsSearching,
    error: projectSearchError,
    clearSearch: clearProjectSearch,
  } = useProjectSearch(projectRoot);

  const {
    persistAppState, flushAppState, isInitialized, tabsRef, loadedConfig,
    saveCurrentSession, loadSessionForProject, acquireProjectLock, releaseCurrentLock,
  } = usePersistence({
    tabs, activeId, projectRoot, expandedFolders,
    setTabs, setActiveId, setProjectRoot, setFileTree, setExpandedFolders,
    loadDirectory, loadChildren,
    editorViewRef, cursorPositionsRef,
    addToast,
    loadConfig, saveConfig, flushSaveConfig,
  });

  // --- Apply restored config to layout ---
  useEffect(() => {
    if (loadedConfig) applyConfig(loadedConfig);
  }, [loadedConfig, applyConfig]);

  // --- Scroll sync between editor and preview ---
  useScrollSync({
    editorViewRef,
    previewRef,
    enabled: scrollSync,
    activeTabId: activeId,
    editorMountCount,
  });

  // Set pending cursor/scroll restore when active tab changes.
  // useLayoutEffect runs BEFORE regular useEffects (including CM's value sync),
  // ensuring pendingRestoreRef is set before CM processes the value change.
  useLayoutEffect(() => {
    const key = activeTab?.path || activeId;
    if (!key) {
      pendingRestoreRef.current = null;
      return;
    }
    const savedCursor = cursorPositionsRef.current[key];
    if (savedCursor !== undefined) {
      pendingRestoreRef.current = {
        cursor: savedCursor,
        scroll: scrollPositionsRef.current[key],
      };
    } else {
      pendingRestoreRef.current = null;
    }
    // Auto-clear after 500ms to prevent stale restores if no value sync occurs
    const timer = setTimeout(() => { pendingRestoreRef.current = null; }, 500);
    return () => clearTimeout(timer);
  }, [activeId, activeTab?.path]);

  // --- Compute editor stats from EditorView state ---
  const computeEditorStats = useCallback((view: EditorView): EditorStats => {
    const { state } = view;
    const { head, anchor } = state.selection.main;
    const lineObj = state.doc.lineAt(head);
    const line = lineObj.number;
    const col = head - lineObj.from;
    const charCount = state.doc.length;
    const lineCount = state.doc.lines;
    const selectionLength = Math.abs(head - anchor);
    // Word count: only recalculate when needed (caller decides)
    const text = state.doc.toString();
    const wordCount = text.trim().length === 0 ? 0 : text.split(/\s+/).filter(Boolean).length;
    return { line, col, charCount, lineCount, wordCount, selectionLength };
  }, []);

  // --- Outline: extract headings from active tab content ---
  const headings = useMemo(() => {
    if (!activeTab?.content) return [];
    return extractHeadings(activeTab.content);
  }, [activeTab?.content]);

  // --- Outline: navigate to heading position in editor ---
  const handleOutlineHeadingClick = useCallback((heading: { from: number }) => {
    const view = editorViewRef.current;
    if (!view) return;
    const pos = Math.min(heading.from, view.state.doc.length);
    view.dispatch({
      selection: { anchor: pos, head: pos },
      effects: EditorView.scrollIntoView(pos, { y: "center" }),
    });
    view.focus();
  }, []);

  // Restore cursor/scroll AFTER CM's value sync completes (via onUpdate callback).
  // This is more reliable than a timer because it reacts to the actual document change
  // instead of guessing when CM finishes its internal value prop synchronization.
  // Also updates the status bar stats on every relevant editor change.
  const handleEditorUpdate = useCallback((update: ViewUpdate) => {
    // --- Cursor/scroll restoration ---
    const pending = pendingRestoreRef.current;
    if (pending && update.docChanged) {
      pendingRestoreRef.current = null;

      const { cursor, scroll } = pending;
      requestAnimationFrame(() => {
        try {
          const view = update.view;
          const pos = Math.min(cursor, view.state.doc.length);
          if (scroll !== undefined) {
            view.dispatch({ selection: { anchor: pos, head: pos } });
            view.scrollDOM.scrollTop = scroll;
          } else {
            view.dispatch({
              selection: { anchor: pos, head: pos },
              effects: EditorView.scrollIntoView(pos, { y: 'center' }),
            });
          }
          view.focus();
        } catch {
          // Editor may have been destroyed
        }
      });
    }

    // --- Status bar stats update ---
    if (update.docChanged || update.selectionSet) {
      const stats = computeEditorStats(update.view);
      // Avoid unnecessary re-renders by comparing with previous value
      const prev = editorStatsRef.current;
      if (
        prev.line !== stats.line || prev.col !== stats.col ||
        prev.charCount !== stats.charCount || prev.lineCount !== stats.lineCount ||
        prev.wordCount !== stats.wordCount || prev.selectionLength !== stats.selectionLength
      ) {
        editorStatsRef.current = stats;
        setEditorStats(stats);
      }
    }

    // --- Table toolbar detection ---
    if (update.docChanged || update.selectionSet) {
      const view = update.view;
      const { state } = view;
      const cursorPos = state.selection.main.head;
      const docText = state.doc.toString();
      const lines = docText.split("\n");
      const cursorLine = state.doc.lineAt(cursorPos).number - 1; // 0-based

      const parsed = parseTableAtCursor(lines, cursorLine);
      if (parsed) {
        // Calculate cursor row/col indices within the table
        const tableLineOffset = cursorLine - parsed.startLine;
        let cursorRowIndex: number;
        if (tableLineOffset === 0) {
          cursorRowIndex = -1; // header row
        } else if (tableLineOffset === 1) {
          cursorRowIndex = -1; // separator row → treat as header
        } else {
          cursorRowIndex = tableLineOffset - 2; // data row index (0-based)
        }

        // Determine column index based on cursor position within the line
        const lineObj = state.doc.lineAt(cursorPos);
        const lineText = lineObj.text;
        const offsetInLine = cursorPos - lineObj.from;
        let colIndex = 0;
        let pipeCount = 0;
        for (let i = 0; i < offsetInLine; i++) {
          if (lineText[i] === "|") {
            pipeCount++;
          }
        }
        // First pipe is the leading one, so column = pipeCount - 1
        colIndex = Math.max(0, pipeCount - 1);
        if (colIndex >= parsed.headers.length) {
          colIndex = parsed.headers.length - 1;
        }

        // Position the toolbar above the table's first line
        const tableFirstLineObj = state.doc.line(parsed.startLine + 1); // 1-based
        const coords = view.coordsAtPos(tableFirstLineObj.from);
        if (coords) {
          // Clamp top so the toolbar doesn't go above the viewport
          const toolbarTop = Math.max(4, coords.top - 40);
          setTableContext({
            table: parsed,
            cursorRowIndex,
            cursorColIndex: colIndex,
            top: toolbarTop,
            left: coords.left,
          });
        } else {
          setTableContext(null);
        }
      } else {
        setTableContext(null);
      }
    }
  }, [computeEditorStats]);

  // --- Persistence trigger on state change (must be placed after cursor restoration) ---
  useEffect(() => {
    persistAppState();
  }, [tabs, activeId, projectRoot, expandedFolders, isInitialized, persistAppState]);

  // --- Auto-expand parent folders in tree when switching tabs (lazy-load aware) ---
  useEffect(() => {
    if (!activeTab?.path) return;
    const targetPath = activeTab.path;

    // Collect parent folders that need expanding (root-first order)
    const parentsToExpand: string[] = [];
    let currentParent = getDirName(targetPath);
    while (currentParent && currentParent.length > 3) {
      if (!expandedFolders.has(currentParent)) {
        parentsToExpand.unshift(currentParent);
      }
      const nextParent = getDirName(currentParent);
      if (nextParent === currentParent) break;
      currentParent = nextParent;
    }

    if (parentsToExpand.length > 0) {
      // Load children for unloaded parents, then expand all at once
      (async () => {
        for (const parentPath of parentsToExpand) {
          const children = findNodeChildren(fileTree, parentPath);
          if (children === undefined) {
            await loadChildren(parentPath);
          }
        }
        setExpandedFolders(prev => {
          const next = new Set(prev);
          parentsToExpand.forEach(p => next.add(p));
          return next;
        });
      })();
    }
  }, [activeId, activeTab?.path, setExpandedFolders, fileTree, expandedFolders, loadChildren, findNodeChildren]);

  // --- App exit confirmation (per-window) ---
  useEffect(() => {
    const unlistenClose = getCurrentWindow().onCloseRequested(async (event) => {
      event.preventDefault();

      const hasModified = tabsRef.current.some(tab => tab.isModified);
      if (hasModified) {
        const ok = await ask(t.unsavedChangesConfirm, {
          title: t.exitConfirmTitle,
          kind: "warning",
          okLabel: t.discardAndExit,
          cancelLabel: t.cancel,
        });
        if (!ok) return;
      }

      await flushAppState();
      await getCurrentWindow().destroy();
    });

    return () => {
      unlistenClose.then(f => f());
    };
  }, [flushAppState, tabsRef, t]);

  // --- Drag & drop (media insertion + copy to .assets folder) ---
  useEffect(() => {
    const unlistenDrop = listen("tauri://drag-drop", async (event: any) => {
      const pathsDropped = event.payload.paths as string[];
      if (pathsDropped.length === 0 || !editorViewRef.current) return;

      if (!activeTab?.path) {
        addToast(t.saveFileFirstMedia, "warning");
        return;
      }

      const rawDroppedPath = decodeURIComponent(pathsDropped[0]);
      const ext = getExtension(rawDroppedPath).toLowerCase();
      const isImage = IMAGE_EXTENSIONS.includes(ext);
      const isVideo = VIDEO_EXTENSIONS.includes(ext);
      if (!isImage && !isVideo) return;

      try {
        const baseDir = getDirName(activeTab.path);
        const mdFileName = getFileName(activeTab.path);
        const fileName = await copyMediaFile(rawDroppedPath, baseDir, mdFileName);
        if (!fileName) return;

        const assetsName = mdFileName.replace(/\.md$/, ".assets");
        const encodedFileName = encodeURIComponent(fileName);
        const insertText = isImage
          ? `![image](./${assetsName}/${encodedFileName})`
          : `<video src="./${assetsName}/${encodedFileName}" controls width="100%"></video>`;
        const view = editorViewRef.current!;
        const cursor = view.state.selection.main.head;
        view.dispatch({
          changes: { from: cursor, insert: insertText },
          selection: { anchor: cursor + insertText.length }
        });

        refreshTree();
      } catch (e) {
        console.error("Media copy failed:", e);
        addToast(t.failedMediaCopy, "error");
      }
    });

    return () => {
      unlistenDrop.then(f => f());
    };
  }, [activeTab, refreshTree, t]);

  // --- Keyboard shortcuts (table-driven) ---
  useEffect(() => {
    const keyMap: { key: string; ctrl?: boolean; shift?: boolean; handler: () => void }[] = [
      { key: "s", ctrl: true, handler: () => saveFile() },
      { key: "f", ctrl: true, handler: () => setShowSearchDialog(true) },
      { key: "F", ctrl: true, shift: true, handler: () => setShowProjectSearch(prev => !prev) },
      { key: "h", ctrl: true, handler: () => setShowSearchDialog(true) },
      { key: "ArrowLeft", ctrl: true, shift: true, handler: () => {
        const idx = tabs.findIndex(t => t.id === activeId);
        if (idx > 0) reorderTabs(idx, idx - 1);
      }},
      { key: "ArrowRight", ctrl: true, shift: true, handler: () => {
        const idx = tabs.findIndex(t => t.id === activeId);
        if (idx >= 0 && idx < tabs.length - 1) reorderTabs(idx, idx + 1);
      }},
    ];

    const escapeTargets: [boolean, () => void][] = [
      [tabContextMenu !== null, () => setTabContextMenu(null)],
      [showSearchDialog, () => setShowSearchDialog(false)],
      [showProjectSearch, () => setShowProjectSearch(false)],
      [showHamburgerMenu, () => setShowHamburgerMenu(false)],
      [showSettingsDialog, () => setShowSettingsDialog(false)],
      [showAboutDialog, () => setShowAboutDialog(false)],
      [zenMode, () => setZenMode(false)],
      [selectedTabIds.size > 0, () => clearSelection()],
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // F11: toggle zen mode
      if (e.key === "F11") {
        e.preventDefault();
        setZenMode(prev => !prev);
        return;
      }

      if (e.key === "Escape") {
        for (const [isOpen, close] of escapeTargets) {
          if (isOpen) { close(); break; }
        }
        return;
      }

      for (const binding of keyMap) {
        if (binding.ctrl && !(e.ctrlKey || e.metaKey)) continue;
        if (binding.shift && !e.shiftKey) continue;
        if (!binding.shift && e.shiftKey && binding.ctrl) continue;
        if (e.key === binding.key) {
          e.preventDefault();
          binding.handler();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeId, reorderTabs, tabContextMenu, showSearchDialog, showProjectSearch, showHamburgerMenu, showSettingsDialog, showAboutDialog, zenMode, selectedTabIds.size, clearSelection]);

  // --- Close hamburger menu on outside click ---
  useEffect(() => {
    if (!showHamburgerMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-hamburger-menu]')) {
        setShowHamburgerMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showHamburgerMenu]);

  // --- Clear tab selection on click outside tab bar ---
  useEffect(() => {
    if (selectedTabIds.size === 0) return;
    const handleClickOutsideTabs = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-tab-bar]')) {
        clearSelection();
      }
    };
    document.addEventListener('mousedown', handleClickOutsideTabs);
    return () => document.removeEventListener('mousedown', handleClickOutsideTabs);
  }, [selectedTabIds.size, clearSelection]);

  useEffect(() => { mermaid.contentLoaded(); }, [activeTab?.content]);

  // --- File operation functions ---
  const createFileInFolder = async (folderPath: string) => {
    const name = await promptUser(t.newFileName, "newfile.md");
    if (!name) return;
    const fullPath = joinPath(folderPath, name);
    try {
      await writeTextFile(fullPath, `# ${name}\n`);
      await refreshTree();
      openTargetFile(fullPath);
    } catch (e) {
      console.error("Failed to create file:", e);
      addToast(t.failedCreateFile, "error");
    }
    setContextMenu(null);
  };

  const createFolderInFolder = async (folderPath: string) => {
    const name = await promptUser(t.newFolderName, "new-folder");
    if (!name) return;
    const fullPath = joinPath(folderPath, name);
    try {
      await mkdir(fullPath, { recursive: true });
      setExpandedFolders(prev => new Set([...prev, folderPath]));
      await refreshTree();
    } catch (e) {
      console.error("Failed to create folder:", e);
      addToast(t.failedCreateFolder, "error");
    }
    setContextMenu(null);
  };

  const renameFile = async (oldPath: string) => {
    const oldName = getFileName(oldPath);
    const newName = await promptUser(t.newNamePrompt, oldName);
    if (!newName || newName === oldName) return;
    const newPath = oldPath.substring(0, oldPath.lastIndexOf(oldName)) + newName;
    try {
      await rename(oldPath, newPath);
      setTabs(prev => prev.map(t => t.path === oldPath ? { ...t, path: newPath, name: newName } : t));

      // When renaming a .md file, also rename the corresponding .assets directory
      // and update image paths inside the Markdown content
      if (oldName.endsWith(".md") && newName.endsWith(".md")) {
        const dir = oldPath.substring(0, oldPath.lastIndexOf(oldName));
        const oldAssetsName = oldName.replace(/\.md$/, ".assets");
        const newAssetsName = newName.replace(/\.md$/, ".assets");
        const oldAssetsDir = joinPath(dir, oldAssetsName);
        const newAssetsDir = joinPath(dir, newAssetsName);

        // Rename the .assets directory
        if (await exists(oldAssetsDir)) {
          await rename(oldAssetsDir, newAssetsDir);
        }

        // Rewrite image paths in the Markdown (handles both ./ prefixed and bare paths)
        const mdContent = await readTextFile(newPath);
        const oldAssetsEscaped = oldAssetsName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const updatedContent = mdContent
          .replace(new RegExp(`\\./${oldAssetsEscaped}/`, 'g'), `./${newAssetsName}/`)
          .replace(new RegExp(`\\(${oldAssetsEscaped}/`, 'g'), `(${newAssetsName}/`);

        if (updatedContent !== mdContent) {
          await writeTextFile(newPath, updatedContent);
          // Also update open tab content
          setTabs(prev => prev.map(t =>
            t.path === newPath
              ? { ...t, content: updatedContent, originalContent: updatedContent }
              : t
          ));
        }
      }

      // When renaming a file inside .assets, update references in the corresponding .md file
      const parentDir = getFileName(getDirName(oldPath));
      if (parentDir.endsWith(".assets")) {
        const mdName = parentDir.replace(/\.assets$/, ".md");
        const grandParentDir = getDirName(getDirName(oldPath));
        const mdPath = joinPath(grandParentDir, mdName);

        if (await exists(mdPath)) {
          // Use in-memory content if the file is open in a tab, otherwise read from disk
          const openTab = tabsRef.current.find(t => t.path === mdPath);
          const mdContent = openTab ? openTab.content : await readTextFile(mdPath);
          const oldNameEscaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const updatedContent = mdContent.replace(
            new RegExp(oldNameEscaped, 'g'),
            newName
          );

          if (updatedContent !== mdContent) {
            await writeTextFile(mdPath, updatedContent);
            setTabs(prev => prev.map(t =>
              t.path === mdPath
                ? { ...t, content: updatedContent, originalContent: updatedContent }
                : t
            ));
          }
        }
      }

      await refreshTree();
    } catch (e) {
      console.error("Rename failed:", e);
      addToast(t.failedRename, "error");
    }
    setContextMenu(null);
  };

  const duplicateFile = async (srcPath: string) => {
    const fileName = getFileName(srcPath);
    const nameParts = fileName.split('.');
    const ext = nameParts.pop();
    const baseName = nameParts.join('.');
    const newPath = srcPath.replace(fileName, `${baseName}-copy.${ext}`);

    try {
      await copyFile(srcPath, newPath);
      await refreshTree();
    } catch (e) {
      console.error("Copy error:", e);
      addToast(t.failedDuplicate, "error");
    }
    setContextMenu(null);
  };

  const deleteFile = async (deletePath: string, isDirectory?: boolean) => {
    const name = getFileName(deletePath);

    let isDir = isDirectory;
    let hasChildren = false;

    if (isDir || isDir === undefined) {
      try {
        const entries = await readDir(deletePath);
        if (entries.length > 0) {
          hasChildren = true;
          isDir = true;
        } else {
          isDir = true;
        }
      } catch {
        isDir = false;
      }
    }

    if (hasChildren) {
      const ok = await ask(`'${name}' ${t.deleteFolderNotEmpty}`, { title: t.deleteBulkTitle, kind: "warning" });
      if (ok) {
        try {
          await remove(deletePath, { recursive: true });
          setTabs(prev => prev.filter(t => t.path !== deletePath && !t.path?.startsWith(deletePath + '/') && !t.path?.startsWith(deletePath + '\\')));
          setExpandedFolders(prev => {
            const next = new Set<string>();
            for (const p of prev) {
              if (p !== deletePath && !p.startsWith(deletePath + '/') && !p.startsWith(deletePath + '\\')) {
                next.add(p);
              }
            }
            return next;
          });
          await refreshTree();
        } catch (e) {
          console.error("Delete error:", e);
          addToast(t.failedDelete, "error");
        }
      }
    } else {
      const ok = await ask(`'${name}' ${t.deleteConfirm}`, { title: t.deletePhysicalTitle, kind: "warning" });
      if (ok) {
        try {
          await remove(deletePath, isDir ? { recursive: true } : undefined);
          setTabs(prev => prev.filter(t => t.path !== deletePath));
          if (isDir) {
            setExpandedFolders(prev => {
              const next = new Set(prev);
              next.delete(deletePath);
              return next;
            });
          }
          await refreshTree();
        } catch {
          // Fallback: retry with recursive option
          try {
             await remove(deletePath, { recursive: true });
             setTabs(prev => prev.filter(t => t.path !== deletePath));
             setExpandedFolders(prev => {
               const next = new Set(prev);
               next.delete(deletePath);
               return next;
             });
             await refreshTree();
          } catch(err) {
             console.error("Delete error:", err);
             addToast(t.failedDelete, "error");
          }
        }
      }
    }
    setContextMenu(null);
  };

  // Paste media data from clipboard and save to .assets folder
  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let imageItem: DataTransferItem | null = null;
    let videoItem: DataTransferItem | null = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        imageItem = items[i];
        break;
      }
      if (items[i].type.startsWith("video/")) {
        videoItem = items[i];
        break;
      }
    }

    const mediaItem = imageItem || videoItem;
    if (!mediaItem) return;

    // Prevent default paste when media is detected
    e.preventDefault();

    if (!activeTab?.path) {
      addToast(t.saveFileFirstPaste, "warning");
      return;
    }

    const file = mediaItem.getAsFile();
    if (!file) return;

    const baseDir = getDirName(activeTab.path);
    const mdFileName = getFileName(activeTab.path);
    const assetsName = mdFileName.replace(/\.md$/, ".assets");
    const assetsDir = joinPath(baseDir, assetsName);

    try {
      await mkdir(assetsDir, { recursive: true });

      let ext: string;
      let prefix: string;
      if (imageItem) {
        ext = file.type === "image/jpeg" ? ".jpg" : ".png";
        prefix = "pasted-image";
      } else {
        ext = VIDEO_MIME_MAP[file.type] || ".mp4";
        prefix = "pasted-video";
      }
      const timestamp = new Date().getTime();
      const destFileName = `${prefix}-${timestamp}${ext}`;
      const destPath = joinPath(assetsDir, destFileName);

      const arrayBuffer = await file.arrayBuffer();
      await writeFile(destPath, new Uint8Array(arrayBuffer));

      if (editorViewRef.current) {
        const view = editorViewRef.current;
        const encodedName = encodeURIComponent(destFileName);
        const insertText = imageItem
          ? `![image](./${assetsName}/${encodedName})`
          : `<video src="./${assetsName}/${encodedName}" controls width="100%"></video>`;
        const cursor = view.state.selection.main.head;
        view.dispatch({
          changes: { from: cursor, insert: insertText },
          selection: { anchor: cursor + insertText.length }
        });
      }

      refreshTree();
    } catch (err) {
      console.error("Media paste failed:", err);
      addToast(t.failedMediaPaste, "error");
    }
  };

  // Copy media file to {filename}.assets folder
  const copyMediaFile = async (rawDroppedPath: string, baseDir: string, mdFileName: string) => {
    const assetsName = mdFileName.replace(/\.md$/, ".assets");
    const assetsDir = joinPath(baseDir, assetsName);
    await mkdir(assetsDir, { recursive: true });

    const originalFileName = rawDroppedPath.split(/[/\\]/).pop();
    if (!originalFileName) throw new Error("Failed to extract file name");
    let destFileName = originalFileName;
    let destPath = joinPath(assetsDir, destFileName);

    try {
      // Check for duplicate file name
      const isExist = await exists(destPath);

      if (isExist) {
        const overwrite = await ask(`'${destFileName}' ${t.fileExistsOverwrite}`, {
          title: t.overwriteConfirmTitle,
          kind: "warning",
          okLabel: t.overwrite,
          cancelLabel: t.saveAsAlternate,
        });

        if (!overwrite) {
          // Ask user for a new file name
          const newName = await promptUser(t.newMediaNamePrompt, originalFileName);
          if (!newName) return null;
          destFileName = newName;
          destPath = joinPath(assetsDir, destFileName);
        }
      }

      await copyFile(rawDroppedPath, destPath);

      return getFileName(destPath); // Return file name for Markdown insertion
    } catch (e) {
      console.error("Media copy failed:", e);
      addToast(t.failedMediaCopy, "error");
      return null;
    }
  };

  // --- Event listeners ---
  useEffect(() => {
    const unlisteners = [
      listen("menu-new", () => createNewTab()),
      listen("menu-open", async () => {
        const selected = await open({ multiple: false, filters: [{ name: "Markdown", extensions: ["md"] }] });
        if (selected && typeof selected === "string") openTargetFile(selected);
      }),
      listen("menu-save", () => saveFile()),
      listen("menu-toggle_theme", () => toggleTheme()),
      listen("menu-undo", () => { if (editorViewRef.current) undo(editorViewRef.current); }),
      listen("menu-redo", () => { if (editorViewRef.current) redo(editorViewRef.current); }),
      listen("menu-cut", () => document.execCommand("cut")),
      listen("menu-copy", () => document.execCommand("copy")),
      listen("menu-paste", () => document.execCommand("paste")),
      listen("menu-exit", async () => {
        await confirmAndExit(tabsRef.current, flushAppState, {
          message: t.unsavedChangesConfirm,
          title: t.exitConfirmTitle,
          okLabel: t.discardAndExit,
          cancelLabel: t.cancel,
        });
      }),
    ];
    return () => { unlisteners.forEach(async (u) => (await u)()); };
  }, [tabs, activeId, projectRoot]);

  // --- Table editing: apply a table mutation to the document ---
  // Uses the *original* table range from tableContext for replacement,
  // and the *new* (mutated) table for the formatted content.
  const applyTableChange = useCallback((newTable: ParsedTable) => {
    const view = editorViewRef.current;
    if (!view || !tableContext) return;
    const { state } = view;
    const formatted = formatTable(newTable);

    // Use the ORIGINAL table's line range for replacement
    const origTable = tableContext.table;
    const startLine = state.doc.line(origTable.startLine + 1); // 0-based → 1-based
    const endLine = state.doc.line(origTable.endLine);         // endLine is exclusive 0-based, so in 1-based it's the last table line
    const from = startLine.from;
    const to = endLine.to;

    // Place cursor at end of newly formatted table
    const newCursorPos = from + formatted.length;

    view.dispatch({
      changes: { from, to, insert: formatted },
      selection: { anchor: Math.min(newCursorPos, from + formatted.length) },
    });
    view.focus();
  }, [tableContext]);

  const handleTableInsertRowAbove = useCallback(() => {
    if (!tableContext) return;
    const { table, cursorRowIndex } = tableContext;
    const rowIdx = cursorRowIndex < 0 ? 0 : cursorRowIndex;
    applyTableChange(insertRowAbove(table, rowIdx));
  }, [tableContext, applyTableChange]);

  const handleTableInsertRowBelow = useCallback(() => {
    if (!tableContext) return;
    const { table, cursorRowIndex } = tableContext;
    const rowIdx = cursorRowIndex < 0 ? 0 : cursorRowIndex;
    applyTableChange(insertRowBelow(table, rowIdx));
  }, [tableContext, applyTableChange]);

  const handleTableDeleteRow = useCallback(() => {
    if (!tableContext || tableContext.cursorRowIndex < 0) return;
    applyTableChange(deleteRow(tableContext.table, tableContext.cursorRowIndex));
  }, [tableContext, applyTableChange]);

  const handleTableInsertColumnLeft = useCallback(() => {
    if (!tableContext) return;
    applyTableChange(insertColumnLeft(tableContext.table, tableContext.cursorColIndex));
  }, [tableContext, applyTableChange]);

  const handleTableInsertColumnRight = useCallback(() => {
    if (!tableContext) return;
    applyTableChange(insertColumnRight(tableContext.table, tableContext.cursorColIndex));
  }, [tableContext, applyTableChange]);

  const handleTableDeleteColumn = useCallback(() => {
    if (!tableContext) return;
    applyTableChange(deleteColumn(tableContext.table, tableContext.cursorColIndex));
  }, [tableContext, applyTableChange]);

  const handleTableSetAlignment = useCallback((alignment: Alignment) => {
    if (!tableContext) return;
    applyTableChange(setColumnAlignment(tableContext.table, tableContext.cursorColIndex, alignment));
  }, [tableContext, applyTableChange]);

  const handleTableFormat = useCallback(() => {
    if (!tableContext) return;
    applyTableChange(tableContext.table); // formatTable is called inside applyTableChange
  }, [tableContext, applyTableChange]);

  const handleTableInsertNew = useCallback((rows: number, cols: number) => {
    const view = editorViewRef.current;
    if (!view) return;
    const { state } = view;
    const cursor = state.selection.main.head;
    const newTableText = "\n" + generateNewTable(rows, cols) + "\n";
    view.dispatch({
      changes: { from: cursor, insert: newTableText },
      selection: { anchor: cursor + newTableText.length },
    });
    view.focus();
  }, []);

  // --- Snippet insertion ---
  const insertSnippet = (snippet: string) => {
    if (!editorViewRef.current) return;
    const view = editorViewRef.current;
    const { state } = view;
    const mainPos = state.selection.main.head;

    // Simple placeholder processing for $1, $2 etc.
    let processedSnippet = snippet;
    let selectionOffset = snippet.length;
    let selectionLength = 0;

    if (snippet.includes("$1")) {
      const index = snippet.indexOf("$1");
      processedSnippet = snippet.replace("$1", "");
      selectionOffset = index;
      selectionLength = 0; // Move cursor to placeholder position after insertion
    }

    view.dispatch({
      changes: { from: mainPos, insert: processedSnippet },
      selection: { anchor: mainPos + selectionOffset, head: mainPos + selectionOffset + selectionLength }
    });
    view.focus();
  };

  // --- Tab context menu handler ---
  const handleTabContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTabContextMenu({ x: e.pageX, y: e.pageY, tabId });
  }, []);

  // --- Context menu handler ---
  const handleContextMenu = (e: React.MouseEvent, entry: FileEntry, isBackground: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      path: entry.path,
      isDirectory: entry.isDirectory,
      isBackground: isBackground
    });
  };

  useEffect(() => {
    const closeMenu = () => {
      setContextMenu(null);
      setTabContextMenu(null);
    };
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // --- Editor content change handler (stabilized with useCallback) ---
  const handleEditorChange = useCallback((val: string) => {
    setTabs(prev => prev.map(t =>
      t.id === activeId
        ? { ...t, content: val, isModified: val !== t.originalContent }
        : t
    ));
  }, [activeId, setTabs]);

  // --- Toggle folder expansion (lazy-loads children on first expand) ---
  const handleToggleFolder = useCallback(async (folderPath: string) => {
    if (expandedFolders.has(folderPath)) {
      // Collapsing
      setExpandedFolders(prev => {
        const next = new Set(prev);
        next.delete(folderPath);
        return next;
      });
    } else {
      // Expanding: load children if not yet loaded
      const children = findNodeChildren(fileTree, folderPath);
      if (children === undefined) {
        await loadChildren(folderPath);
      }
      setExpandedFolders(prev => new Set([...prev, folderPath]));
    }
  }, [expandedFolders, fileTree, loadChildren, findNodeChildren, setExpandedFolders]);

  // --- Save cursor position + switch active tab (with multi-select support) ---
  const handleTabClick = useCallback((tabId: string, e?: React.MouseEvent) => {
    if (e && (e.ctrlKey || e.metaKey)) {
      // Ctrl+click: toggle individual selection
      toggleSelectTab(tabId);
      return;
    }
    if (e && e.shiftKey) {
      // Shift+click: range selection from active tab to clicked tab
      rangeSelectTabs(tabId);
      return;
    }
    // Normal click: clear selection and switch tab
    clearSelection();
    saveCursorPosition(activeId, tabs, editorViewRef.current, cursorPositionsRef.current);
    // Save scroll position of the current tab before switching
    if (activeId && editorViewRef.current) {
      const key = tabs.find(t => t.id === activeId)?.path || activeId;
      scrollPositionsRef.current[key] = editorViewRef.current.scrollDOM.scrollTop;
    }
    setActiveId(tabId);
  }, [activeId, tabs, setActiveId, toggleSelectTab, rangeSelectTabs, clearSelection]);

  // --- Context menu: Open in system file explorer ---
  const handleOpenInExplorer = useCallback(async (filePath: string) => {
    await openPath(normalizePath(filePath));
    setContextMenu(null);
  }, []);

  // --- Hamburger menu: Exit ---
  const handleExit = useCallback(async () => {
    await confirmAndExit(tabsRef.current, flushAppState, {
      message: t.unsavedChangesConfirm,
      title: t.exitConfirmTitle,
      okLabel: t.discardAndExit,
      cancelLabel: t.cancel,
    });
  }, [flushAppState, tabsRef, t]);

  // --- Export: HTML ---
  const handleExportHTML = useCallback(async () => {
    const previewArea = previewRef.current;
    if (!previewArea || !activeTab) return;

    const title = activeTab.name.replace(/\.md$/, "");
    const html = generateExportHTML(previewArea.innerHTML, title, activeTab.path || "");

    try {
      const filePath = await save({
        defaultPath: `${title}.html`,
        filters: [{ name: "HTML", extensions: ["html"] }],
      });
      if (!filePath) return;
      await writeTextFile(filePath, html);
      addToast(t.exportedSuccessfully, "success");
    } catch (e) {
      console.error("HTML export failed:", e);
      addToast(t.failedExport, "error");
    }
  }, [activeTab, addToast, t]);

  // --- Export: PDF (via window.print) ---
  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  // --- Project search result click handler ---
  const handleProjectSearchResultClick = useCallback(async (filePath: string, lineNumber: number) => {
    await openTargetFile(filePath);
    // After file is opened, move cursor to the target line
    requestAnimationFrame(() => {
      setTimeout(() => {
        const view = editorViewRef.current;
        if (!view) return;
        const doc = view.state.doc;
        if (lineNumber > doc.lines) return;
        const lineObj = doc.line(lineNumber);
        view.dispatch({
          selection: { anchor: lineObj.from, head: lineObj.from },
          effects: EditorView.scrollIntoView(lineObj.from, { y: "center" }),
        });
        view.focus();
      }, 100);
    });
  }, [openTargetFile]);

  // --- Open new window ---
  const handleNewWindow = useCallback(() => {
    const label = `markly-${Date.now()}`;
    new WebviewWindow(label, {
      url: "/",
      title: "Markly",
      width: 800,
      height: 600,
    });
  }, []);

  // --- Open folder with lock check and session restore ---
  const handleOpenFolder = useCallback(async () => {
    const selected = await open({ directory: true });
    if (!selected || typeof selected !== "string") return;

    // Check if the directory is locked by another instance
    const locked = await isProjectLocked(selected);
    if (locked) {
      await ask(
        t.directoryLockedMessage,
        { title: "Markly", kind: "warning" }
      );
      return;
    }

    // Save current project's session
    await saveCurrentSession();

    // Release current lock
    await releaseCurrentLock();

    // Acquire lock for new project
    await acquireProjectLock(selected);

    // Set new project root and load tree
    setProjectRoot(selected);
    const tree = await loadDirectory(selected);
    setFileTree(tree);

    // Load saved session for this project (if any)
    const sessionData = await loadSessionForProject(selected);
    if (sessionData && sessionData.openedPaths.length > 0) {
      // Restore expanded folders
      if (sessionData.expandedFolders.length > 0) {
        const sortedFolders = [...sessionData.expandedFolders].sort(
          (a, b) => a.length - b.length
        );
        for (const folderPath of sortedFolders) {
          try {
            await loadChildren(folderPath);
          } catch { /* skip deleted folders */ }
        }
        setExpandedFolders(new Set(sessionData.expandedFolders));
      } else {
        setExpandedFolders(new Set());
      }

      // Restore cursor positions
      cursorPositionsRef.current = sessionData.cursorPositions ?? {};

      // Restore tabs
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
            isModified: false,
          });
        } catch {
          addToast(`${t.failedFileRestore}: ${getFileName(filePath)}`, "warning");
        }
      }

      if (restoredTabs.length > 0) {
        setTabs(restoredTabs);
        const active = restoredTabs.find(t => t.path === sessionData.activePath) || restoredTabs[0];
        setActiveId(active.id);
      } else {
        setTabs([]);
      }
    } else {
      // No saved session: fresh start
      setExpandedFolders(new Set());
      setTabs([]);
      cursorPositionsRef.current = {};
    }
  }, [
    saveCurrentSession, releaseCurrentLock, acquireProjectLock,
    loadSessionForProject, setProjectRoot, loadDirectory, setFileTree,
    loadChildren, setExpandedFolders, setTabs, setActiveId,
    addToast, t,
  ]);

  // --- First-launch language selection ---
  if (language === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-slate-200 font-sans">
        <div className="w-80 text-center space-y-6">
          <div className="text-4xl font-bold tracking-tighter italic text-blue-400">Markly</div>
          <h2 className="text-lg font-semibold">
            言語を選択 / Select Language
          </h2>
          <p className="text-sm text-slate-400 whitespace-pre-line">
            Marklyで使用する言語を選択してください。{"\n"}Choose the language for Markly.{"\n"}
            <span className="text-xs text-slate-500">この設定は後から変更できます / You can change this later in Settings.</span>
          </p>
          <div className="flex flex-col gap-3">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelectLanguage(opt.value)}
                className="px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all text-base font-medium"
              >
                {opt.nativeLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={t}>
    <div className={`flex h-screen w-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden font-sans relative ${isResizing ? "select-none" : ""}`}>

      {/* 1. Sidebar */}
      {!zenMode && (
        <>
          <Sidebar
            sidebarRef={sidebarRef}
            sidebarWidth={sidebarWidth}
            fileTree={fileTree}
            projectRoot={projectRoot}
            expandedFolders={expandedFolders}
            loadingFolders={loadingFolders}
            activeFilePath={activeTab?.path}
            isRefreshing={isRefreshing}
            openTabsHeight={openTabsHeight}
            tabs={tabs}
            activeId={activeId}
            onToggleFolder={handleToggleFolder}
            onOpenFile={openTargetFile}
            onContextMenu={handleContextMenu}
            onCreateFile={createFileInFolder}
            onCreateFolder={createFolderInFolder}
            onRename={renameFile}
            onDelete={deleteFile}
            onRefreshTree={refreshTree}
            onOpenFolder={handleOpenFolder}
            onNewWindow={handleNewWindow}
            onTabClick={handleTabClick}
            onResizeMouseDown={handleMouseDown}
            showProjectSearch={showProjectSearch}
            onToggleProjectSearch={() => setShowProjectSearch(prev => !prev)}
            projectSearchQuery={projectSearchQuery}
            onProjectSearchQueryChange={setProjectSearchQuery}
            projectSearchCaseSensitive={projectSearchCaseSensitive}
            onProjectSearchCaseSensitiveChange={setProjectSearchCaseSensitive}
            projectSearchUseRegex={projectSearchUseRegex}
            onProjectSearchUseRegexChange={setProjectSearchUseRegex}
            projectSearchResults={projectSearchResults}
            projectSearchTotalMatches={projectSearchTotalMatches}
            projectSearchIsSearching={projectSearchIsSearching}
            projectSearchError={projectSearchError}
            onProjectSearchResultClick={handleProjectSearchResultClick}
            onProjectSearchClear={clearProjectSearch}
          />

          {/* Sidebar resize handle */}
          <div
            className="resize-handle-v"
            onMouseDown={() => handleMouseDown("sidebar")}
          />
        </>
      )}

      {/* 2. Main area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Tab bar */}
        {!zenMode && (
          <TabBar
            tabs={tabs}
            activeId={activeId}
            selectedTabIds={selectedTabIds}
            isDark={isDark}
            showReference={showReference}
            showOutline={showOutline}
            showHamburgerMenu={showHamburgerMenu}
            onTabClick={handleTabClick}
            onCloseTab={closeTab}
            onTabContextMenu={handleTabContextMenu}
            onCreateNewTab={createNewTab}
            onToggleReference={() => setShowReference(!showReference)}
            onToggleOutline={() => setShowOutline(!showOutline)}
            onToggleTheme={toggleTheme}
            onToggleHamburgerMenu={() => setShowHamburgerMenu(prev => !prev)}
            onOpenSearchDialog={() => setShowSearchDialog(true)}
            onOpenProjectSearch={() => setShowProjectSearch(true)}
            onOpenSettingsDialog={() => setShowSettingsDialog(true)}
            onOpenAboutDialog={() => setShowAboutDialog(true)}
            onExportHTML={handleExportHTML}
            onExportPDF={handleExportPDF}
            hasActiveTab={!!activeTab}
            onExit={handleExit}
            zenMode={zenMode}
            onToggleZenMode={() => setZenMode(prev => !prev)}
            draggedIndex={draggedIndex}
            draggedIds={draggedIds}
            dropTargetIndex={dropTargetIndex}
            dropPosition={dropPosition}
            dragClientX={dragClientX}
            dragClientY={dragClientY}
            draggedTotalWidth={draggedTotalWidth}
            onTabMouseDown={handleTabMouseDown}
          />
        )}

        {activeTab ? (
          <>
            <div id="main-editor-area" className="flex-1 flex overflow-hidden relative">
              {showOutline && !zenMode && (
                <OutlinePanel
                  headings={headings}
                  onHeadingClick={handleOutlineHeadingClick}
                  onClose={() => setShowOutline(false)}
                />
              )}
              {/* Table editing toolbar */}
              {tableContext && (
                <TableToolbar
                  table={tableContext.table}
                  cursorRowIndex={tableContext.cursorRowIndex}
                  cursorColIndex={tableContext.cursorColIndex}
                  top={tableContext.top}
                  left={tableContext.left}
                  onInsertRowAbove={handleTableInsertRowAbove}
                  onInsertRowBelow={handleTableInsertRowBelow}
                  onDeleteRow={handleTableDeleteRow}
                  onInsertColumnLeft={handleTableInsertColumnLeft}
                  onInsertColumnRight={handleTableInsertColumnRight}
                  onDeleteColumn={handleTableDeleteColumn}
                  onSetAlignment={handleTableSetAlignment}
                  onFormatTable={handleTableFormat}
                  onInsertNewTable={handleTableInsertNew}
                />
              )}
              <EditorPane
                content={activeTab.content || ""}
                isDark={isDark}
                editorFontFamily={editorFontFamily}
                editorFontSize={editorFontSize}
                lineWrapping={lineWrapping}
                editorWidthPercent={editorWidthPercent}
                onCreateEditor={(view) => {
                  editorViewRef.current = view;
                  // Trigger useScrollSync re-run now that editorViewRef.current is set
                  setEditorMountCount(c => c + 1);
                  // Compute initial stats for the status bar
                  const stats = computeEditorStats(view);
                  editorStatsRef.current = stats;
                  setEditorStats(stats);
                  // Initial cursor restoration (editor first mount, no value sync).
                  // pendingRestoreRef is already set by useLayoutEffect.
                  const pending = pendingRestoreRef.current;
                  if (pending) {
                    pendingRestoreRef.current = null;
                    const pos = Math.min(pending.cursor, view.state.doc.length);
                    setTimeout(() => {
                      try {
                        view.dispatch({
                          selection: { anchor: pos, head: pos },
                          effects: EditorView.scrollIntoView(pos, { y: 'center' }),
                        });
                        view.focus();
                      } catch { /* editor may not be ready */ }
                    }, 0);
                  }
                }}
                onChange={handleEditorChange}
                onPaste={handlePaste}
                onUpdate={handleEditorUpdate}
              />
              {/* Editor/Preview resize handle */}
              <div
                className="resize-handle-v"
                onMouseDown={() => handleMouseDown("editor")}
              />
              <PreviewPane
                ref={previewRef}
                content={activeTab.content}
                activeFilePath={activeTab.path}
                isDark={isDark}
                lineBreaks={lineBreaks}
                previewFontFamily={previewFontFamily}
                previewFontSize={previewFontSize}
                showReference={showReference && !zenMode}
                refActiveCategory={refActiveCategory}
                onSetRefActiveCategory={setRefActiveCategory}
                onCloseReference={() => setShowReference(false)}
                onInsertSnippet={insertSnippet}
                markdownReference={markdownRef}
              />
            </div>
            {!zenMode && <StatusBar stats={editorStats} fileName={activeTab.name} />}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
            <div className="text-6xl mb-4 font-bold opacity-10 select-none tracking-tighter italic pointer-events-none">Markly</div>
            <div className="text-sm uppercase tracking-widest opacity-30 font-bold">{t.selectFileToEdit}</div>
          </div>
        )}
      </div>

      {/* Zen mode exit hint overlay */}
      {zenMode && (
        <div className="zen-mode-hint" onClick={() => setZenMode(false)}>
          {t.zenModeExit}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          onOpenInExplorer={handleOpenInExplorer}
          onCreateFile={createFileInFolder}
          onCreateFolder={createFolderInFolder}
          onDuplicate={duplicateFile}
          onRename={renameFile}
          onDelete={deleteFile}
        />
      )}

      {/* Tab context menu */}
      {tabContextMenu && (
        <TabContextMenu
          config={tabContextMenu}
          tabCount={tabs.length}
          tabIndex={tabs.findIndex(t => t.id === tabContextMenu.tabId)}
          selectedCount={selectedTabIds.size}
          onClose={(id) => { closeTab(id); setTabContextMenu(null); }}
          onCloseOthers={(id) => { closeOtherTabs(id); setTabContextMenu(null); }}
          onCloseLeft={(id) => { closeTabsToTheLeft(id); setTabContextMenu(null); }}
          onCloseRight={(id) => { closeTabsToTheRight(id); setTabContextMenu(null); }}
          onCloseAll={() => { closeAllTabs(); setTabContextMenu(null); }}
          onCloseSelected={() => { closeSelectedTabs(); setTabContextMenu(null); }}
        />
      )}

      {/* Search & Replace dialog */}
      {showSearchDialog && (
        <SearchDialog
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          replaceQuery={replaceQuery}
          setReplaceQuery={setReplaceQuery}
          searchCaseSensitive={searchCaseSensitive}
          setSearchCaseSensitive={setSearchCaseSensitive}
          searchUseRegex={searchUseRegex}
          setSearchUseRegex={setSearchUseRegex}
          matchCount={matchCount}
          currentMatchIndex={currentMatchIndex}
          dialogPos={searchDialogPos}
          onHighlightAndGoToMatch={highlightAndGoToMatch}
          onReplaceCurrentMatch={replaceCurrentMatch}
          onReplaceAllMatches={replaceAllMatches}
          onDragStart={handleDialogDragStart}
          onClose={() => setShowSearchDialog(false)}
        />
      )}

      {/* Settings dialog */}
      {showSettingsDialog && (
        <SettingsDialog
          isDark={isDark}
          toggleTheme={toggleTheme}
          language={language!}
          setLanguage={(lang) => { setLanguage(lang); saveConfig({ language: lang }); }}
          lineBreaks={lineBreaks}
          setLineBreaks={setLineBreaks}
          lineWrapping={lineWrapping}
          setLineWrapping={setLineWrapping}
          scrollSync={scrollSync}
          setScrollSync={setScrollSync}
          editorFontFamily={editorFontFamily}
          setEditorFontFamily={setEditorFontFamily}
          editorFontSize={editorFontSize}
          setEditorFontSize={setEditorFontSize}
          previewFontFamily={previewFontFamily}
          setPreviewFontFamily={setPreviewFontFamily}
          previewFontSize={previewFontSize}
          setPreviewFontSize={setPreviewFontSize}
          saveConfig={saveConfig}
          loadConfig={loadConfig}
          applyConfig={applyConfig}
          onClose={() => setShowSettingsDialog(false)}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* About dialog */}
      {showAboutDialog && (
        <AboutDialog onClose={() => setShowAboutDialog(false)} />
      )}

      {/* Input dialog (replaces window.prompt) */}
      {inputDialogConfig && (
        <InputDialog
          title={inputDialogConfig.title}
          defaultValue={inputDialogConfig.defaultValue}
          onConfirm={handleInputConfirm}
          onCancel={handleInputCancel}
        />
      )}
    </div>
    </I18nContext.Provider>
  );
}

export default App;
