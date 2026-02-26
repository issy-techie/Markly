import React from "react";
import { X, Search, ChevronUp, ChevronDown, CaseSensitive, Regex } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

interface SearchDialogProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  replaceQuery: string;
  setReplaceQuery: (q: string) => void;
  searchCaseSensitive: boolean;
  setSearchCaseSensitive: (v: boolean) => void;
  searchUseRegex: boolean;
  setSearchUseRegex: (v: boolean) => void;
  matchCount: number;
  currentMatchIndex: number;
  dialogPos: { x: number; y: number };
  onHighlightAndGoToMatch: (direction: "next" | "prev") => void;
  onReplaceCurrentMatch: () => void;
  onReplaceAllMatches: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onClose: () => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  searchCaseSensitive,
  setSearchCaseSensitive,
  searchUseRegex,
  setSearchUseRegex,
  matchCount,
  currentMatchIndex,
  dialogPos,
  onHighlightAndGoToMatch,
  onReplaceCurrentMatch,
  onReplaceAllMatches,
  onDragStart,
  onClose,
}) => {
  const t = useI18n();
  return (
    <div
      className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-2xl rounded-lg overflow-hidden"
      style={{ top: dialogPos.y, left: dialogPos.x, width: 360 }}
    >
      {/* Title bar (draggable) */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-900 cursor-move select-none border-b border-slate-200 dark:border-slate-700"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
          <Search size={14} /> {t.searchTitle}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Search input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onHighlightAndGoToMatch("next"); }}
            className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <span className="text-xs text-slate-500 min-w-[40px] text-right">
            {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : "0"}
          </span>
        </div>

        {/* Replace input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t.replacePlaceholder}
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1 cursor-pointer select-none text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={searchCaseSensitive}
              onChange={(e) => setSearchCaseSensitive(e.target.checked)}
              className="rounded"
            />
            <CaseSensitive size={14} /> {t.caseSensitive}
          </label>
          <label className="flex items-center gap-1 cursor-pointer select-none text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={searchUseRegex}
              onChange={(e) => setSearchUseRegex(e.target.checked)}
              className="rounded"
            />
            <Regex size={14} /> {t.regex}
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onHighlightAndGoToMatch("prev")}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors flex items-center gap-1"
            title={t.prev}
          >
            <ChevronUp size={14} /> {t.prev}
          </button>
          <button
            onClick={() => onHighlightAndGoToMatch("next")}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors flex items-center gap-1"
            title={t.next}
          >
            <ChevronDown size={14} /> {t.next}
          </button>
          <div className="flex-1" />
          <button
            onClick={onReplaceCurrentMatch}
            className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            {t.replace}
          </button>
          <button
            onClick={onReplaceAllMatches}
            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            {t.replaceAll}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
