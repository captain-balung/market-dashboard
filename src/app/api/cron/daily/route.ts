import { NextResponse } from "next/server";
import { writeNineAmSnapshot } from "@/lib/snapshot";
import { fetchCryptoCompareNews } from "@/lib/news/cryptocompare";
import { fetchFinnhubStockNews } from "@/lib/news/finnhub-news";
import { fetchMarketauxNews } from "@/lib/news/marketaux";
import { summarizeOneCategory, persistDailyDigest, getTaipeiDateString } from "@/lib/digest";
import { runRetentionCleanup } from "@/lib/retention";
import type { DigestItem } from "@/lib/digest";
import type { NewsItem, NewsCategory } from "@/lib/news/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min（Claude 五次 call + 抓新聞）

/**
 * POST /api/cron/daily — F-21。
 *
 * 依序：F-04 9:00 snapshot → F-07/F-08/F-09 三路抓新聞 → F-10 對五類各跑 Claude 繁中摘要 → 寫 daily_digest。
 * 每一步單獨 try/catch，個別失效記入 warnings 不終止全流程（spec 工程紅線 4）。
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 });
  }

  const warnings: Record<string, string> = {};
  const steps: Record<string, unknown> = {};

  // F-04
  try {
    steps.snapshot = await writeNineAmSnapshot();
  } catch (e) {
    warnings.snapshot = e instanceof Error ? e.message : "unknown";
  }

  // F-07/F-08/F-09 平行抓三路
  const [cryptoNews, finnhubNews, marketaux] = await Promise.all([
    fetchCryptoCompareNews().catch((e) => {
      warnings.cryptocompare = e instanceof Error ? e.message : "unknown";
      return [] as NewsItem[];
    }),
    fetchFinnhubStockNews().catch((e) => {
      warnings.finnhubNews = e instanceof Error ? e.message : "unknown";
      return [] as NewsItem[];
    }),
    fetchMarketauxNews().catch((e) => {
      warnings.marketaux = e instanceof Error ? e.message : "unknown";
      return [] as NewsItem[];
    }),
  ]);

  steps.newsCounts = {
    cryptocompare: cryptoNews.length,
    finnhub: finnhubNews.length,
    marketaux: marketaux.length,
  };

  // 分類池
  const byCategory: Record<NewsCategory, NewsItem[]> = {
    crypto: [],
    metal: [],
    stock: [],
    geo: [],
    macro: [],
  };
  for (const n of cryptoNews) byCategory[n.category].push(n);
  for (const n of finnhubNews) byCategory[n.category].push(n);
  for (const n of marketaux) byCategory[n.category].push(n);

  // F-10 五類分別呼叫 Claude
  const digest: Record<NewsCategory, DigestItem[]> = {
    crypto: [],
    metal: [],
    stock: [],
    geo: [],
    macro: [],
  };
  await Promise.all(
    (Object.keys(byCategory) as NewsCategory[]).map(async (cat) => {
      try {
        digest[cat] = await summarizeOneCategory(cat, byCategory[cat]);
      } catch (e) {
        warnings[`claude_${cat}`] = e instanceof Error ? e.message : "unknown";
      }
    }),
  );

  // 寫入
  const date = getTaipeiDateString();
  try {
    await persistDailyDigest({ date, categories: digest });
    steps.digest = {
      date,
      counts: Object.fromEntries(Object.entries(digest).map(([k, v]) => [k, v.length])),
    };
  } catch (e) {
    warnings.persist = e instanceof Error ? e.message : "unknown";
  }

  // F-23 保留清理（每日跑）
  try {
    steps.retention = await runRetentionCleanup();
  } catch (e) {
    warnings.retention = e instanceof Error ? e.message : "unknown";
  }

  return NextResponse.json({
    status: Object.keys(warnings).length ? "partial" : "ok",
    steps,
    ...(Object.keys(warnings).length ? { warnings } : {}),
  });
}
