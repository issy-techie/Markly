import React, { useState, useCallback, useRef } from "react";
import { FileText, FolderOpen, FolderPlus, FilePlus, RefreshCw, ExternalLink, Search, FolderTree, X } from "lucide-react";
import type { Tab, FileEntry, ProjectSearchFileGroup } from "../../types";
import { useI18n } from "../../hooks/useI18n";
import FileTreeNode from "../FileTreeNode";
import ProjectSearchPanel from "./ProjectSearchPanel";

interface SidebarProps {
  sidebarRef: React.RefObject<HTMLElement | null>;
  sidebarWidth: number;
  fileTree: FileEntry[];
  projectRoot: string | null;
  expandedFolders: Set<string>;
  loadingFolders: Set<string>;
  activeFilePath: string | null | undefined;
  isRefreshing: boolean;
  openTabsHeight: number;
  tabs: Tab[];
  activeId: string | null;
  onToggleFolder: (path: string) => void;
  onOpenFile: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, entry: FileEntry, isBackground?: boolean) => void;
  onCreateFile: (folderPath: string) => void;
  onCreateFolder: (folderPath: string) => void;
  onRename: (path: string) => void;
  onDelete: (path: string, isDirectory: boolean) => void;
  onRefreshTree: () => void;
  onOpenFolder: () => void;
  onNewWindow: () => void;
  onTabClick: (tabId: string) => void;
  onCloseTab: (tabId: string, e?: React.MouseEvent) => void;
  onReorderTabs: (fromIndex: number, toIndex: number) => void;
  onResizeMouseDown: (target: "sidebar" | "editor" | "opentabs") => void;
  // Project search props
  showProjectSearch: boolean;
  onToggleProjectSearch: () => void;
  projectSearchQuery: string;
  onProjectSearchQueryChange: (q: string) => void;
  projectSearchCaseSensitive: boolean;
  onProjectSearchCaseSensitiveChange: (v: boolean) => void;
  projectSearchUseRegex: boolean;
  onProjectSearchUseRegexChange: (v: boolean) => void;
  projectSearchResults: ProjectSearchFileGroup[];
  projectSearchTotalMatches: number;
  projectSearchIsSearching: boolean;
  projectSearchError: string | null;
  onProjectSearchResultClick: (filePath: string, lineNumber: number) => void;
  onProjectSearchClear: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarRef,
  sidebarWidth,
  fileTree,
  projectRoot,
  expandedFolders,
  loadingFolders,
  activeFilePath,
  isRefreshing,
  openTabsHeight,
  tabs,
  activeId,
  onToggleFolder,
  onOpenFile,
  onContextMenu,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onRefreshTree,
  onOpenFolder,
  onNewWindow,
  onTabClick,
  onCloseTab,
  onReorderTabs,
  onResizeMouseDown,
  showProjectSearch,
  onToggleProjectSearch,
  projectSearchQuery,
  onProjectSearchQueryChange,
  projectSearchCaseSensitive,
  onProjectSearchCaseSensitiveChange,
  projectSearchUseRegex,
  onProjectSearchUseRegexChange,
  projectSearchResults,
  projectSearchTotalMatches,
  projectSearchIsSearching,
  projectSearchError,
  onProjectSearchResultClick,
  onProjectSearchClear,
}) => {
  const t = useI18n();

  // --- Open Tabs mouse-based drag-and-drop ---
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    // Only left button; ignore if clicking the close button
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    const startY = e.clientY;
    let dragging = false;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging && Math.abs(ev.clientY - startY) > 4) {
        dragging = true;
        dragIndexRef.current = index;
        setDragIndex(index);
      }
      if (!dragging || !tabListRef.current) return;
      // Find which tab item the cursor is over
      const items = tabListRef.current.querySelectorAll<HTMLElement>("[data-tab-index]");
      let hoverIdx: number | null = null;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        if (ev.clientY >= rect.top && ev.clientY < rect.bottom) {
          hoverIdx = parseInt(item.dataset.tabIndex!, 10);
          break;
        }
      }
      setDropIndex(hoverIdx);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (dragging && dragIndexRef.current !== null) {
        const from = dragIndexRef.current;
        setDropIndex(prev => {
          if (prev !== null && prev !== from) {
            onReorderTabs(from, prev);
          }
          return null;
        });
      }
      dragIndexRef.current = null;
      setDragIndex(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [onReorderTabs]);

  /** Compute relative directory path from projectRoot (excluding filename) */
  const getRelativeDir = useCallback((tabPath: string | null): string | null => {
    if (!tabPath || !projectRoot) return null;
    const normalized = tabPath.replace(/\\/g, "/");
    const normalizedRoot = projectRoot.replace(/\\/g, "/").replace(/\/$/, "");
    if (!normalized.startsWith(normalizedRoot + "/")) return null;
    // relative = "src/components/Sidebar.tsx" etc.
    const relative = normalized.slice(normalizedRoot.length + 1);
    const lastSlash = relative.lastIndexOf("/");
    if (lastSlash < 0) return null; // root-level file
    return relative.substring(0, lastSlash);
  }, [projectRoot]);

  return (
    <aside
      ref={sidebarRef}
      className="bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col select-none flex-shrink-0"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="p-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          {/* Explorer / Search toggle buttons */}
          <button
            onClick={() => showProjectSearch && onToggleProjectSearch()}
            title="Explorer"
            className={`p-0.5 rounded transition-colors ${
              !showProjectSearch
                ? "text-blue-500 bg-blue-500/10"
                : "hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <FolderTree size={13} />
          </button>
          <button
            onClick={() => !showProjectSearch && onToggleProjectSearch()}
            title={t.projectSearch}
            className={`p-0.5 rounded transition-colors ${
              showProjectSearch
                ? "text-blue-500 bg-blue-500/10"
                : "hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <Search size={13} />
          </button>
          <span className="ml-0.5">{showProjectSearch ? t.projectSearch : "Explorer"}</span>
        </div>
        {!showProjectSearch && (
          <div className="flex gap-1">
            <button onClick={onRefreshTree} title={t.refresh} disabled={isRefreshing}>
              <RefreshCw size={14} className={`hover:text-blue-500 transition-colors ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
            </button>
            <button onClick={() => projectRoot && onCreateFile(projectRoot)} title={t.createFileInRoot}><FilePlus size={14} className="hover:text-blue-500" /></button>
            <button onClick={() => projectRoot && onCreateFolder(projectRoot)} title={t.createFolderInRoot}><FolderPlus size={14} className="hover:text-blue-500" /></button>
            <button onClick={onOpenFolder} title={t.openFolder}><FolderOpen size={14} className="hover:text-blue-500" /></button>
            <button onClick={onNewWindow} title={t.newWindow}><ExternalLink size={14} className="hover:text-blue-500" /></button>
          </div>
        )}
      </div>

      {/* Main content area — switches between Explorer and Search */}
      {showProjectSearch ? (
        <ProjectSearchPanel
          query={projectSearchQuery}
          onQueryChange={onProjectSearchQueryChange}
          caseSensitive={projectSearchCaseSensitive}
          onCaseSensitiveChange={onProjectSearchCaseSensitiveChange}
          useRegex={projectSearchUseRegex}
          onUseRegexChange={onProjectSearchUseRegexChange}
          results={projectSearchResults}
          totalMatches={projectSearchTotalMatches}
          isSearching={projectSearchIsSearching}
          error={projectSearchError}
          onResultClick={onProjectSearchResultClick}
          onClear={onProjectSearchClear}
        />
      ) : (
        <>
          <div
            className="flex-1 overflow-y-auto py-2 custom-scrollbar"
            onContextMenu={(e) => projectRoot && onContextMenu(e, { name: '', path: projectRoot, isDirectory: true }, true)}
          >
            {projectRoot ? (
              fileTree.map(entry => (
                <FileTreeNode
                  key={entry.path}
                  entry={entry}
                  depth={0}
                  expandedFolders={expandedFolders}
                  loadingFolders={loadingFolders}
                  activeFilePath={activeFilePath}
                  onToggleFolder={onToggleFolder}
                  onOpenFile={onOpenFile}
                  onContextMenu={(e, entry) => onContextMenu(e, entry)}
                  onCreateFolder={onCreateFolder}
                  onCreateFile={onCreateFile}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <div className="px-6 py-10 text-xs text-slate-400 text-center leading-loose italic opacity-50">
                {t.noFolderSelected} <button onClick={onOpenFolder} className="block mx-auto mt-2 text-blue-500 font-bold underline not-italic opacity-100">{t.open}</button>
              </div>
            )}
          </div>

          {/* Explorer / Open Tabs vertical resize handle */}
          <div
            className="resize-handle-h"
            onMouseDown={() => onResizeMouseDown("opentabs")}
          />

          {/* Open Tabs */}
          <div className="border-t border-slate-200 dark:border-slate-700 flex flex-col bg-slate-100/50 dark:bg-black/20 overflow-hidden flex-shrink-0" style={{ height: `${openTabsHeight}px` }}>
            <div className="p-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/50">Open Tabs</div>
            <div ref={tabListRef} className="flex-1 overflow-y-auto py-1 custom-scrollbar">
              {tabs.map((tab, index) => {
                const relDir = getRelativeDir(tab.path);
                return (
                  <div
                    key={tab.id}
                    data-tab-index={index}
                    onMouseDown={(e) => handleTabMouseDown(e, index)}
                    onClick={() => { if (dragIndex === null) onTabClick(tab.id); }}
                    className={`
                      px-4 py-1 text-sm flex items-center justify-between group cursor-pointer
                      ${activeId === tab.id ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-slate-200 dark:hover:bg-slate-700"}
                      ${dragIndex === index ? "opacity-40" : ""}
                      ${dropIndex === index && dragIndex !== null && dragIndex !== index ? "border-t-2 border-blue-400" : "border-t-2 border-transparent"}
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 text-[11px]">
                      <FileText size={11} className={`flex-shrink-0 ${activeId === tab.id ? "text-blue-500" : "text-slate-400"}`} />
                      <span className="truncate">{tab.name}</span>
                      {relDir && (
                        <span className="truncate text-[9px] text-slate-400 dark:text-slate-500 ml-0.5">{relDir}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      {tab.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                      <button
                        onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id, e); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-300 dark:hover:bg-slate-600 rounded transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
