import { readTextFile, writeTextFile, remove, mkdir, exists } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

const LOCKS_DIR_NAME = "locks";
const HEARTBEAT_INTERVAL_MS = 10_000; // 10 seconds
const STALE_THRESHOLD_MS = 30_000;    // 30 seconds

/** Encode a project root path into a safe lock filename */
const encodeLockFileName = (projectRoot: string): string => {
  return encodeURIComponent(projectRoot) + ".lock";
};

/** Get the full path to the locks directory */
const getLocksDir = async (): Promise<string> => {
  const appData = await appDataDir();
  return join(appData, LOCKS_DIR_NAME);
};

/** Get the full path to a specific lock file */
const getLockFilePath = async (projectRoot: string): Promise<string> => {
  const locksDir = await getLocksDir();
  return join(locksDir, encodeLockFileName(projectRoot));
};

/** Ensure the locks directory exists */
const ensureLocksDir = async (): Promise<void> => {
  const locksDir = await getLocksDir();
  if (!(await exists(locksDir))) {
    await mkdir(locksDir, { recursive: true });
  }
};

/** Check if a project root is locked by another instance */
export const isProjectLocked = async (projectRoot: string): Promise<boolean> => {
  try {
    const lockPath = await getLockFilePath(projectRoot);
    if (!(await exists(lockPath))) return false;

    const content = await readTextFile(lockPath);
    const lockData: { timestamp: number } = JSON.parse(content);
    const age = Date.now() - lockData.timestamp;

    // If lock is older than stale threshold, it's from a crashed instance
    return age < STALE_THRESHOLD_MS;
  } catch {
    // If we can't read/parse the lock file, treat as unlocked
    return false;
  }
};

/** Create or update a lock file for a project root */
export const acquireLock = async (projectRoot: string): Promise<void> => {
  await ensureLocksDir();
  const lockPath = await getLockFilePath(projectRoot);
  const content = JSON.stringify({ timestamp: Date.now() });
  await writeTextFile(lockPath, content);
};

/** Remove the lock file for a project root */
export const releaseLock = async (projectRoot: string): Promise<void> => {
  try {
    const lockPath = await getLockFilePath(projectRoot);
    if (await exists(lockPath)) {
      await remove(lockPath);
    }
  } catch {
    // Best effort; don't throw on cleanup failure
  }
};

/** Start a heartbeat interval that updates the lock file timestamp */
export const startHeartbeat = (projectRoot: string): ReturnType<typeof setInterval> => {
  return setInterval(async () => {
    try {
      await acquireLock(projectRoot);
    } catch {
      // Heartbeat failure is non-fatal; lock will become stale naturally
    }
  }, HEARTBEAT_INTERVAL_MS);
};
