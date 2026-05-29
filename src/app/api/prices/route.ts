import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { fetchCoingeckoPrices } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

/**
 * GET /api/prices
 *
 * Phase 0 MVP：讀 watchlist 啟用標的，加密類丟給 CoinGecko 取現價。
 * 美股 + 9:00 定格漲跌 之後 Phase 1 才補。
 *
 * 容錯設計（spec.md 工程紅線 4）：個別資料源失效不拖垮全頁，price 欄位回 null。
 */
export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: watchlist, error: dbError } = await supabase
    .from("watchlist")
    .select("symbol, category, tv_symbol")
    .eq("active", true);

  if (dbError) {
    return NextResponse.json(
      { status: "error", source: "supabase", message: dbError.message },
      { status: 500 },
    );
  }

  const cryptoSymbols = (watchlist ?? [])
    .filter((w) => w.category === "crypto" || w.category === "metal")
    .map((w) => w.symbol);

  let priceMap: Record<string, number> = {};
  let priceError: string | null = null;
  try {
    priceMap = await fetchCoingeckoPrices(cryptoSymbols);
  } catch (e) {
    priceError = e instanceof Error ? e.message : "unknown error";
  }

  return NextResponse.json({
    status: priceError ? "partial" : "ok",
    prices: (watchlist ?? []).map((w) => ({
      symbol: w.symbol,
      category: w.category,
      price: priceMap[w.symbol] ?? null,
    })),
    ...(priceError ? { warnings: { coingecko: priceError } } : {}),
  });
}
