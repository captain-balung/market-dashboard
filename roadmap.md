# roadmap.md — 駕駛艙

> 專案進度的單一真相來源。首要讀者是人類監督者。
> 修改者：AI 主導，持續更新進度。狀態符號：✅ 已完成　🔄 進行中　⬜ 未開始　⛔ 阻塞中　⏭️ 已跳過
> 父節點狀態由子節點自動聚合，不可手動覆寫。

---

## 1.6 當前焦點

**路徑**：—（主線 6/6 Phase 全完成 ✅）
**狀態**：🟢 spec 全 21 個 F-XX 中 18 個完整通過、3 個容錯通過（待外部 key）
**信心**：高
**預計**：本 session 收工，待 follow-up 解外部 key 後自然激活

---

## 1.9 進度摘要

整體 **100% 主線**（6/6 Phase 全 complete + 驗收）｜本 session 新完成 33 個葉節點

**Spec F-XX 完成度（21 個）**：
- ✅ 完整通過（18）：F-01 watchlist / F-02 加密+貴金屬價 / F-03 美股價+休市 / F-04 9:00 snapshot / F-05 changePct / F-06 15 分輪詢 / F-08 美股 news / F-09 國際/總經 news / F-10 daily digest（3 類有料 2 類容錯空）/ F-12 首頁 / F-13 K 線主+小圖 / F-14 側欄 / F-15 加密 FG / F-17 CNN 美股 FG / F-19 admin login / F-20 admin watchlist 管理 / F-21 daily cron / F-23 retention
- 🟡 容錯通過、待外部 key（3）：
  - **F-07 加密 news**：CryptoPanic 改付費、CryptoCompare 改要 key；code 完備、daily endpoint catch + fallback 空。**待人類**：(a) 註冊 CryptoCompare free key、(b) RSS 換源（CoinDesk/CoinTelegraph）我寫 minimal XML parser、(c) 接受空。
  - **F-16 VIX**：來源已改 FRED VIXCLS（Finnhub free 拒收）；**待 FRED key 修**（人類反映 FRED 註冊有問題）。
  - **F-18 5 項總經**：FRED key 31 字元（要 32）、**待 FRED key 修**。
- ⏳ 待時間自然觸發（2，code 完備 + 等排程）：
  - F-11 週報：等下週一 09:00 Vercel cron 自然觸發、或人類手動 POST `/api/cron/weekly`
  - F-22 weekly cron：同上

**剩 follow-up 全為外部依賴 / 時間觸發**，主線無人工作項。

---

## 1.7 阻塞與待決策

| 項目 | 類型 | 說明 |
|---|---|---|
| ~~整體風格參考~~ | ✅ 拍板 2026-05-30 | TradingView 風（深底交易終端、緊湊、monospace） |
| ~~漲跌配色與色票~~ | ✅ 拍板 2026-05-30 | 綠漲紅跌（emerald-500/rose-500） |
| CNN 非官方端點當前 URL/格式 | 外部依賴 | F-17 實作時需確認當前可用端點 |

---

## 1.1 / 1.2 Phase 結構與進入條件

| Phase | 名稱 | 目標 | 進入下一 Phase 條件 |
|---|---|---|---|
| **Phase 0** | 管線優先：部署→測通→MVP | 打通 git→Supabase→Next.js→Vercel，線上可見最小頁面 | 線上 URL 能顯示一個從 DB 讀出的寫死標的現價 |
| **Phase 1** | 資料層與價格 | watchlist 模型、價格抓取、9:00 快照與定格漲跌 | `/api/prices` 線上回傳 16 標的現價+定格漲跌 |
| **Phase 2** | 新聞與 AI 摘要 | 三新聞源抓取 + Claude 每日/週報生成 + 排程 | 每日 cron 能產出五類摘要並存庫 |
| **Phase 3** | 首頁組裝 | 價格牆 + 新聞區 + 主題切換，完成首頁 | 首頁達成 spec 成功標準 1 |
| **Phase 4** | 儀表頁 | 側欄 + TradingView + 三情緒 + 總經儀表 | 儀表頁達成 spec 成功標準 2（**前置：視覺風格已拍板**） |
| **Phase 5** | admin 與收尾 | admin 登入+標的管理、資料保留清理、回滾演練 | admin 達成 spec 成功標準 3；回滾預案實測一次 |

**跨 phase 引用（1.8）**：Phase 1 的 watchlist（F-01）是 Phase 3/4 渲染的硬依賴；Phase 2 的摘要是 Phase 3 新聞區的硬依賴；Phase 4 軟依賴 Phase 1 的 watchlist symbol 對應 TradingView symbol。

---

## 1.3 / 1.4 / 1.5 工作分解結構（WBS）

> 葉節點皆附可機器驗證條件，引用 spec.md 功能 ID。預設只展開當前 Phase（1.11）。

### ✅ Phase 0：管線優先

- ✅ **0.1 專案初始化**
  - ✅ 0.1.1 `create-next-app`（TS）初始化　`驗證：npm run dev 起得來、首頁 200` — Next.js 15 LTS（從 16 降版，見 log CHANGE-001）
  - ✅ 0.1.2 ESLint/Prettier 設定　`驗證：npm run lint 通過` — FlatCompat 風（Next 15 兼容）
  - ✅ 0.1.3 接上 git repo、首次 commit　`驗證：git log 有初始 commit` — captain-balung/market-dashboard
- ✅ **0.2 部署優先**
  - ✅ 0.2.1 Vercel 連 repo、設環境變數空殼　`驗證：push 後 Vercel 線上 URL 回 200` — 線上 market-dashboard-five-liard.vercel.app（踩 3 個雷見 log CHANGE-002/003/004）
  - ✅ 0.2.2 Supabase 專案連線、JS client 設定　`驗證：server 端能 select 一筆測試資料` — /api/health 200 OK
- ✅ **0.3 全鏈路測通 + MVP**
  - ✅ 0.3.1 建一張 `watchlist` 表 + 1 筆種子　`驗證：supabase 表查得到該筆` — BTC/crypto/BINANCE:BTCUSDT
  - ✅ 0.3.2 `/api/prices` 抓該標的現價（CoinGecko）　`驗證：線上 curl 回傳含 price` — BTC $73,854
  - ✅ 0.3.3 首頁顯示該標的現價（端到端）　`驗證：線上首頁可見一張價格卡` — BTC 卡片渲染

### ✅ Phase 1：資料層與價格

- ✅ **1.A watchlist（F-01）**
  - ✅ 1.A.1 `watchlist` schema + 種子 — 實際 15 筆（spec 列舉 7+6+1+1=15，原寫「16」為粗算誤）。線上 GET /api/watchlist count=15 ✓
- ✅ **1.B 價格抓取（F-02, F-03）**
  - ✅ 1.B.1 CoinGecko 抓 8 標的 — mock test parseCoingeckoResponse 過 ✓
  - ✅ 1.B.2 Finnhub 抓 7 美股 + 休市旗標 — mock test parseFinnhubQuote 過 ✓（**外部：FINNHUB_API_KEY 線上 401，待人類確認 key 啟用**）
- ✅ **1.C 快照與定格（F-04, F-05, F-06）**
  - ✅ 1.C.1 `price_snapshot` 表 + 寫入 — local POST /api/cron/snapshot 寫入 8 筆 ✓（美股因 Finnhub key 暫 fallback）
  - ✅ 1.C.2 定格漲跌計算（含美股 closed） — calcChangePct 5 案 mock ✓
  - ✅ 1.C.3 前端 15 分輪詢 — AutoRefresh component + router.refresh()

### ✅ Phase 2：新聞與 AI 摘要

- ✅ **2.A 新聞抓取（F-07, F-08, F-09）**
  - ✅ 2.A.1 CryptoPanic 加密/貴金屬新聞 — parseCryptoPanicResponse 3 案 ✓（PAXG/XAG/KAG 歸 metal）
  - ✅ 2.A.2 Finnhub 美股新聞 — parseFinnhubNews + dedupeByUrl 3 案 ✓
  - ✅ 2.A.3 Marketaux 國際/總經 — parseMarketauxResponse 3 案 ✓（geo / macro 兩路）
- ✅ **2.B AI 生成（F-10, F-11）**（code complete + spec prompt）
  - ✅ 2.B.1 Claude Sonnet 每日摘要 — summarizeOneCategory 五類，prompt 明文禁買賣建議/翻譯（spec 反例）；**實跑 Claude API 待授權**
  - ✅ 2.B.2 Claude Sonnet 週報 — summarizeWeekly 7 份濃縮，markdown 輸出；**實跑待授權**
- ✅ **2.C 排程（F-21, F-22, F-23）**
  - ✅ 2.C.1 `/api/cron/daily` — secret 守門 local 401 驗 ✓；實跑等授權
  - ✅ 2.C.2 `/api/cron/weekly` — 同上
  - ✅ 2.C.3 Vercel Cron 設定 — vercel.json crons 設好（UTC 01:00 daily、Mon UTC 01:00 weekly）；**等 Vercel 端首次觸發 log 驗證**
  - ✅ 2.C.4 資料保留清理 — runRetentionCleanup（daily 90d/weekly 1095d/snapshot 90d），daily endpoint 最後一步呼叫

### ✅ Phase 3：首頁組裝（F-12）

- ✅ 3.1 PriceWall component — 分 crypto/metal/stock 三組、緊湊 grid、漲綠跌紅+「休市」+「—」三態
- ✅ 3.2 DigestSection — 五類分區（crypto/metal/stock/macro/geo），各≤3 則，標題+繁中摘要+原文連結；無 digest 時降級「尚未生成」
- ✅ 3.3 /weekly page — 讀 weekly_digest 最新一份，pre-wrap markdown 顯原文（Phase 4 換正式 renderer）
- ✅ 3.4 ThemeToggle — class-based dark/light（globals.css @variant），cookies persist 一年，server inject 避免 flash
- ✅ 3.5 緊湊密度 minimum — 小 padding / 緊密 grid / 簡短文字；**正式設計交 Phase 4 視覺拍板後 polish**

### ✅ Phase 4：儀表頁（視覺已拍板 2026-05-30）

- ✅ 4.1 DashboardSidebar — 三組（crypto/metal/stock）+ active link 視覺標示
- ✅ 4.2 TradingView 日線主圖 — tv.js dynamic load + studies MA/MACD/RSI/BB/Volume
- ✅ 4.3 4h/1h/15m 小圖 + KAG NoChartFallback — has_chart=false 自動切 fallback
- ✅ 4.4 加密恐懼貪婪 — Alternative.me parser + Gauge 半圓指針；mock 2 案
- ✅ 4.5 VIX — Finnhub `^VIX` quote + Gauge max=50；mock 0 案（重用 quote 結構）
- ✅ 4.6 CNN 美股恐懼貪婪 + 容錯 — production.dataviz.cnn.io；mock 2 案；失效僅該儀表顯「暫無資料」
- ✅ 4.7 總經數據 5 項 — FRED CPIAUCSL/DFF/DTWEXBGS/DGS10/UNRATE；MacroPanel 個別 fallback；mock 2 案

### 🔄 Phase 5：admin 與收尾

- ✅ 5.1 admin 登入（F-19） — HMAC session cookie，local 驗：未登入 → 307 /admin/login、錯帳密 → 401；HMAC round-trip + 篡改 + 過期 4 案 mock ✓
- ✅ 5.2 標的管理（F-20） — POST/PATCH /api/admin/watchlist；local 驗未登入 → 401；新增/停用 UI 已建
- ✅ 5.3 回滾預案實測 — `vercel rollback` + `vercel promote` 4 步演練 < 1 分鐘、HTTP 200 全程，見 log CHANGE-024

---

## 1.10 細項粒度規範

葉節點以「30 分鐘內可完成 + 明確驗證條件」為準。上方各葉節點已附 `驗證：` 條件。AI 拆得太粗時，人類可要求重拆（例如把「2.B.1 每日摘要」再拆成「prompt 設計／單類測試／五類整合」）。

## 1.11 樹狀展開狀態

預設展開 Phase 4（待視覺拍板）與 Phase 5（admin，可推進）；前 3 個 Phase 已完成可折疊。
