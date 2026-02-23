import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- Mock Tauri APIs ---
const mockExists = vi.fn();
const mockReadTextFile = vi.fn();
const mockWriteTextFile = vi.fn();
const mockRemove = vi.fn();
const mockMkdir = vi.fn();

vi.mock("@tauri-apps/plugin-fs", () => ({
  exists: (...args: any[]) => mockExists(...args),
  readTextFile: (...args: any[]) => mockReadTextFile(...args),
  writeTextFile: (...args: any[]) => mockWriteTextFile(...args),
  remove: (...args: any[]) => mockRemove(...args),
  mkdir: (...args: any[]) => mockMkdir(...args),
}));

vi.mock("@tauri-apps/api/path", () => ({
  appDataDir: () => Promise.resolve("/mock/appdata"),
  join: (...parts: string[]) => Promise.resolve(parts.join("/")),
}));

// Import AFTER mocks are set up
import { isProjectLocked, acquireLock, releaseLock, startHeartbeat } from "./lockFile";

describe("isProjectLocked", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when lock file does not exist", async () => {
    mockExists.mockResolvedValue(false);

    const result = await isProjectLocked("D:\\project");
    expect(result).toBe(false);
  });

  it("returns true when lock file has fresh timestamp", async () => {
    mockExists.mockResolvedValue(true);
    mockReadTextFile.mockResolvedValue(
      JSON.stringify({ timestamp: Date.now() - 5000 }) // 5 seconds ago
    );

    const result = await isProjectLocked("D:\\project");
    expect(result).toBe(true);
  });

  it("returns false when lock file has stale timestamp (>30s)", async () => {
    mockExists.mockResolvedValue(true);
    mockReadTextFile.mockResolvedValue(
      JSON.stringify({ timestamp: Date.now() - 60000 }) // 60 seconds ago
    );

    const result = await isProjectLocked("D:\\project");
    expect(result).toBe(false);
  });

  it("returns false when lock file content is corrupted", async () => {
    mockExists.mockResolvedValue(true);
    mockReadTextFile.mockResolvedValue("not-json");

    const result = await isProjectLocked("D:\\project");
    expect(result).toBe(false);
  });

  it("returns false when reading lock file throws", async () => {
    mockExists.mockRejectedValue(new Error("read error"));

    const result = await isProjectLocked("D:\\project");
    expect(result).toBe(false);
  });
});

describe("acquireLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates locks directory and writes lock file", async () => {
    mockExists.mockResolvedValue(false);
    mockMkdir.mockResolvedValue(undefined);
    mockWriteTextFile.mockResolvedValue(undefined);

    await acquireLock("D:\\project");

    expect(mockMkdir).toHaveBeenCalled();
    expect(mockWriteTextFile).toHaveBeenCalledWith(
      expect.stringContaining(".lock"),
      expect.stringContaining("timestamp")
    );
  });

  it("writes a valid JSON timestamp", async () => {
    mockExists.mockResolvedValue(true);
    mockWriteTextFile.mockResolvedValue(undefined);

    const before = Date.now();
    await acquireLock("D:\\project");
    const after = Date.now();

    const writtenContent = mockWriteTextFile.mock.calls[0][1];
    const parsed = JSON.parse(writtenContent);
    expect(parsed.timestamp).toBeGreaterThanOrEqual(before);
    expect(parsed.timestamp).toBeLessThanOrEqual(after);
  });
});

describe("releaseLock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes the lock file when it exists", async () => {
    mockExists.mockResolvedValue(true);
    mockRemove.mockResolvedValue(undefined);

    await releaseLock("D:\\project");

    expect(mockRemove).toHaveBeenCalledWith(
      expect.stringContaining(".lock")
    );
  });

  it("does not throw when lock file does not exist", async () => {
    mockExists.mockResolvedValue(false);

    await expect(releaseLock("D:\\project")).resolves.toBeUndefined();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("does not throw when remove fails", async () => {
    mockExists.mockResolvedValue(true);
    mockRemove.mockRejectedValue(new Error("remove error"));

    await expect(releaseLock("D:\\project")).resolves.toBeUndefined();
  });
});

describe("startHeartbeat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockExists.mockResolvedValue(true);
    mockWriteTextFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an interval ID", () => {
    const id = startHeartbeat("D:\\project");
    expect(id).toBeDefined();
    clearInterval(id);
  });

  it("updates lock file periodically", async () => {
    const id = startHeartbeat("D:\\project");

    // Advance 10 seconds (heartbeat interval)
    await vi.advanceTimersByTimeAsync(10_000);
    expect(mockWriteTextFile).toHaveBeenCalled();

    clearInterval(id);
  });
});
