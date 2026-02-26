import React from "react";
import { X } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import type { HeadingItem } from "../../utils/headingExtractor";

interface OutlinePanelProps {
  headings: HeadingItem[];
  onHeadingClick: (heading: HeadingItem) => void;
  onClose: () => void;
}

const OutlinePanel: React.FC<OutlinePanelProps> = ({
  headings,
  onHeadingClick,
  onClose,
}) => {
  const t = useI18n();

  return (
    <div className="w-48 flex-shrink-0 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col select-none h-full">
      {/* Header */}
      <div className="p-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        {t.outline}
        <button
          onClick={onClose}
          className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <X size={12} className="text-slate-400" />
        </button>
      </div>

      {/* Heading list */}
      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        {headings.length === 0 ? (
          <div className="px-4 py-8 text-xs text-slate-400 text-center italic opacity-50">
            {t.outlineEmpty}
          </div>
        ) : (
          headings.map((heading, index) => (
            <button
              key={`${heading.lineNumber}-${index}`}
              onClick={() => onHeadingClick(heading)}
              className="w-full text-left py-1 truncate hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px]"
              style={{ paddingLeft: `${8 + (heading.level - 1) * 12}px`, paddingRight: "8px" }}
              title={heading.text}
            >
              <span
                className={
                  heading.level <= 2
                    ? "font-medium text-slate-700 dark:text-slate-200"
                    : "text-slate-500 dark:text-slate-400"
                }
              >
                {heading.text}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default OutlinePanel;
