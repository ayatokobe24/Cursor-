import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "./AuthForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

afterEach(() => {
  cleanup();
  push.mockClear();
});

describe("AuthForm", () => {
  it("メールとパスワードのラベルがあり他の本人確認手段を出さない", () => {
    render(<AuthForm mode="login" submitAuth={async () => ({ ok: true, value: { redirectTo: "/" } })} />);

    expect(screen.getByLabelText("メール")).toBeInTheDocument();
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
    expect(screen.queryByText(/Google|GitHub|OAuth|ソーシャル/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/収入|支出|差引/)).not.toBeInTheDocument();
  });

  it("認証失敗時は短文を出し家計データを出さない", async () => {
    const user = userEvent.setup();
    render(
      <AuthForm
        mode="login"
        submitAuth={async () => ({
          ok: false,
          error: { kind: "invalidCredentials" },
        })}
      />,
    );

    await user.type(screen.getByLabelText("メール"), "a@example.com");
    await user.type(screen.getByLabelText("パスワード"), "wrong");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールまたはパスワードが正しくありません"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/収入合計|支出合計/)).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("成功すると家計へ進める", async () => {
    const user = userEvent.setup();
    const submitAuth = vi.fn(async () => ({
      ok: true as const,
      value: { redirectTo: "/" as const },
    }));

    render(<AuthForm mode="signup" submitAuth={submitAuth} />);

    await user.type(screen.getByLabelText("メール"), "a@example.com");
    await user.type(screen.getByLabelText("パスワード"), "password12");
    await user.click(screen.getByRole("button", { name: "登録" }));

    expect(submitAuth).toHaveBeenCalledWith("a@example.com", "password12");
    expect(push).toHaveBeenCalledWith("/");
  });
});
