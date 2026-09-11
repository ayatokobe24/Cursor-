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

describe("CopyCatalog SCR-002 (Requirement 4.4, 4.5)", () => {
  test("consent copy matches MOCK-DEC-01 SCR-002 exactly", async () => {
    const { copy } = await loadCopy();
    const consent = copy.consent;

    assert.equal(consent.title, "相談を始める前に");
    assert.equal(
      consent.description,
      "安心して話せるように、情報の扱いを確認します。",
    );
    assert.equal(
      consent.items.thirdParty,
      "所属企業から独立した第三者サービスであること",
    );
    assert.equal(
      consent.items.noCompanyShare,
      "相談内容を所属企業へ提供しないこと",
    );
    assert.equal(consent.items.noHrEval, "人事評価に使わないこと");
    assert.equal(Object.keys(consent.items).length, 3);
    assert.equal(
      consent.publicNote,
      "あなたが明示的に同意しない限り、相談内容は公開されません。",
    );
    assert.equal(consent.cta, "同意して進む");
    assert.equal(
      consent.disabledReason,
      "必要な確認が終わるまで、次へは進めません。",
    );
    assert.equal("optional" in consent, false);
  });
});

describe("CopyCatalog SCR-003 (Requirement 2.4, 4.6)", () => {
  test("consult copy matches MOCK-DEC-01 SCR-003 exactly", async () => {
    const { copy } = await loadCopy();
    const consult = copy.consult;

    assert.equal(consult.title, "いま困っていることを書く");
    assert.equal(
      consult.reassurance,
      "うまくまとめなくて大丈夫です。いま頭にあることを、そのまま書いてください。",
    );
    assert.equal(
      consult.hint,
      "何があったか、何が一番つらいかを、そのまま書いてください。",
    );
    assert.equal(
      consult.confidentiality,
      "顧客名、案件名、人名は、書かなくて構いません。書かれた場合は、必要なら伏せて扱います。",
    );
    assert.equal(
      consult.maskingNotice,
      "伏せた方がよさそうな箇所があります。内容を確認してから進めます。",
    );
    assert.equal(consult.cta, "相談を始める");
    assert.match(consult.startFailed, /入力はそのまま残して/);
    assert.doesNotMatch(consult.title, /5W3H/);
    assert.doesNotMatch(consult.hint, /Who|What|When|Where|Why|How/);
  });
});

describe("CopyCatalog SCR-004 (Requirement 5.4, 5.5)", () => {
  test("coaching copy matches MOCK-DEC-01 thinking and failure lines", async () => {
    const { copy } = await loadCopy();
    assert.equal(copy.coaching.thinking, "考えています");
    assert.equal(
      copy.coaching.scriptFailed,
      "もう一度聞いてみますか。いまの入力はそのまま残しています。",
    );
  });
});

async function loadCopy(): Promise<typeof CopyCatalog> {
  return import(pathToFileURL(copyPath).href) as Promise<typeof CopyCatalog>;
}
