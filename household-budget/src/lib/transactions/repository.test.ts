import { describe, expect, it } from "vitest";
import {
  getById,
  insert,
  listByMonth,
  remove,
  update,
} from "./repository";

type QueryResult = { data: unknown; error: { message: string } | null };

class FakeQuery implements PromiseLike<QueryResult> {
  readonly ops: string[] = [];
  lastPayload: unknown;
  private readonly result: QueryResult;

  constructor(result: QueryResult) {
    this.result = result;
  }

  select(columns?: string) {
    this.ops.push(`select:${columns ?? "*"}`);
    return this;
  }

  insert(payload: unknown) {
    this.ops.push("insert");
    this.lastPayload = payload;
    return this;
  }

  update(payload: unknown) {
    this.ops.push("update");
    this.lastPayload = payload;
    return this;
  }

  delete() {
    this.ops.push("delete");
    return this;
  }

  eq(column: string, value: unknown) {
    this.ops.push(`eq:${column}=${String(value)}`);
    return this;
  }

  gte(column: string, value: unknown) {
    this.ops.push(`gte:${column}=${String(value)}`);
    return this;
  }

  lt(column: string, value: unknown) {
    this.ops.push(`lt:${column}=${String(value)}`);
    return this;
  }

  order(column: string) {
    this.ops.push(`order:${column}`);
    return this;
  }

  maybeSingle() {
    this.ops.push("maybeSingle");
    return Promise.resolve(this.result);
  }

  single() {
    this.ops.push("single");
    return Promise.resolve(this.result);
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

function client(query: FakeQuery) {
  return {
    from(table: string) {
      query.ops.push(`from:${table}`);
      return query;
    },
  };
}

const row = {
  id: "tx-1",
  user_id: "user-1",
  type: "expense" as const,
  amount: 1200,
  occurred_on: "2026-09-04",
  memo: "昼食",
};

describe("listByMonth", () => {
  it("発生日列で月の半開区間を問い合わせカテゴリは参照しない", async () => {
    const query = new FakeQuery({ data: [row], error: null });
    const result = await listByMonth(client(query), "user-1", "2026-09");

    expect(query.ops.join(" ")).toContain("from:transactions");
    expect(query.ops.join(" ")).toContain("gte:occurred_on=2026-09-01");
    expect(query.ops.join(" ")).toContain("lt:occurred_on=2026-10-01");
    expect(query.ops.join(" ")).not.toContain("category");
    expect(result).toEqual({
      ok: true,
      value: [
        {
          id: "tx-1",
          userId: "user-1",
          type: "expense",
          amountYen: 1200,
          occurredOn: "2026-09-04",
          memo: "昼食",
        },
      ],
    });
  });
});

describe("insert", () => {
  it("所有者は引数の利用者で付け共有用の列を送らない", async () => {
    const query = new FakeQuery({ data: row, error: null });
    const result = await insert(client(query), "user-1", {
      type: "expense",
      amountYen: 1200,
      occurredOn: "2026-09-04",
      memo: "昼食",
    });

    expect(query.lastPayload).toEqual({
      user_id: "user-1",
      type: "expense",
      amount: 1200,
      occurred_on: "2026-09-04",
      memo: "昼食",
    });
    expect(query.lastPayload).not.toHaveProperty("category_id");
    expect(query.lastPayload).not.toHaveProperty("shared_with");
    expect(result.ok).toBe(true);
  });
});

describe("update / remove", () => {
  it("見えない行の更新はなかったことになる", async () => {
    const query = new FakeQuery({ data: null, error: null });
    const result = await update(client(query), "user-1", "missing", {
      type: "expense",
      amountYen: 1,
      occurredOn: "2026-09-04",
      memo: null,
    });
    expect(result).toEqual({ ok: false, error: { kind: "notFound" } });
  });

  it("取得失敗は unavailable になる", async () => {
    const query = new FakeQuery({
      data: null,
      error: { message: "db down" },
    });
    const result = await getById(client(query), "user-1", "tx-1");
    expect(result).toEqual({
      ok: false,
      error: { kind: "unavailable", message: "記録を取得できませんでした" },
    });
  });

  it("削除は自分の行だけを対象にする", async () => {
    const query = new FakeQuery({ data: row, error: null });
    const result = await remove(client(query), "user-1", "tx-1");
    expect(query.ops.join(" ")).toContain("eq:id=tx-1");
    expect(query.ops.join(" ")).toContain("eq:user_id=user-1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});
