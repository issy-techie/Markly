import React from "react";
import { X, XCircle, ArrowLeftFromLine, ArrowRightFromLine, Trash2, CheckSquare } from "lucide-react";
import type { TabContextMenuConfig } from "../../types";
import { useI18n } from "../../hooks/useI18n";

interface TabContextMenuProps {
  config: TabContextMenuConfig;
  tabCount: number;
  tabIndex: number;
  selectedCount: number;
  onClose: (tabId: string) => void;
  onCloseOthers: (tabId: string) => void;
  onCloseLeft: (tabId: string) => void;
  onCloseRight: (tabId: string) => void;
  onCloseAll: () => void;
  onCloseSelected: () => void;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
  config,
  tabCount,
  tabIndex,
  selectedCount,
  onClose,
  onCloseOthers,
  onCloseLeft,
  onCloseRight,
  onCloseAll,
  onCloseSelected,
}) => {
  const t = useI18n();
  const hasOthers = tabCount > 1;
  const hasLeft = tabIndex > 0;
  const hasRight = tabIndex < tabCount - 1;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md py-1 min-w-[180px] text-xs"
      style={{ top: config.y, left: config.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onClose(config.tabId)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors"
      >
        <X size={14} /> {t.tabClose}
      </button>
      <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
      <button
        onClick={() => onCloseOthers(config.tabId)}
        disabled={!hasOthers}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:cursor-default"
      >
        <XCircle size={14} /> {t.tabCloseOthers}
      </button>
      <button
        onClick={() => onCloseLeft(config.tabId)}
        disabled={!hasLeft}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:cursor-default"
      >
        <ArrowLeftFromLine size={14} /> {t.tabCloseLeft}
      </button>
      <button
        onClick={() => onCloseRight(config.tabId)}
        disabled={!hasRight}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:cursor-default"
      >
        <ArrowRightFromLine size={14} /> {t.tabCloseRight}
      </button>
      {selectedCount >= 2 && (
        <>
          <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
          <button
            onClick={() => onCloseSelected()}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          >
            <CheckSquare size={14} /> {t.tabCloseSelected} ({selectedCount})
          </button>
        </>
      )}
      <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
      <button
        onClick={() => onCloseAll()}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500 hover:text-white transition-colors text-red-500"
      >
        <Trash2 size={14} /> {t.tabCloseAll}
      </button>
    </div>
  );
};

export default TabContextMenu;
