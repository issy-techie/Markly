// --- Type definitions ---

/** User-defined snippet for quick insertion in the editor */
export interface Snippet {
  /** Unique identifier */
  id: string;
  /** Trigger prefix typed in editor (without leading /), e.g. "date", "sig" */
  prefix: string;
  /** Display label shown in completion popup */
  label: string;
  /** Content to insert. Supports $1 placeholder for cursor positioning, {{DATE}} for current date */
  content: string;
}

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
  // User-defined snippets (global)
  userSnippets: Snippet[];
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

// --- Project-wide search ---

export interface ProjectSearchMatch {
  file_path: string;
  file_name: string;
  line_number: number;   // 1-based
  line_content: string;
  match_start: number;   // character offset
  match_end: number;
}

export interface ProjectSearchFileGroup {
  filePath: string;
  fileName: string;
  matches: ProjectSearchMatch[];
}
