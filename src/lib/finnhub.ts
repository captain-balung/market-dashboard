/**
 * Finnhub 美股現價 + 市場狀態 — F-03。
 *
 * 美股七雄：AAPL / MSFT / GOOGL / AMZN / META / NVDA / TSLA
 *
 * Finnhub /quote 端點回 { c: current, pc: previous close, t: timestamp }。
 * t === 0 視為「沒交易資料」（休市或限流 fallback）。
 * 市場狀態額外靠 /stock/market-status?exchange=US 判斷盤中/休市。
 */

export type FinnhubQuote = {
  c: number; // current price
  pc: number; // previous close
  t: number; // unix seconds; 0 表示無資料
};

export type StockPrice = {
  symbol: string;
  price: number | null; // 休市時為 null
  marketClosed: boolean;
};

export function parseFinnhubQuote(
  symbol: string,
  q: FinnhubQuote,
  marketClosed: boolean,
): StockPrice {
  if (!q || q.t === 0 || !Number.isFinite(q.c) || q.c === 0) {
    return { symbol, price: null, marketClosed: true };
  }
  return { symbol, price: q.c, marketClosed };
}

async function fetchFinnhubMarketStatus(): Promise<boolean> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error("FINNHUB_API_KEY missing");
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${apiKey}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) {
    // 市場狀態查不到不致命，沿用「假設盤中」由 quote 判斷
    return false;
  }
  const json = (await res.json()) as { isOpen?: boolean };
  return json.isOpen === false;
}

export async function fetchFinnhubStockPrices(symbols: string[]): Promise<StockPrice[]> {
  if (symbols.length === 0) return [];
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error("FINNHUB_API_KEY missing");

  const marketClosed = await fetchFinnhubMarketStatus().catch(() => false);

  // 不平行打太兇避免免費 quota；單一執行緒序列 + revalidate cache
  const results: StockPrice[] = [];
  for (const symbol of symbols) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
        { next: { revalidate: 60 } },
      );
      if (!res.ok) {
        results.push({ symbol, price: null, marketClosed: true });
        continue;
      }
      const q = (await res.json()) as FinnhubQuote;
      results.push(parseFinnhubQuote(symbol, q, marketClosed));
    } catch {
      results.push({ symbol, price: null, marketClosed: true });
    }
  }
  return results;
}
