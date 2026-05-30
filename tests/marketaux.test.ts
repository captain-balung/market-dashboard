import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarketauxResponse } from "../src/lib/news/marketaux.ts";

test("parseMarketauxResponse 標準化文章 + 帶 category (F-09)", () => {
  const json = {
    data: [
      {
        title: "Fed signals hold",
        url: "https://example.com/fed",
        published_at: "2026-05-29T10:00:00Z",
        source: "Reuters",
        description: "Fed officials said...",
      },
    ],
  };
  const items = parseMarketauxResponse(json, "macro");
  assert.equal(items.length, 1);
  assert.equal(items[0].category, "macro");
  assert.equal(items[0].source, "Reuters");
  assert.equal(items[0].excerpt, "Fed officials said...");
});

test("parseMarketauxResponse geo 與 macro 兩類分別標", () => {
  const json = { data: [{ title: "t", url: "u", published_at: "p", source: "s" }] };
  const geo = parseMarketauxResponse(json, "geo");
  const macro = parseMarketauxResponse(json, "macro");
  assert.equal(geo[0].category, "geo");
  assert.equal(macro[0].category, "macro");
});

test("parseMarketauxResponse 空 data 回空陣列", () => {
  assert.deepEqual(parseMarketauxResponse({}, "macro"), []);
  assert.deepEqual(parseMarketauxResponse({ data: [] }, "geo"), []);
});
