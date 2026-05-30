import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFinnhubNews, dedupeByUrl } from "../src/lib/news/finnhub-news.ts";

test("parseFinnhubNews 把 datetime (秒) 轉成 ISO (F-08)", () => {
  const items = parseFinnhubNews([
    {
      headline: "Apple announces",
      url: "https://x.com/a",
      datetime: 1717000000,
      source: "Reuters",
      summary: "details...",
    },
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].category, "stock");
  assert.equal(items[0].source, "Reuters");
  assert.equal(items[0].excerpt, "details...");
  assert.ok(items[0].publishedAt.startsWith("2024-"));
});

test("parseFinnhubNews 缺 datetime/headline/url 跳過", () => {
  const items = parseFinnhubNews([
    { headline: "no url", datetime: 1717000000 },
    { url: "https://x.com/b", datetime: 1717000000 },
    { headline: "no time", url: "https://x.com/c" },
    { headline: "ok", url: "https://x.com/d", datetime: 1717000001 },
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "ok");
});

test("dedupeByUrl 相同 url 只留一筆", () => {
  const items = [
    {
      title: "a",
      url: "https://x.com/dup",
      publishedAt: "2026-05-29T10:00:00Z",
      source: "S1",
      category: "stock" as const,
    },
    {
      title: "b",
      url: "https://x.com/dup",
      publishedAt: "2026-05-29T11:00:00Z",
      source: "S2",
      category: "stock" as const,
    },
    {
      title: "c",
      url: "https://x.com/uniq",
      publishedAt: "2026-05-29T12:00:00Z",
      source: "S3",
      category: "stock" as const,
    },
  ];
  const out = dedupeByUrl(items);
  assert.equal(out.length, 2);
});
