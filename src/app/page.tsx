import { getSupabaseServerClient } from "@/lib/supabase-server";
import { fetchCoingeckoPrices } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getSupabaseServerClient();
  const { data: watchlist, error: dbError } = await supabase
    .from("watchlist")
    .select("symbol, category, tv_symbol")
    .eq("active", true);

  const symbols = (watchlist ?? [])
    .filter((w) => w.category === "crypto" || w.category === "metal")
    .map((w) => w.symbol);

  let prices: Record<string, number> = {};
  let priceWarning: string | null = null;
  try {
    prices = await fetchCoingeckoPrices(symbols);
  } catch (e) {
    priceWarning = e instanceof Error ? e.message : "unknown error";
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Market Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Phase 0 MVP — 之後 Phase 3 換成完整價格牆 + 新聞區
        </p>
      </header>

      {dbError ? (
        <div className="rounded border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
          Supabase 讀取失敗：{dbError.message}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {(watchlist ?? []).map((w) => {
            const price = prices[w.symbol];
            return (
              <div
                key={w.symbol}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
              >
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {w.category}
                </div>
                <div className="mt-1 text-base font-medium">{w.symbol}</div>
                <div className="mt-3 font-mono text-2xl tabular-nums">
                  {typeof price === "number"
                    ? `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                    : "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {priceWarning ? (
        <p className="mt-6 text-xs text-amber-400">CoinGecko 部分失效：{priceWarning}</p>
      ) : null}
    </main>
  );
}
