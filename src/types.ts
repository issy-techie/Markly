// --- Type definitions ---
export interface AppConfig {
  // User preferences
  theme: "light" | "dark";
  sidebarWidth: number;
  editorWidthPercent: number;
  openTabsHeight: number;
  lineBreaks: boolean;
  lineWrapping: boolean;
  editorFontFamily: string;
  editorFontSize: number;
  previewFontFamily: string;
  previewFontSize: number;
  // Session state (managed in config.json)
  projectRoot: string | null;
  openedPaths: string[];
  activePath: string | null;
  expandedFolders: string[];
  cursorPositions: Record<string, number>;
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
