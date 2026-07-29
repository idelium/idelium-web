import { describe, expect, it, vi } from "vitest";

import { useEnterpriseGridLoader } from "@/composables/useEnterpriseGridLoader";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

describe("enterprise grid loader", () => {
  it("preserves the last authorized dataset after a failed background refresh", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Authorized" }],
        meta: { total: 1 },
      })
      .mockRejectedValueOnce(new Error("Network unavailable"));
    const loader = useEnterpriseGridLoader(load);

    await loader.run({ page: 1 });
    await loader.run({ page: 1 }, { background: true });

    expect(loader.state.rows).toEqual([{ id: 1, name: "Authorized" }]);
    expect(loader.state.stale).toBe(true);
    expect(loader.state.error).toBeInstanceOf(Error);
  });

  it("clears cached rows on permission denial", async () => {
    const forbidden = Object.assign(new Error("Forbidden"), {
      response: { status: 403 },
    });
    const load = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ id: 1 }], meta: {} })
      .mockRejectedValueOnce(forbidden);
    const loader = useEnterpriseGridLoader(load);

    await loader.run({});
    await loader.run({}, { background: true });

    expect(loader.state.permissionDenied).toBe(true);
    expect(loader.state.rows).toEqual([]);
    expect(loader.state.stale).toBe(false);
  });

  it("cancels superseded requests and ignores stale responses", async () => {
    const first = deferred();
    const second = deferred();
    const signals = [];
    const load = vi.fn((query, { signal }) => {
      signals.push(signal);
      return query.search === "first" ? first.promise : second.promise;
    });
    const loader = useEnterpriseGridLoader(load);

    const firstRun = loader.run({ search: "first" });
    const secondRun = loader.run({ search: "second" });
    second.resolve({ rows: [{ id: 2 }], meta: { total: 1 } });
    await secondRun;
    first.resolve({ rows: [{ id: 1 }], meta: { total: 1 } });
    await firstRun;

    expect(signals[0].aborted).toBe(true);
    expect(loader.state.rows).toEqual([{ id: 2 }]);
  });

  it("aborts and clears state on context reset", async () => {
    const request = deferred();
    let signal;
    const loader = useEnterpriseGridLoader((query, options) => {
      signal = options.signal;
      return request.promise;
    });

    const run = loader.run({});
    loader.reset();
    request.resolve({ rows: [{ id: 1 }], meta: {} });
    await run;

    expect(signal.aborted).toBe(true);
    expect(loader.state.rows).toEqual([]);
    expect(loader.state.loading).toBe(false);
  });
});
