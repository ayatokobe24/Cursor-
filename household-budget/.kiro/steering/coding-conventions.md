# Coding Conventions

アプリコードの見た目と名前を揃える。フォルダ配置は `structure.md` に従う。

## Indent and formatting

既存の `src/` に合わせ、**スペース 2 段**、末尾カンマあり、セミコロンありとする。タブは使わない。Prettier 設定ファイルはまだない。導入するまではこの規則と ESLint（`eslint-config-next`）を正とする。

```typescript
export function formatYen(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}
```

- JSX の属性は 1 行に収まるなら 1 行。収まらなければ 1 属性 1 行
- オブジェクト・配列の複数行は開き括弧の次で改行する

## Naming

| 対象 | 規則 | 例 |
| --- | --- | --- |
| コンポーネント / コンポーネントファイル | PascalCase | `TransactionList.tsx` |
| 関数・変数・フック | camelCase | `formatYen`, `useMonthFilter` |
| カスタムフック | `use` 接頭辞 | `useTransactions` |
| 型・インターフェース | PascalCase。`I` 接頭辞は付けない | `Transaction`, `CreateExpenseInput` |
| 定数 | UPPER_SNAKE は真の定数のみ | `MAX_MEMO_LENGTH` |
| ルート・ユーティリティファイル | kebab-case または Next 予約名 | `page.tsx`, `format-yen.ts` |
| CSS 変数 | kebab-case | `--background` |
| DB テーブル・カラム（Supabase） | snake_case | `transactions.occurred_on` |
| 環境変数 | `NEXT_PUBLIC_` は公開してよい値のみ | キー本体はリポジトリに書かない |

真偽値は `is` / `has` / `can` で始める（`isIncome`, `hasError`）。イベントハンドラは `handle` または `on`（`handleSubmit`, `onDelete`）。

金額は円の整数（`number`）で扱い、表示用の文字列と混在させない。列挙は TypeScript の union を優先する。

```typescript
type TransactionType = "income" | "expense";
```

## Imports

`structure.md` の順を守る。未使用 import を残さない。型だけの import は `import type` にする。

## Comments

自明なコードにコメントを書かない。単位・境界・「なぜ」だけ書く。`any` を使う場合は理由をその場に残す。

---
_Patterns and decisions, not a catalog of every identifier_
