# roadmap.md — 駕駛艙

> 專案進度的單一真相來源。首要讀者是人類監督者。
> 修改者：AI 主導，持續更新進度。狀態符號：✅ 已完成　🔄 進行中　⬜ 未開始　⛔ 阻塞中　⏭️ 已跳過
> 父節點狀態由子節點自動聚合，不可手動覆寫。

---

## 1.6 當前焦點

**路徑**：Phase 1 → 資料層與價格 → 1.A.1 watchlist 16 筆種子
**狀態**：🔄 進行中
**信心**：高（pipeline 已通、加 15 筆種子 + 擴 CoinGecko/Finnhub adapter 為主）
**預計**：本 session 內收 Phase 1

---

## 1.9 進度摘要

整體 13%（1/6 Phase 完成）｜Phase 0 100% ✅｜Phase 1 啟動中｜本 session 新完成 8 個葉節點（全 Phase 0）

---

## 1.7 阻塞與待決策

| 項目 | 類型 | 說明 |
|---|---|---|
| 整體風格參考（TradingView/CoinGecko/Yahoo 風） | 待人類決策 | spec/design 已標「暫緩」，**進入 Phase 4 視覺前須拍板**（design.md 視覺與介面） |
| 漲跌配色與色票 | 待人類決策 | 同上，設計階段前定 |
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

### 🔄 Phase 1：資料層與價格

- 🔄 **1.A watchlist（F-01）**
  - 🔄 1.A.1 `watchlist` schema（symbol/category/tv_symbol/has_chart/active）+ 16 筆種子　`驗證：GET /api/watchlist 筆數=16`
- ⬜ **1.B 價格抓取（F-02, F-03）**
  - ⬜ 1.B.1 CoinGecko 抓 6 幣+PAXG+KAG　`驗證：mock 測試解析 8 標的 price`
  - ⬜ 1.B.2 Finnhub 抓 7 美股 + 休市旗標　`驗證：mock 測試含 marketStatus`
- ⬜ **1.C 快照與定格（F-04, F-05, F-06）**
  - ⬜ 1.C.1 `price_snapshot` 表 + 寫入邏輯　`驗證：手動觸發後表有當日 09:00 筆`
  - ⬜ 1.C.2 定格漲跌計算（含美股 closed）　`驗證：單元測試 (今-昨)/昨；無昨日交易回 closed`
  - ⬜ 1.C.3 前端 15 分輪詢現價　`驗證：Playwright 觀察 15 分後重抓（可縮短測試）`

### ⬜ Phase 2：新聞與 AI 摘要

- ⬜ **2.A 新聞抓取（F-07, F-08, F-09）**
  - ⬜ 2.A.1 CryptoPanic 加密/貴金屬新聞標準化　`驗證：mock 回標準化陣列`
  - ⬜ 2.A.2 Finnhub 美股新聞標準化　`驗證：mock 回標準化陣列`
  - ⬜ 2.A.3 Marketaux 國際/總經新聞標準化　`驗證：mock 回標準化陣列`
- ⬜ **2.B AI 生成（F-10, F-11）**
  - ⬜ 2.B.1 Claude Sonnet 每日摘要（五類各約3則繁中+連結）　`驗證：daily_digest 五類齊、每則有 source_url`
  - ⬜ 2.B.2 Claude Sonnet 週報（讀7份每日）　`驗證：weekly_digest 寫入成功`
- ⬜ **2.C 排程（F-21, F-22, F-23）**
  - ⬜ 2.C.1 `/api/cron/daily` + CRON_SECRET 驗證　`驗證：錯 secret 回 401、對的執行`
  - ⬜ 2.C.2 `/api/cron/weekly`　`驗證：同上`
  - ⬜ 2.C.3 Vercel Cron 設定（台北09:00=UTC01:00）　`驗證：Vercel cron log 有觸發`
  - ⬜ 2.C.4 資料保留清理（每日90天/週報3年）　`驗證：插過期測試資料後執行被刪`

### ⬜ Phase 3：首頁組裝（F-12）

- ⬜ 3.1 價格牆元件（現價+定格漲跌+休市）　`驗證：Playwright 截圖含 16 卡`
- ⬜ 3.2 五類新聞摘要區（標題+繁中摘要+連結）　`驗證：Playwright 見五類區塊`
- ⬜ 3.3 週報入口　`驗證：點擊可見週報`
- ⬜ 3.4 深/淺主題切換（預設深、存 cookie）　`驗證：切換後重載仍保留`
- ⬜ 3.5 緊湊密度版面　`驗證：Playwright 截圖比對設計目標`

### ⬜ Phase 4：儀表頁（前置：視覺風格拍板）

- ⬜ 4.1 商品列表側欄（F-14）　`驗證：點擊切換主圖標的`
- ⬜ 4.2 TradingView 主圖日線+指標（F-13）　`驗證：載入含 MA/MACD/RSI/布林/量`
- ⬜ 4.3 4h/1h/15m 小圖（僅MA）+ KAG「無圖表」（F-13）　`驗證：三小圖載入、KAG 顯示無圖表`
- ⬜ 4.4 加密恐懼貪婪儀表（F-15）　`驗證：顯示0–100+分級`
- ⬜ 4.5 VIX 儀表（F-16）　`驗證：顯示數值、失效顯示暫無資料`
- ⬜ 4.6 CNN 美股恐懼貪婪儀表+容錯（F-17）　`驗證：失效時僅該儀表暫無資料、不影響其他`
- ⬜ 4.7 總經數據儀表 5 項（F-18）　`驗證：CPI/利率/DXY/10Y/失業率各顯示值+日期`

### ⬜ Phase 5：admin 與收尾

- ⬜ 5.1 admin 登入（F-19）　`驗證：未登入導向登入頁、對的帳密設 session`
- ⬜ 5.2 標的管理（F-20）　`驗證：新增後 /api/watchlist 反映、未登入寫入回401`
- ⬜ 5.3 回滾預案實測　`驗證：Vercel rollback 演練一次成功`

---

## 1.10 細項粒度規範

葉節點以「30 分鐘內可完成 + 明確驗證條件」為準。上方各葉節點已附 `驗證：` 條件。AI 拆得太粗時，人類可要求重拆（例如把「2.B.1 每日摘要」再拆成「prompt 設計／單類測試／五類整合」）。

## 1.11 樹狀展開狀態

預設只展開**當前 Phase（Phase 1）**與當前焦點路徑；其餘 Phase 收合，待進入時展開，避免一次被所有細項淹沒。
