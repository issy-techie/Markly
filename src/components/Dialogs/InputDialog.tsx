import { useState } from "react";
import Modal from "../ui/Modal";

interface InputDialogProps {
  title: string;
  defaultValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

/**
 * A modal input dialog that replaces window.prompt with a native-looking UI.
 * Manages its own input value internally and calls onConfirm(value) on submit.
 */
const InputDialog: React.FC<InputDialogProps> = ({
  title,
  defaultValue,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirm(value);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <Modal onClose={onCancel} className="w-80">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">{title}</h3>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-3 py-2 text-sm border rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => onConfirm(value)}
            className="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InputDialog;
