---
description: E2Eテストを実行する
---

# E2Eテスト実行

docs/e2e/test-case.mc を参照して、E2Eテストを実行してください。

## 実行手順

1. docs/e2e/test-case.mc を読み込む
2. テストケースの「前提（Given）」に従って準備する
3. 「操作（When）」に従ってブラウザを操作する
4. 「期待（Then）」を確認する
5. 結果を報告する

## 失敗時

`.cursor/rules/e2e-test.mdc` に従い、スクリーンショットは `docs/e2e/screenshots/` へ保存する。
