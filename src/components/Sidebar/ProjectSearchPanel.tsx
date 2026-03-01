import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, CaseSensitive, Regex, ChevronRight, FileText, Loader2, AlertCircle, X } from "lucide-react";
import type { ProjectSearchFileGroup, ProjectSearchMatch } from "../../types";
import { useI18n } from "../../hooks/useI18n";

interface ProjectSearchPanelProps {
  query: string;
  onQueryChange: (q: string) => void;
  caseSensitive: boolean;
  onCaseSensitiveChange: (v: boolean) => void;
  useRegex: boolean;
  onUseRegexChange: (v: boolean) => void;
  results: ProjectSearchFileGroup[];
  totalMatches: number;
  isSearching: boolean;
  error: string | null;
  onResultClick: (filePath: string, lineNumber: number) => void;
  onClear: () => void;
}

const ProjectSearchPanel: React.FC<ProjectSearchPanelProps> = ({
  query,
  onQueryChange,
  caseSensitive,
  onCaseSensitiveChange,
  useRegex,
  onUseRegexChange,
  results,
  totalMatches,
  isSearching,
  error,
  onResultClick,
  onClear,
}) => {
  const t = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [collapsedFiles, setCollapsedFiles] = useState<Set<string>>(new Set());

  // Auto-focus input when panel mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const toggleCollapse = useCallback((filePath: string) => {
    setCollapsedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  }, []);

  // Render match line with highlighted match portion
  const renderMatchLine = (match: ProjectSearchMatch) => {
    const line = match.line_content;
    const chars = Array.from(line);
    const before = chars.slice(0, match.match_start).join("");
    const matched = chars.slice(match.match_start, match.match_end).join("");
    const after = chars.slice(match.match_end).join("");

    return (
      <div
        key={`${match.file_path}:${match.line_number}:${match.match_start}`}
        className="flex items-start gap-1 px-2 py-0.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600/50 rounded transition-colors group"
        onClick={() => onResultClick(match.file_path, match.line_number)}
      >
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono w-6 text-right shrink-0 mt-px">
          {match.line_number}
        </span>
        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate leading-snug">
          {before}
          <span className="bg-amber-300/60 dark:bg-amber-500/40 text-slate-900 dark:text-amber-100 rounded-sm px-px">
            {matched}
          </span>
          {after}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search input area */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-700 space-y-1.5">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t.projectSearchPlaceholder}
            className="w-full pl-7 pr-7 py-1.5 text-[12px] rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
          />
          {query && (
            <button
              onClick={onClear}
              className="absolute right-1.5 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
              title="Clear"
            >
              <X size={12} className="text-slate-400" />
            </button>
          )}
        </div>
        {/* Options */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCaseSensitiveChange(!caseSensitive)}
            title={t.caseSensitive}
            className={`p-1 rounded transition-colors ${
              caseSensitive
                ? "bg-blue-500/20 text-blue-500"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <CaseSensitive size={14} />
          </button>
          <button
            onClick={() => onUseRegexChange(!useRegex)}
            title={t.regex}
            className={`p-1 rounded transition-colors ${
              useRegex
                ? "bg-blue-500/20 text-blue-500"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <Regex size={14} />
          </button>
          {/* Result summary */}
          <div className="flex-1 text-right">
            {isSearching ? (
              <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                <Loader2 size={10} className="animate-spin" />
                {t.projectSearchSearching}
              </span>
            ) : query && !error && totalMatches > 0 ? (
              <span className="text-[10px] text-slate-400">
                {totalMatches} matches · {results.length} files
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {/* Error */}
        {error && (
          <div className="px-3 py-2 mx-2 mt-1 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
            <span className="text-[11px] text-red-600 dark:text-red-400 break-all">
              {t.projectSearchInvalidRegex}
            </span>
          </div>
        )}

        {/* Truncation warning */}
        {totalMatches >= 1000 && (
          <div className="px-3 py-1.5 mx-2 mt-1 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] text-amber-600 dark:text-amber-400">{t.projectSearchTruncated}</span>
          </div>
        )}

        {/* No results */}
        {!error && !isSearching && query.trim() && totalMatches === 0 && (
          <div className="px-4 py-8 text-center text-[11px] text-slate-400 italic">
            {t.projectSearchNoResults}
          </div>
        )}

        {/* File groups */}
        {results.map((group) => (
          <div key={group.filePath} className="mb-0.5">
            {/* File header */}
            <div
              className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10"
              onClick={() => toggleCollapse(group.filePath)}
            >
              <ChevronRight
                size={12}
                className={`text-slate-400 transition-transform shrink-0 ${
                  collapsedFiles.has(group.filePath) ? "" : "rotate-90"
                }`}
              />
              <FileText size={11} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                {group.fileName}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-200/60 dark:bg-slate-600/60 rounded-full px-1.5 ml-auto shrink-0">
                {group.matches.length}
              </span>
            </div>
            {/* Match lines */}
            {!collapsedFiles.has(group.filePath) && (
              <div className="pl-3">
                {group.matches.map(renderMatchLine)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSearchPanel;
