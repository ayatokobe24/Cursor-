import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as CopyCatalog from "./copy";

const dir = path.dirname(fileURLToPath(import.meta.url));
const copyPath = path.join(dir, "copy.ts");

describe("CopyCatalog SCR-001 (Requirement 1.3, 2.7)", () => {
  test("src/mock/copy.ts exists", () => {
    assert.equal(existsSync(copyPath), true);
  });

  test("login copy matches MOCK-DEC-01 SCR-001 exactly", async () => {
    const { copy } = await loadCopy();
    const login = copy.login;

    assert.equal(login.serviceName, "伴走（仮）");
    assert.equal(
      login.summary,
      "仕事のつまずきを、一人で抱えずに次の一歩まで整理するための、所属企業から独立した場です。",
    );
    assert.equal(login.thirdParty, "相談内容は所属企業へ渡りません。");
    assert.equal(
      login.anonymity,
      "他の利用者に、あなたが誰かは分かりません。",
    );
    assert.equal(login.emailLabel, "メール");
    assert.equal(login.passwordLabel, "パスワード");
    assert.match(login.authNote, /モック用仮置き/);
    assert.match(login.authNote, /認証方式の本決定ではない/);
    assert.equal(login.cta, "ログイン");
    assert.equal(login.createAccount, "アカウントを作成");
    assert.equal(login.forgotPassword, "パスワードを忘れた場合");
    assert.equal(login.terms, "利用規約");
    assert.equal(login.privacy, "プライバシー");
  });
});

async function loadCopy(): Promise<typeof CopyCatalog> {
  return import(pathToFileURL(copyPath).href) as Promise<typeof CopyCatalog>;
}
