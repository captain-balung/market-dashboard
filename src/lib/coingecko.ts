/**
 * CoinGecko 現價抓取 (server-only) — F-02。
 *
 * watchlist symbol（大寫） ↔ CoinGecko id 對照表。KAG 用 Kinesis Silver token。
 */

export const COINGECKO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
  PAXG: "pax-gold",
  KAG: "kinesis-silver",
};

export type CoingeckoResponse = Record<string, { usd?: number }>;
export type PriceMap = Record<string, number>;

export function parseCoingeckoResponse(json: CoingeckoResponse): PriceMap {
  const result: PriceMap = {};
  for (const [symbol, cgId] of Object.entries(COINGECKO_ID_MAP)) {
    const price = json[cgId]?.usd;
    if (typeof price === "number") result[symbol] = price;
  }
  return result;
}

export async function fetchCoingeckoPrices(symbols: string[]): Promise<PriceMap> {
  const ids = symbols.map((s) => COINGECKO_ID_MAP[s]).filter((x): x is string => Boolean(x));
  if (ids.length === 0) return {};

  const apiKey = process.env.COINGECKO_API_KEY;
  const params = new URLSearchParams({ ids: ids.join(","), vs_currencies: "usd" });
  if (apiKey) params.set("x_cg_demo_api_key", apiKey);

  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?${params.toString()}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`CoinGecko ${res.status} ${res.statusText}`);
  }
  return parseCoingeckoResponse((await res.json()) as CoingeckoResponse);
}
