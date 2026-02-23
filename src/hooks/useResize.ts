import { useState, useEffect, useCallback, useRef } from "react";
import type { AppConfig } from "../types";
import { DEFAULT_CONFIG, RESIZE } from "../constants";

interface UseResizeOptions {
  saveConfig: (config: Partial<AppConfig>) => Promise<void>;
  lineBreaks: boolean;
  lineWrapping: boolean;
}

export const useResize = ({ saveConfig, lineBreaks, lineWrapping }: UseResizeOptions) => {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_CONFIG.sidebarWidth);
  const [editorWidthPercent, setEditorWidthPercent] = useState(DEFAULT_CONFIG.editorWidthPercent);
  const [openTabsHeight, setOpenTabsHeight] = useState(DEFAULT_CONFIG.openTabsHeight);
  const [isResizing, setIsResizing] = useState<"sidebar" | "editor" | "opentabs" | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);

  const handleMouseDown = useCallback((type: "sidebar" | "editor" | "opentabs") => {
    setIsResizing(type);
  }, []);

  // Apply loaded config values to layout dimensions
  const applyConfig = useCallback((config: Partial<AppConfig>) => {
    if (config.sidebarWidth) setSidebarWidth(config.sidebarWidth);
    if (config.editorWidthPercent) setEditorWidthPercent(config.editorWidthPercent);
    if (config.openTabsHeight) setOpenTabsHeight(config.openTabsHeight);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing === "sidebar") {
        const newWidth = Math.max(RESIZE.SIDEBAR_MIN_WIDTH, Math.min(RESIZE.SIDEBAR_MAX_WIDTH, e.clientX));
        setSidebarWidth(newWidth);
      } else if (isResizing === "editor") {
        const mainArea = document.getElementById("main-editor-area");
        if (mainArea) {
          const rect = mainArea.getBoundingClientRect();
          const percent = ((e.clientX - rect.left) / rect.width) * 100;
          setEditorWidthPercent(Math.max(RESIZE.EDITOR_MIN_PERCENT, Math.min(RESIZE.EDITOR_MAX_PERCENT, percent)));
        }
      } else if (isResizing === "opentabs") {
        if (sidebarRef.current) {
          const rect = sidebarRef.current.getBoundingClientRect();
          const newHeight = rect.bottom - e.clientY;
          setOpenTabsHeight(Math.max(RESIZE.OPEN_TABS_MIN_HEIGHT, Math.min(RESIZE.OPEN_TABS_MAX_HEIGHT, newHeight)));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      saveConfig({
        sidebarWidth,
        editorWidthPercent,
        openTabsHeight,
        lineBreaks,
        lineWrapping
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth, editorWidthPercent, openTabsHeight, saveConfig, lineBreaks, lineWrapping]);

  return {
    sidebarWidth,
    editorWidthPercent,
    openTabsHeight,
    isResizing,
    sidebarRef,
    handleMouseDown,
    applyConfig,
  };
};
