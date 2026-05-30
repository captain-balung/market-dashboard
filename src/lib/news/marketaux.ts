/**
 * Marketaux 國際/總經新聞 — F-09 (Phase 2.A.3)。
 *
 * 兩組關鍵字打兩次：geo（地緣政治）與 macro（總經）。
 * 標準化成 NewsItem 並標 category。
 */

import type { NewsItem, NewsCategory } from "./types.ts";

export type MarketauxArticle = {
  title?: string;
  url?: string;
  published_at?: string;
  source?: string;
  description?: string;
};

export type MarketauxResponse = {
  data?: MarketauxArticle[];
};

const GEO_KEYWORDS = "geopolitics OR ukraine OR israel OR taiwan OR china+sanction";
const MACRO_KEYWORDS = "fed OR inflation OR cpi OR interest+rate OR recession";

export function parseMarketauxResponse(
  json: MarketauxResponse,
  category: NewsCategory,
): NewsItem[] {
  const out: NewsItem[] = [];
  for (const a of json.data ?? []) {
    if (!a.title || !a.url || !a.published_at) continue;
    out.push({
      title: a.title,
      url: a.url,
      publishedAt: a.published_at,
      source: a.source ?? "Marketaux",
      category,
      excerpt: a.description,
    });
  }
  return out;
}

async function fetchOnce(search: string, category: NewsCategory): Promise<NewsItem[]> {
  const token = process.env.MARKETAUX_API_KEY;
  if (!token) throw new Error("MARKETAUX_API_KEY missing");
  const params = new URLSearchParams({
    search,
    language: "en",
    limit: "20",
    api_token: token,
  });
  const res = await fetch(`https://api.marketaux.com/v1/news/all?${params.toString()}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`Marketaux ${res.status} ${res.statusText}`);
  return parseMarketauxResponse((await res.json()) as MarketauxResponse, category);
}

export async function fetchMarketauxNews(): Promise<NewsItem[]> {
  const out: NewsItem[] = [];
  try {
    out.push(...(await fetchOnce(GEO_KEYWORDS, "geo")));
  } catch {
    // geo 失效不致命，繼續 macro
  }
  try {
    out.push(...(await fetchOnce(MACRO_KEYWORDS, "macro")));
  } catch {
    // macro 失效不致命
  }
  return out;
}
