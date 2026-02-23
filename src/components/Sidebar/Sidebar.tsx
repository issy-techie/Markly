import React from "react";
import { FileText, FolderOpen, FolderPlus, FilePlus, RefreshCw, ExternalLink } from "lucide-react";
import type { Tab, FileEntry } from "../../types";
import FileTreeNode from "../FileTreeNode";

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
  onResizeMouseDown: (target: "sidebar" | "editor" | "opentabs") => void;
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
  onResizeMouseDown,
}) => {
  return (
    <aside
      ref={sidebarRef}
      className="bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col select-none flex-shrink-0"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="p-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        Explorer
        <div className="flex gap-1">
          <button onClick={onRefreshTree} title="更新" disabled={isRefreshing}>
            <RefreshCw size={14} className={`hover:text-blue-500 transition-colors ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
          </button>
          <button onClick={() => projectRoot && onCreateFile(projectRoot)} title="ルートにファイル作成"><FilePlus size={14} className="hover:text-blue-500" /></button>
          <button onClick={() => projectRoot && onCreateFolder(projectRoot)} title="ルートにディレクトリ作成"><FolderPlus size={14} className="hover:text-blue-500" /></button>
          <button onClick={onOpenFolder} title="フォルダを開く"><FolderOpen size={14} className="hover:text-blue-500" /></button>
          <button onClick={onNewWindow} title="新しいウィンドウで開く"><ExternalLink size={14} className="hover:text-blue-500" /></button>
        </div>
      </div>

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
            フォルダ未選択 <button onClick={onOpenFolder} className="block mx-auto mt-2 text-blue-500 font-bold underline not-italic opacity-100">開く</button>
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
        <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
          {tabs.map(tab => (
            <div key={tab.id} onClick={() => onTabClick(tab.id)} className={`px-4 py-1 text-sm truncate flex items-center justify-between group cursor-pointer ${activeId === tab.id ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              <div className="flex items-center gap-2 truncate text-[11px]"><FileText size={11} className={activeId === tab.id ? "text-blue-500" : "text-slate-400"} /><span className="truncate">{tab.name}</span></div>
              {tab.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
