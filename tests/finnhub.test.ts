import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFinnhubQuote } from "../src/lib/finnhub.ts";

test("parseFinnhubQuote 盤中 quote 含 current price (Phase 1.B.2)", () => {
  const q = { c: 175.5, pc: 174.0, t: 1717000000 };
  const r = parseFinnhubQuote("AAPL", q, false);
  assert.equal(r.symbol, "AAPL");
  assert.equal(r.price, 175.5);
  assert.equal(r.marketClosed, false);
});

test("parseFinnhubQuote 休市 (t=0) 回 price=null marketClosed=true", () => {
  const q = { c: 0, pc: 0, t: 0 };
  const r = parseFinnhubQuote("AAPL", q, false);
  assert.equal(r.price, null);
  assert.equal(r.marketClosed, true);
});

test("parseFinnhubQuote marketStatus=true 但有 quote 仍可用", () => {
  const q = { c: 175.5, pc: 174.0, t: 1717000000 };
  const r = parseFinnhubQuote("AAPL", q, true);
  // c 仍存在表示前收盤可用，marketClosed flag 沿用入參
  assert.equal(r.price, 175.5);
  assert.equal(r.marketClosed, true);
});
