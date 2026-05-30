/**
 * Finnhub 美股新聞 — F-08 (Phase 2.A.2)。
 *
 * 同時取每家美股七雄的 company-news 與大盤 general news，合併並標準化。
 * 去重（同 url 只留一筆）以免不同來源回相同新聞。
 */

import type { NewsItem } from "./types";

export type FinnhubNewsItem = {
  headline?: string;
  url?: string;
  datetime?: number; // unix seconds
  source?: string;
  summary?: string;
};

const STOCK_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA"];

export function parseFinnhubNews(items: FinnhubNewsItem[]): NewsItem[] {
  const out: NewsItem[] = [];
  for (const i of items) {
    if (!i.headline || !i.url || !i.datetime) continue;
    out.push({
      title: i.headline,
      url: i.url,
      publishedAt: new Date(i.datetime * 1000).toISOString(),
      source: i.source ?? "Finnhub",
      category: "stock",
      excerpt: i.summary,
    });
  }
  return out;
}

export function dedupeByUrl(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const i of items) {
    if (seen.has(i.url)) continue;
    seen.add(i.url);
    out.push(i);
  }
  return out;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchFinnhubStockNews(): Promise<NewsItem[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error("FINNHUB_API_KEY missing");

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 36 * 60 * 60 * 1000); // 留 36h 容錯週末
  const from = isoDate(oneDayAgo);
  const to = isoDate(now);

  const all: NewsItem[] = [];

  // 大盤
  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${token}`, {
      next: { revalidate: 600 },
    });
    if (res.ok) {
      const arr = (await res.json()) as FinnhubNewsItem[];
      all.push(...parseFinnhubNews(arr));
    }
  } catch {
    // 大盤失效不致命，繼續個股
  }

  // 七雄
  for (const symbol of STOCK_SYMBOLS) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${token}`,
        { next: { revalidate: 600 } },
      );
      if (!res.ok) continue;
      const arr = (await res.json()) as FinnhubNewsItem[];
      all.push(...parseFinnhubNews(arr));
    } catch {
      // 個股失效不致命
    }
  }

  return dedupeByUrl(all);
}
