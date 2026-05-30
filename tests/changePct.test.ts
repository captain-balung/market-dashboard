import { test } from "node:test";
import assert from "node:assert/strict";
import { calcChangePct } from "../src/lib/changePct.ts";

test("calcChangePct 正常算 (今-昨)/昨 (Phase 1.C.2)", () => {
  const c = calcChangePct(110, 100, false);
  assert.equal(c.kind, "pct");
  if (c.kind === "pct") assert.equal(c.value, 0.1);
});

test("calcChangePct 跌幅", () => {
  const c = calcChangePct(95, 100, false);
  assert.equal(c.kind, "pct");
  if (c.kind === "pct") assert.equal(c.value, -0.05);
});

test("calcChangePct 美股休市且無快照 → closed", () => {
  const c = calcChangePct(null, null, true);
  assert.equal(c.kind, "closed");
});

test("calcChangePct 缺資料 → unavailable", () => {
  assert.equal(calcChangePct(null, 100, false).kind, "unavailable");
  assert.equal(calcChangePct(110, null, false).kind, "unavailable");
  assert.equal(calcChangePct(110, 0, false).kind, "unavailable");
});

test("calcChangePct 美股開盤但無快照 → unavailable", () => {
  const c = calcChangePct(null, 100, false);
  assert.equal(c.kind, "unavailable");
});
