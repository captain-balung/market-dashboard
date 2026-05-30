/**
 * CryptoPanic 新聞抓取 — F-07 (Phase 2.A.1)。
 *
 * 同時涵蓋加密與貴金屬（PAXG/KAG 屬 CryptoPanic 的 metals 標籤）。
 * 取最近 24 小時的 hot/trending 新聞，標準化成 NewsItem。
 */

import type { NewsItem, NewsCategory } from "./types.ts";

export type CryptoPanicPost = {
  title: string;
  url: string;
  published_at: string;
  source?: { title?: string; domain?: string };
  currencies?: { code?: string }[];
};

export type CryptoPanicResponse = {
  results?: CryptoPanicPost[];
};

const METAL_CODES = new Set(["PAXG", "XAU", "XAG", "KAG", "GOLD", "SILVER"]);

export function parseCryptoPanicResponse(json: CryptoPanicResponse): NewsItem[] {
  const out: NewsItem[] = [];
  for (const p of json.results ?? []) {
    if (!p.title || !p.url || !p.published_at) continue;
    const isMetal = (p.currencies ?? []).some((c) => c.code && METAL_CODES.has(c.code));
    const category: NewsCategory = isMetal ? "metal" : "crypto";
    out.push({
      title: p.title,
      url: p.url,
      publishedAt: p.published_at,
      source: p.source?.title ?? p.source?.domain ?? "CryptoPanic",
      category,
    });
  }
  return out;
}

export async function fetchCryptoPanicNews(): Promise<NewsItem[]> {
  const token = process.env.CRYPTOPANIC_API_KEY;
  if (!token) throw new Error("CRYPTOPANIC_API_KEY missing");
  const url = `https://cryptopanic.com/api/v1/posts/?auth_token=${token}&filter=hot&public=true&kind=news`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`CryptoPanic ${res.status} ${res.statusText}`);
  return parseCryptoPanicResponse((await res.json()) as CryptoPanicResponse);
}
