/**
 * CoinGecko 現價抓取 (server-only)。
 *
 * watchlist 表的 symbol 用大寫（BTC、ETH）、CoinGecko API 用 ID 字串（bitcoin、ethereum），
 * 此處用一個小 mapping 轉換。Phase 1 之後若 mapping 變大會移到 watchlist 表的欄位。
 */

const SYMBOL_TO_CG_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
  PAXG: "pax-gold",
  KAG: "kinesis-silver",
};

export type CoingeckoPriceMap = Record<string, number>;

export async function fetchCoingeckoPrices(symbols: string[]): Promise<CoingeckoPriceMap> {
  const ids = symbols.map((s) => SYMBOL_TO_CG_ID[s]).filter((x): x is string => Boolean(x));
  if (ids.length === 0) return {};

  const apiKey = process.env.COINGECKO_API_KEY;
  const base = "https://api.coingecko.com/api/v3/simple/price";
  const params = new URLSearchParams({ ids: ids.join(","), vs_currencies: "usd" });
  if (apiKey) params.set("x_cg_demo_api_key", apiKey);

  const res = await fetch(`${base}?${params.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as Record<string, { usd?: number }>;
  const result: CoingeckoPriceMap = {};
  for (const [symbol, cgId] of Object.entries(SYMBOL_TO_CG_ID)) {
    const price = json[cgId]?.usd;
    if (typeof price === "number") result[symbol] = price;
  }
  return result;
}
