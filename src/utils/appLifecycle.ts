import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import type { Tab } from "../types";

interface ConfirmExitOptions {
  message?: string;
  title?: string;
  okLabel?: string;
  cancelLabel?: string;
}

/**
 * Confirm unsaved changes, persist state if OK, then close the window.
 */
export const confirmAndExit = async (
  tabs: Tab[],
  persistFn: () => void | Promise<void>,
  options?: ConfirmExitOptions
): Promise<void> => {
  const hasModified = tabs.some(t => t.isModified);

  if (!hasModified) {
    await persistFn();
    await getCurrentWindow().destroy();
    return;
  }

  const dialogOptions: { title: string; kind: "warning"; okLabel?: string; cancelLabel?: string } = {
    title: options?.title ?? "終了確認",
    kind: "warning",
  };
  if (options?.okLabel) dialogOptions.okLabel = options.okLabel;
  if (options?.cancelLabel) dialogOptions.cancelLabel = options.cancelLabel;

  const ok = await ask(
    options?.message ?? "未保存の変更があります。終了しますか？",
    dialogOptions
  );

  if (ok) {
    await persistFn();
    await getCurrentWindow().destroy();
  }
};
