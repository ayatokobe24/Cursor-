# Testing Standards

振る舞いを検証する。実装の内部構造や Tailwind のクラス名はテストしない。ランナーは未導入のため、導入時は **Vitest + Testing Library** を既定とし、重要な画面フローだけブラウザ確認（または Playwright）を足す。

## Philosophy

- 金額計算、収支の集計、バリデーションを厚くする
- UI は「何が見えるか / 何ができるか」を検証する
- Supabase はモックまたはテスト用クライアントに閉じる。本番プロジェクトは叩かない

## Organization

コロケーションを既定にする。

```
src/lib/money.ts
src/lib/money.test.ts
src/components/TransactionForm.tsx
src/components/TransactionForm.test.tsx
```

- ファイル: `*.test.ts` / `*.test.tsx`
- スイート名は対象、ケース名は期待する振る舞い（日本語可）

E2E を足す場合は `e2e/` に集め、単体テストと混ぜない。

## Test types

- **Unit**: `lib/` の純関数（税込みしない円の加減、月次合計）
- **Component**: フォーム送信、空状態、エラー表示。Router と Supabase はモック
- **E2E**: ログインして収支を 1 件登録し一覧に出る、など少数のクリティカルパスのみ

## Structure (AAA)

```typescript
it("支出を負数にせず金額の絶対値として扱う", () => {
  // Arrange
  const input = { type: "expense" as const, amount: 1200 };

  // Act
  const signed = toSignedAmount(input);

  // Assert
  expect(signed).toBe(-1200);
});
```

ケース名は仕様の一文にする。`should` の羅列は避ける。

## Mocking and data

- モックするのは外部（Supabase、認証セッション、`next/navigation`）だけ
- テスト対象そのものはモックしない
- fixture は最小（1 件の支出、1 件の収入）。日付は固定する
- 各テスト後にモックをリセットする

```typescript
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
}));
```

MCP の `execute_sql` はテストの代替にしない。自動テストはリポジトリ内で再現できるように書く。

## Coverage

数値の閾値は CI 導入まで設けない。必須にする範囲:

- 金額・集計ユーティリティ
- 記録作成のバリデーション
- RLS を前提にした「自分の行だけ扱う」クエリ組み立て（モック検証）

`npm run lint` と `npm run build` はテスト以前のゲートとして残す。

---
_Behavior over implementation. No production database in tests_
