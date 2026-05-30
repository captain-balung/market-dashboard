/**
 * 9:00 定格寫入邏輯 — F-04。
 *
 * 用台北時區計算「今日 09:00」當作 snapshot_at，避免日界線錯位。
 * 抓加密+貴金屬（CoinGecko）+ 美股（Finnhub）目前現價，當作 09:00 定格寫入。
 * Phase 1 階段由排程或手動 endpoint 觸發；Phase 2 接 Vercel Cron。
 */

import { getSupabaseServerClient } from "./supabase-server";
import { fetchCoingeckoPrices } from "./coingecko";
import { fetchFinnhubStockPrices } from "./finnhub";

/** 取台北今日 09:00 對應的 UTC Date 物件。 */
export function getTaipei9amUtc(now: Date = new Date()): Date {
  const taipeiOffsetMs = 8 * 60 * 60 * 1000;
  const taipeiNow = new Date(now.getTime() + taipeiOffsetMs);
  const y = taipeiNow.getUTCFullYear();
  const m = taipeiNow.getUTCMonth();
  const d = taipeiNow.getUTCDate();
  return new Date(Date.UTC(y, m, d, 9 - 8, 0, 0));
}

export type SnapshotResult = {
  inserted: number;
  failed: { symbol: string; reason: string }[];
  snapshotAt: string;
};

export async function writeNineAmSnapshot(): Promise<SnapshotResult> {
  const supabase = getSupabaseServerClient();
  const { data: watchlist, error: dbError } = await supabase
    .from("watchlist")
    .select("symbol, category")
    .eq("active", true);
  if (dbError) throw new Error(`watchlist read: ${dbError.message}`);

  const cryptoSymbols = (watchlist ?? [])
    .filter((w) => w.category === "crypto" || w.category === "metal")
    .map((w) => w.symbol);
  const stockSymbols = (watchlist ?? []).filter((w) => w.category === "stock").map((w) => w.symbol);

  const failed: { symbol: string; reason: string }[] = [];

  const cryptoPrices = await fetchCoingeckoPrices(cryptoSymbols).catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : "unknown";
    for (const s of cryptoSymbols) failed.push({ symbol: s, reason: `coingecko: ${msg}` });
    return {} as Record<string, number>;
  });

  const stockPrices = await fetchFinnhubStockPrices(stockSymbols).catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : "unknown";
    for (const s of stockSymbols) failed.push({ symbol: s, reason: `finnhub: ${msg}` });
    return [] as Awaited<ReturnType<typeof fetchFinnhubStockPrices>>;
  });

  const snapshotAt = getTaipei9amUtc().toISOString();
  type Row = { symbol: string; price_usd: number; snapshot_at: string; source: string };
  const rows: Row[] = [];

  for (const sym of Object.keys(cryptoPrices)) {
    rows.push({
      symbol: sym,
      price_usd: cryptoPrices[sym],
      snapshot_at: snapshotAt,
      source: "coingecko",
    });
  }
  for (const p of stockPrices) {
    if (p.price == null) {
      failed.push({ symbol: p.symbol, reason: "market closed or no quote" });
      continue;
    }
    rows.push({
      symbol: p.symbol,
      price_usd: p.price,
      snapshot_at: snapshotAt,
      source: "finnhub",
    });
  }

  if (rows.length === 0) return { inserted: 0, failed, snapshotAt };

  const { error: insertError } = await supabase
    .from("price_snapshot")
    .upsert(rows, { onConflict: "symbol,snapshot_at" });
  if (insertError) throw new Error(`snapshot upsert: ${insertError.message}`);

  return { inserted: rows.length, failed, snapshotAt };
}
