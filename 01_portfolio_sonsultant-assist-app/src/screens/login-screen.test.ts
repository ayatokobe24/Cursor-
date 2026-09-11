import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as LoginModel from "./login-model";

const dir = path.dirname(fileURLToPath(import.meta.url));
const screenPath = path.join(dir, "login-screen.tsx");
const modelPath = path.join(dir, "login-model.ts");
const pagePath = path.join(dir, "..", "app", "login", "page.tsx");

describe("LoginScreen (Requirement 1.3, 2.7, 4.1, 4.2, 4.3)", () => {
  test("src/screens/login-screen.tsx exists", () => {
    assert.equal(existsSync(screenPath), true);
  });

  test("login page wires LoginScreen with AppShell kind=none", () => {
    assert.equal(existsSync(pagePath), true);
    const source = readFileSync(pagePath, "utf8");
    assert.match(source, /LoginScreen/);
    assert.match(source, /from ["']@\/screens\/login-screen["']/);
    assert.match(source, /AppShell/);
    assert.match(source, /kind=["']none["']/);
    assert.doesNotMatch(source, /PlaceholderPanel/);
    assert.doesNotMatch(source, /次へ（プレースホルダ）/);
    assert.doesNotMatch(source, /SCR-\d+/);
  });

  test("login screen uses primitives, mock copy, and MockRuntime.signIn", () => {
    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /GlassCard/);
    assert.match(source, /TextField/);
    assert.match(source, /PrimaryButton/);
    assert.match(source, /InlineMessage/);
    assert.match(source, /useMockRuntime/);
    assert.match(source, /\.signIn\(/);
    assert.match(source, /copy\.login/);
    assert.match(source, /['"]use client['"]/);
    assert.doesNotMatch(source, /PlaceholderPanel/);
    assert.doesNotMatch(source, /SCR-\d+/);
    assert.doesNotMatch(source, /\bany\b/);
    assert.doesNotMatch(source, /Header|Sidebar|Stepper/);
  });

  test("unconsented sign-in routes to /consent", async () => {
    const { routeAfterSuccessfulSignIn } = await loadModel();
    assert.equal(routeAfterSuccessfulSignIn(false), "/consent");
  });

  test("consented sign-in routes to /consult/new", async () => {
    const { routeAfterSuccessfulSignIn } = await loadModel();
    assert.equal(routeAfterSuccessfulSignIn(true), "/consult/new");
  });

  test("empty password is a mock auth failure without leaving login", async () => {
    const { isMockCredentialRejected } = await loadModel();
    assert.equal(isMockCredentialRejected(""), true);
    assert.equal(isMockCredentialRejected("   "), true);
    assert.equal(isMockCredentialRejected("mock-pass"), false);
  });
});

async function loadModel(): Promise<typeof LoginModel> {
  return import(pathToFileURL(modelPath).href) as Promise<typeof LoginModel>;
}
