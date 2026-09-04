# Technology Stack

## Architecture

Next.js App Router によるフルスタック Web アプリ。UI は React Server Components を既定とし、クライアントインタラクションが必要な箇所だけ `'use client'` を使う。

データと認証の正は Supabase（PostgreSQL + Auth）とする。アプリは Next.js から Supabase クライアント経由でアクセスし、独自の API サーバーは置かない。クライアントに秘密情報を置かない。

## Core Technologies

- **Language**: TypeScript 5（`strict: true`）
- **Framework**: Next.js 16（App Router）
- **UI**: React 19 / React DOM 19
- **Styling**: Tailwind CSS 4（`@import "tailwindcss"`、PostCSS プラグイン `@tailwindcss/postcss`）
- **Backend**: Supabase（Database / Auth。追加サービスは必要になったら選定する）
- **Runtime**: Node.js（Next.js が要求する現行 LTS 相当）

## Key Libraries

実行時の中核は Next.js、React、Supabase 公式クライアント（`@supabase/supabase-js` および Next.js 向けヘルパー）とする。状態管理ライブラリや別 ORM は入れない。DB アクセスは Supabase クライアントに寄せる。

パッケージへの追加は未着手でも、技術選定としては上記を正とする。

## Development Standards

### Type Safety

- TypeScript strict を維持する
- 新規コードで `any` を使わない。やむを得ない場合は理由をコメントする
- テーブル型は Supabase の生成型、またはそれに準ずる定義を使う

### Code Quality

- ESLint 9 + `eslint-config-next`（core-web-vitals と TypeScript 設定）
- `npm run lint` を品質ゲートとする

### Testing

テストランナーは未導入。導入するまでは lint と型チェック（`next build`）を最低限の検証とする。

## Development Environment

### Required Tools

- Node.js と npm（`package-lock.json` を正とする）
- ローカル開発用の Supabase プロジェクト（URL とキーは環境変数。リポジトリに書かない）

### Common Commands

```bash
# Dev: npm run dev
# Build: npm run build
# Start: npm run start
# Lint: npm run lint
```

## Key Technical Decisions

- **App Router + `src/`**: ルートと設定を分け、アプリコードは `src/` に置く
- **パスエイリアス `@/`**: `src/` からの絶対インポートを標準にする
- **Supabase を BaaS とする**: 永続化と認証を自前実装しない
- **Geist フォント**: `next/font/google` で読み込み、CSS 変数経由で Tailwind テーマに接続する
- **デフォルトメタデータは仮**: `layout.tsx` の title/description は create-next-app のまま。プロダクト名に合わせて更新する

---
_Document standards and patterns, not every dependency_
