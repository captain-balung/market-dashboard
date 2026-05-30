import Link from "next/link";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { fetchCoingeckoPrices } from "@/lib/coingecko";
import { fetchFinnhubStockPrices } from "@/lib/finnhub";
import { calcChangePct } from "@/lib/changePct";
import { getTaipei9amUtc } from "@/lib/snapshot";
import { AutoRefresh } from "@/components/AutoRefresh";
import { PriceWall, type PriceCard } from "@/components/PriceWall";
import { DigestSection } from "@/components/DigestSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { THEME_COOKIE, DEFAULT_THEME, isValidTheme } from "@/lib/theme";
import type { DigestItem } from "@/lib/digest";
import type { NewsCategory } from "@/lib/news/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const themeRaw = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isValidTheme(themeRaw) ? themeRaw : DEFAULT_THEME;

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
  const stockSymbols = (watchlist ?? [])
    .filter((w) => w.category === "stock")
    .map((w) => w.symbol);

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

  const cards: PriceCard[] = (watchlist ?? []).map((w) => {
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
    const change = calcChangePct(snap.today, snap.yesterday, marketClosed && w.category === "stock");
    return { symbol: w.symbol, category: w.category, price, change, marketClosed };
  });

  // digest
  const { data: digestRow } = await supabase
    .from("daily_digest")
    .select("date, payload")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  const digestDate: string | null = digestRow?.date ?? null;
  const digestCategories: Partial<Record<NewsCategory, DigestItem[]>> =
    (digestRow?.payload as Partial<Record<NewsCategory, DigestItem[]>>) ?? {};

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6">
      <AutoRefresh />

      <header className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Market Dashboard</h1>
          <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
            現價每 15 分更新 · 漲跌% 為台北 09:00 定格 · 摘要每日 09:00 生成
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/weekly"
            className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted)] hover:bg-[var(--color-surface)]"
          >
            本週重點
          </Link>
          <ThemeToggle initial={theme} />
        </div>
      </header>

      {dbError ? (
        <div className="rounded border border-red-900 bg-red-950/30 p-4 text-sm text-red-200">
          Supabase 讀取失敗：{dbError.message}
        </div>
      ) : (
        <div className="space-y-6">
          <PriceWall cards={cards} />
          <DigestSection digestDate={digestDate} categories={digestCategories} />
        </div>
      )}

      {warnings.length > 0 ? (
        <ul className="mt-4 space-y-0.5 text-[11px] text-amber-500">
          {warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
