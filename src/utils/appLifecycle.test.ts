import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Tab } from "../types";

// --- Mock Tauri APIs before importing the module under test ---
const mockDestroy = vi.fn().mockResolvedValue(undefined);
const mockAsk = vi.fn();

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({ destroy: mockDestroy }),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  ask: (...args: any[]) => mockAsk(...args),
}));

// Import AFTER mocks are set up
import { confirmAndExit } from "./appLifecycle";

const createTab = (id: string, isModified: boolean): Tab => ({
  id,
  path: `/docs/${id}.md`,
  name: `${id}.md`,
  content: "new content",
  originalContent: isModified ? "old content" : "new content",
  isModified,
});

describe("confirmAndExit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls persistFn and destroys window when no tabs are modified", async () => {
    const tabs: Tab[] = [createTab("a", false), createTab("b", false)];
    const persistFn = vi.fn().mockResolvedValue(undefined);

    await confirmAndExit(tabs, persistFn);

    expect(persistFn).toHaveBeenCalledOnce();
    expect(mockDestroy).toHaveBeenCalledOnce();
    expect(mockAsk).not.toHaveBeenCalled();
  });

  it("shows confirmation dialog when tabs are modified", async () => {
    const tabs: Tab[] = [createTab("a", true), createTab("b", false)];
    const persistFn = vi.fn().mockResolvedValue(undefined);
    mockAsk.mockResolvedValue(true);

    await confirmAndExit(tabs, persistFn);

    expect(mockAsk).toHaveBeenCalledOnce();
    expect(persistFn).toHaveBeenCalledOnce();
    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  it("does not exit when user cancels the dialog", async () => {
    const tabs: Tab[] = [createTab("a", true)];
    const persistFn = vi.fn();
    mockAsk.mockResolvedValue(false);

    await confirmAndExit(tabs, persistFn);

    expect(mockAsk).toHaveBeenCalledOnce();
    expect(persistFn).not.toHaveBeenCalled();
    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it("uses default dialog message and title", async () => {
    const tabs: Tab[] = [createTab("a", true)];
    const persistFn = vi.fn();
    mockAsk.mockResolvedValue(false);

    await confirmAndExit(tabs, persistFn);

    expect(mockAsk).toHaveBeenCalledWith(
      "未保存の変更があります。終了しますか？",
      expect.objectContaining({ title: "終了確認", kind: "warning" })
    );
  });

  it("accepts custom dialog options", async () => {
    const tabs: Tab[] = [createTab("a", true)];
    const persistFn = vi.fn();
    mockAsk.mockResolvedValue(false);

    await confirmAndExit(tabs, persistFn, {
      message: "Save before exit?",
      title: "Confirm",
      okLabel: "Yes",
      cancelLabel: "No",
    });

    expect(mockAsk).toHaveBeenCalledWith(
      "Save before exit?",
      expect.objectContaining({
        title: "Confirm",
        kind: "warning",
        okLabel: "Yes",
        cancelLabel: "No",
      })
    );
  });

  it("handles async persistFn correctly", async () => {
    const tabs: Tab[] = [createTab("a", false)];
    let resolved = false;
    const persistFn = vi.fn().mockImplementation(async () => {
      await new Promise(r => setTimeout(r, 10));
      resolved = true;
    });

    await confirmAndExit(tabs, persistFn);

    expect(resolved).toBe(true);
    expect(mockDestroy).toHaveBeenCalledOnce();
  });
});
