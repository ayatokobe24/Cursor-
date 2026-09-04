# API Standards（Supabase MCP）

このアプリに独自の REST / GraphQL サーバーは置かない。実行時の API は **Supabase クライアント**、スキーマ変更と調査は **Supabase MCP** とする。

## Runtime vs MCP

| 用途 | 手段 |
| --- | --- |
| 画面からの読み書き | `@/` の Supabase クライアント（ユーザーセッション + RLS） |
| テーブル設計、マイグレーション、調査用 SQL | Cursor に接続した公式 Supabase MCP |
| 本番データの一括破壊・他ユーザー閲覧 | 行わない |

MCP はエージェント用の管理口である。アプリの `src/` から MCP を呼ばない。

## MCP の前提

公式サーバーは `https://mcp.supabase.com/mcp`。Cursor の **Settings → Tools & MCP** で接続し、ブラウザログインでプロジェクトを選ぶ。

このワークスペースには現時点で Supabase MCP は接続されていない。未接続のときはスキーマ変更を推測でコミットせず、接続を依頼するか Dashboard / CLI にフォールバックする。

アクセストークンや DB パスワードを steering やソースに書かない。ツール実行は Cursor の承認ダイアログで中身を確認してから通す。

## エージェントが使う流れ

スキーマを変えるとき:

1. `list_tables`（必要なら `list_migrations`）で現状を取る
2. 個人家計簿向けの変更 SQL を用意する（`user_id`、RLS、金額は整数円）
3. DDL は `apply_migration` に乗せる。アドホックな `execute_sql` でテーブルを作らない
4. 型が必要なら MCP の型生成、または同等の生成手順でアプリ側型を更新する

データを見るとき:

- 開発確認は `execute_sql` でよい。`select *` の全件ダンプは避ける
- 本番相当プロジェクトでは更新・削除 SQL を MCP から流さない。読むだけに留める

## アプリ側の契約

ページやコンポーネントは `src/lib/supabase/` 経由でアクセスする。エラーは Supabase の `error` を握りつぶさず、ユーザー向け文言に翻訳する。

```typescript
const { data, error } = await supabase
  .from("transactions")
  .select("id, amount, type, occurred_on")
  .order("occurred_on", { ascending: false });

if (error) {
  throw error;
}
```

認証済みユーザーの行だけが返る前提（RLS）。service role はサーバーの管理処理以外で使わない。クライアントバンドルに載せない。

リソース名は DB の複数形 snake_case（`transactions`）に合わせ、フロントの型名は PascalCase（`Transaction`）にする。

---
_MCP はスキーマと調査。実行時 API はクライアント + RLS_
