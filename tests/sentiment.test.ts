import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAlternativeMe, parseCnnFng, parseFredLatest } from "../src/lib/sentiment.ts";

test("parseAlternativeMe 解析加密恐懼貪婪 (F-15)", () => {
  const json = {
    data: [{ value: "65", value_classification: "Greed", timestamp: "1717000000" }],
  };
  const r = parseAlternativeMe(json);
  assert.notEqual(r, null);
  assert.equal(r!.value, 65);
  assert.equal(r!.label, "Greed");
});

test("parseAlternativeMe 空 data 回 null", () => {
  assert.equal(parseAlternativeMe({ data: [] }), null);
  assert.equal(parseAlternativeMe({}), null);
});

test("parseCnnFng 解析 CNN score (F-17)", () => {
  const json = { fear_and_greed: { score: 42.5, rating: "Fear", timestamp: "2026-05-30" } };
  const r = parseCnnFng(json);
  assert.equal(r!.value, 43);
  assert.equal(r!.label, "Fear");
});

test("parseCnnFng 缺 score 回 null", () => {
  assert.equal(parseCnnFng({}), null);
  assert.equal(parseCnnFng({ fear_and_greed: {} }), null);
});

test("parseFredLatest 取最近一筆有值的觀察 (F-18)", () => {
  const json = {
    observations: [
      { date: "2026-05-28", value: "." },
      { date: "2026-05-29", value: "3.42" },
    ],
  };
  const p = parseFredLatest("DGS10", "10Y", "%", json);
  assert.equal(p.value, 3.42);
  assert.equal(p.asOf, "2026-05-29");
  assert.equal(p.label, "10Y");
});

test("parseFredLatest 空 observations 回 null value", () => {
  const p = parseFredLatest("X", "X", undefined, { observations: [] });
  assert.equal(p.value, null);
  assert.equal(p.asOf, null);
});
