import type { Translations } from "./types";

const ja: Translations = {
  // --- App general ---
  appTagline: "ファイルを選択して編集を始めましょう",
  selectFileToEdit: "Select a file to edit",

  // --- Sidebar ---
  refresh: "更新",
  createFileInRoot: "ルートにファイル作成",
  createFolderInRoot: "ルートにディレクトリ作成",
  openFolder: "フォルダを開く",
  newWindow: "新しいウィンドウで開く",
  noFolderSelected: "フォルダ未選択",
  open: "開く",

  // --- TabBar / Hamburger menu ---
  markdownReference: "Markdownリファレンス",
  toggleTheme: "テーマ切替",
  menu: "メニュー",
  searchAndReplace: "検索・置換",
  settings: "設定",
  versionInfo: "バージョン情報",
  exit: "終了",

  // --- Context menu ---
  openInExplorer: "エクスプローラーで開く",
  createNewFile: "新規ファイル作成",
  createNewFolder: "新規ディレクトリ作成",
  duplicate: "複製をつくる",
  rename: "名前を変更",
  delete: "削除",

  // --- Settings dialog ---
  theme: "テーマ",
  dark: "ダーク",
  light: "ライト",
  language: "言語",
  editorSettings: "エディタ設定",
  lineBreaksLabel: "改行をそのまま反映",
  lineWrappingLabel: "行の折り返し",
  scrollSyncLabel: "スクロール同期",
  editorFont: "エディタフォント",
  previewFont: "プレビューフォント",
  fontSize: "サイズ",
  settingsManagement: "設定管理",
  exportSettings: "エクスポート",
  importSettings: "インポート",
  close: "閉じる",
  settingsExported: "設定をエクスポートしました",
  settingsImported: "設定をインポートしました",
  exportFailed: "エクスポートに失敗しました",
  importFailed: "インポートに失敗しました",

  // --- About dialog ---
  aboutTitle: "バージョン情報",

  // --- Search dialog ---
  searchTitle: "検索・置換",
  searchPlaceholder: "検索...",
  replacePlaceholder: "置換...",
  caseSensitive: "大文字/小文字",
  regex: "正規表現",
  prev: "前",
  next: "次",
  replace: "置換",
  replaceAll: "すべて置換",

  // --- Input dialog ---
  cancel: "キャンセル",
  ok: "OK",

  // --- Toast / confirm messages ---
  unsavedChangesConfirm: "未保存の変更があります。変更を破棄して終了しますか？",
  exitConfirmTitle: "Markly - 終了の確認",
  discardAndExit: "破棄して終了",
  directoryLockedMessage: "このディレクトリは別のMarklyインスタンスで開かれています。",
  newFileName: "新規ファイル名:",
  newFolderName: "新規ディレクトリ名:",
  newNamePrompt: "新しい名前:",
  newMediaNamePrompt: "新しいファイル名を入力してください（拡張子含む）:",
  fileExistsOverwrite: "は既に存在します。上書きしますか？",
  overwriteConfirmTitle: "同名ファイルの確認",
  overwrite: "上書き",
  saveAsAlternate: "別名で保存",
  deleteConfirm: "を削除しますか？\nこの操作は取り消せません。",
  deletePhysicalTitle: "物理削除の確認",
  deleteFolderNotEmpty: "は空ではありません。\n中のファイルを含めて完全に削除しますか？\nこの操作は取り消せません。",
  deleteBulkTitle: "一括削除の確認",
  failedCreateFile: "ファイルの作成に失敗しました",
  failedCreateFolder: "ディレクトリの作成に失敗しました",
  failedRename: "名前の変更に失敗しました",
  failedDuplicate: "ファイルの複製に失敗しました",
  failedDelete: "削除に失敗しました",
  failedMediaCopy: "メディアファイルのコピーに失敗しました。ファイルパスや権限を確認してください",
  failedMediaPaste: "メディアの貼り付けに失敗しました",
  failedFileRestore: "ファイルの復元に失敗",
  failedConfigLoad: "設定ファイルの読み込みに失敗しました",
  failedConfigSave: "設定の保存に失敗しました",
  saveFileFirstMedia: "メディアファイルをコピーするには、まずMarkdownファイルを保存してください",
  saveFileFirstPaste: "メディアをペーストするには、まずMarkdownファイルを保存してください",

  // --- Reference panel ---
  referenceFooter: "項目をクリックするとカーソル位置にテンプレートが挿入されます。",
  colorPicker: "カラーピッカー",
  textColor: "文字色",
  bgColor: "背景色",
  insertThisColor: "この色で挿入",

  // --- Status bar ---
  statusBarLn: "行",
  statusBarCol: "列",
  statusBarChars: "文字",
  statusBarLines: "行数",
  statusBarWords: "単語",
  statusBarSelected: "選択",

  // --- Outline panel ---
  outline: "アウトライン",
  outlineEmpty: "見出しがありません",

  // --- Tab context menu ---
  tabClose: "閉じる",
  tabCloseOthers: "他を閉じる",
  tabCloseLeft: "左側をすべて閉じる",
  tabCloseRight: "右側をすべて閉じる",
  tabCloseAll: "すべて閉じる",

  // --- Language selector (first launch) ---
  selectLanguageTitle: "言語を選択 / Select Language",
  selectLanguageDesc: "Marklyで使用する言語を選択してください。\nこの設定は後から変更できます。",
};

export default ja;
