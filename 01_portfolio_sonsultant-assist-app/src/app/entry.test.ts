import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.join(dir, "page.tsx");
const layoutPath = path.join(dir, "layout.tsx");
const loginPath = path.join(dir, "login", "page.tsx");
const consentPath = path.join(dir, "consent", "page.tsx");
const consultPath = path.join(dir, "consult", "new", "page.tsx");

const USER_FACING_PAGES = [loginPath, consentPath, consultPath] as const;

describe("App entry (Requirement 1.4, 1.5)", () => {
  test("src/app/page.tsx redirects / to /login and is not named ホーム", () => {
    assert.equal(existsSync(pagePath), true);
    const source = readFileSync(pagePath, "utf8");
    assert.match(source, /from ["']next\/navigation["']/);
    assert.match(source, /redirect\(\s*["']\/login["']\s*\)/);
    assert.equal(/\bHome\b/.test(source), false);
    assert.equal(/ホーム/.test(source), false);
    assert.equal(/ダッシュボード/.test(source), false);
    assert.equal(/dashboard/i.test(source), false);
  });

  test("root layout wraps children with MockRuntimeProvider", () => {
    const source = readFileSync(layoutPath, "utf8");
    assert.match(source, /MockRuntimeProvider/);
    assert.match(source, /from ["']@\/mock\/runtime["']/);
  });

  test("user-facing login/consent/consult placeholders do not show SCR numbers", () => {
    for (const filePath of USER_FACING_PAGES) {
      const source = readFileSync(filePath, "utf8");
      assert.equal(
        /SCR-\d+/.test(source),
        false,
        `${path.relative(dir, filePath)} must not display SCR numbers`,
      );
    }
  });
});
