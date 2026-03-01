import React from "react";
import { Plus, X, Search, FolderSearch, Menu, Settings, Info, LogOut, Sun, Moon, Book, ListTree, Maximize, Minimize, FileText, FileDown } from "lucide-react";
import type { Tab } from "../../types";
import { useI18n } from "../../hooks/useI18n";
import IconButton from "../ui/IconButton";

interface TabBarProps {
  tabs: Tab[];
  activeId: string | null;
  selectedTabIds: Set<string>;
  isDark: boolean;
  showReference: boolean;
  showOutline: boolean;
  showHamburgerMenu: boolean;
  onTabClick: (tabId: string, e?: React.MouseEvent) => void;
  onCloseTab: (tabId: string, e?: React.MouseEvent) => void;
  onCreateNewTab: () => void;
  onToggleReference: () => void;
  onToggleOutline: () => void;
  onToggleTheme: () => void;
  onToggleHamburgerMenu: () => void;
  onOpenSearchDialog: () => void;
  onOpenProjectSearch: () => void;
  onOpenSettingsDialog: () => void;
  onOpenAboutDialog: () => void;
  onExit: () => void;
  // Export
  onExportHTML: () => void;
  onExportPDF: () => void;
  hasActiveTab: boolean;
  // Zen mode
  zenMode: boolean;
  onToggleZenMode: () => void;
  // Tab context menu
  onTabContextMenu: (e: React.MouseEvent, tabId: string) => void;
  // Tab drag-and-drop reorder
  draggedIndex: number | null;
  draggedIds: string[];
  dropTargetIndex: number | null;
  dropPosition: "before" | "after" | null;
  dragClientX: number;
  dragClientY: number;
  draggedTotalWidth: number;
  onTabMouseDown: (e: React.MouseEvent, index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeId,
  selectedTabIds,
  isDark,
  showReference,
  showOutline,
  showHamburgerMenu,
  onTabClick,
  onCloseTab,
  onCreateNewTab,
  onToggleReference,
  onToggleOutline,
  onToggleTheme,
  onToggleHamburgerMenu,
  onOpenSearchDialog,
  onOpenProjectSearch,
  onOpenSettingsDialog,
  onOpenAboutDialog,
  onExit,
  onExportHTML,
  onExportPDF,
  hasActiveTab,
  zenMode,
  onToggleZenMode,
  onTabContextMenu,
  draggedIndex,
  draggedIds,
  dropTargetIndex,
  dropPosition,
  dragClientX,
  dragClientY,
  draggedTotalWidth,
  onTabMouseDown,
}) => {
  const t = useI18n();
  const isDragging = draggedIndex !== null;
  const draggedTab = isDragging ? tabs[draggedIndex] : null;
  const draggedIdSet = new Set(draggedIds);
  const isMultiDrag = draggedIds.length > 1;

  return (
    <div className="h-8 flex items-end bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-1 gap-0.5" data-tab-bar>
      <div className="flex-1 flex h-full overflow-x-auto tab-scrollbar items-end">
        {tabs.map((tab, index) => {
          const isSelected = selectedTabIds.has(tab.id);
          const isActive = activeId === tab.id;
          const isBeingDragged = draggedIdSet.has(tab.id);

          // Compute slide offset for non-dragged tabs during drag
          let slideTransform = "";
          if (isDragging && !isBeingDragged && dropTargetIndex !== null && dropPosition !== null) {
            // Determine the effective insert position
            const insertIdx = dropPosition === "before" ? dropTargetIndex : dropTargetIndex + 1;

            // Count how many dragged tabs are before/after this tab
            const draggedBefore = draggedIds.filter((id) => {
              const di = tabs.findIndex(t => t.id === id);
              return di < index;
            }).length;
            const draggedAfter = draggedIds.filter((id) => {
              const di = tabs.findIndex(t => t.id === id);
              return di > index;
            }).length;

            // This tab's "logical" position if dragged tabs were removed
            const logicalIndex = index - draggedBefore;
            // Insert position in the "remaining" array
            const remainingInsertIdx = insertIdx - draggedIds.filter((id) => {
              const di = tabs.findIndex(t => t.id === id);
              return di < insertIdx;
            }).length;

            if (logicalIndex >= remainingInsertIdx) {
              // This tab is at or after insert point → shift right
              slideTransform = `translateX(${draggedTotalWidth}px)`;
            }
            // tabs before insert point stay in place (no transform needed)
            void draggedAfter; // suppress unused warning
          }

          return (
          <div
            key={tab.id}
            onClick={(e) => onTabClick(tab.id, e)}
            onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); onCloseTab(tab.id, e); } }}
            onContextMenu={(e) => onTabContextMenu(e, tab.id)}
            onMouseDown={(e) => onTabMouseDown(e, index)}
            className={`
              flex items-center gap-2 px-3 py-1.5 text-xs rounded-t-lg
              cursor-pointer group flex-shrink-0 min-w-[80px] max-w-[200px]
              ${isDragging && !isBeingDragged ? "tab-slide-transition" : ""}
              ${!isDragging ? "transition-all duration-150" : ""}
              ${isActive
                ? "bg-white dark:bg-slate-900 shadow-sm font-medium -mb-px border-t border-l border-r border-slate-200 dark:border-slate-700"
                : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 mt-1"
              }
              ${isSelected && !isBeingDragged ? "ring-2 ring-blue-400 ring-inset" : ""}
              ${isBeingDragged ? "opacity-30 scale-95" : ""}
              ${dropTargetIndex === index && dropPosition === "before" ? "tab-drop-before" : ""}
              ${dropTargetIndex === index && dropPosition === "after" ? "tab-drop-after" : ""}
            `}
            style={slideTransform ? { transform: slideTransform } : undefined}
          >
            <span className="truncate flex-1 select-none">{tab.name}</span>
            {tab.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>}
            <button onClick={(e) => onCloseTab(tab.id, e)} className="ml-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-opacity"><X size={12} /></button>
          </div>
          );
        })}
      </div>
      <div className="flex items-center h-full bg-slate-100 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 px-2 flex-shrink-0 gap-1">
        <IconButton onClick={onCreateNewTab} title="New Tab"><Plus size={16} /></IconButton>
        <IconButton onClick={onToggleOutline} title={t.outline} active={showOutline}><ListTree size={16} /></IconButton>
        <IconButton onClick={onToggleReference} title={t.markdownReference} active={showReference}><Book size={16} /></IconButton>
        <IconButton onClick={onToggleTheme} title={t.toggleTheme}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <div className="relative" data-hamburger-menu>
          <IconButton onClick={onToggleHamburgerMenu} title={t.menu}>
            <Menu size={16} />
          </IconButton>
          {showHamburgerMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md py-1 z-50 text-sm"
              onClick={onToggleHamburgerMenu}
            >
              <button
                onClick={onOpenSearchDialog}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Search size={14} className="shrink-0" /> {t.searchAndReplace} <span className="ml-auto text-xs text-slate-400">Ctrl+F</span>
              </button>
              <button
                onClick={onOpenProjectSearch}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <FolderSearch size={14} className="shrink-0" /> {t.projectSearch} <span className="ml-auto text-xs text-slate-400">Ctrl+Shift+F</span>
              </button>
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                {isDark ? <Sun size={14} className="shrink-0" /> : <Moon size={14} className="shrink-0" />} {t.toggleTheme} ({isDark ? "Light" : "Dark"})
              </button>
              <button
                onClick={onToggleZenMode}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                {zenMode ? <Minimize size={14} className="shrink-0" /> : <Maximize size={14} className="shrink-0" />} {t.zenMode} <span className="ml-auto text-xs text-slate-400">F11</span>
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={onExportHTML}
                disabled={!hasActiveTab}
                className={`w-full flex items-center gap-2 px-3 py-2 transition-colors whitespace-nowrap ${hasActiveTab ? "hover:bg-slate-100 dark:hover:bg-slate-700" : "opacity-40 cursor-not-allowed"}`}
              >
                <FileText size={14} className="shrink-0" /> {t.exportAsHTML}
              </button>
              <button
                onClick={onExportPDF}
                disabled={!hasActiveTab}
                className={`w-full flex items-center gap-2 px-3 py-2 transition-colors whitespace-nowrap ${hasActiveTab ? "hover:bg-slate-100 dark:hover:bg-slate-700" : "opacity-40 cursor-not-allowed"}`}
              >
                <FileDown size={14} className="shrink-0" /> {t.exportAsPDF}
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={onOpenSettingsDialog}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Settings size={14} className="shrink-0" /> {t.settings}
              </button>
              <button
                onClick={onOpenAboutDialog}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Info size={14} className="shrink-0" /> {t.versionInfo}
              </button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={onExit}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors whitespace-nowrap"
              >
                <LogOut size={14} className="shrink-0" /> {t.exit}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drag ghost: floating copy of the dragged tab(s) */}
      {isDragging && draggedTab && dragClientX > 0 && (
        <div
          className={`tab-drag-ghost flex items-center gap-2 px-3 py-1.5 text-xs
            ${activeId === draggedTab.id
              ? "bg-white dark:bg-slate-900 font-medium border-t border-l border-r border-slate-200 dark:border-slate-700"
              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}
          style={{
            left: dragClientX - 60,
            top: dragClientY - 14,
            width: isMultiDrag ? 140 : undefined,
            maxWidth: 200,
            minWidth: 80,
          }}
        >
          <span className="truncate flex-1 select-none">{draggedTab.name}</span>
          {isMultiDrag && (
            <span className="flex-shrink-0 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {draggedIds.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TabBar;
