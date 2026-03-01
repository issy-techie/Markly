import React, { useState } from "react";
import { X, Plus, Pencil, Trash2, Braces } from "lucide-react";
import type { Snippet } from "../../types";
import { useI18n } from "../../hooks/useI18n";
import Modal from "../ui/Modal";

interface SnippetsDialogProps {
  snippets: Snippet[];
  onAdd: (snippet: Snippet) => void;
  onUpdate: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

interface EditingSnippet {
  id: string;
  prefix: string;
  label: string;
  content: string;
  isNew: boolean;
}

const SnippetsDialog: React.FC<SnippetsDialogProps> = ({
  snippets,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const t = useI18n();
  const [editing, setEditing] = useState<EditingSnippet | null>(null);

  const handleStartAdd = () => {
    setEditing({
      id: crypto.randomUUID(),
      prefix: "",
      label: "",
      content: "",
      isNew: true,
    });
  };

  const handleStartEdit = (s: Snippet) => {
    setEditing({ ...s, isNew: false });
  };

  const handleSave = () => {
    if (!editing || !editing.prefix.trim() || !editing.content.trim()) return;
    const snippet: Snippet = {
      id: editing.id,
      prefix: editing.prefix.trim().replace(/^\//, ""),
      label: editing.label.trim() || editing.prefix.trim(),
      content: editing.content,
    };
    if (editing.isNew) {
      onAdd(snippet);
    } else {
      onUpdate(snippet);
    }
    setEditing(null);
  };

  const handleCancelEdit = () => setEditing(null);

  const isDuplicatePrefix = editing
    ? snippets.some(
        (s) =>
          s.id !== editing.id &&
          s.prefix.toLowerCase() === editing.prefix.trim().replace(/^\//, "").toLowerCase()
      )
    : false;

  const inputClass =
    "w-full px-2 py-1.5 text-sm border rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <Modal onClose={onClose} className="w-[480px] max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <span className="font-bold text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Braces size={16} /> {t.snippetsTitle}
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {editing ? (
          /* ---- Edit / Add form ---- */
          <div className="space-y-3">
            {/* Prefix */}
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t.snippetPrefix}
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-400 font-mono">/</span>
                <input
                  type="text"
                  value={editing.prefix}
                  onChange={(e) =>
                    setEditing({ ...editing, prefix: e.target.value.replace(/\s/g, "") })
                  }
                  placeholder="date"
                  autoFocus
                  className={inputClass}
                />
              </div>
              {isDuplicatePrefix && (
                <p className="text-xs text-red-500 mt-1">{t.snippetDuplicatePrefix}</p>
              )}
            </div>

            {/* Label */}
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t.snippetLabel}
              </label>
              <input
                type="text"
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder={t.snippetLabelPlaceholder}
                className={inputClass}
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {t.snippetContent}
              </label>
              <textarea
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                rows={6}
                placeholder={t.snippetContentPlaceholder}
                className={`${inputClass} font-mono resize-y`}
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {t.snippetPlaceholderHint}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={
                  !editing.prefix.trim() || !editing.content.trim() || isDuplicatePrefix
                }
                className="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editing.isNew ? t.snippetAdd : t.snippetSave}
              </button>
            </div>
          </div>
        ) : (
          /* ---- List view ---- */
          <div className="space-y-2">
            {snippets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">{t.snippetsEmpty}</p>
            ) : (
              snippets.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">
                        /{s.prefix}
                      </code>
                      <span className="text-sm font-medium truncate text-slate-700 dark:text-slate-200">
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 font-mono">
                      {s.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartEdit(s)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                    title={t.snippetEdit}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
                    title={t.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between">
        {!editing ? (
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            <Plus size={14} /> {t.snippetAdd}
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {t.close}
        </button>
      </div>
    </Modal>
  );
};

export default SnippetsDialog;
