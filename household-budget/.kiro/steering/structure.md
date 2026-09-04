# Project Structure

## Organization Philosophy

App Router を入口にした薄いレイヤー構成。画面は `src/app/`、共有 UI とドメインロジックは `src/` 配下、Supabase アクセスは専用モジュールに閉じる。ファイル一覧ではなく「どこに何を置くか」を守る。

個人の家計簿であるため、データはログインユーザー単位で扱う前提で配置する。

## Directory Patterns

### App routes

**Location**: `src/app/`  
**Purpose**: ルート、レイアウト、ページ専用スタイル、ルート固有の UI  
**Example**: `layout.tsx` が全体シェル、`page.tsx` が `/` の画面。新画面は同階層にルートフォルダを追加する。

### Shared modules

**Location**: `src/` 直下（例: `components/`, `lib/`）  
**Purpose**: ルートに紐づかない再利用コード  
**Example**: UI 部品は `components/`、金額計算などのドメインロジックは `lib/`。ページファイルにビジネスロジックを溜めない。

### Supabase access

**Location**: `src/lib/supabase/`（導入時）  
**Purpose**: ブラウザ用・サーバー用クライアントの生成と、テーブルアクセスの入口  
**Example**: ページやコンポーネントから直接 `createClient` を散らさず、ここを経由する。Row Level Security を前提にし、アプリ側で他ユーザーのデータを取らない。

仕様成果物は `.kiro/specs/`、プロジェクトメモリは `.kiro/steering/` に置く。アプリ実行時のソースとは分ける。

## Naming Conventions

- **Files**: ルートと設定は kebab-case または Next.js 予約名（`page.tsx`, `layout.tsx`, `globals.css`）。React コンポーネントファイルは PascalCase
- **Components**: PascalCase。1 ファイル 1 主要エクスポート
- **Functions**: camelCase。サーバー専用処理はファイル名または配置で意図が分かるようにする

## Import Organization

```typescript
import type { Metadata } from "next";
import { HomeSummary } from "@/components/HomeSummary";
import { createClient } from "@/lib/supabase/server";
import { formatYen } from "@/lib/money";
import { LocalWidget } from "./local-widget";
```

- 外部パッケージ → `@/` の共有モジュール → 相対パス（同一ルート内）
- 深い相対パス（`../../../`）は使わず `@/` に切り替える

**Path Aliases**:

- `@/*`: `./src/*`

## Code Organization Principles

- ルートファイルは組み立てに留め、計算と永続化は `lib/` 側へ出す
- クライアント境界は必要最小限。データ取得はサーバー側を優先する
- Supabase の接続情報は環境変数のみ。クライアントに service role を渡さない
- 新しいパターン（Server Action など）を導入したら、既存パターンに乗るかこのファイルへ原則を追記する

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
