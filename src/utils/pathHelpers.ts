// Platform detection for path separator
const IS_WINDOWS = typeof navigator !== 'undefined' && /Win/.test(navigator.platform);

/** Platform-specific path separator */
export const SEPARATOR = IS_WINDOWS ? '\\' : '/';

/**
 * Extract the file name from a full path.
 * e.g. "C:\folder\file.md" → "file.md"
 */
export const getFileName = (filePath: string): string =>
  filePath.split(/[\\/]/).pop() || "";

/**
 * Extract the parent directory from a full path.
 * e.g. "C:\folder\file.md" → "C:\folder"
 */
export const getDirName = (filePath: string): string => {
  const normalized = filePath.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash === -1) return '.';
  if (lastSlash === 0) return '/';
  // Handle Windows drive root like "C:/"
  if (lastSlash === 2 && normalized[1] === ':') return filePath.substring(0, 3);
  return filePath.substring(0, lastSlash);
};

/**
 * Extract the file extension from a path (including the dot).
 * e.g. "photo.png" → ".png"
 */
export const getExtension = (filePath: string): string => {
  const fileName = getFileName(filePath);
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot);
};

/**
 * Join a base path and a file/directory name.
 * Handles trailing separators and uses the platform separator.
 */
export const joinPath = (base: string, name: string): string =>
  base.endsWith('/') || base.endsWith('\\') ? `${base}${name}` : `${base}${SEPARATOR}${name}`;

/**
 * Normalize path separators for the current platform.
 * On Windows, converts forward slashes to backslashes and vice versa.
 */
export const normalizePath = (filePath: string): string =>
  IS_WINDOWS ? filePath.replace(/\//g, '\\') : filePath.replace(/\\/g, '/');
