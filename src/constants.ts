import type { AppConfig, SessionData } from "./types";

// --- Resize constraints ---
export const RESIZE = {
  SIDEBAR_MIN_WIDTH: 180,
  SIDEBAR_MAX_WIDTH: 500,
  EDITOR_MIN_PERCENT: 20,
  EDITOR_MAX_PERCENT: 80,
  OPEN_TABS_MIN_HEIGHT: 80,
  OPEN_TABS_MAX_HEIGHT: 300,
} as const;

// --- Default configuration ---
export const DEFAULT_CONFIG: AppConfig = {
  theme: "light",
  sidebarWidth: 250,
  editorWidthPercent: 50,
  openTabsHeight: 192,
  lineBreaks: false,
  lineWrapping: true,
  scrollSync: false,
  editorFontFamily: "monospace",
  editorFontSize: 14,
  previewFontFamily: "sans-serif",
  previewFontSize: 16,
  lastProjectRoot: null,
  sessions: {},
};

// --- Default empty session ---
export const EMPTY_SESSION: SessionData = {
  openedPaths: [],
  activePath: null,
  expandedFolders: [],
  cursorPositions: {},
};

// --- Font options ---
export const FONT_OPTIONS = [
  { label: "Default (Monospace)", value: "monospace" },
  { label: "Consolas", value: "'Consolas', 'Courier New', monospace" },
  { label: "UD Digi Kyokasho (UDデジタル教科書体)", value: "'UD Digi Kyokasho N-R', 'UD Digi Kyokasho', sans-serif" },
  { label: "Yu Gothic (游ゴシック)", value: "'Yu Gothic', 'YuGothic', sans-serif" },
  { label: "Meiryo (メイリオ)", value: "'Meiryo', sans-serif" },
  { label: "BIZ UDP Gothic (BIZ UDPゴシック)", value: "'BIZ UDPGothic', sans-serif" },
];

export const PREVIEW_FONT_OPTIONS = [
  { label: "Default (Sans-Serif)", value: "sans-serif" },
  { label: "Yu Gothic (游ゴシック)", value: "'Yu Gothic', 'YuGothic', sans-serif" },
  { label: "Meiryo (メイリオ)", value: "'Meiryo', sans-serif" },
  { label: "UD Digi Kyokasho (UDデジタル教科書体)", value: "'UD Digi Kyokasho N-R', 'UD Digi Kyokasho', sans-serif" },
  { label: "BIZ UDP Gothic (BIZ UDPゴシック)", value: "'BIZ UDPGothic', sans-serif" },
  { label: "Serif (明朝体)", value: "'Yu Mincho', 'YuMincho', serif" },
];

// --- Image extensions ---
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

// --- Video extensions ---
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'];

// --- Video MIME type to extension mapping (for clipboard paste) ---
export const VIDEO_MIME_MAP: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/ogg': '.ogg',
};

// --- Markdown reference data ---
export const MARKDOWN_REFERENCE = [
  {
    category: "見出し",
    items: [
      { label: "見出し 1", syntax: "# Header 1", snippet: "# " },
      { label: "見出し 2", syntax: "## Header 2", snippet: "## " },
      { label: "見出し 3", syntax: "### Header 3", snippet: "### " },
      { label: "見出し 4", syntax: "#### Header 4", snippet: "#### " },
      { label: "見出し 5", syntax: "##### Header 5", snippet: "##### " },
      { label: "見出し 6", syntax: "###### Header 6", snippet: "###### " },
    ]
  },
  {
    category: "装飾",
    items: [
      { label: "太字", syntax: "**Bold**", snippet: "**$1**" },
      { label: "イタリック", syntax: "*Italic*", snippet: "*$1*" },
      { label: "打ち消し", syntax: "~~Strike~~", snippet: "~~$1~~" },
      { label: "コード", syntax: "`Code`", snippet: "`$1`" },
    ]
  },
  {
    category: "リスト",
    items: [
      { label: "箇条書き", syntax: "- Item", snippet: "- " },
      { label: "番号付き", syntax: "1. Item", snippet: "1. " },
      { label: "タスク", syntax: "- [ ] Task", snippet: "- [ ] " },
    ]
  },
  {
    category: "構造",
    items: [
      { label: "引用", syntax: "> Quote", snippet: "> " },
      { label: "リンク", syntax: "[Title](url)", snippet: "[$1](https://$2)" },
      { label: "区切り線", syntax: "---", snippet: "\n---\n" },
      { label: "テーブル", syntax: "Table", snippet: "| Header | Header |\n| :--- | :--- |\n| Cell | Cell |" },
      { label: "画像", syntax: "![alt](path)", snippet: "![${1:alt}](./$2)" },
      { label: "動画", syntax: '<video src="..." controls>', snippet: '<video src="./$1" controls width="100%"></video>' },
    ]
  },
  {
    category: "図解",
    items: [
      { label: "Mermaid (フロー)", syntax: "mermaid", snippet: "```mermaid\ngraph TD\n  A --> B\n```" },
      { label: "PlantUML", syntax: "plantuml", snippet: "```plantuml\n@startuml\nAlice -> Bob: Hello\n@enduml\n```" },
      { label: "コードブロック", syntax: "```lang", snippet: "```$1\n$2\n```" },
    ]
  }
];
