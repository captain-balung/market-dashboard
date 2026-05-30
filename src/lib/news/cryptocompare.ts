/**
 * CryptoCompare News — F-07 替代源（CryptoPanic 改付費後）。
 *
 * 公開 endpoint，不需 API key（基礎使用）。
 * categories tag 含 PAXG/XAU/XAG 等視為 metal，其餘加密類視為 crypto。
 */

import type { NewsItem, NewsCategory } from "./types";

export type CryptoCompareArticle = {
  id?: string | number;
  title?: string;
  url?: string;
  published_on?: number; // unix seconds
  source?: string;
  body?: string;
  categories?: string; // pipe-separated, e.g. "BTC|TRADING"
  tags?: string;
};

export type CryptoCompareResponse = {
  Data?: CryptoCompareArticle[];
};

const METAL_TOKENS = new Set([
  "PAXG",
  "XAU",
  "XAG",
  "GOLD",
  "SILVER",
  "METAL",
  "METALS",
  "KAG",
]);

function isMetal(article: CryptoCompareArticle): boolean {
  const all = `${article.categories ?? ""}|${article.tags ?? ""}`.toUpperCase();
  const parts = all.split(/[|, ]+/).filter(Boolean);
  return parts.some((p) => METAL_TOKENS.has(p));
}

export function parseCryptoCompareResponse(json: CryptoCompareResponse): NewsItem[] {
  const out: NewsItem[] = [];
  for (const a of json.Data ?? []) {
    if (!a.title || !a.url || !a.published_on) continue;
    const category: NewsCategory = isMetal(a) ? "metal" : "crypto";
    out.push({
      title: a.title,
      url: a.url,
      publishedAt: new Date(a.published_on * 1000).toISOString(),
      source: a.source ?? "CryptoCompare",
      category,
      excerpt: a.body?.slice(0, 500),
    });
  }
  return out;
}

export async function fetchCryptoCompareNews(): Promise<NewsItem[]> {
  // 不帶 categories 抓所有；帶 lang=EN
  const url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest";
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`CryptoCompare ${res.status} ${res.statusText}`);
  const json = (await res.json()) as CryptoCompareResponse;
  return parseCryptoCompareResponse(json);
}
