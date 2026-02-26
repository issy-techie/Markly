import React from "react";
import { useI18n } from "../../hooks/useI18n";

export interface EditorStats {
  line: number;
  col: number;
  charCount: number;
  lineCount: number;
  wordCount: number;
  selectionLength: number;
}

interface StatusBarProps {
  stats: EditorStats;
  fileName?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ stats, fileName }) => {
  const t = useI18n();

  return (
    <div className="h-6 flex items-center bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-3 flex-shrink-0 text-[11px] select-none">
      {/* Left: file name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {fileName && (
          <span className="text-slate-500 dark:text-slate-400 truncate">{fileName}</span>
        )}
      </div>

      {/* Right: stats */}
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <span>
          <span className="text-slate-400 dark:text-slate-500">{t.statusBarLn}</span>{" "}
          <span className="font-mono text-slate-600 dark:text-slate-300">{stats.line.toLocaleString()}</span>
          <span className="text-slate-300 dark:text-slate-600 mx-0.5">,</span>
          <span className="text-slate-400 dark:text-slate-500">{t.statusBarCol}</span>{" "}
          <span className="font-mono text-slate-600 dark:text-slate-300">{stats.col}</span>
        </span>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <span>
          <span className="font-mono text-slate-600 dark:text-slate-300">{stats.charCount.toLocaleString()}</span>{" "}
          <span className="text-slate-400 dark:text-slate-500">{t.statusBarChars}</span>
        </span>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <span>
          <span className="font-mono text-slate-600 dark:text-slate-300">{stats.lineCount.toLocaleString()}</span>{" "}
          <span className="text-slate-400 dark:text-slate-500">{t.statusBarLines}</span>
        </span>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <span>
          <span className="font-mono text-slate-600 dark:text-slate-300">{stats.wordCount.toLocaleString()}</span>{" "}
          <span className="text-slate-400 dark:text-slate-500">{t.statusBarWords}</span>
        </span>

        {stats.selectionLength > 0 && (
          <>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>
              <span className="text-slate-400 dark:text-slate-500">{t.statusBarSelected}</span>{" "}
              <span className="font-mono text-blue-500">{stats.selectionLength.toLocaleString()}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
