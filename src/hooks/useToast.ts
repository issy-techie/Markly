import { useState, useCallback, useRef } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((
    message: string,
    type: ToastMessage["type"] = "info",
    duration = 4000
  ) => {
    const id = crypto.randomUUID();
    const toast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [removeToast]);

  return { toasts, addToast, removeToast };
};
