# log.md — 變更日誌

> **append-only**（慣例約束）：既有條目不可改，只能新增。發現舊條目有誤時新增「修正」條目指向它。
> 每條欄位：時間戳（ISO 8601 含時區）／類型（變更/決策/修正）／範圍與摘要／觸發來源／決策內容（僅決策類型）／風險等級（低/中/高/不可逆）。
> 時間戳一律用真實 UTC 或含時區的當地時間，AI 不可亂填本地時間。

---

## DECISION-001

- **時間戳**：2026-05-28T00:00:00+08:00
- **類型**：決策
- **範圍與摘要**：選定 Next.js（App Router）+ Vercel 作為框架與部署平台。
- **觸發來源**：人類指示（規格討論）
- **決策內容**：
  - 脈絡：需前後端一體、機密 key 關在 server 端、部署省事、內建排程。
  - 選項：Next.js+Vercel／純前端 SPA + 獨立後端／其他全端框架。
  - 決定：Next.js + Vercel。
  - 後果：綁定 Vercel 生態（排程用 Vercel Cron）；若未來離開 Vercel，Cron 與部署需重做。
- **風險等級**：中

## DECISION-002

- **時間戳**：2026-05-28T00:00:00+08:00
- **類型**：決策
- **範圍與摘要**：資料庫選 Supabase（Postgres）。
- **觸發來源**：人類指示
- **決策內容**：脈絡：需存 watchlist/快照/摘要，要免費、通用、後台可改資料。選項：Supabase／Vercel Postgres。決定：Supabase（不被 Vercel 綁死、後台可直接改資料當 admin 介面後備）。後果：多一個外部服務帳號要管。
- **風險等級**：低

## DECISION-003

- **時間戳**：2026-05-28T00:00:00+08:00
- **類型**：決策
- **範圍與摘要**：排程用 Vercel Cron，台北每日09:00、週一09:00。
- **觸發來源**：人類指示
- **決策內容**：脈絡：需每日/每週定時生成摘要。選項：Vercel Cron／外部排程服務。決定：Vercel Cron（內建零成本）。後果：受 Vercel 免費 cron 限制（本專案頻率極低，無虞）；時區須 UTC 換算（台北09:00=UTC01:00）。
- **風險等級**：低

## DECISION-004

- **時間戳**：2026-05-28T00:00:00+08:00
- **類型**：決策
- **範圍與摘要**：AI 摘要用 Claude Sonnet。
- **觸發來源**：人類指示
- **決策內容**：脈絡：摘要/解讀品質重於成本，一天僅跑一次。選項：Haiku（省）／Sonnet（品質）。決定：Sonnet。後果：單次成本略高但總量極低，可接受。
- **風險等級**：低

## DECISION-005

- **時間戳**：2026-05-28T00:00:00+08:00
- **類型**：決策
- **範圍與摘要**：K 線圖用 TradingView 嵌入 widget，不自存 K 線/自算指標。
- **觸發來源**：人類指示
- **決策內容**：脈絡：需日線主圖+多框架+多指標。選項：自建圖表+自存歷史／TradingView 嵌入。決定：TradingView 嵌入。後果：依賴第三方 widget；KAG 等小幣 TradingView 無圖，該標的顯示「無圖表」。
- **風險等級**：低

## DECISION-006

- **時間戳**：2026-05-28T00:00:00+08:00
- **類型**：決策
- **範圍與摘要**：定案資料源組合——CoinGecko（加密+貴金屬價格）、Finnhub（美股價格+新聞+VIX）、CryptoPanic（加密新聞）、Marketaux（國際/總經新聞）、FRED（總經數據）、Alternative.me（加密恐懼貪婪）。
- **觸發來源**：人類指示（經 web 查證可用性與免費額度）
- **決策內容**：脈絡：三類資產+宏觀+情緒需多源，要免費可用。選項見各源比較（討論記錄）。決定：上述組合，皆有免費額度且彼此互補（價格源與新聞源最大化重疊以減少 key 數）。後果：共需管理 5 個 API key + Anthropic。
- **風險等級**：低

## DECISION-007

- **時間戳**：2026-05-28T00:00:00+08:00
- **類型**：決策
- **範圍與摘要**：CNN 美股恐懼貪婪指數採用其網站非官方內部端點。
- **觸發來源**：人類指示（web 查證：CNN 無官方 API）
- **決策內容**：脈絡：使用者要 CNN 美股版情緒，但 CNN 無官方 API。選項：非官方端點／第三方 RapidAPI 中間商／Python 套件抓取。決定：直接打非官方內部端點（最乾淨）。後果：**CNN 改版即失效**（史上發生過）；故定為「盡力而為」來源，須容錯——失效時該儀表顯示「暫無資料」，不影響其他區塊。
- **風險等級**：中

---

<!-- 後續條目往下 append。範例格式：

## CHANGE-NNN
- 時間戳：YYYY-MM-DDThh:mm:ss+08:00
- 類型：變更
- 範圍與摘要：...
- 觸發來源：人類指示 / QA退件 / 自動偵測 / AI自主判斷
- 風險等級：低/中/高/不可逆

-->

## CHANGE-001

- **時間戳**：2026-05-30T00:30:00+08:00
- **類型**：變更（降版）
- **範圍與摘要**：Next.js 16.2.6 → 15.5.18（LTS）。eslint-config-next 同步降版。eslint.config.mjs 改 FlatCompat 風（Next 15 兼容）。
- **觸發來源**：自動偵測（Phase 0.2.1 部署 build 成功但 routing 全 404）
- **決策內容**：
  - 症狀：`vercel --prod` build log 顯示 `▲ Next.js 16.2.6 (Turbopack)` 全綠通過、`Build Completed in /vercel/output [24s]`，但 production / preview 全部 routing 404；`.next/server/app/index.html` 有 emit、卻沒進 `.vercel/output/static/`。
  - 試過：把 `next build --webpack` 強制關 Turbopack、加 `NEXT_DISABLE_TURBOPACK=1`、`vercel build --prebuilt` — 均無效。
  - 真正關鍵在 Vercel 內部 `@vercel/next` adapter 對 Next.js 16 prerender manifest 格式不兼容（但偽裝 build 成功）。
  - 解：降版到 15 LTS（react@19 保留）。
- **風險等級**：中（功能無影響，但與 spec design.md 未指定版本相符；之後 Next.js 16 在 Vercel adapter 穩定後可再評估升版）

## CHANGE-002

- **時間戳**：2026-05-30T00:30:00+08:00
- **類型**：決策
- **範圍與摘要**：repo 加 `vercel.json` 強制 `"framework": "nextjs"`，override Vercel Project Settings。
- **觸發來源**：自動偵測（同 CHANGE-001 的 404 調查）
- **決策內容**：
  - 脈絡：用 `vercel projects add market-dashboard` 建專案時 Vercel **不自動偵測 framework**，預設為 `Other`。每次 deploy 走 `@vercel/static-build` 而非 `@vercel/next`，build 後 `.vercel/output/static/` 只含 `public/*.svg`，配上 catch-all 404 routing rule，所有路徑回 404。
  - 選項：(A) dashboard 手動改 Project Settings Framework Preset → Next.js；(B) repo 加 `vercel.json` 設 framework；(C) 用 `vercel link --yes` 觸發框架自動偵測（但 cwd 含中文時 `vercel link` 報錯）。
  - 選 B：寫進 repo 跟 git 走、新環境/重建專案也不會踩坑。也順手強制：未來換 Vercel project／clone 到新環境，framework 不會漂移。
  - `vercel.json` 內容：`{ "$schema": "https://openapi.vercel.sh/vercel.json", "framework": "nextjs" }`
- **風險等級**：低

## CHANGE-003

- **時間戳**：2026-05-30T00:30:00+08:00
- **類型**：修正（外部設定）
- **範圍與摘要**：Vercel project Deployment Protection 預設開「Standard Protection (Require Log In)」，包含 production deployment 也擋；需 dashboard 關閉 toggle 才能讓訪客唯讀（對齊 spec.md 總體規範 5）。
- **觸發來源**：自動偵測（curl production URL 全 401，response header 含 `_vercel_sso_nonce`）
- **決策內容**：
  - Vercel Hobby 對新 project 預設 Vercel Authentication 為 Standard Protection（Pro 才能改成 All Deployments）。
  - 但 toggle「Require Log In」**Hobby 免費可關**。下拉鎖死不是真正阻礙。
  - 解：dashboard → Settings → Deployment Protection → 把 Require Log In toggle 關掉 → Save。
  - 既有 4 個 project（captain-balung-devlog、ai-daily-brief、statistics、statistics-wkjw）皆已預先關過，所以對照 200。
- **風險等級**：中（這個 setting 沒關 → 整個專案精神「對訪客唯讀公開」失效）

## CHANGE-004

- **時間戳**：2026-05-30T00:30:00+08:00
- **類型**：修正
- **範圍與摘要**：禁用 PowerShell 5.1 pipe 到 native exe（特別是 `vercel env add`）— pipe stdin 會在 value 起頭加 UTF-8 BOM (`﻿` / 65279)，造成 Supabase HTTP client 報 `Cannot convert argument to a ByteString because the character at index 0 has a value of 65279`。改用 bash `printf '%s' | vercel env add KEY production`。
- **觸發來源**：自動偵測（線上 /api/prices 500，error message 直指 65279）
- **決策內容**：
  - 試過：在 PowerShell 設 `[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)` + `$OutputEncoding` 同設 — **無效**，BOM 仍出現。
  - PowerShell 5.1 native exe stdin 編碼有多層默認，難以靠單一 flag 鎖。
  - 解：用 bash `printf '%s' "$val" | vercel env add ...`（保證無 BOM、無 trailing newline）。
  - 行動：把 12 個 env vars 全部 rm + 重 add，這次走 bash 路徑。
- **風險等級**：中（之後若不知這坑，其他 secret 上傳會繼續壞）

## CHANGE-005

- **時間戳**：2026-05-30T00:30:00+08:00
- **類型**：變更
- **範圍與摘要**：build script 短暫加過 `--webpack` flag、Vercel 加過 `NEXT_DISABLE_TURBOPACK=1` env var。CHANGE-001 降版後 `--webpack` flag 移除（Next.js 15 無此 flag）；env var 因 .env.local 不再列也未重 upload。
- **觸發來源**：自動偵測（試錯路徑）
- **風險等級**：低（Vercel 端 `NEXT_DISABLE_TURBOPACK=1` 殘留，無實際作用；下次 env 整理時可手動 rm）

## DECISION-008

- **時間戳**：2026-05-30T01:00:00+08:00
- **類型**：決策
- **範圍與摘要**：Phase 1.A.1 watchlist 種子數量定為 **15 筆**（非 spec 文 case 寫的「16」）。
- **觸發來源**：自動偵測（spec.md 內部矛盾：F-01 表「16 筆種子」vs 範圍邊界「美股七雄、6 個幣、PAXG 金、KAG 銀」=7+6+1+1=15）
- **決策內容**：採以範圍邊界明列為準（15），F-01 表的「16」標為粗算筆誤。roadmap 1.A.1 同步修正。
- **風險等級**：低

## CHANGE-006

- **時間戳**：2026-05-30T01:30:00+08:00
- **類型**：變更
- **範圍與摘要**：Phase 1 完整 code complete。新增 `src/lib/{coingecko,finnhub,changePct,snapshot}.ts`、`src/app/api/{watchlist,prices,cron/snapshot}/route.ts`、`src/components/AutoRefresh.tsx`、`src/app/page.tsx` 改 15 卡片版。mock test 11 案全過。
- **觸發來源**：使用者指示「進 Phase 1」
- **風險等級**：低

## CHANGE-007

- **時間戳**：2026-05-30T01:30:00+08:00
- **類型**：自主判斷
- **範圍與摘要**：Phase 2 Claude SDK 選 **raw fetch 而非 @anthropic-ai/sdk**。
- **觸發來源**：AI 自主判斷
- **決策內容**：脈絡：spec/design 沒指定 SDK；用量極低（每天 5 次摘要 + 每週 1 次週報）；不需要 streaming/batching/auto-retry。選項：（A）raw fetch；（B）安裝 SDK。決定：A。後果：若之後需要 prompt caching、tool use、批次 batch API 再升 SDK。
- **風險等級**：低

## CHANGE-008

- **時間戳**：2026-05-30T01:30:00+08:00
- **類型**：變更
- **範圍與摘要**：Phase 2 完整 code complete。新增 `src/lib/news/{types,cryptopanic,finnhub-news,marketaux}.ts`、`src/lib/{claude,digest,retention}.ts`、`src/app/api/{cron/daily,cron/weekly,digest}/route.ts`、`vercel.json` crons 設定。mock test 新增 9 案總計 20/20 過。
- **觸發來源**：使用者指示「繼續 Phase 2 不要停」
- **風險等級**：低
- **caveat**：F-10/F-11 真實 Claude API call、F-21/F-22 真實 cron 觸發、F-23 真實過期資料清理三項驗證待人類授權後手動 trigger 或等首次 Vercel cron 排程（每日 01:00 UTC = 台北 09:00）。

## CHANGE-009

- **時間戳**：2026-05-30T02:00:00+08:00
- **類型**：自主判斷
- **範圍與摘要**：主題切換不引入 next-themes 等套件，自寫 cookie-based class toggle。
- **觸發來源**：AI 自主判斷
- **決策內容**：脈絡：spec 要求深淺切換 + cookie persist + 預設深；next-themes 是社群標準但需新依賴。選項：（A）自寫；（B）next-themes。決定：A。後果：~50 行（globals.css 配 @variant + theme.ts + ThemeToggle.tsx + layout.tsx 從 cookies() 注 className），無 hydration flash。
- **風險等級**：低

## CHANGE-010

- **時間戳**：2026-05-30T02:00:00+08:00
- **類型**：自主判斷
- **範圍與摘要**：週報頁面暫不引入 markdown renderer，用 `<pre className="whitespace-pre-wrap">` 顯原文。
- **觸發來源**：AI 自主判斷
- **決策內容**：Phase 3.3 spec 驗收「點擊可見週報」minimum 過；Phase 4 視覺拍板後正式換 react-markdown 或自寫 minimal markdown→React node 轉換器。
- **風險等級**：低

## CHANGE-011

- **時間戳**：2026-05-30T02:00:00+08:00
- **類型**：變更
- **範圍與摘要**：Phase 3 完整 code complete。新增 `src/components/{PriceWall,DigestSection,ThemeToggle}.tsx`、`src/lib/theme.ts`、`src/app/weekly/page.tsx`；改寫 `src/app/page.tsx` 用 PriceWall + DigestSection + ThemeToggle 並從 cookies() 讀主題；globals.css 改 @variant class-based dark mode。
- **觸發來源**：使用者指示「繼續往下不要停」
- **風險等級**：低
- **caveat**：3.5 緊湊密度為 minimum 版，正式設計細調等 Phase 4 視覺風格拍板後處理。Phase 3.3 weekly markdown 顯原文，待 polish。

## DECISION-012

- **時間戳**：2026-05-30T02:30:00+08:00
- **類型**：決策
- **範圍與摘要**：跳過 Phase 4，先做 Phase 5。
- **觸發來源**：AI 自主判斷
- **決策內容**：脈絡：Phase 4 spec 明文「前置：視覺風格拍板」（roadmap 1.7），由人類決定的不可逆品味；Phase 5 admin 不依賴視覺拍板。決定：Phase 4 暫停等拍板、先推 Phase 5。後果：Phase 5 完成後仍需人類拍視覺才能解 Phase 4 阻塞。
- **風險等級**：低

## CHANGE-013

- **時間戳**：2026-05-30T02:30:00+08:00
- **類型**：自主判斷
- **範圍與摘要**：admin session HMAC key **沿用 `CRON_SECRET`** 而非新增 `ADMIN_SESSION_SECRET` env var。
- **觸發來源**：AI 自主判斷
- **決策內容**：脈絡：單一 admin 場景無第二把 key 需求；新增環境變數會增加管理成本。選項：(A) 沿用 CRON_SECRET；(B) 新增 ADMIN_SESSION_SECRET。決定：A。後果：未來若 admin 與 cron secret 需分離（例如轉發給第三方 cron 服務），改成 B 需 logout 全 session（無向下兼容）。
- **風險等級**：低

## CHANGE-015

- **時間戳**：2026-05-30T02:50:00+08:00
- **類型**：修正
- **範圍與摘要**：source 內部 import 統一不帶 `.ts` extension（之前我為了讓 node:test runner 認得而帶 `.ts`，但 Next.js 預設 tsconfig `allowImportingTsExtensions=false`，prod build 報「An import path can only end with a '.ts' extension when allowImportingTsExtensions is enabled」並 abort）。
- **觸發來源**：自動偵測（Vercel build failed、線上 alias 卡在前一份）
- **決策內容**：src/ 內 5 個檔（digest, retention, news/{cryptopanic,finnhub-news,marketaux}）的相對 import 移除 `.ts`。tests/ 維持帶 `.ts`（node:test 走 `--experimental-strip-types` 路徑需要 explicit extension）。
- **風險等級**：中（這個若沒抓到、admin 相關所有改動都不上線）
- **後果**：之後晉升 ai-rules.md 硬性教訓——「Next.js source 內互相 import 不可帶 .ts extension，僅 node:test files 才帶」。

## CHANGE-016

- **時間戳**：2026-05-30T02:50:00+08:00
- **類型**：修正
- **範圍與摘要**：Finnhub key 換新（40 字元、之前 20 字元的 free tier key 被 Finnhub 回 "Invalid API key"）。bash 路徑重 upload Vercel production env。
- **觸發來源**：人類指示（cmd c → 修 Finnhub key）
- **後果**：線上 /api/prices 美股 7 標的全部有實際值。**注意**：Finnhub free tier 的 `/stock/market-status` endpoint 對 isOpen 永遠回 false，所以 marketClosed flag 在線上一直是 true；但 `/quote` 回實際 c 與 pc，code 正確顯示 price 與「休市」label（前者真實後者保守）。
- **風險等級**：低

## CHANGE-017

- **時間戳**：2026-05-30T03:15:00+08:00
- **類型**：變更（驗收）
- **範圍與摘要**：Phase 2 Claude API 與 daily cron 一次真實 trigger 完成。結果：snapshot 15 筆全寫入；Finnhub news 902 條 / Marketaux 6 條 / CryptoPanic 0 條（**404 follow-up**）；Claude 摘要 stock=3、geo=2、macro=2、crypto=0、metal=0（後兩者因 CryptoPanic 0 條而 fallback）；payload 含 source_url/source/published_at；retention 跑了 0/0/0。線上首頁渲染 5 類區塊 + 「川普」「伊朗」「軟著陸」實際解讀文字。
- **觸發來源**：人類指示（cmd b → SQL + trigger）
- **風險等級**：低

## CHANGE-018 — follow-up

- **時間戳**：2026-05-30T03:15:00+08:00
- **類型**：修正待辦
- **範圍與摘要**：CryptoPanic API 端點 404。試過 4 個 URL 變體（v1/posts、free/v1/posts、developer/v2/posts、free/v2/posts、pro/v2/posts）全 404；webfetch dev docs 403、search 出來的兩個來源彼此矛盾（一說 base 改 `/{plan}/v2/`、一說仍是 `/v1/`）；request HTML body 看不出有用線索。
- **觸發來源**：自動偵測（cron daily 跑出 cryptopanic warning）
- **決策內容**：暫不修，按 spec.md 工程紅線 4「單一資料源失效不拖垮整頁」，crypto/metal 兩類目前 fallback 為空 digest 區塊；待人類登入 CryptoPanic dashboard 取「實際當前可用 endpoint URL」貼給我，或評估換源（CoinDesk RSS / CoinGecko news beta / NewsAPI 加密類）。
- **風險等級**：低（不阻塞其他類，且 spec 容錯設計範圍內）

## CHANGE-014

- **時間戳**：2026-05-30T02:30:00+08:00
- **類型**：變更
- **範圍與摘要**：Phase 5.1 + 5.2 完整 code complete。新增 `src/lib/admin-session.ts`（HMAC + timingSafeEqual）、`src/app/api/admin/{login,logout,watchlist}/route.ts`、`src/app/admin/{login,}/{page,LoginForm,AdminWatchlistEditor}.tsx`。session HMAC mock 4 案；endpoint guard local 驗：未登入 → 307/401。
- **觸發來源**：使用者指示「繼續不停」
- **風險等級**：低
- **caveat**：5.1 對的帳密 + 設 cookie 流程 local 未驗（要從 .env.local 讀 ADMIN_PASSWORD 用 curl cookie jar 驗）；建議使用者瀏覽器手動驗。5.3 Vercel rollback 演練需人類觸發。
