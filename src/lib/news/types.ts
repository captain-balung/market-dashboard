/**
 * 五類新聞統一型別 (Phase 2.A)。
 *
 * 五類對應 spec F-10：加密 / 貴金屬 / 美股 / 國際形勢 / 總體經濟。
 * 之所以分這五類是因為訊號源不同：加密貴金屬看 CryptoPanic，
 * 美股看 Finnhub，國際/總經看 Marketaux 關鍵字篩選。
 */

export type NewsCategory = "crypto" | "metal" | "stock" | "geo" | "macro";

export type NewsItem = {
  title: string;
  url: string;
  publishedAt: string; // ISO 8601
  source: string;
  category: NewsCategory;
  excerpt?: string;
};
