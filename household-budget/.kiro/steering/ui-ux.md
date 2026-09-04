# UI/UX Guidelines

個人が毎日短時間で収支を残せる画面にする。装飾より可読性と入力の速さ。スタイルは Tailwind CSS 4。トークンは `globals.css` の `--background` / `--foreground` を優先し、ページごとに色を増やさない。

## Layout pattern

- コンテンツ幅は既存ホームに合わせ、本文は `max-w-3xl` 程度に収める
- 縦積みを基本にする（`flex flex-col`）。家計の一覧・フォームは上から下へ
- 余白は Tailwind の 4 の倍数（`gap-4`, `p-4`, `py-8`）。マジックナンバーの px はアイコンサイズなど最小限
- モバイルを先に書く。`sm:` 以上で横並びや左寄せを足す（現行 `page.tsx` と同じ）

```tsx
<main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
  <h1 className="text-2xl font-semibold tracking-tight">今月の収支</h1>
  {/* 要約 → 操作 → 一覧 */}
</main>
```

画面の順は **要約（収入・支出・差引）→ 追加アクション → 明細**。重要な数字を折りたたみの奥に置かない。

## Visual language

- テキスト: `font-sans`。見出しは `font-semibold` + `tracking-tight`
- 本文: `text-zinc-600`（ダークは `dark:text-zinc-400`）
- 収入は意味色を控えめに（緑系）、支出は赤系。色だけに頼らずラベルも付ける
- 金額は右寄せ、`tabular-nums` で桁を揃える。表示は円のフォーマッタ経由（`coding-conventions.md`）
- 角丸はボタンを `rounded-full` または `rounded-lg` に統一し、画面内で混ぜない
- `next/image` でビットマップを出す。装飾 SVG 以外の大きな img は避ける

ダークモードは `prefers-color-scheme` に追従する（既存の `dark:` パターン）。強制テーマ切り替えは仕様ができるまで足さない。

## Interaction

- 主ボタンは 1 画面に 1 つ（例: 「支出を記録」）。副操作はボーダー付きボタン
- タッチしやすい高さ（`h-12` 前後）。既存の CTA に合わせる
- フォームはラベルを入力の上に置く。プレースホルダだけにしない
- 送信中はボタンを無効化し、失敗はフィールド近くに短く出す
- 空状態は「まだ記録がありません」+ 次の操作を示す。スケルトンやスピナーは取得中だけ

破壊的操作（削除）は確認を挟む。一覧の誤タップで消さない。

## Accessibility

- インタラクティブ要素はボタンまたはリンクにする。div クリックにしない
- アイコンボタンには `aria-label`（例: 「この支出を削除」）
- コントラストは zinc の本文色を維持する。薄いグレーだけで金額を示さない
- フォーカスリングを消さない

## What not to do

- ダッシュボードのためのチャートを最初から置かない。数字と一覧で足りる間は表と要約に留める
- 世帯切替・メンバー招待の UI を足さない（対象は個人）
- create-next-app の Deploy / Documentation リンクをプロダクト UI として残さない

---
_Calm, numeric, mobile-first. Tokens over one-off colors_
