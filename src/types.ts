// --- Type definitions ---

/** Per-project session data stored under sessions[projectRoot] */
export interface SessionData {
  openedPaths: string[];
  activePath: string | null;
  expandedFolders: string[];
  cursorPositions: Record<string, number>;
}

export type Language = "ja" | "en";

export interface AppConfig {
  // User preferences (global, shared across all projects)
  theme: "light" | "dark";
  language: Language | null;  // null = first launch (show language selector)
  sidebarWidth: number;
  editorWidthPercent: number;
  openTabsHeight: number;
  lineBreaks: boolean;
  lineWrapping: boolean;
  scrollSync: boolean;
  editorFontFamily: string;
  editorFontSize: number;
  previewFontFamily: string;
  previewFontSize: number;
  // Multi-project session management
  lastProjectRoot: string | null;
  sessions: Record<string, SessionData>;
}

export interface Tab { 
  id: string; 
  path: string | null; 
  name: string; 
  content: string; 
  originalContent: string;
  isModified: boolean; 
}

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  /**
   * For directories: undefined = children not yet loaded (lazy),
   * [] = loaded but directory is empty. For files: always undefined.
   */
  children?: FileEntry[];
}

export interface ContextMenuConfig {
  x: number;
  y: number;
  path: string;
  isDirectory: boolean;
  isBackground?: boolean;
}

export interface TabContextMenuConfig {
  x: number;
  y: number;
  tabId: string;
}
