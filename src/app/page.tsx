import { getSupabaseServerClient } from "@/lib/supabase-server";
import { fetchCoingeckoPrices } from "@/lib/coingecko";
import { fetchFinnhubStockPrices } from "@/lib/finnhub";
import { calcChangePct, type ChangeValue } from "@/lib/changePct";
import { getTaipei9amUtc } from "@/lib/snapshot";
import { AutoRefresh } from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

type Card = {
  symbol: string;
  category: string;
  price: number | null;
  change: ChangeValue;
  marketClosed: boolean;
};

function formatPrice(price: number | null): string {
  if (price == null) return "—";
  const digits = price < 1 ? 4 : 2;
  return `$${price.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
}

function formatChange(c: ChangeValue): { text: string; tone: "up" | "down" | "flat" | "muted" } {
  if (c.kind === "closed") return { text: "休市", tone: "muted" };
  if (c.kind === "unavailable") return { text: "—", tone: "muted" };
  const pct = c.value * 100;
  const sign = pct > 0 ? "+" : "";
  const tone = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  return { text: `${sign}${pct.toFixed(2)}%`, tone };
}

const TONE_CLASS: Record<"up" | "down" | "flat" | "muted", string> = {
  up: "text-emerald-400",
  down: "text-rose-400",
  flat: "text-zinc-400",
  muted: "text-zinc-500",
};

const CATEGORY_LABEL: Record<string, string> = {
  crypto: "加密",
  metal: "貴金屬",
  stock: "美股",
};

export default async function Home() {
  const supabase = getSupabaseServerClient();
  const { data: watchlist, error: dbError } = await supabase
    .from("watchlist")
    .select("symbol, category, tv_symbol")
    .eq("active", true)
    .order("category")
    .order("symbol");

  const cryptoSymbols = (watchlist ?? [])
    .filter((w) => w.category === "crypto" || w.category === "metal")
    .map((w) => w.symbol);
  const stockSymbols = (watchlist ?? []).filter((w) => w.category === "stock").map((w) => w.symbol);

  const warnings: string[] = [];
  const cryptoPrices = await fetchCoingeckoPrices(cryptoSymbols).catch((e: unknown) => {
    warnings.push(`CoinGecko: ${e instanceof Error ? e.message : "unknown"}`);
    return {} as Record<string, number>;
  });
  const stockPrices = await fetchFinnhubStockPrices(stockSymbols).catch((e: unknown) => {
    warnings.push(`Finnhub: ${e instanceof Error ? e.message : "unknown"}`);
    return [] as Awaited<ReturnType<typeof fetchFinnhubStockPrices>>;
  });
  const stockMap = new Map(stockPrices.map((p) => [p.symbol, p]));

  const todayAt = getTaipei9amUtc();
  const yesterdayAt = new Date(todayAt.getTime() - 24 * 60 * 60 * 1000);
  const { data: snapshots } = await supabase
    .from("price_snapshot")
    .select("symbol, price_usd, snapshot_at")
    .in("snapshot_at", [todayAt.toISOString(), yesterdayAt.toISOString()]);
  const todayKey = todayAt.toISOString();
  const yesterdayKey = yesterdayAt.toISOString();
  const snapMap = new Map<string, { today?: number; yesterday?: number }>();
  for (const s of snapshots ?? []) {
    const e = snapMap.get(s.symbol) ?? {};
    const ts = new Date(s.snapshot_at).toISOString();
    if (ts === todayKey) e.today = Number(s.price_usd);
    else if (ts === yesterdayKey) e.yesterday = Number(s.price_usd);
    snapMap.set(s.symbol, e);
  }

  const cards: Card[] = (watchlist ?? []).map((w) => {
    let price: number | null = null;
    let marketClosed = false;
    if (w.category === "crypto" || w.category === "metal") {
      price = cryptoPrices[w.symbol] ?? null;
    } else if (w.category === "stock") {
      const sp = stockMap.get(w.symbol);
      price = sp?.price ?? null;
      marketClosed = sp?.marketClosed ?? false;
    }
    const snap = snapMap.get(w.symbol) ?? {};
    const change = calcChangePct(
      snap.today,
      snap.yesterday,
      marketClosed && w.category === "stock",
    );
    return { symbol: w.symbol, category: w.category, price, change, marketClosed };
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <AutoRefresh />

      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Market Dashboard</h1>
          <p className="mt-1 text-xs text-zinc-500">
            現價每 15 分更新 / 漲跌% 為 09:00 定格 — Phase 1 MVP，Phase 3 換完整版面
          </p>
        </div>
      </header>

      {dbError ? (
        <div className="rounded border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
          Supabase 讀取失敗：{dbError.message}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cards.map((c) => {
            const ch = formatChange(c.change);
            return (
              <div key={c.symbol} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-medium">{c.symbol}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    {CATEGORY_LABEL[c.category] ?? c.category}
                  </div>
                </div>
                <div className="mt-2 font-mono text-lg tabular-nums">{formatPrice(c.price)}</div>
                <div className={`mt-1 text-xs tabular-nums ${TONE_CLASS[ch.tone]}`}>{ch.text}</div>
              </div>
            );
          })}
        </div>
      )}

      {warnings.length > 0 ? (
        <ul className="mt-6 space-y-1 text-xs text-amber-400">
          {warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
