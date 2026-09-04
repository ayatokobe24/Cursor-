import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LedgerHome } from "./LedgerHome";
import { formatYen } from "@/lib/money";
import type { Transaction } from "@/lib/transactions/types";

const refresh = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push }),
}));

afterEach(() => {
  cleanup();
  refresh.mockClear();
  push.mockClear();
});

const idleActions = {
  saveTransaction: async () => ({ ok: true as const, value: { id: "tx-1" } }),
  updateTransaction: async () => ({ ok: true as const, value: { id: "tx-1" } }),
  deleteTransaction: async () => ({ ok: true as const, value: undefined }),
  signOut: async () => ({
    ok: true as const,
    value: { redirectTo: "/login" as const },
  }),
};

const item: Transaction = {
  id: "tx-1",
  userId: "user-1",
  type: "expense",
  amountYen: 1200,
  occurredOn: "2026-09-04",
  memo: "昼食",
};

describe("LedgerHome", () => {
  it("要約のあとに記録の追加、そのあとに明細を出す", () => {
    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 1200, netYen: -1200 }}
        items={[item]}
        saveTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        updateTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        deleteTransaction={async () => ({ ok: true, value: undefined })}
        signOut={idleActions.signOut}
      />,
    );

    const summary = screen.getByRole("region", { name: "月次要約" });
    const form = screen.getByRole("form", { name: "記録を追加" });
    const list = screen.getByRole("region", { name: "明細" });
    expect(
      summary.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      form.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText(/Deploy|Documentation|To get started/i)).toBeNull();
    expect(screen.getByRole("button", { name: "記録を追加" })).toBeInTheDocument();
  });

  it("明細は種別文言と円表示があり空なら記録へ誘導する", () => {
    const { rerender } = render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 0, netYen: 0 }}
        items={[]}
        saveTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        updateTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        deleteTransaction={async () => ({ ok: true, value: undefined })}
        signOut={idleActions.signOut}
      />,
    );

    expect(screen.getByText("この月の記録はまだありません")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "記録を追加する" })).toHaveAttribute(
      "href",
      "#add-transaction",
    );

    rerender(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 1200, netYen: -1200 }}
        items={[item]}
        saveTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        updateTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        deleteTransaction={async () => ({ ok: true, value: undefined })}
        signOut={idleActions.signOut}
      />,
    );

    const list = screen.getByRole("region", { name: "明細" });
    expect(within(list).getByText("支出")).toBeInTheDocument();
    expect(within(list).getByText("昼食")).toBeInTheDocument();
    expect(within(list).getByText("2026-09-04")).toBeInTheDocument();
    expect(within(list).getByText(formatYen(1200))).toBeInTheDocument();
  });

  it("対象月の前後へ切り替えるリンクがある", () => {
    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 0, netYen: 0 }}
        items={[]}
        saveTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        updateTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        deleteTransaction={async () => ({ ok: true, value: undefined })}
        signOut={idleActions.signOut}
      />,
    );

    expect(screen.getByRole("link", { name: "前の月" })).toHaveAttribute(
      "href",
      "/?month=2026-08",
    );
    expect(screen.getByRole("link", { name: "次の月" })).toHaveAttribute(
      "href",
      "/?month=2026-10",
    );
    expect(screen.getByText("2026-09")).toBeInTheDocument();
  });
});

describe("TransactionForm", () => {
  it("ラベルがあり検証失敗は入力近くに出す", async () => {
    const user = userEvent.setup();
    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 0, netYen: 0 }}
        items={[]}
        saveTransaction={async () => ({
          ok: false,
          error: {
            kind: "validation",
            fields: { amountYen: "1円以上の整数を入力してください" },
          },
        })}
        updateTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        deleteTransaction={async () => ({ ok: true, value: undefined })}
        signOut={idleActions.signOut}
      />,
    );

    expect(screen.getByLabelText("種別")).toBeInTheDocument();
    expect(screen.getByLabelText("金額")).toBeInTheDocument();
    expect(screen.getByLabelText("発生日")).toBeInTheDocument();
    expect(screen.getByLabelText("メモ")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "記録を追加" }));
    expect(
      await screen.findByText("1円以上の整数を入力してください"),
    ).toBeInTheDocument();
  });

  it("保存中は同じ保存を受け付けない", async () => {
    const user = userEvent.setup();
    let finish: (value: { ok: true; value: { id: string } }) => void = () => {};
    const saveTransaction = vi.fn(
      () =>
        new Promise<{ ok: true; value: { id: string } }>((resolve) => {
          finish = resolve;
        }),
    );

    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 0, netYen: 0 }}
        items={[]}
        saveTransaction={saveTransaction}
        updateTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        deleteTransaction={async () => ({ ok: true, value: undefined })}
        signOut={idleActions.signOut}
      />,
    );

    await user.selectOptions(screen.getByLabelText("種別"), "expense");
    await user.clear(screen.getByLabelText("金額"));
    await user.type(screen.getByLabelText("金額"), "500");
    await user.click(screen.getByRole("button", { name: "記録を追加" }));

    expect(screen.getByRole("button", { name: "記録を追加" })).toBeDisabled();
    finish({ ok: true, value: { id: "tx-new" } });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "記録を追加" })).toBeEnabled();
    });
    expect(refresh).toHaveBeenCalled();
  });
});

describe("記録の修正と削除", () => {
  it("確認しない削除では記録を消さない", async () => {
    const user = userEvent.setup();
    const deleteTransaction = vi.fn(async () => ({
      ok: true as const,
      value: undefined,
    }));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 1200, netYen: -1200 }}
        items={[item]}
        saveTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        updateTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        deleteTransaction={deleteTransaction}
        signOut={idleActions.signOut}
      />,
    );

    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(confirm).toHaveBeenCalled();
    expect(deleteTransaction).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(deleteTransaction).toHaveBeenCalledWith("tx-1", true);
    confirm.mockRestore();
  });

  it("編集保存で更新を送る", async () => {
    const user = userEvent.setup();
    const updateTransaction = vi.fn(async () => ({
      ok: true as const,
      value: { id: "tx-1" },
    }));

    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 1200, netYen: -1200 }}
        items={[item]}
        saveTransaction={async () => ({ ok: true, value: { id: "tx-1" } })}
        updateTransaction={updateTransaction}
        deleteTransaction={async () => ({ ok: true, value: undefined })}
        signOut={idleActions.signOut}
      />,
    );

    await user.click(screen.getByRole("button", { name: "編集" }));
    const editForm = screen.getByRole("form", { name: "記録を編集" });
    await user.clear(within(editForm).getByLabelText("メモ"));
    await user.type(within(editForm).getByLabelText("メモ"), "夕食");
    await user.click(within(editForm).getByRole("button", { name: "変更を保存" }));

    expect(updateTransaction).toHaveBeenCalledWith(
      "tx-1",
      expect.objectContaining({ memo: "夕食", amountYen: 1200, type: "expense" }),
    );
  });
});

describe("失敗表示とログアウト", () => {
  it("取得失敗でもフォームを残し0円実績や空の誘導にすり替えない", () => {
    render(
      <LedgerHome
        monthId="2026-09"
        summary={null}
        items={[]}
        loadError="記録を取得できませんでした"
        {...idleActions}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "記録を取得できませんでした",
    );
    expect(screen.getByRole("form", { name: "記録を追加" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "月次要約" })).toBeInTheDocument();
    expect(screen.queryByText("この月の記録はまだありません")).toBeNull();
    expect(screen.queryByText(formatYen(0))).toBeNull();
  });

  it("保存失敗でも既存の明細と要約を残す", async () => {
    const user = userEvent.setup();
    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 1200, netYen: -1200 }}
        items={[item]}
        saveTransaction={async () => ({
          ok: false,
          error: { kind: "unavailable", message: "記録を保存できませんでした" },
        })}
        updateTransaction={idleActions.updateTransaction}
        deleteTransaction={idleActions.deleteTransaction}
        signOut={idleActions.signOut}
      />,
    );

    await user.click(screen.getByRole("button", { name: "記録を追加" }));
    expect(
      await screen.findByText("記録を保存できませんでした"),
    ).toBeInTheDocument();
    expect(screen.getByText("昼食")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "月次要約" })).getByText(
        formatYen(1200),
      ),
    ).toBeInTheDocument();
  });

  it("ログアウト操作を家計画面から使える", async () => {
    const user = userEvent.setup();
    const signOut = vi.fn(async () => ({
      ok: true as const,
      value: { redirectTo: "/login" as const },
    }));

    render(
      <LedgerHome
        monthId="2026-09"
        summary={{ incomeTotalYen: 0, expenseTotalYen: 0, netYen: 0 }}
        items={[]}
        saveTransaction={idleActions.saveTransaction}
        updateTransaction={idleActions.updateTransaction}
        deleteTransaction={idleActions.deleteTransaction}
        signOut={signOut}
      />,
    );

    await user.click(screen.getByRole("button", { name: "ログアウト" }));
    expect(signOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/login");
    });
  });
});
