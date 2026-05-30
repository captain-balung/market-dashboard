"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type WatchlistRow = {
  symbol: string;
  category: string;
  tv_symbol: string | null;
  has_chart: boolean;
  active: boolean;
};

export function AdminWatchlistEditor({ rows }: { rows: WatchlistRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    symbol: "",
    category: "crypto",
    tv_symbol: "",
    has_chart: true,
  });

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/watchlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        symbol: form.symbol,
        category: form.category,
        tv_symbol: form.tv_symbol || null,
        has_chart: form.has_chart,
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setError(j.message ?? `HTTP ${res.status}`);
      return;
    }
    setForm({ symbol: "", category: "crypto", tv_symbol: "", has_chart: true });
    startTransition(() => router.refresh());
  }

  async function toggle(symbol: string, active: boolean) {
    setError(null);
    const res = await fetch("/api/admin/watchlist", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ symbol, active }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setError(j.message ?? `HTTP ${res.status}`);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={add}
        className="space-y-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      >
        <h2 className="text-sm font-medium">新增標的</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Symbol (BTC)"
            required
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          >
            <option value="crypto">加密</option>
            <option value="metal">貴金屬</option>
            <option value="stock">美股</option>
          </select>
          <input
            placeholder="TV symbol (BINANCE:BTCUSDT)"
            value={form.tv_symbol}
            onChange={(e) => setForm({ ...form, tv_symbol: e.target.value })}
            className="col-span-2 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.has_chart}
            onChange={(e) => setForm({ ...form, has_chart: e.target.checked })}
          />
          有 K 線圖
        </label>
        {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-emerald-600 px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          新增
        </button>
      </form>

      <section>
        <h2 className="mb-2 text-sm font-medium">現有標的 ({rows.length})</h2>
        <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)] bg-[var(--color-surface)]">
          {rows.map((r) => (
            <li key={r.symbol} className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${r.active ? "" : "text-zinc-500 line-through"}`}
                >
                  {r.symbol}
                </span>
                <span className="text-[10px] uppercase text-[var(--color-muted)]">
                  {r.category}
                </span>
                <span className="text-[10px] text-[var(--color-muted)]">{r.tv_symbol ?? "—"}</span>
              </div>
              <button
                type="button"
                onClick={() => toggle(r.symbol, !r.active)}
                disabled={pending}
                className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs hover:bg-zinc-800/50"
              >
                {r.active ? "停用" : "啟用"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
