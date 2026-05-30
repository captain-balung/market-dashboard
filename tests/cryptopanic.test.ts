import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCryptoPanicResponse } from "../src/lib/news/cryptopanic.ts";

test("parseCryptoPanicResponse 標準化加密新聞 (F-07)", () => {
  const json = {
    results: [
      {
        title: "Bitcoin breaks 75k",
        url: "https://example.com/btc",
        published_at: "2026-05-29T10:00:00Z",
        source: { title: "CoinDesk" },
        currencies: [{ code: "BTC" }],
      },
    ],
  };
  const items = parseCryptoPanicResponse(json);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Bitcoin breaks 75k");
  assert.equal(items[0].category, "crypto");
  assert.equal(items[0].source, "CoinDesk");
});

test("parseCryptoPanicResponse 把 PAXG 視為 metal", () => {
  const json = {
    results: [
      {
        title: "Gold-backed PAXG rallies",
        url: "https://example.com/paxg",
        published_at: "2026-05-29T10:00:00Z",
        source: { title: "Bloomberg" },
        currencies: [{ code: "PAXG" }],
      },
    ],
  };
  const items = parseCryptoPanicResponse(json);
  assert.equal(items[0].category, "metal");
});

test("parseCryptoPanicResponse 缺欄位的條目跳過", () => {
  const json = {
    results: [
      { title: "no url", published_at: "x" },
      { url: "no-title.com", published_at: "x" },
      { title: "ok", url: "https://ok.com", published_at: "2026-05-29T10:00:00Z" },
    ],
  };
  const items = parseCryptoPanicResponse(json);
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "ok");
});
