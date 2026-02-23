import type { AppConfig, SessionData } from "../types";

/** Old flat config structure (for type checking during migration) */
interface LegacyAppConfig {
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
  projectRoot: string | null;
  openedPaths: string[];
  activePath: string | null;
  expandedFolders: string[];
  cursorPositions: Record<string, number>;
}

/** Detect if a parsed config object is in the old flat format */
export const isLegacyConfig = (config: unknown): config is LegacyAppConfig => {
  return (
    config != null &&
    typeof config === "object" &&
    "openedPaths" in config &&
    Array.isArray((config as LegacyAppConfig).openedPaths) &&
    !("sessions" in config)
  );
};

/** Migrate a legacy flat config to the new multi-session format */
export const migrateLegacyConfig = (legacy: LegacyAppConfig): AppConfig => {
  const sessions: Record<string, SessionData> = {};

  if (legacy.projectRoot && legacy.openedPaths.length > 0) {
    sessions[legacy.projectRoot] = {
      openedPaths: legacy.openedPaths,
      activePath: legacy.activePath,
      expandedFolders: legacy.expandedFolders ?? [],
      cursorPositions: legacy.cursorPositions ?? {},
    };
  }

  return {
    theme: legacy.theme,
    sidebarWidth: legacy.sidebarWidth,
    editorWidthPercent: legacy.editorWidthPercent,
    openTabsHeight: legacy.openTabsHeight,
    lineBreaks: legacy.lineBreaks,
    lineWrapping: legacy.lineWrapping,
    editorFontFamily: legacy.editorFontFamily,
    editorFontSize: legacy.editorFontSize,
    previewFontFamily: legacy.previewFontFamily,
    previewFontSize: legacy.previewFontSize,
    lastProjectRoot: legacy.projectRoot,
    sessions,
  };
};
