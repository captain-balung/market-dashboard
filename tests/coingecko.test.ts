import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCoingeckoResponse, COINGECKO_ID_MAP } from "../src/lib/coingecko.ts";

test("parseCoingeckoResponse 解析 8 標的 (Phase 1.B.1)", () => {
  const fakeJson = {
    bitcoin: { usd: 73000 },
    ethereum: { usd: 3500 },
    solana: { usd: 180 },
    binancecoin: { usd: 620 },
    ripple: { usd: 0.55 },
    dogecoin: { usd: 0.18 },
    "pax-gold": { usd: 2700 },
    "kinesis-silver": { usd: 32 },
  };
  const result = parseCoingeckoResponse(fakeJson);
  assert.equal(Object.keys(result).length, 8);
  assert.equal(result.BTC, 73000);
  assert.equal(result.ETH, 3500);
  assert.equal(result.SOL, 180);
  assert.equal(result.BNB, 620);
  assert.equal(result.XRP, 0.55);
  assert.equal(result.DOGE, 0.18);
  assert.equal(result.PAXG, 2700);
  assert.equal(result.KAG, 32);
});

test("parseCoingeckoResponse 部分回應降級不報錯", () => {
  const partial = { bitcoin: { usd: 73000 }, ethereum: {} as { usd?: number } };
  const result = parseCoingeckoResponse(partial);
  assert.equal(result.BTC, 73000);
  assert.equal(result.ETH, undefined);
});

test("COINGECKO_ID_MAP 含 spec 指定的 8 標的", () => {
  for (const sym of ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "PAXG", "KAG"]) {
    assert.ok(COINGECKO_ID_MAP[sym], `missing ${sym}`);
  }
});
