/** All translatable string keys used across the app */
export interface Translations {
  // App general
  appTagline: string;
  selectFileToEdit: string;

  // Sidebar
  refresh: string;
  createFileInRoot: string;
  createFolderInRoot: string;
  openFolder: string;
  newWindow: string;
  noFolderSelected: string;
  open: string;

  // TabBar / Hamburger menu
  markdownReference: string;
  toggleTheme: string;
  menu: string;
  searchAndReplace: string;
  settings: string;
  versionInfo: string;
  exit: string;

  // Context menu
  openInExplorer: string;
  createNewFile: string;
  createNewFolder: string;
  duplicate: string;
  rename: string;
  delete: string;

  // Settings dialog
  theme: string;
  dark: string;
  light: string;
  language: string;
  editorSettings: string;
  lineBreaksLabel: string;
  lineWrappingLabel: string;
  scrollSyncLabel: string;
  editorFont: string;
  previewFont: string;
  fontSize: string;
  settingsManagement: string;
  exportSettings: string;
  importSettings: string;
  close: string;
  settingsExported: string;
  settingsImported: string;
  exportFailed: string;
  importFailed: string;

  // About dialog
  aboutTitle: string;

  // Search dialog
  searchTitle: string;
  searchPlaceholder: string;
  replacePlaceholder: string;
  caseSensitive: string;
  regex: string;
  prev: string;
  next: string;
  replace: string;
  replaceAll: string;

  // Input dialog
  cancel: string;
  ok: string;

  // Toast / confirm messages
  unsavedChangesConfirm: string;
  exitConfirmTitle: string;
  discardAndExit: string;
  directoryLockedMessage: string;
  newFileName: string;
  newFolderName: string;
  newNamePrompt: string;
  newMediaNamePrompt: string;
  fileExistsOverwrite: string;
  overwriteConfirmTitle: string;
  overwrite: string;
  saveAsAlternate: string;
  deleteConfirm: string;
  deletePhysicalTitle: string;
  deleteFolderNotEmpty: string;
  deleteBulkTitle: string;
  failedCreateFile: string;
  failedCreateFolder: string;
  failedRename: string;
  failedDuplicate: string;
  failedDelete: string;
  failedMediaCopy: string;
  failedMediaPaste: string;
  failedFileRestore: string;
  failedConfigLoad: string;
  failedConfigSave: string;
  saveFileFirstMedia: string;
  saveFileFirstPaste: string;

  // Reference panel
  referenceFooter: string;
  colorPicker: string;
  textColor: string;
  bgColor: string;
  insertThisColor: string;

  // Language selector
  selectLanguageTitle: string;
  selectLanguageDesc: string;
}
