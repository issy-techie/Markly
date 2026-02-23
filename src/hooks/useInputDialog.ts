import { useState, useRef, useCallback } from "react";

export interface InputDialogConfig {
  title: string;
  defaultValue: string;
}

/**
 * Hook that provides a promise-based input dialog as a replacement for window.prompt.
 * Returns `promptUser()` which shows a native-looking input dialog and resolves
 * with the user-entered string, or null if cancelled.
 */
export const useInputDialog = () => {
  const [config, setConfig] = useState<InputDialogConfig | null>(null);
  const resolverRef = useRef<((value: string | null) => void) | null>(null);

  const promptUser = useCallback((title: string, defaultValue: string = ""): Promise<string | null> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setConfig({ title, defaultValue });
    });
  }, []);

  const handleConfirm = useCallback((value: string) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setConfig(null);
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(null);
    resolverRef.current = null;
    setConfig(null);
  }, []);

  return {
    inputDialogConfig: config,
    promptUser,
    handleInputConfirm: handleConfirm,
    handleInputCancel: handleCancel,
  };
};
