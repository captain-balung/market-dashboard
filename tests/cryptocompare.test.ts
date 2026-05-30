import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCryptoCompareResponse } from "../src/lib/news/cryptocompare.ts";

test("parseCryptoCompareResponse 把 BTC 標籤標為 crypto", () => {
  const json = {
    Data: [
      {
        title: "Bitcoin breaks 75k",
        url: "https://example.com/btc",
        published_on: 1717000000,
        source: "coindesk",
        body: "details...",
        categories: "BTC|TRADING",
        tags: "BTC",
      },
    ],
  };
  const items = parseCryptoCompareResponse(json);
  assert.equal(items.length, 1);
  assert.equal(items[0].category, "crypto");
  assert.equal(items[0].source, "coindesk");
  assert.equal(items[0].excerpt, "details...");
});

test("parseCryptoCompareResponse 把 PAXG/XAU 視為 metal", () => {
  const items = parseCryptoCompareResponse({
    Data: [
      {
        title: "Gold-backed PAXG rallies",
        url: "https://example.com/paxg",
        published_on: 1717000000,
        source: "bloomberg",
        categories: "PAXG|MARKET",
      },
      {
        title: "Silver hits 30",
        url: "https://example.com/xag",
        published_on: 1717000000,
        source: "kitco",
        categories: "XAG",
      },
    ],
  });
  assert.equal(items[0].category, "metal");
  assert.equal(items[1].category, "metal");
});

test("parseCryptoCompareResponse 缺欄位的條目跳過", () => {
  const items = parseCryptoCompareResponse({
    Data: [
      { title: "no url", published_on: 1717000000 },
      { url: "no-title.com", published_on: 1717000000 },
      { title: "ok", url: "https://ok.com", published_on: 1717000000 },
    ],
  });
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "ok");
});
