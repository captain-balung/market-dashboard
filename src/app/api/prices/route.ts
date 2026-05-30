import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { fetchCoingeckoPrices } from "@/lib/coingecko";
import { fetchFinnhubStockPrices } from "@/lib/finnhub";
import { calcChangePct, type ChangeValue } from "@/lib/changePct";
import { getTaipei9amUtc } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

type PriceRow = {
  symbol: string;
  category: string;
  tv_symbol: string | null;
  price: number | null;
  change: ChangeValue;
  marketClosed?: boolean;
};

/**
 * GET /api/prices — F-02 / F-03 / F-05 / F-06。
 *
 * 對每個 watchlist 啟用標的：現價 + 9:00 定格漲跌。
 * 美股休市時 marketClosed=true、change={kind:"closed"}。
 * 個別資料源失效不拖垮全頁，price=null/change=unavailable。
 */
export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: watchlist, error: dbError } = await supabase
    .from("watchlist")
    .select("symbol, category, tv_symbol")
    .eq("active", true);

  if (dbError) {
    return NextResponse.json(
      { status: "error", source: "supabase", message: dbError.message, prices: [] },
      { status: 500 },
    );
  }

  const cryptoSymbols = (watchlist ?? [])
    .filter((w) => w.category === "crypto" || w.category === "metal")
    .map((w) => w.symbol);
  const stockSymbols = (watchlist ?? []).filter((w) => w.category === "stock").map((w) => w.symbol);

  const warnings: Record<string, string> = {};

  const cryptoPrices = await fetchCoingeckoPrices(cryptoSymbols).catch((e: unknown) => {
    warnings.coingecko = e instanceof Error ? e.message : "unknown";
    return {} as Record<string, number>;
  });

  const stockPrices = await fetchFinnhubStockPrices(stockSymbols).catch((e: unknown) => {
    warnings.finnhub = e instanceof Error ? e.message : "unknown";
    return [] as Awaited<ReturnType<typeof fetchFinnhubStockPrices>>;
  });

  const stockMap = new Map(stockPrices.map((p) => [p.symbol, p]));

  // 9:00 定格資料：今日 & 昨日 09:00 兩筆 snapshot
  const todayAt = getTaipei9amUtc();
  const yesterdayAt = new Date(todayAt.getTime() - 24 * 60 * 60 * 1000);

  const { data: snapshots, error: snapError } = await supabase
    .from("price_snapshot")
    .select("symbol, price_usd, snapshot_at")
    .in("snapshot_at", [todayAt.toISOString(), yesterdayAt.toISOString()]);
  if (snapError) warnings.snapshot = snapError.message;

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

  const rows: PriceRow[] = (watchlist ?? []).map((w) => {
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
    return {
      symbol: w.symbol,
      category: w.category,
      tv_symbol: w.tv_symbol,
      price,
      change,
      ...(w.category === "stock" ? { marketClosed } : {}),
    };
  });

  return NextResponse.json({
    status: Object.keys(warnings).length ? "partial" : "ok",
    count: rows.length,
    prices: rows,
    ...(Object.keys(warnings).length ? { warnings } : {}),
  });
}
