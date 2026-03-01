import React, { useMemo, useState, useCallback } from "react";
import { X, Plus, Pipette } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import type { ReferenceCategory } from "../../constants";
import { createMarkdownComponents } from "./MarkdownRenderers";
import { useI18n } from "../../hooks/useI18n";

interface PreviewPaneProps {
  content: string;
  activeFilePath: string | null | undefined;
  isDark: boolean;
  lineBreaks: boolean;
  previewFontFamily: string;
  previewFontSize: number;
  showReference: boolean;
  refActiveCategory: string;
  onSetRefActiveCategory: (category: string) => void;
  onCloseReference: () => void;
  onInsertSnippet: (snippet: string) => void;
  markdownReference: ReferenceCategory[];
}

const PreviewPane = React.forwardRef<HTMLDivElement, PreviewPaneProps>(({
  content,
  activeFilePath,
  isDark,
  lineBreaks,
  previewFontFamily,
  previewFontSize,
  showReference,
  refActiveCategory,
  onSetRefActiveCategory,
  onCloseReference,
  onInsertSnippet,
  markdownReference,
}, ref) => {
  const t = useI18n();
  const markdownComponents = useMemo(
    () => createMarkdownComponents({ activeFilePath, isDark }),
    [activeFilePath, isDark]
  );

  // Color picker state
  const [pickerColor, setPickerColor] = useState("#e74c3c");
  const [pickerMode, setPickerMode] = useState<"text" | "bg">("text");

  const handleInsertPickerColor = useCallback(() => {
    if (pickerMode === "text") {
      onInsertSnippet(`<span style="color: ${pickerColor}">$1</span>`);
    } else {
      onInsertSnippet(`<span style="background-color: ${pickerColor}; padding: 0 4px; border-radius: 2px">$1</span>`);
    }
  }, [pickerColor, pickerMode, onInsertSnippet]);

  return (
    <div className="flex-1 relative overflow-hidden flex">
      {/* Scrollable preview content */}
      <div ref={ref} className={`p-8 overflow-y-auto preview-area custom-scrollbar flex-1 ${isDark ? "prose prose-invert bg-slate-900" : "prose bg-slate-50"}`} style={{ fontFamily: previewFontFamily, fontSize: `${previewFontSize}px` }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, ...(lineBreaks ? [remarkBreaks] : [])]}
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Reference panel (Slide-in drawer) — positioned relative to non-scrolling wrapper */}
      <div data-reference-panel className={`absolute top-0 right-0 h-full w-64 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-700 shadow-2xl z-40 transition-transform duration-300 ease-in-out transform flex flex-col ${showReference ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/50 shrink-0">
          <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Reference</span>
          <button onClick={onCloseReference} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
            <X size={14} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto tab-scrollbar bg-slate-100/30 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 px-2 pt-1 no-scrollbar shrink-0">
            {markdownReference.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSetRefActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                  refActiveCategory === cat.id
                    ? "border-blue-500 text-blue-500 bg-white/50 dark:bg-slate-700/50"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
            {/* Color picker UI — shown only for textColor category */}
            {refActiveCategory === "textColor" && (
              <div className="mb-3 p-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <Pipette size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.colorPicker}</span>
                </div>
                {/* Mode toggle */}
                <div className="flex gap-1 mb-2">
                  <button
                    onClick={() => setPickerMode("text")}
                    className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                      pickerMode === "text"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500"
                    }`}
                  >
                    {t.textColor}
                  </button>
                  <button
                    onClick={() => setPickerMode("bg")}
                    className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                      pickerMode === "bg"
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500"
                    }`}
                  >
                    {t.bgColor}
                  </button>
                </div>
                {/* Color wheel + HEX input */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={pickerColor}
                    onChange={(e) => setPickerColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-500 p-0"
                    title={t.colorPicker}
                  />
                  <input
                    type="text"
                    value={pickerColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setPickerColor(v);
                    }}
                    className="flex-1 text-[11px] font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
                {/* Preview */}
                <div className="mb-2 p-2 rounded bg-slate-50 dark:bg-slate-800 text-[11px] text-center">
                  {pickerMode === "text" ? (
                    <span style={{ color: pickerColor }}>Preview — {pickerColor}</span>
                  ) : (
                    <span style={{ backgroundColor: pickerColor, padding: "0 4px", borderRadius: "2px" }}>Preview — {pickerColor}</span>
                  )}
                </div>
                {/* Insert button */}
                <button
                  onClick={handleInsertPickerColor}
                  className="w-full text-[11px] py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  {t.insertThisColor}
                </button>
              </div>
            )}

            {markdownReference.filter(cat => cat.id === refActiveCategory).map((cat, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="grid grid-cols-1 gap-1">
                  {cat.items.map((item, iidx) => (
                    <button
                      key={iidx}
                      onClick={() => onInsertSnippet(item.snippet)}
                      className="group flex flex-col items-start p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all text-left shadow-sm hover:shadow"
                    >
                      <div className="flex items-center justify-between w-full mb-0.5">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{item.label}</span>
                        <Plus size={10} className="text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                      {/* Color swatch for 文字色 items */}
                      {"color" in item && (item as any).color && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="inline-block w-3 h-3 rounded-full border border-slate-300 dark:border-slate-500 shrink-0" style={{ backgroundColor: (item as any).color }} />
                          <code className="text-[9px] font-mono text-slate-400">{(item as any).color}</code>
                        </div>
                      )}
                      <code className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded truncate w-full">{item.syntax}</code>
                      {item.sample && <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{item.sample}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-slate-100/30 dark:bg-slate-900/10 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <p className="text-[10px] text-slate-400 leading-tight">{t.referenceFooter}</p>
        </div>
      </div>
    </div>
  );
});

PreviewPane.displayName = "PreviewPane";

export default PreviewPane;
