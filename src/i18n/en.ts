import type { Translations } from "./types";

const en: Translations = {
  // --- App general ---
  appTagline: "Select a file to start editing",
  selectFileToEdit: "Select a file to edit",

  // --- Sidebar ---
  refresh: "Refresh",
  createFileInRoot: "New file in root",
  createFolderInRoot: "New folder in root",
  openFolder: "Open folder",
  newWindow: "Open in new window",
  noFolderSelected: "No folder selected",
  open: "Open",

  // --- TabBar / Hamburger menu ---
  markdownReference: "Markdown Reference",
  toggleTheme: "Toggle theme",
  menu: "Menu",
  searchAndReplace: "Search & Replace",
  settings: "Settings",
  versionInfo: "About",
  exit: "Exit",

  // --- Context menu ---
  openInExplorer: "Open in Explorer",
  createNewFile: "New file",
  createNewFolder: "New folder",
  duplicate: "Duplicate",
  rename: "Rename",
  delete: "Delete",

  // --- Settings dialog ---
  theme: "Theme",
  dark: "Dark",
  light: "Light",
  language: "Language",
  editorSettings: "Editor Settings",
  lineBreaksLabel: "Render line breaks",
  lineWrappingLabel: "Line wrapping",
  scrollSyncLabel: "Scroll sync",
  editorFont: "Editor font",
  previewFont: "Preview font",
  fontSize: "Size",
  settingsManagement: "Settings Management",
  exportSettings: "Export",
  importSettings: "Import",
  close: "Close",
  settingsExported: "Settings exported successfully",
  settingsImported: "Settings imported successfully",
  exportFailed: "Failed to export settings",
  importFailed: "Failed to import settings",

  // --- About dialog ---
  aboutTitle: "About",

  // --- Search dialog ---
  searchTitle: "Search & Replace",
  searchPlaceholder: "Search...",
  replacePlaceholder: "Replace...",
  caseSensitive: "Case sensitive",
  regex: "Regex",
  prev: "Prev",
  next: "Next",
  replace: "Replace",
  replaceAll: "Replace all",

  // --- Input dialog ---
  cancel: "Cancel",
  ok: "OK",

  // --- Toast / confirm messages ---
  unsavedChangesConfirm: "You have unsaved changes. Discard and exit?",
  exitConfirmTitle: "Markly - Confirm Exit",
  discardAndExit: "Discard & Exit",
  directoryLockedMessage: "This directory is already open in another Markly instance.",
  newFileName: "New file name:",
  newFolderName: "New folder name:",
  newNamePrompt: "New name:",
  newMediaNamePrompt: "Enter a new file name (with extension):",
  fileExistsOverwrite: " already exists. Overwrite?",
  overwriteConfirmTitle: "File already exists",
  overwrite: "Overwrite",
  saveAsAlternate: "Save as different name",
  deleteConfirm: "Delete this item?\nThis action cannot be undone.",
  deletePhysicalTitle: "Confirm deletion",
  deleteFolderNotEmpty: " is not empty.\nDelete all contents permanently?\nThis action cannot be undone.",
  deleteBulkTitle: "Confirm bulk deletion",
  failedCreateFile: "Failed to create file",
  failedCreateFolder: "Failed to create folder",
  failedRename: "Failed to rename",
  failedDuplicate: "Failed to duplicate file",
  failedDelete: "Failed to delete",
  failedMediaCopy: "Failed to copy media file. Check file path and permissions",
  failedMediaPaste: "Failed to paste media",
  failedFileRestore: "Failed to restore file",
  failedConfigLoad: "Failed to load config file",
  failedConfigSave: "Failed to save config",
  saveFileFirstMedia: "Save the Markdown file first to copy media files",
  saveFileFirstPaste: "Save the Markdown file first to paste media",

  // --- Reference panel ---
  referenceFooter: "Click an item to insert its template at the cursor position.",
  colorPicker: "Color Picker",
  textColor: "Text color",
  bgColor: "Background",
  insertThisColor: "Insert this color",

  // --- Status bar ---
  statusBarLn: "Ln",
  statusBarCol: "Col",
  statusBarChars: "Chars",
  statusBarLines: "Lines",
  statusBarWords: "Words",
  statusBarSelected: "Sel",

  // --- Outline panel ---
  outline: "Outline",
  outlineEmpty: "No headings found",

  // --- Tab context menu ---
  tabClose: "Close",
  tabCloseOthers: "Close Others",
  tabCloseLeft: "Close to the Left",
  tabCloseRight: "Close to the Right",
  tabCloseAll: "Close All",
  tabCloseSelected: "Close Selected Tabs",

  // --- Table editing ---
  tableInsertRowAbove: "Insert row above",
  tableInsertRowBelow: "Insert row below",
  tableDeleteRow: "Delete row",
  tableInsertColumnLeft: "Insert column left",
  tableInsertColumnRight: "Insert column right",
  tableDeleteColumn: "Delete column",
  tableAlignLeft: "Align left",
  tableAlignCenter: "Align center",
  tableAlignRight: "Align right",
  tableFormat: "Format table",
  tableInsertNew: "Insert table",
  tableRows: "Rows",
  tableColumns: "Columns",

  // --- Export ---
  exportAsHTML: "Export as HTML",
  exportAsPDF: "Export as PDF",
  exportedSuccessfully: "Exported successfully",
  failedExport: "Failed to export",

  // --- Zen mode ---
  zenMode: "Zen Mode",
  zenModeExit: "Press Esc or F11 to exit Zen Mode",

  // --- Language selector (first launch) ---
  selectLanguageTitle: "Select Language / 言語を選択",
  selectLanguageDesc: "Choose the language for Markly.\nYou can change this later in Settings.",

  // --- Project search ---
  projectSearch: "Search in Project",
  projectSearchPlaceholder: "Search in files...",
  projectSearchNoResults: "No results found",
  projectSearchTruncated: "Results limited to 1000 matches",
  projectSearchInvalidRegex: "Invalid regular expression",
  projectSearchSearching: "Searching...",
};

export default en;
