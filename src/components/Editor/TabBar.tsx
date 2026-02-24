import React from "react";
import { Plus, X, Search, Menu, Settings, Info, LogOut, Sun, Moon, Book } from "lucide-react";
import type { Tab } from "../../types";
import IconButton from "../ui/IconButton";

interface TabBarProps {
  tabs: Tab[];
  activeId: string | null;
  isDark: boolean;
  showReference: boolean;
  showHamburgerMenu: boolean;
  onTabClick: (tabId: string) => void;
  onCloseTab: (tabId: string, e?: React.MouseEvent) => void;
  onCreateNewTab: () => void;
  onToggleReference: () => void;
  onToggleTheme: () => void;
  onToggleHamburgerMenu: () => void;
  onOpenSearchDialog: () => void;
  onOpenSettingsDialog: () => void;
  onOpenAboutDialog: () => void;
  onExit: () => void;
  // Tab drag-and-drop reorder
  draggedIndex: number | null;
  dropTargetIndex: number | null;
  dropPosition: "before" | "after" | null;
  onTabMouseDown: (e: React.MouseEvent, index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeId,
  isDark,
  showReference,
  showHamburgerMenu,
  onTabClick,
  onCloseTab,
  onCreateNewTab,
  onToggleReference,
  onToggleTheme,
  onToggleHamburgerMenu,
  onOpenSearchDialog,
  onOpenSettingsDialog,
  onOpenAboutDialog,
  onExit,
  draggedIndex,
  dropTargetIndex,
  dropPosition,
  onTabMouseDown,
}) => {
  return (
    <div className="h-8 flex items-end bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-1 gap-0.5">
      <div className="flex-1 flex h-full overflow-x-auto tab-scrollbar items-end">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); onCloseTab(tab.id, e); } }}
            onMouseDown={(e) => onTabMouseDown(e, index)}
            className={`
              flex items-center gap-2 px-3 py-1.5 text-xs rounded-t-lg
              cursor-pointer group flex-shrink-0 min-w-[80px] max-w-[200px]
              ${draggedIndex === null ? "transition-all duration-150" : ""}
              ${activeId === tab.id
                ? "bg-white dark:bg-slate-900 shadow-sm font-medium -mb-px border-t border-l border-r border-slate-200 dark:border-slate-700"
                : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 mt-1"
              }
              ${draggedIndex === index ? "opacity-40" : ""}
              ${dropTargetIndex === index && dropPosition === "before" ? "tab-drop-before" : ""}
              ${dropTargetIndex === index && dropPosition === "after" ? "tab-drop-after" : ""}
            `}
          >
            <span className="truncate flex-1 select-none">{tab.name}</span>
            {tab.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>}
            <button onClick={(e) => onCloseTab(tab.id, e)} className="ml-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-opacity"><X size={12} /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center h-full bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 px-2 flex-shrink-0 gap-1">
        <IconButton onClick={onCreateNewTab} title="New Tab"><Plus size={16} /></IconButton>
        <IconButton onClick={onToggleReference} title="Markdownリファレンス" active={showReference}><Book size={16} /></IconButton>
        <IconButton onClick={onToggleTheme} title="テーマ切替">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <div className="relative" data-hamburger-menu>
          <IconButton onClick={onToggleHamburgerMenu} title="メニュー">
            <Menu size={16} />
          </IconButton>
          {showHamburgerMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md py-1 z-50 text-sm"
              onClick={onToggleHamburgerMenu}
            >
              <button
                onClick={onOpenSearchDialog}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Search size={14} /> 検索・置換 <span className="ml-auto text-xs text-slate-400">Ctrl+F</span>
              </button>
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />} テーマ切替 ({isDark ? "Light" : "Dark"})
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={onOpenSettingsDialog}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings size={14} /> 設定
              </button>
              <button
                onClick={onOpenAboutDialog}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Info size={14} /> バージョン情報
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={onExit}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
              >
                <LogOut size={14} /> 終了
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabBar;
