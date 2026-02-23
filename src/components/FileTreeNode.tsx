import React from "react";
import { FileText, FolderPlus, ChevronRight, ChevronDown, Folder, Edit2, Trash2, FilePlus, Image as ImageIcon, Loader2 } from "lucide-react";
import type { FileEntry } from "../types";
import { IMAGE_EXTENSIONS } from "../constants";

interface FileTreeNodeProps {
  entry: FileEntry;
  depth: number;
  expandedFolders: Set<string>;
  loadingFolders: Set<string>;
  activeFilePath: string | null | undefined;
  onToggleFolder: (path: string) => void;
  onOpenFile: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, entry: FileEntry) => void;
  onCreateFolder: (folderPath: string) => void;
  onCreateFile: (folderPath: string) => void;
  onRename: (path: string) => void;
  onDelete: (path: string, isDirectory: boolean) => void;
}

const FileTreeNode = React.memo(({
  entry,
  depth,
  expandedFolders,
  loadingFolders,
  activeFilePath,
  onToggleFolder,
  onOpenFile,
  onContextMenu,
  onCreateFolder,
  onCreateFile,
  onRename,
  onDelete,
}: FileTreeNodeProps) => {
  const isExpanded = expandedFolders.has(entry.path);
  const isLoading = loadingFolders.has(entry.path);
  const ext = entry.name.toLowerCase().substring(entry.name.lastIndexOf('.'));
  const isImage = IMAGE_EXTENSIONS.includes(ext);
  const isActive = activeFilePath === entry.path;

  const childProps = {
    expandedFolders,
    loadingFolders,
    activeFilePath,
    onToggleFolder,
    onOpenFile,
    onContextMenu,
    onCreateFolder,
    onCreateFile,
    onRename,
    onDelete,
  };

  return (
    <div className="group/item">
      <div
        onClick={() => {
          if (entry.isDirectory) {
            onToggleFolder(entry.path);
          } else {
            onOpenFile(entry.path);
          }
        }}
        onContextMenu={(e) => onContextMenu(e, entry)}
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-sm truncate relative ${
          isActive
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
            : "hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {entry.isDirectory ? (
          <>
            {isLoading
              ? <Loader2 size={14} className="animate-spin text-blue-500" />
              : isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            }
            <Folder size={14} className="text-blue-500 fill-blue-500/20" />
          </>
        ) : (
          <>{isImage ? <ImageIcon size={14} className="text-emerald-500" /> : <FileText size={14} className="text-slate-400" />}</>
        )}
        <span className="truncate flex-1 select-none">{entry.name}</span>

        <div className="hidden group-hover/item:flex items-center gap-1 pr-1 bg-inherit">
          {entry.isDirectory && <button onClick={(e) => { e.stopPropagation(); onCreateFolder(entry.path); }} title="新規ディレクトリ作成"><FolderPlus size={12} className="text-slate-400 hover:text-blue-500" /></button>}
          {entry.isDirectory && <button onClick={(e) => { e.stopPropagation(); onCreateFile(entry.path); }} title="新規ファイル作成"><FilePlus size={12} className="text-slate-400 hover:text-blue-500" /></button>}
          <button onClick={(e) => { e.stopPropagation(); onRename(entry.path); }} title="名前を変更"><Edit2 size={12} className="text-slate-400 hover:text-blue-500" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(entry.path, entry.isDirectory); }} title="削除"><Trash2 size={12} className="text-slate-400 hover:text-red-500" /></button>
        </div>
      </div>
      {entry.isDirectory && isExpanded && entry.children && (
        <div>
          {entry.children.map(child => (
            <FileTreeNode key={child.path} entry={child} depth={depth + 1} {...childProps} />
          ))}
        </div>
      )}
    </div>
  );
});

FileTreeNode.displayName = "FileTreeNode";

export default FileTreeNode;
