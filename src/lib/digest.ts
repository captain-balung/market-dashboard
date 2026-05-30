/**
 * 每日/每週摘要生成 — F-10 / F-11 (Phase 2.B)。
 *
 * spec.md 工作原則 1「解讀先於聚合」：產出必須是 Claude 用自己的話重寫的
 * 繁中摘要+解讀，不接受原文整段翻譯貼上。
 *
 * 每類產 ~3 則繁中摘要，每則附 source_url 鏈回原文。
 */

import { callClaude } from "./claude";
import { getSupabaseServerClient } from "./supabase-server";
import type { NewsItem, NewsCategory } from "./news/types";

export type DigestItem = {
  title: string; // 繁中標題
  summary: string; // 繁中摘要 + 解讀
  source_url: string;
  source: string;
  published_at: string;
};

export type DailyDigest = {
  date: string; // YYYY-MM-DD (台北)
  categories: Record<NewsCategory, DigestItem[]>;
};

const CATEGORY_LABEL: Record<NewsCategory, string> = {
  crypto: "加密貨幣",
  metal: "貴金屬",
  stock: "美股",
  geo: "國際形勢",
  macro: "總體經濟",
};

const SYSTEM_PROMPT = `你是一個服務一位資深財經讀者的市場觀察助手。
任務：對給定的英文新聞清單，挑出 2-3 則最重要的，用繁體中文重寫成「短標題 + 1-2 句解讀」。

嚴格規則：
1. 用「自己的話重寫」，不要直接翻譯整段。
2. 只解讀「為何漲跌 / 為何重要」，**禁止**給買賣建議或目標價。
3. 每則 ≤ 3 句、繁體中文、財經圈口語但不浮誇。
4. 保留原文 url 與 source 不變。
5. 輸出 JSON 陣列，schema 嚴格：
   [{"title":"繁中標題","summary":"繁中解讀","source_url":"原 url","source":"原 source","published_at":"原 published_at"}]
6. 不要包 markdown code fence，直接輸出 JSON 開頭的 [。`;

function buildUserPrompt(category: NewsCategory, items: NewsItem[]): string {
  const lines = items.slice(0, 30).map((n, i) =>
    JSON.stringify({
      idx: i,
      title: n.title,
      excerpt: n.excerpt?.slice(0, 400) ?? "",
      source_url: n.url,
      source: n.source,
      published_at: n.publishedAt,
    }),
  );
  return [
    `類別：${CATEGORY_LABEL[category]}`,
    `候選新聞（共 ${items.length} 則，僅展示前 30 則）：`,
    ...lines,
    "",
    "請挑 2-3 則最重要的，照前述 schema 輸出 JSON 陣列。",
  ].join("\n");
}

function tryParseDigestItems(text: string): DigestItem[] {
  let raw = text.trim();
  // 容忍包了 ```json ... ``` 的情況
  if (raw.startsWith("```")) {
    raw = raw
      .replace(/^```(?:json)?\s*/, "")
      .replace(/```$/, "")
      .trim();
  }
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("expected array");
  const out: DigestItem[] = [];
  for (const p of parsed) {
    if (typeof p !== "object" || p === null) continue;
    const obj = p as Record<string, unknown>;
    if (
      typeof obj.title === "string" &&
      typeof obj.summary === "string" &&
      typeof obj.source_url === "string" &&
      typeof obj.source === "string" &&
      typeof obj.published_at === "string"
    ) {
      out.push({
        title: obj.title,
        summary: obj.summary,
        source_url: obj.source_url,
        source: obj.source,
        published_at: obj.published_at,
      });
    }
  }
  return out;
}

export async function summarizeOneCategory(
  category: NewsCategory,
  items: NewsItem[],
): Promise<DigestItem[]> {
  if (items.length === 0) return [];
  const text = await callClaude({
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(category, items) }],
    maxTokens: 1500,
  });
  return tryParseDigestItems(text);
}

export function getTaipeiDateString(now: Date = new Date()): string {
  const taipei = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return taipei.toISOString().slice(0, 10);
}

export async function persistDailyDigest(digest: DailyDigest): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("daily_digest")
    .upsert([{ date: digest.date, payload: digest.categories }], { onConflict: "date" });
  if (error) throw new Error(`daily_digest upsert: ${error.message}`);
}

// 週報：把過去 7 份 daily_digest 餵 Claude 濃縮
const WEEKLY_SYSTEM_PROMPT = `你是同一位市場觀察助手。任務：把過去 7 天每日摘要濃縮成一週重點。
規則：
1. 用繁中。
2. 五類各保留 2-3 個本週主軸；列點。
3. 解讀本週趨勢與背後驅動，禁止給買賣建議。
4. 輸出 markdown，分五個 H2 章節：## 加密貨幣 / ## 貴金屬 / ## 美股 / ## 國際形勢 / ## 總體經濟。
5. 每章每點末尾保留至少一個原文連結。`;

export async function summarizeWeekly(
  digests: { date: string; payload: Record<NewsCategory, DigestItem[]> }[],
): Promise<string> {
  if (digests.length === 0) return "（本週無摘要可彙整）";
  const userPayload = digests
    .map((d) => `--- ${d.date} ---\n${JSON.stringify(d.payload, null, 0)}`)
    .join("\n");
  return await callClaude({
    system: WEEKLY_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPayload }],
    maxTokens: 3000,
  });
}

export async function persistWeeklyDigest(weekOf: string, content: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("weekly_digest")
    .upsert([{ week_of: weekOf, content }], { onConflict: "week_of" });
  if (error) throw new Error(`weekly_digest upsert: ${error.message}`);
}
