import React from "react";
import { FolderOpen, FolderPlus, FilePlus, Copy, Edit2, Trash2 } from "lucide-react";
import type { ContextMenuConfig } from "../../types";

interface ContextMenuProps {
  contextMenu: ContextMenuConfig;
  onOpenInExplorer: (path: string) => void;
  onCreateFile: (folderPath: string) => void;
  onCreateFolder: (folderPath: string) => void;
  onDuplicate: (path: string) => void;
  onRename: (path: string) => void;
  onDelete: (path: string, isDirectory: boolean) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  onOpenInExplorer,
  onCreateFile,
  onCreateFolder,
  onDuplicate,
  onRename,
  onDelete,
}) => {
  return (
    <div
      className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md py-1 min-w-[160px] text-xs"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.isDirectory && (
        <>
          <button onClick={() => onOpenInExplorer(contextMenu.path)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors"><FolderOpen size={14} /> エクスプローラーで開く</button>
          <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
          <button onClick={() => onCreateFile(contextMenu.path)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors"><FilePlus size={14} /> 新規ファイル作成</button>
          <button onClick={() => onCreateFolder(contextMenu.path)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors"><FolderPlus size={14} /> 新規ディレクトリ作成</button>
        </>
      )}
      {!contextMenu.isBackground && (
        <>
          <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
          {!contextMenu.isDirectory && (
            <button onClick={() => onDuplicate(contextMenu.path)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors"><Copy size={14} /> 複製をつくる</button>
          )}
          <button onClick={() => onRename(contextMenu.path)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors"><Edit2 size={14} /> 名前を変更</button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <button onClick={() => onDelete(contextMenu.path, contextMenu.isDirectory)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500 hover:text-white transition-colors text-red-500"><Trash2 size={14} /> 削除</button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
