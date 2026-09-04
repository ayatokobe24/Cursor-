# Research & Design Decisions

## Summary

- **Feature**: household-budget
- **Discovery Scope**: Extension（既存仕様のマージ。追加要件は Supabase Auth による本人確認。認証はセキュリティ機微のため公式 SSR 手順を再検証）
- **Key Findings**:
  - 実行時 API は独自 REST ではなく Supabase Data API + RLS。管理用 MCP はアプリ実行パスに入れない（steering `api-standards.md`）。
  - 本人確認の正は **Supabase Auth**（メール/パスワード）。アプリはパスワードを保存しない。セッションは `@supabase/ssr` の Cookie。検証は `getSession()` ではなく `auth.getUser()`（または同等のサーバー検証）。
  - Next.js 16 では `middleware.ts` が `proxy.ts` に改名され、プロキシは楽観的リダイレクトと Cookie 更新に留める。認可の正は RSC / Server Action でのセッション検証と Postgres RLS。
  - `cookies()` は非同期。公開キーは `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`（プロジェクトによっては publishable key と同趣旨）。
  - リモートに先行していた `categories` と取引の `date` / `category_id` は仕様外。設計の `occurred_on` に合わせて除去する。

## Research Log

### 現行コードベース

- **Context**: 拡張ではなく新規機能として家計簿を載せる。認証はテンプレートに無い。
- **Sources Consulted**: `src/app/page.tsx`, `layout.tsx`, `package.json`, `.kiro/steering/*`
- **Findings**:
  - App Router + `src/` + `@/` のみ。ドメイン・認証・データ層は未実装。
  - 依存は Next 16.3.4 / React 19 / Tailwind 4。Supabase クライアント未導入。
  - ホームは create-next-app テンプレート（要件 7.5 で家計画面から除去）。
- **Implications**: 既存パターンはルート配置とエイリアスのみ踏襲。認証クライアントは steering の `lib/supabase` に閉じる。

### Next.js と Supabase Auth SSR

- **Context**: 要件 1.1–1.8, 6.2。Cookie セッション、登録/ログイン/ログアウト、未認証の遮断。
- **Sources Consulted**:
  - [Server-Side Auth Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
  - [Supabase Next.js auth prompt](https://github.com/supabase/supabase/blob/master/examples/prompts/nextjs-supabase-auth.md)
  - [Next.js Proxy ファイル規約](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
  - [supabase/ssr cookies() async](https://github.com/supabase/ssr/issues/75)
- **Findings**:
  - ブラウザは `createBrowserClient`。サーバーは `await cookies()` 後に `createServerClient`（`getAll` / `setAll`）。
  - プロキシ（旧 Middleware）は毎リクエストで Cookie を更新し、`getUser` でユーザー有無を見る。応答オブジェクトの Cookie を捨てるとセッションが切れる。
  - Server Component からの Cookie 書き込み失敗は、プロキシが更新していれば無視してよい。
  - メール確認がプロジェクトで有効な場合、登録直後にセッションが無い。PKCE のコード交換は `/auth/callback` の Route Handler のみ許可する（一般 REST は置かない）。
  - Next.js 16 の Proxy はセキュリティ境界ではなく UX ゲート。Server Action とデータ読取は毎回 `getUser` する。
- **Implications**: AuthService は Server Action。AuthSession は DAL。AuthProxy はリダイレクトと refresh。service role はアプリに置かない。

### Row Level Security

- **Context**: 要件 5.4, 6.1, 6.4。anon key でも他ユーザー行を見せない。
- **Sources Consulted**:
  - [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- **Findings**:
  - テーブルで RLS を有効化し、SELECT / INSERT / UPDATE / DELETE を分ける。
  - `(select auth.uid())` で文単位に評価。UPDATE の `WITH CHECK` で `user_id` 付け替えを防ぐ。
  - JWT の `sub` が `auth.users.id` と一致する。アプリの `user_id` は Auth のユーザー ID をコピーするだけ。
- **Implications**: 認可の正は RLS。アプリ側フィルタは防御。共有テーブルや招待カラムは作らない。

### 月次集計の置き場所

- **Context**: 要件 4。一覧と要約の一致。
- **Sources Consulted**: 個人家計の想定件数、steering（テストは純関数を厚くする）
- **Findings**: 1 ユーザー・1 か月の行はサーバーメモリで集計してよい。
- **Implications**: 対象月の行を 1 回取得し、ドメイン純関数で収入合計・支出合計・差引を出す。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 薄いレイヤー App Router | Types → Domain → Repository → Server runtime → UI | steering と一致。テスト容易 | 巨大化するとサービス層が膨らむ | 採用。個人 CRUD に十分 |
| 独自 REST BFF | Next Route Handler で JSON API | モバイル追加に有利 | 要件にクライアントが複数ない。二重契約 | 却下。Auth callback のみ例外 |
| NextAuth 等の別 IdP | アプリ側でセッションを持つ | プロバイダ切替が容易 | パスワードとユーザーの正が二重になる | 却下。1.6 で Supabase Auth に限定 |
| Hexagonal 全面 | Port/Adapter を全操作に | テスト境界が明確 | 現状の規模に過剰 | リポジトリ境界のみ採用 |

## Design Decisions

### Decision: 本人確認は Supabase Auth のみ

- **Context**: 追加要件。1.1–1.4 に加え 1.6–1.8。
- **Alternatives Considered**:
  1. 自前ユーザー表とパスワードハッシュ
  2. NextAuth Credentials
  3. Supabase Auth メール/パスワード
- **Selected Approach**: `signUp` / `signInWithPassword` / `signOut`。ユーザー実体は `auth.users`。家計行の `user_id` はその UUID。
- **Rationale**: steering と既存設計の正。パスワードをアプリ DB に置かない。
- **Trade-offs**: OAuth・MFA・パスワード再設定は本仕様の対象外。メール確認のプロジェクト設定に登録完了の定義が依存する。
- **Follow-up**: 開発では確認メールをオフにするか、確認待ちを `unavailable` として家計を出さない（1.1, 1.8）。

### Decision: Cookie セッションと Proxy 保護

- **Context**: 未認証に家計データを出さない（1.5, 1.7, 6.2）。
- **Alternatives Considered**:
  1. クライアントのみの localStorage JWT
  2. `@supabase/ssr` + `proxy.ts` + DAL の `getUser`
- **Selected Approach**: `@supabase/ssr`。Proxy で Cookie 更新と楽観的リダイレクト。未認証は `/login`、認証済みの `/login` `/signup` は `/`。Action と RSC は `getUser` で失敗閉鎖。
- **Rationale**: 公式 SSR。Next.js 16 は Proxy を唯一の認可にしない。
- **Trade-offs**: Proxy と Cookie アダプタの保守が必要。
- **Follow-up**: `getSession()` だけでゲートしない。

### Decision: Server Action で記録の変更

- **Context**: 保存中の再実行防止（2.5）、失敗のフィールド近傍表示（7.4）。
- **Alternatives Considered**:
  1. ブラウザから直接 `from('transactions')`
  2. Server Action + `revalidatePath`
- **Selected Approach**: 変更は Server Action。検証はドメイン。永続化はサーバークライアント。一覧・要約は RSC が再取得。
- **Rationale**: Cookie 更新と検証をサーバーに寄せる。
- **Trade-offs**: インタラクションのたびにサーバー往復。個人家計では許容。
- **Follow-up**: Action の戻りは discriminated union。`any` 禁止。

### Decision: 1 テーブル `transactions` とハード削除

- **Context**: 記録の CRUD と月次。共有は対象外。
- **Alternatives Considered**:
  1. income / expense を別テーブル
  2. ソフト削除
- **Selected Approach**: `type` 付き 1 テーブル。削除は行削除。
- **Rationale**: 要約が単純。要件は共有・監査ログを求めない。
- **Trade-offs**: 削除復元なし。
- **Follow-up**: スキーマ変更は MCP `apply_migration` または同等。

### Decision: 円は整数、発生日は date

- **Context**: 2.6, 3.5, 4.5。
- **Alternatives Considered**: `numeric`、タイムゾーン付き timestamptz のみ。
- **Selected Approach**: `amount` は正の整数（円）。`occurred_on` は `date`。表示は `Intl` の JPY。
- **Rationale**: 端数と TZ ずれを避ける。カレンダー日で月を切る。
- **Trade-offs**: 外貨・小数円は対象外。
- **Follow-up**: 月境界は `YYYY-MM` と半開区間 `[start, nextStart)`。

### Decision: カテゴリは仕様外。リモートは設計へ合わせる

- **Context**: 設計レビューで、先行作成した `categories` と取引の `date` / `category_id` が Physical Data Model と食い違っていた。
- **Alternatives Considered**:
  1. 要件・設計をカテゴリ付きに拡張する
  2. リモートを設計（`occurred_on` のみ、カテゴリなし）へ合わせる
- **Selected Approach**: 2。`categories` を削除し、発生日列を `occurred_on` にする。
- **Rationale**: 要件 2 / 3 / 4 は発生日と種別のみ。カテゴリは本仕様の対象外。
- **Trade-offs**: 後からカテゴリを足す場合は別仕様とマイグレーションが必要。
- **Follow-up**: アプリ実装は `public.transactions` のみを前提にする。

## Risks & Mitigations

- メール確認が有効だと登録直後にセッションが無い — 確認待ちは家計を出さず短文を出す（1.8）。
- Proxy だけを認可とするとスキップや偽 Cookie に弱い — Action / RSC で `getUser`、DB は RLS。
- RLS 未設定のまま Data API 公開 — マイグレーションで RLS と操作別ポリシーを必須にする。
- Server Component で Cookie が書けずセッションが古くなる — Proxy の `updateSession` を必須にする。
- 本番で MCP `execute_sql` の更新 — steering どおり読むだけ。アプリは anon + ユーザー JWT のみ。

## References

- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- `.kiro/steering/tech.md`, `structure.md`, `api-standards.md`, `testing.md`, `ui-ux.md`, `coding-conventions.md`
