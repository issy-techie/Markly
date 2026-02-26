import type { AppConfig, SessionData, Language } from "./types";

// --- Reference data types ---
export interface ReferenceItem {
  label: string;
  syntax: string;
  snippet: string;
  sample: string;
  color?: string;
}
export interface ReferenceCategory {
  id: string;
  category: string;
  items: ReferenceItem[];
}

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
  theme: "dark",
  sidebarWidth: 250,
  editorWidthPercent: 50,
  openTabsHeight: 192,
  lineBreaks: true,
  lineWrapping: true,
  scrollSync: true,
  language: null,
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

// --- Markdown reference data (Japanese) ---
const MARKDOWN_REFERENCE_JA: ReferenceCategory[] = [
  { id: "headings", category: "見出し", items: [
    { label: "見出し 1", syntax: "# 見出し", snippet: "# $1", sample: "文書のメインタイトル" },
    { label: "見出し 2", syntax: "## 見出し", snippet: "## $1", sample: "セクションの見出し" },
    { label: "見出し 3", syntax: "### 見出し", snippet: "### $1", sample: "サブセクションの見出し" },
    { label: "見出し 4", syntax: "#### 見出し", snippet: "#### $1", sample: "小見出し" },
    { label: "見出し 5", syntax: "##### 見出し", snippet: "##### $1", sample: "補足的な見出し" },
    { label: "見出し 6", syntax: "###### 見出し", snippet: "###### $1", sample: "最小の見出し" },
  ]},
  { id: "decoration", category: "装飾", items: [
    { label: "太字", syntax: "**太字**", snippet: "**$1**", sample: "重要な語句を強調" },
    { label: "イタリック", syntax: "*イタリック*", snippet: "*$1*", sample: "用語や外来語の強調" },
    { label: "太字+イタリック", syntax: "***強調***", snippet: "***$1***", sample: "最も強い強調" },
    { label: "打ち消し", syntax: "~~打ち消し~~", snippet: "~~$1~~", sample: "削除・訂正された内容" },
    { label: "インラインコード", syntax: "`code`", snippet: "`$1`", sample: "コードや変数名の表記" },
    { label: "上付き・下付き", syntax: "X<sup>2</sup> H<sub>2</sub>O", snippet: "$1<sup>$2</sup>", sample: "数式や化学式 (HTML)" },
  ]},
  { id: "textColor", category: "文字色", items: [
    { label: "赤", syntax: '<span style="color:red">', snippet: '<span style="color: #e74c3c">$1</span>', sample: "警告・重要な注意書き", color: "#e74c3c" },
    { label: "青", syntax: '<span style="color:blue">', snippet: '<span style="color: #3498db">$1</span>', sample: "リンク風テキスト・情報", color: "#3498db" },
    { label: "緑", syntax: '<span style="color:green">', snippet: '<span style="color: #27ae60">$1</span>', sample: "成功・完了ステータス", color: "#27ae60" },
    { label: "オレンジ", syntax: '<span style="color:orange">', snippet: '<span style="color: #f39c12">$1</span>', sample: "注意・警告レベルの情報", color: "#f39c12" },
    { label: "紫", syntax: '<span style="color:purple">', snippet: '<span style="color: #9b59b6">$1</span>', sample: "特別・ハイライト表示", color: "#9b59b6" },
    { label: "グレー", syntax: '<span style="color:gray">', snippet: '<span style="color: #95a5a6">$1</span>', sample: "補足・注釈テキスト", color: "#95a5a6" },
    { label: "背景色付き", syntax: '<span style="background:yellow">', snippet: '<span style="background-color: #ffeaa7; padding: 0 4px; border-radius: 2px">$1</span>', sample: "マーカー風の背景ハイライト", color: "#ffeaa7" },
    { label: "カスタムカラー", syntax: '<span style="color:#hex">', snippet: '<span style="color: #$1">テキスト</span>', sample: "任意の色を HEX で指定" },
  ]},
  { id: "lists", category: "リスト", items: [
    { label: "箇条書き", syntax: "- Item", snippet: "- 項目1\n- 項目2\n- 項目3", sample: "順序のないリスト" },
    { label: "番号付き", syntax: "1. Item", snippet: "1. 手順1\n2. 手順2\n3. 手順3", sample: "順序のあるリスト" },
    { label: "タスク", syntax: "- [ ] / - [x]", snippet: "- [ ] 未完了のタスク\n- [x] 完了したタスク\n- [ ] 次のタスク", sample: "チェックボックス付きリスト" },
    { label: "ネストリスト", syntax: "  - Sub item", snippet: "- 親項目\n  - 子項目1\n  - 子項目2\n- 親項目2", sample: "入れ子構造のリスト" },
  ]},
  { id: "structure", category: "構造", items: [
    { label: "引用", syntax: "> Quote", snippet: "> $1", sample: "他者の発言や参考文献の引用" },
    { label: "ネスト引用", syntax: ">> Nested", snippet: "> 引用テキスト\n>\n>> ネストされた引用", sample: "引用の中の引用" },
    { label: "リンク", syntax: "[Title](url)", snippet: "[$1](https://$2)", sample: "クリック可能なハイパーリンク" },
    { label: "区切り線", syntax: "---", snippet: "\n---\n", sample: "セクション間の水平線" },
    { label: "テーブル", syntax: "| H1 | H2 | H3 |", snippet: "| 列1 | 列2 | 列3 |\n| :--- | :---: | ---: |\n| 左揃え | 中央揃え | 右揃え |\n| データ | データ | データ |", sample: "左揃え・中央揃え・右揃え対応" },
    { label: "画像", syntax: "![alt](path)", snippet: "![${1:alt}](./$2)", sample: "PNG/JPG/SVG等の画像埋め込み" },
    { label: "動画", syntax: "<video>", snippet: '<video src="./$1" controls width="100%"></video>', sample: "MP4/WebM等の動画プレーヤー" },
    { label: "脚注", syntax: "テキスト[^1]", snippet: "テキスト[^1]\n\n[^1]: 脚注の内容", sample: "ページ下部に注釈を表示" },
    { label: "折りたたみ", syntax: "<details>", snippet: "<details>\n<summary>クリックして展開</summary>\n\n折りたたまれた内容がここに入ります。\n\n</details>", sample: "クリックで開閉する折りたたみ" },
  ]},
  { id: "embeds", category: "埋め込み", items: [
    { label: "YouTube", syntax: "iframe youtube", snippet: '<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>', sample: "YouTube動画プレーヤー" },
    { label: "Google Maps", syntax: "iframe maps", snippet: '<iframe src="https://www.google.com/maps/embed?pb=MAP_EMBED_CODE" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>', sample: "Googleマップの地図表示" },
    { label: "Google Slides", syntax: "iframe slides", snippet: '<iframe src="https://docs.google.com/presentation/d/PRESENTATION_ID/embed?start=false&loop=false" width="640" height="389" frameborder="0" allowfullscreen></iframe>', sample: "Googleスライドの埋め込み表示" },
    { label: "Google Docs", syntax: "iframe docs", snippet: '<iframe src="https://docs.google.com/document/d/DOCUMENT_ID/pub?embedded=true" width="640" height="480"></iframe>', sample: "Googleドキュメントの埋め込み表示" },
    { label: "Google Sheets", syntax: "iframe sheets", snippet: '<iframe src="https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/pubhtml?widget=true" width="640" height="480"></iframe>', sample: "Googleスプレッドシートの埋め込み" },
    { label: "Spotify", syntax: "iframe spotify", snippet: '<iframe src="https://open.spotify.com/embed/track/TRACK_ID" width="300" height="380" frameborder="0" allow="encrypted-media"></iframe>', sample: "Spotifyトラックのプレーヤー" },
    { label: "CodePen", syntax: "iframe codepen", snippet: '<iframe height="300" style="width:100%;" scrolling="no" src="https://codepen.io/USER/embed/PEN_ID?default-tab=result" frameborder="no" loading="lazy" allowfullscreen></iframe>', sample: "CodePenのライブプレビュー" },
    { label: "汎用 iframe", syntax: '<iframe src="...">', snippet: '<iframe src="https://$1" width="640" height="480" frameborder="0"></iframe>', sample: "任意のWebページの埋め込み" },
  ]},
  { id: "mermaid", category: "Mermaid", items: [
    { label: "フローチャート", syntax: "graph TD", snippet: "```mermaid\ngraph TD\n  A[開始] --> B{条件分岐}\n  B -->|Yes| C[処理A]\n  B -->|No| D[処理B]\n  C --> E[終了]\n  D --> E\n```", sample: "処理の流れや判断を図示" },
    { label: "シーケンス図", syntax: "sequenceDiagram", snippet: "```mermaid\nsequenceDiagram\n  participant C as クライアント\n  participant S as サーバー\n  C->>S: リクエスト送信\n  S-->>C: レスポンス返却\n  C->>S: データ送信\n  S-->>C: 処理結果\n```", sample: "オブジェクト間のやり取りを時系列表示" },
    { label: "クラス図", syntax: "classDiagram", snippet: "```mermaid\nclassDiagram\n  class Animal {\n    +String name\n    +int age\n    +makeSound()\n  }\n  class Dog {\n    +fetch()\n  }\n  class Cat {\n    +purr()\n  }\n  Animal <|-- Dog\n  Animal <|-- Cat\n```", sample: "クラスの構造と継承関係を図示" },
    { label: "状態遷移図", syntax: "stateDiagram-v2", snippet: "```mermaid\nstateDiagram-v2\n  [*] --> 待機中\n  待機中 --> 処理中: 開始\n  処理中 --> 完了: 成功\n  処理中 --> エラー: 失敗\n  エラー --> 待機中: リトライ\n  完了 --> [*]\n```", sample: "状態の変化と遷移条件を図示" },
    { label: "ER図", syntax: "erDiagram", snippet: "```mermaid\nerDiagram\n  USER ||--o{ ORDER : places\n  ORDER ||--|{ LINE_ITEM : contains\n  PRODUCT ||--o{ LINE_ITEM : includes\n  USER {\n    int id PK\n    string name\n    string email\n  }\n```", sample: "データベースのテーブル関係を図示" },
    { label: "ガントチャート", syntax: "gantt", snippet: "```mermaid\ngantt\n  title プロジェクト計画\n  dateFormat YYYY-MM-DD\n  section 設計\n    要件定義: a1, 2024-01-01, 7d\n    基本設計: a2, after a1, 5d\n  section 開発\n    実装: a3, after a2, 10d\n    テスト: a4, after a3, 5d\n```", sample: "プロジェクトのスケジュール管理" },
    { label: "円グラフ", syntax: "pie", snippet: "```mermaid\npie title 言語シェア\n  \"JavaScript\" : 40\n  \"Python\" : 30\n  \"TypeScript\" : 20\n  \"その他\" : 10\n```", sample: "割合・構成比を円グラフで表示" },
    { label: "マインドマップ", syntax: "mindmap", snippet: "```mermaid\nmindmap\n  root((プロジェクト))\n    企画\n      市場調査\n      要件定義\n    開発\n      フロントエンド\n      バックエンド\n    テスト\n      単体テスト\n      結合テスト\n```", sample: "アイデアの階層構造を視覚化" },
    { label: "タイムライン", syntax: "timeline", snippet: "```mermaid\ntimeline\n  title 開発ロードマップ\n  2024 Q1 : 要件定義\n           : プロトタイプ作成\n  2024 Q2 : アルファ版リリース\n           : ユーザーテスト\n  2024 Q3 : ベータ版リリース\n  2024 Q4 : 正式リリース\n```", sample: "時系列のイベントを表示" },
    { label: "Gitグラフ", syntax: "gitGraph", snippet: "```mermaid\ngitGraph\n  commit\n  commit\n  branch develop\n  checkout develop\n  commit\n  commit\n  checkout main\n  merge develop\n  commit\n```", sample: "Gitブランチの履歴を図示" },
  ]},
  { id: "plantuml", category: "PlantUML", items: [
    { label: "シーケンス図", syntax: "Alice -> Bob", snippet: "```plantuml\n@startuml\nactor ユーザー as U\nparticipant \"フロントエンド\" as F\nparticipant \"API\" as A\ndatabase \"DB\" as D\n\nU -> F: 操作\nF -> A: リクエスト\nA -> D: クエリ\nD --> A: 結果\nA --> F: レスポンス\nF --> U: 表示\n@enduml\n```", sample: "オブジェクト間のメッセージ交換" },
    { label: "ユースケース図", syntax: "actor / usecase", snippet: "```plantuml\n@startuml\nleft to right direction\nactor ユーザー as U\nrectangle システム {\n  usecase \"ログイン\" as UC1\n  usecase \"データ閲覧\" as UC2\n  usecase \"データ編集\" as UC3\n}\nU --> UC1\nU --> UC2\nU --> UC3\nUC3 .> UC1 : <<include>>\n@enduml\n```", sample: "ユーザーとシステム機能の関係" },
    { label: "クラス図", syntax: "class Foo { }", snippet: "```plantuml\n@startuml\nclass Animal {\n  +name: String\n  +age: int\n  +makeSound(): void\n}\nclass Dog extends Animal {\n  +fetch(): void\n}\nclass Cat extends Animal {\n  +purr(): void\n}\n@enduml\n```", sample: "クラスの構造と継承関係" },
    { label: "アクティビティ図", syntax: "start / stop", snippet: "```plantuml\n@startuml\nstart\n:入力を受付;\nif (バリデーション?) then (OK)\n  :データ保存;\n  :完了通知;\nelse (NG)\n  :エラー表示;\nendif\nstop\n@enduml\n```", sample: "処理フローや業務手順の図示" },
    { label: "コンポーネント図", syntax: "component [ ]", snippet: "```plantuml\n@startuml\npackage \"フロントエンド\" {\n  [UI コンポーネント]\n  [状態管理]\n}\npackage \"バックエンド\" {\n  [API サーバー]\n  [認証モジュール]\n}\ndatabase \"データベース\" {\n  [ユーザーDB]\n}\n[UI コンポーネント] --> [API サーバー]\n[API サーバー] --> [ユーザーDB]\n[API サーバー] --> [認証モジュール]\n@enduml\n```", sample: "システム構成要素と依存関係" },
    { label: "状態遷移図", syntax: "state / [*]", snippet: "```plantuml\n@startuml\n[*] --> 待機中\n待機中 --> 処理中 : 開始\n処理中 --> 完了 : 成功\n処理中 --> エラー : 失敗\nエラー --> 待機中 : リトライ\n完了 --> [*]\n@enduml\n```", sample: "状態の変化と遷移条件" },
  ]},
  { id: "code", category: "コード", items: [
    { label: "コードブロック", syntax: "```lang ... ```", snippet: "```$1\n\n```", sample: "シンタックスハイライト付きコード" },
    { label: "TypeScript", syntax: "```typescript", snippet: "```typescript\nconst greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n```", sample: "TypeScriptのコードサンプル" },
    { label: "Python", syntax: "```python", snippet: "```python\ndef greet(name: str) -> str:\n    return f\"Hello, {name}!\"\n```", sample: "Pythonのコードサンプル" },
    { label: "SQL", syntax: "```sql", snippet: "```sql\nSELECT u.name, COUNT(o.id) AS order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nORDER BY order_count DESC;\n```", sample: "SQLクエリのサンプル" },
    { label: "JSON", syntax: "```json", snippet: "```json\n{\n  \"name\": \"example\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^19.0.0\"\n  }\n}\n```", sample: "JSON形式のデータ構造" },
  ]},
];

// --- Markdown reference data (English) ---
const MARKDOWN_REFERENCE_EN: ReferenceCategory[] = [
  { id: "headings", category: "Headings", items: [
    { label: "Heading 1", syntax: "# Heading", snippet: "# $1", sample: "Main document title" },
    { label: "Heading 2", syntax: "## Heading", snippet: "## $1", sample: "Section heading" },
    { label: "Heading 3", syntax: "### Heading", snippet: "### $1", sample: "Subsection heading" },
    { label: "Heading 4", syntax: "#### Heading", snippet: "#### $1", sample: "Sub-heading" },
    { label: "Heading 5", syntax: "##### Heading", snippet: "##### $1", sample: "Supplementary heading" },
    { label: "Heading 6", syntax: "###### Heading", snippet: "###### $1", sample: "Smallest heading" },
  ]},
  { id: "decoration", category: "Formatting", items: [
    { label: "Bold", syntax: "**bold**", snippet: "**$1**", sample: "Emphasize important words" },
    { label: "Italic", syntax: "*italic*", snippet: "*$1*", sample: "Emphasize terms" },
    { label: "Bold + Italic", syntax: "***emphasis***", snippet: "***$1***", sample: "Strongest emphasis" },
    { label: "Strikethrough", syntax: "~~strikethrough~~", snippet: "~~$1~~", sample: "Deleted or corrected content" },
    { label: "Inline code", syntax: "`code`", snippet: "`$1`", sample: "Code or variable names" },
    { label: "Super / Subscript", syntax: "X<sup>2</sup> H<sub>2</sub>O", snippet: "$1<sup>$2</sup>", sample: "Math or chemical formulas (HTML)" },
  ]},
  { id: "textColor", category: "Text Color", items: [
    { label: "Red", syntax: '<span style="color:red">', snippet: '<span style="color: #e74c3c">$1</span>', sample: "Warnings and important notices", color: "#e74c3c" },
    { label: "Blue", syntax: '<span style="color:blue">', snippet: '<span style="color: #3498db">$1</span>', sample: "Link-style text and info", color: "#3498db" },
    { label: "Green", syntax: '<span style="color:green">', snippet: '<span style="color: #27ae60">$1</span>', sample: "Success or completion status", color: "#27ae60" },
    { label: "Orange", syntax: '<span style="color:orange">', snippet: '<span style="color: #f39c12">$1</span>', sample: "Caution or warning-level info", color: "#f39c12" },
    { label: "Purple", syntax: '<span style="color:purple">', snippet: '<span style="color: #9b59b6">$1</span>', sample: "Special or highlighted content", color: "#9b59b6" },
    { label: "Gray", syntax: '<span style="color:gray">', snippet: '<span style="color: #95a5a6">$1</span>', sample: "Supplementary or annotation text", color: "#95a5a6" },
    { label: "Background", syntax: '<span style="background:yellow">', snippet: '<span style="background-color: #ffeaa7; padding: 0 4px; border-radius: 2px">$1</span>', sample: "Marker-style background highlight", color: "#ffeaa7" },
    { label: "Custom color", syntax: '<span style="color:#hex">', snippet: '<span style="color: #$1">text</span>', sample: "Specify any color in HEX" },
  ]},
  { id: "lists", category: "Lists", items: [
    { label: "Bullet list", syntax: "- Item", snippet: "- Item 1\n- Item 2\n- Item 3", sample: "Unordered list" },
    { label: "Numbered list", syntax: "1. Item", snippet: "1. Step 1\n2. Step 2\n3. Step 3", sample: "Ordered list" },
    { label: "Task list", syntax: "- [ ] / - [x]", snippet: "- [ ] Incomplete task\n- [x] Completed task\n- [ ] Next task", sample: "Checklist items" },
    { label: "Nested list", syntax: "  - Sub item", snippet: "- Parent item\n  - Child item 1\n  - Child item 2\n- Parent item 2", sample: "Nested list structure" },
  ]},
  { id: "structure", category: "Structure", items: [
    { label: "Blockquote", syntax: "> Quote", snippet: "> $1", sample: "Quote from others or references" },
    { label: "Nested quote", syntax: ">> Nested", snippet: "> Quoted text\n>\n>> Nested quote", sample: "Quote within a quote" },
    { label: "Link", syntax: "[Title](url)", snippet: "[$1](https://$2)", sample: "Clickable hyperlink" },
    { label: "Horizontal rule", syntax: "---", snippet: "\n---\n", sample: "Horizontal line between sections" },
    { label: "Table", syntax: "| H1 | H2 | H3 |", snippet: "| Col 1 | Col 2 | Col 3 |\n| :--- | :---: | ---: |\n| Left | Center | Right |\n| Data | Data | Data |", sample: "Left / center / right alignment" },
    { label: "Image", syntax: "![alt](path)", snippet: "![${1:alt}](./$2)", sample: "Embed PNG/JPG/SVG images" },
    { label: "Video", syntax: "<video>", snippet: '<video src="./$1" controls width="100%"></video>', sample: "MP4/WebM video player" },
    { label: "Footnote", syntax: "Text[^1]", snippet: "Text[^1]\n\n[^1]: Footnote content", sample: "Display annotations at page bottom" },
    { label: "Collapsible", syntax: "<details>", snippet: "<details>\n<summary>Click to expand</summary>\n\nCollapsed content goes here.\n\n</details>", sample: "Toggle open/close on click" },
  ]},
  { id: "embeds", category: "Embeds", items: [
    { label: "YouTube", syntax: "iframe youtube", snippet: '<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>', sample: "YouTube video player" },
    { label: "Google Maps", syntax: "iframe maps", snippet: '<iframe src="https://www.google.com/maps/embed?pb=MAP_EMBED_CODE" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>', sample: "Google Maps display" },
    { label: "Google Slides", syntax: "iframe slides", snippet: '<iframe src="https://docs.google.com/presentation/d/PRESENTATION_ID/embed?start=false&loop=false" width="640" height="389" frameborder="0" allowfullscreen></iframe>', sample: "Embedded Google Slides" },
    { label: "Google Docs", syntax: "iframe docs", snippet: '<iframe src="https://docs.google.com/document/d/DOCUMENT_ID/pub?embedded=true" width="640" height="480"></iframe>', sample: "Embedded Google Docs" },
    { label: "Google Sheets", syntax: "iframe sheets", snippet: '<iframe src="https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/pubhtml?widget=true" width="640" height="480"></iframe>', sample: "Embedded Google Sheets" },
    { label: "Spotify", syntax: "iframe spotify", snippet: '<iframe src="https://open.spotify.com/embed/track/TRACK_ID" width="300" height="380" frameborder="0" allow="encrypted-media"></iframe>', sample: "Spotify track player" },
    { label: "CodePen", syntax: "iframe codepen", snippet: '<iframe height="300" style="width:100%;" scrolling="no" src="https://codepen.io/USER/embed/PEN_ID?default-tab=result" frameborder="no" loading="lazy" allowfullscreen></iframe>', sample: "CodePen live preview" },
    { label: "Generic iframe", syntax: '<iframe src="...">', snippet: '<iframe src="https://$1" width="640" height="480" frameborder="0"></iframe>', sample: "Embed any web page" },
  ]},
  { id: "mermaid", category: "Mermaid", items: [
    { label: "Flowchart", syntax: "graph TD", snippet: "```mermaid\ngraph TD\n  A[Start] --> B{Condition}\n  B -->|Yes| C[Process A]\n  B -->|No| D[Process B]\n  C --> E[End]\n  D --> E\n```", sample: "Visualize process flow and decisions" },
    { label: "Sequence diagram", syntax: "sequenceDiagram", snippet: "```mermaid\nsequenceDiagram\n  participant C as Client\n  participant S as Server\n  C->>S: Send request\n  S-->>C: Return response\n  C->>S: Send data\n  S-->>C: Result\n```", sample: "Show interactions over time" },
    { label: "Class diagram", syntax: "classDiagram", snippet: "```mermaid\nclassDiagram\n  class Animal {\n    +String name\n    +int age\n    +makeSound()\n  }\n  class Dog {\n    +fetch()\n  }\n  class Cat {\n    +purr()\n  }\n  Animal <|-- Dog\n  Animal <|-- Cat\n```", sample: "Class structure and inheritance" },
    { label: "State diagram", syntax: "stateDiagram-v2", snippet: "```mermaid\nstateDiagram-v2\n  [*] --> Idle\n  Idle --> Processing: Start\n  Processing --> Complete: Success\n  Processing --> Error: Failure\n  Error --> Idle: Retry\n  Complete --> [*]\n```", sample: "State changes and transitions" },
    { label: "ER diagram", syntax: "erDiagram", snippet: "```mermaid\nerDiagram\n  USER ||--o{ ORDER : places\n  ORDER ||--|{ LINE_ITEM : contains\n  PRODUCT ||--o{ LINE_ITEM : includes\n  USER {\n    int id PK\n    string name\n    string email\n  }\n```", sample: "Database table relationships" },
    { label: "Gantt chart", syntax: "gantt", snippet: "```mermaid\ngantt\n  title Project Plan\n  dateFormat YYYY-MM-DD\n  section Design\n    Requirements: a1, 2024-01-01, 7d\n    Architecture: a2, after a1, 5d\n  section Development\n    Implementation: a3, after a2, 10d\n    Testing: a4, after a3, 5d\n```", sample: "Project schedule management" },
    { label: "Pie chart", syntax: "pie", snippet: "```mermaid\npie title Language Share\n  \"JavaScript\" : 40\n  \"Python\" : 30\n  \"TypeScript\" : 20\n  \"Other\" : 10\n```", sample: "Display proportions in a pie chart" },
    { label: "Mind map", syntax: "mindmap", snippet: "```mermaid\nmindmap\n  root((Project))\n    Planning\n      Market Research\n      Requirements\n    Development\n      Frontend\n      Backend\n    Testing\n      Unit Tests\n      Integration Tests\n```", sample: "Visualize hierarchical ideas" },
    { label: "Timeline", syntax: "timeline", snippet: "```mermaid\ntimeline\n  title Development Roadmap\n  2024 Q1 : Requirements\n           : Prototype\n  2024 Q2 : Alpha release\n           : User testing\n  2024 Q3 : Beta release\n  2024 Q4 : Official release\n```", sample: "Display events over time" },
    { label: "Git graph", syntax: "gitGraph", snippet: "```mermaid\ngitGraph\n  commit\n  commit\n  branch develop\n  checkout develop\n  commit\n  commit\n  checkout main\n  merge develop\n  commit\n```", sample: "Visualize Git branch history" },
  ]},
  { id: "plantuml", category: "PlantUML", items: [
    { label: "Sequence diagram", syntax: "Alice -> Bob", snippet: "```plantuml\n@startuml\nactor User as U\nparticipant \"Frontend\" as F\nparticipant \"API\" as A\ndatabase \"DB\" as D\n\nU -> F: Action\nF -> A: Request\nA -> D: Query\nD --> A: Result\nA --> F: Response\nF --> U: Display\n@enduml\n```", sample: "Message exchange between objects" },
    { label: "Use case diagram", syntax: "actor / usecase", snippet: "```plantuml\n@startuml\nleft to right direction\nactor User as U\nrectangle System {\n  usecase \"Login\" as UC1\n  usecase \"View Data\" as UC2\n  usecase \"Edit Data\" as UC3\n}\nU --> UC1\nU --> UC2\nU --> UC3\nUC3 .> UC1 : <<include>>\n@enduml\n```", sample: "User and system feature relationships" },
    { label: "Class diagram", syntax: "class Foo { }", snippet: "```plantuml\n@startuml\nclass Animal {\n  +name: String\n  +age: int\n  +makeSound(): void\n}\nclass Dog extends Animal {\n  +fetch(): void\n}\nclass Cat extends Animal {\n  +purr(): void\n}\n@enduml\n```", sample: "Class structure and inheritance" },
    { label: "Activity diagram", syntax: "start / stop", snippet: "```plantuml\n@startuml\nstart\n:Receive input;\nif (Validation?) then (OK)\n  :Save data;\n  :Notify completion;\nelse (NG)\n  :Show error;\nendif\nstop\n@enduml\n```", sample: "Process flow and procedures" },
    { label: "Component diagram", syntax: "component [ ]", snippet: "```plantuml\n@startuml\npackage \"Frontend\" {\n  [UI Components]\n  [State Management]\n}\npackage \"Backend\" {\n  [API Server]\n  [Auth Module]\n}\ndatabase \"Database\" {\n  [User DB]\n}\n[UI Components] --> [API Server]\n[API Server] --> [User DB]\n[API Server] --> [Auth Module]\n@enduml\n```", sample: "System components and dependencies" },
    { label: "State diagram", syntax: "state / [*]", snippet: "```plantuml\n@startuml\n[*] --> Idle\nIdle --> Processing : Start\nProcessing --> Complete : Success\nProcessing --> Error : Failure\nError --> Idle : Retry\nComplete --> [*]\n@enduml\n```", sample: "State changes and transitions" },
  ]},
  { id: "code", category: "Code", items: [
    { label: "Code block", syntax: "```lang ... ```", snippet: "```$1\n\n```", sample: "Syntax-highlighted code" },
    { label: "TypeScript", syntax: "```typescript", snippet: "```typescript\nconst greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n```", sample: "TypeScript code sample" },
    { label: "Python", syntax: "```python", snippet: "```python\ndef greet(name: str) -> str:\n    return f\"Hello, {name}!\"\n```", sample: "Python code sample" },
    { label: "SQL", syntax: "```sql", snippet: "```sql\nSELECT u.name, COUNT(o.id) AS order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nORDER BY order_count DESC;\n```", sample: "SQL query sample" },
    { label: "JSON", syntax: "```json", snippet: "```json\n{\n  \"name\": \"example\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^19.0.0\"\n  }\n}\n```", sample: "JSON data structure" },
  ]},
];

/** Get localized markdown reference data */
export const getMarkdownReference = (lang: Language): ReferenceCategory[] =>
  lang === "en" ? MARKDOWN_REFERENCE_EN : MARKDOWN_REFERENCE_JA;

/** @deprecated Use getMarkdownReference(lang) instead */
export const MARKDOWN_REFERENCE = MARKDOWN_REFERENCE_JA;
