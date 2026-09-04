# household-budget

個人の収入と支出を記録し、暦月の収支を把握する家計簿アプリ。

## 開発サーバー

```bash
npm run dev
```

公開設定は `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`。サービスロールは置かない。

実画面の手動確認手順は `docs/manual-check.md`。確認用ログインは `.secrets/manual-check.env`（git 対象外）。

## テスト

```bash
npm test
npm run lint
```
