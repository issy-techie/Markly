# Markly

Markly は、Tauri 2 + React + TypeScript で構築されたデスクトップ向け Markdown エディタです。

## 機能

- リアルタイムプレビュー付きの分割ペインエディタ
- ファイルツリーサイドバーによるフォルダ管理
- タブによる複数ファイルの同時編集
- Mermaid / PlantUML ダイアグラムのレンダリング
- GitHub Flavored Markdown (GFM) 対応
- ダークテーマ / ライトテーマ切り替え
- 検索・置換機能
- ウィンドウ状態の自動保存・復元

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | [Tauri 2](https://v2.tauri.app/) |
| フロントエンド | [React 19](https://react.dev/) + TypeScript |
| ビルドツール | [Vite 7](https://vite.dev/) |
| エディタ | [CodeMirror 6](https://codemirror.net/) |
| スタイリング | [Tailwind CSS 3](https://tailwindcss.com/) |
| Markdown レンダリング | react-markdown + remark-gfm |
| テスト | [Vitest](https://vitest.dev/) |

## 前提条件

- [Node.js](https://nodejs.org/) (v18 以上)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI の前提条件](https://v2.tauri.app/start/prerequisites/)

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動 (Web のみ)
npm run dev

# Tauri デスクトップアプリとして起動
npm run tauri dev
```

## ビルド

```bash
# プロダクションビルド
npm run tauri build
```

ビルド成果物は `src-tauri/target/release` に出力されます。

## テスト

```bash
# 型チェック
npx tsc --noEmit

# テストの実行
npm test

# ウォッチモードでテストを実行
npm run test:watch
```

## プロジェクト構成

```
Markly/
├── src/                    # フロントエンド (React)
│   ├── components/         # UI コンポーネント
│   │   ├── Dialogs/        #   ダイアログ類
│   │   ├── Editor/         #   エディタペイン・タブバー
│   │   ├── Preview/        #   プレビューペイン
│   │   ├── Sidebar/        #   ファイルツリーサイドバー
│   │   └── UI/             #   共通 UI 部品
│   ├── hooks/              # カスタムフック
│   ├── utils/              # ユーティリティ関数
│   └── __tests__/          # テストファイル
├── src-tauri/              # バックエンド (Rust / Tauri)
│   └── src/
├── public/                 # 静的ファイル
└── index.html              # エントリポイント
```

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。
