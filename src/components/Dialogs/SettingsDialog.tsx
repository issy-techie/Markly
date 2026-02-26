import React from "react";
import { X, Settings, Sun, Moon, LogOut } from "lucide-react";
import { open, save, ask } from "@tauri-apps/plugin-dialog";
import { copyFile } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import type { AppConfig } from "../../types";
import { FONT_OPTIONS, PREVIEW_FONT_OPTIONS } from "../../constants";
import Modal from "../ui/Modal";
import ToggleSwitch from "../ui/ToggleSwitch";

interface SettingsDialogProps {
  isDark: boolean;
  toggleTheme: () => void;
  lineBreaks: boolean;
  setLineBreaks: (v: boolean) => void;
  lineWrapping: boolean;
  setLineWrapping: (v: boolean) => void;
  scrollSync: boolean;
  setScrollSync: (v: boolean) => void;
  editorFontFamily: string;
  setEditorFontFamily: (v: string) => void;
  editorFontSize: number;
  setEditorFontSize: (v: number) => void;
  previewFontFamily: string;
  setPreviewFontFamily: (v: string) => void;
  previewFontSize: number;
  setPreviewFontSize: (v: number) => void;
  saveConfig: (config: Partial<AppConfig>) => Promise<void>;
  loadConfig: () => Promise<AppConfig | null>;
  applyConfig: (config: Partial<AppConfig>) => void;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isDark,
  toggleTheme,
  lineBreaks,
  setLineBreaks,
  lineWrapping,
  setLineWrapping,
  scrollSync,
  setScrollSync,
  editorFontFamily,
  setEditorFontFamily,
  editorFontSize,
  setEditorFontSize,
  previewFontFamily,
  setPreviewFontFamily,
  previewFontSize,
  setPreviewFontSize,
  saveConfig,
  loadConfig,
  applyConfig,
  onClose,
}) => {
  const handleExport = async () => {
    try {
      const path = await save({ filters: [{ name: "JSON", extensions: ["json"] }], defaultPath: "markly-config.json" });
      if (path) {
        const appData = await appDataDir();
        const configPath = await join(appData, "config.json");
        await copyFile(configPath, path);
        await ask("設定をエクスポートしました", { title: "Markly", kind: "info" });
      }
    } catch (e) {
      console.error(e);
      await ask(`エクスポートに失敗しました: ${e}`, { title: "Error", kind: "error" });
    }
  };

  const handleImport = async () => {
    try {
      const path = await open({ filters: [{ name: "JSON", extensions: ["json"] }] });
      if (path && typeof path === "string") {
        const appData = await appDataDir();
        const configPath = await join(appData, "config.json");
        await copyFile(path, configPath);
        const loaded = await loadConfig();
        if (loaded) applyConfig(loaded);
        await ask("設定をインポートしました", { title: "Markly", kind: "info" });
      }
    } catch (e) {
      console.error(e);
      await ask(`インポートに失敗しました: ${e}`, { title: "Error", kind: "error" });
    }
  };

  return (
    <Modal onClose={onClose} className="w-96">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="font-bold text-sm flex items-center gap-2"><Settings size={16} /> 設定</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={16} /></button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme setting */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">テーマ</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs"
            >
              {isDark ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} className="text-slate-600" />}
              {isDark ? "ダーク" : "ライト"}
            </button>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700"></div>

          {/* Editor settings */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">エディタ設定</h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700 dark:text-slate-300">改行をそのまま反映</span>
              <ToggleSwitch
                checked={lineBreaks}
                onChange={(newVal) => {
                  setLineBreaks(newVal);
                  saveConfig({ lineBreaks: newVal });
                }}
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer mt-3">
              <span className="text-sm text-slate-700 dark:text-slate-300">行の折り返し</span>
              <ToggleSwitch
                checked={lineWrapping}
                onChange={(newVal) => {
                  setLineWrapping(newVal);
                  saveConfig({ lineWrapping: newVal });
                }}
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer mt-3">
              <span className="text-sm text-slate-700 dark:text-slate-300">スクロール同期</span>
              <ToggleSwitch
                checked={scrollSync}
                onChange={(newVal) => {
                  setScrollSync(newVal);
                  saveConfig({ scrollSync: newVal });
                }}
              />
            </label>

            <div className="mt-3">
              <span className="text-sm text-slate-700 dark:text-slate-300 block mb-1">エディタフォント</span>
              <select
                value={editorFontFamily}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setEditorFontFamily(newVal);
                  saveConfig({ editorFontFamily: newVal });
                }}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
              >
                {FONT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">サイズ</span>
                <input
                  type="range"
                  min={10}
                  max={24}
                  value={editorFontSize}
                  onChange={(e) => {
                    const newVal = parseInt(e.target.value, 10);
                    setEditorFontSize(newVal);
                    saveConfig({ editorFontSize: newVal });
                  }}
                  className="flex-1 h-1.5 accent-blue-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">{editorFontSize}px</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-sm text-slate-700 dark:text-slate-300 block mb-1">プレビューフォント</span>
              <select
                value={previewFontFamily}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setPreviewFontFamily(newVal);
                  saveConfig({ previewFontFamily: newVal });
                }}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
              >
                {PREVIEW_FONT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">サイズ</span>
                <input
                  type="range"
                  min={10}
                  max={24}
                  value={previewFontSize}
                  onChange={(e) => {
                    const newVal = parseInt(e.target.value, 10);
                    setPreviewFontSize(newVal);
                    saveConfig({ previewFontSize: newVal });
                  }}
                  className="flex-1 h-1.5 accent-blue-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">{previewFontSize}px</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700"></div>

          {/* Settings management */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">設定管理</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-700 dark:text-slate-200"
              >
                <LogOut size={14} className="rotate-180" /> エクスポート
              </button>
              <button
                onClick={handleImport}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              >
                <LogOut size={14} className="rotate-90" /> インポート
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            閉じる
          </button>
        </div>
    </Modal>
  );
};

export default SettingsDialog;
