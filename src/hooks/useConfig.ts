import { useState, useCallback, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { readTextFile, writeTextFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import type { AppConfig } from "../types";
import { DEFAULT_CONFIG } from "../constants";
import { isLegacyConfig, migrateLegacyConfig } from "../utils/configMigration";

const SAVE_DEBOUNCE_MS = 500;

interface UseConfigOptions {
  onError?: (message: string) => void;
}

export const useConfig = (options?: UseConfigOptions) => {
  const onError = options?.onError;
  const [isDark, setIsDark] = useState(DEFAULT_CONFIG.theme === "dark");
  const [lineBreaks, setLineBreaks] = useState(DEFAULT_CONFIG.lineBreaks);
  const [lineWrapping, setLineWrapping] = useState(DEFAULT_CONFIG.lineWrapping);
  const [editorFontFamily, setEditorFontFamily] = useState(DEFAULT_CONFIG.editorFontFamily);
  const [editorFontSize, setEditorFontSize] = useState(DEFAULT_CONFIG.editorFontSize);
  const [previewFontFamily, setPreviewFontFamily] = useState(DEFAULT_CONFIG.previewFontFamily);
  const [previewFontSize, setPreviewFontSize] = useState(DEFAULT_CONFIG.previewFontSize);

  // Debounce state for saveConfig
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingConfigRef = useRef<Partial<AppConfig>>({});

  const loadConfig = useCallback(async (): Promise<AppConfig | null> => {
    try {
      const appData = await appDataDir();
      const configPath = await join(appData, "config.json");
      if (await exists(configPath)) {
        const content = await readTextFile(configPath);
        let loadedConfig = JSON.parse(content);

        // Migrate legacy flat format to new multi-session format
        if (isLegacyConfig(loadedConfig)) {
          loadedConfig = migrateLegacyConfig(loadedConfig);
          await writeTextFile(configPath, JSON.stringify(loadedConfig, null, 2));
        }

        setIsDark(loadedConfig.theme === "dark");
        setLineBreaks(loadedConfig.lineBreaks ?? DEFAULT_CONFIG.lineBreaks);
        setLineWrapping(loadedConfig.lineWrapping ?? DEFAULT_CONFIG.lineWrapping);
        if (loadedConfig.editorFontFamily) setEditorFontFamily(loadedConfig.editorFontFamily);
        if (loadedConfig.editorFontSize) setEditorFontSize(loadedConfig.editorFontSize);
        if (loadedConfig.previewFontFamily) setPreviewFontFamily(loadedConfig.previewFontFamily);
        if (loadedConfig.previewFontSize) setPreviewFontSize(loadedConfig.previewFontSize);

        return loadedConfig;
      } else {
        await mkdir(appData, { recursive: true });
        await writeTextFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
        return null;
      }
    } catch (e) {
      console.error("Failed to load config:", e);
      onError?.("設定ファイルの読み込みに失敗しました");
      return null;
    }
  }, [onError]);

  /** Flush pending config changes to disk immediately (cancels debounce timer) */
  const flushSaveConfig = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const pending = pendingConfigRef.current;
    pendingConfigRef.current = {};

    if (Object.keys(pending).length === 0) return;

    try {
      const appData = await appDataDir();
      const configPath = await join(appData, "config.json");

      let currentConfig: AppConfig = { ...DEFAULT_CONFIG };
      if (await exists(configPath)) {
        const content = await readTextFile(configPath);
        currentConfig = JSON.parse(content);
      }

      // Deep merge for sessions field to avoid overwriting other projects' data
      const updatedConfig = { ...currentConfig, ...pending };
      if (pending.sessions) {
        updatedConfig.sessions = {
          ...(currentConfig.sessions ?? {}),
          ...pending.sessions,
        };
      }
      await writeTextFile(configPath, JSON.stringify(updatedConfig, null, 2));
    } catch (e) {
      console.error("Failed to save config:", e);
      onError?.("設定の保存に失敗しました");
    }
  }, [onError]);

  /** Debounced saveConfig that merges multiple rapid calls into a single disk write */
  const saveConfig = useCallback(async (newConfig: Partial<AppConfig>) => {
    pendingConfigRef.current = { ...pendingConfigRef.current, ...newConfig };

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      flushSaveConfig();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSaveConfig]);

  // Flush pending config on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        flushSaveConfig();
      }
    };
  }, [flushSaveConfig]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      saveConfig({ theme: next ? "dark" : "light" });
      return next;
    });
  }, [saveConfig]);

  // Apply theme to DOM and window
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    getCurrentWindow().setTheme(isDark ? "dark" : "light");
  }, [isDark]);

  return {
    isDark,
    lineBreaks, setLineBreaks,
    lineWrapping, setLineWrapping,
    editorFontFamily, setEditorFontFamily,
    editorFontSize, setEditorFontSize,
    previewFontFamily, setPreviewFontFamily,
    previewFontSize, setPreviewFontSize,
    loadConfig,
    saveConfig,
    flushSaveConfig,
    toggleTheme,
  };
};
