import React from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import type { ToastMessage } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLE_MAP = {
  success: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200",
  error: "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200",
  warning: "bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200",
  info: "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200",
};

const ICON_COLOR_MAP = {
  success: "text-emerald-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => {
        const Icon = ICON_MAP[toast.type];
        return (
          <div
            key={toast.id}
            className={`toast-slide-in flex items-start gap-2 px-4 py-3 rounded-lg border shadow-lg ${STYLE_MAP[toast.type]}`}
          >
            <Icon size={16} className={`flex-shrink-0 mt-0.5 ${ICON_COLOR_MAP[toast.type]}`} />
            <span className="text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
