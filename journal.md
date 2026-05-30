# journal.md — 對外進度素材

> 給人類拿去寫部落格/發社群/做進度報告的素材池。
> AI 只在收工時攢**條列原料**（非成品貼文）；人類可自由改寫、刪修、潤飾。
> 內容衍生自 log.md 與 roadmap.md，但用人話重寫。「可講/不可講」預設保守。

---

## 2026-05-28 — 規劃定案

**對應里程碑**：Phase 0 前置（規格與文件完成）

**進度重點（人話）**：
- 把一個「個人用的市場看板」從一句模糊想法，談成了完整規格：首頁每天早上自動整理三大市場（幣、金銀、美股）的新聞並用 AI 寫成中文摘要，另一頁是可以細看 K 線和市場情緒的盯盤儀表。
- 決定了所有資料怎麼來、用哪些免費服務、怎麼部署。

**可講/不可講**：
- ✅ 可講：產品概念、雙頁設計、用 AI 做新聞解讀的點子
- ⚠️ 不可講：任何 API key、admin 帳密、CRON_SECRET、Supabase 連線資訊

**素材鉤子（選填）**：
- 「為什麼一個只給自己用的工具，反而值得好好寫規格」——談個人專案也用正式流程的取捨
- 「漲跌幅不看 24 小時，而是用自己的『早上九點』當基準」——一個很個人化的設計決定
- 「想要 CNN 的市場情緒，但它沒有官方 API」——如何在不穩定資料源上做容錯設計

---

<!-- 後續每次收工往下 append 一組：日期+里程碑 / 進度重點 / 可講不可講 / 素材鉤子 -->

## 2026-05-30 — Phase 0 打通管線

**對應里程碑**：Phase 0「部署→測通→MVP」全收尾

**進度重點（人話）**：
- 從 0 到「線上能看到一張 BTC 卡片」端到端跑通：Next.js scaffold → GitHub repo → Vercel auto-deploy → Supabase 連線 → CoinGecko 抓現價 → 首頁 server component 渲染。
- 線上 https://market-dashboard-five-liard.vercel.app/ 顯示 BTC $73,854，5 個 commit 進 main。
- 中間踩了 4 個雷：Vercel Standard Protection 預設開 / `vercel projects add` 不偵測 framework / Next.js 16 與 Vercel adapter 不兼容 / PowerShell 5.1 pipe 加 BOM；都記入 log.md，並晉升為 ai-rules.md 硬性教訓。

**可講/不可講**：
- ✅ 可講：管線通法、踩雷與解法、為什麼選 Next.js 15 而非 16
- ✅ 可講：spec.md 的「先讓水管通水再裝水龍頭」順序如何挽救我在 deploy 階段就卡住
- ⚠️ 不可講：所有 env vars 值、線上 admin 帳密、CRON_SECRET

**素材鉤子（選填）**：
- 「用 `vercel projects add` 建專案是個陷阱：framework preset 預設 Other」— 給開發者的避雷指南
- 「PowerShell 5.1 偷塞 BOM 到 vercel CLI stdin，2 小時除錯」— 跨平台工具踩雷
- 「Next.js 16 Vercel build 假成功 routing 全 404」— 新版本搶先用的代價
- 「Hobby 帳號『需登入』預設值會擋住 production」— 個人專案 OSS 分享前必檢查

---

## 2026-05-30 — 一個 session 推到 90%

**對應里程碑**：Phase 1 / 2 / 3 / 5（5.1+5.2）code complete；Phase 4 待視覺拍板

**進度重點（人話）**：
- 從「線上一張 BTC 卡」一路推到「15 標的價格牆 + 五類新聞區 + 週報入口 + 深淺切換 + admin 增減標的」。
- 加上 Phase 2 的 Claude Sonnet 摘要 / 週報生成、Vercel cron 設定、資料保留清理。
- 寫了 24 個 mock 測試，全過。
- 線上 https://market-dashboard-five-liard.vercel.app 已可訪問完整首頁。

**剩待人類**：
1. 視覺風格拍板（TradingView 風 vs CoinGecko 風 vs Yahoo 風）+ 漲跌色票
2. Vercel rollback 演練一次
3. 授權手動 trigger 一次 Claude 摘要（約 $0.05）看實際品質
4. Finnhub API key 確認啟用
5. Supabase 跑 daily_digest / weekly_digest 兩張表的 SQL

**可講/不可講**：
- ✅ 可講：一個 session 推到 90%、規範體系如何讓 AI 自主推進不離題
- ✅ 可講：admin session 用 HMAC 自簽不引入 next-auth 等套件
- ✅ 可講：跳過視覺風格未拍板的 Phase 4、先做 Phase 5 的決策路徑
- ⚠️ 不可講：admin 帳密、CRON_SECRET、所有 API key

**素材鉤子（選填）**：
- 「為什麼 admin 認證自寫 50 行就好、不裝 next-auth」— 服務一個人的判斷
- 「品味屬人類、code 屬 AI：AI 該停下問的地方」— 規範如何防止 AI 過度自主
- 「Vercel hobby Cron 用免錢 + Anthropic 一次 $0.05 = 一個 AI 看板月成本 < $5」— 個人 AI 工具經濟學

---

## 2026-05-30（收工）— 一個 session 主線 6/6 Phase 全收尾

**對應里程碑**：spec.md 全 21 個 F-XX 中 18 個完整通過、3 個容錯通過、Phase 5.3 rollback 演練實測

**進度重點（人話）**：
- 從規格定案到「線上完整可用版本」一個 session 完成：
  - 首頁：價格牆 15 標的（現價 + 9:00 定格漲跌 + 休市）、五類新聞 AI 繁中摘要、本週重點入口、深淺主題切換
  - 儀表頁：TradingView K 線（日線主圖 + 4h/1h/15m 三小圖、含 MA/MACD/RSI/布林/量）、三個情緒儀表（加密 23 Extreme Fear / VIX / CNN 60 Greed）、五項總經
  - admin：HMAC session、watchlist 增減 UI
  - 排程：daily（snapshot + 三源新聞 + Claude 五類 + retention）、weekly（7 份濃縮）
  - 容錯設計：所有外部源獨立 try/catch、單一失效顯「暫無資料」、不拖垮全頁
- 線上 https://market-dashboard-five-liard.vercel.app／/dashboard/BTC／/weekly／/admin 全可訪問
- 16 個 git commit、33 個 mock test 全通、5 個踩雷晉升 ai-rules 硬性教訓
- Phase 5.3 rollback 演練實測 < 1 分鐘

**踩雷成就（log 與 ai-rules 已收編）**：
1. PowerShell 5.1 pipe 加 BOM 到 vercel CLI stdin（2 小時除錯）
2. `vercel projects add` 不偵測 framework，預設 Other（整站 routing 404）
3. Next.js 16 + Vercel adapter build 假成功（routing 全 404）
4. Vercel Hobby 新 project 預設「Require Log In」連 production 都 401
5. `.ts` extension 在 src/ 內互相 import 被 Vercel build 拒收

**剩 follow-up（全外部依賴）**：
- FRED API key 修（解 VIX + 5 項總經 → 自然激活）
- CryptoCompare free key 註冊 / 或換 RSS 源（解 crypto/metal 兩類 news）
- 等下週一 09:00 Vercel cron 自然觸發週報

**可講/不可講**：
- ✅ 可講：spec → code → 線上一氣呵成的時程、踩雷成就、容錯設計如何救場
- ✅ 可講：「先讓水管通水，再裝水龍頭」管線優先順序的實踐紀錄
- ✅ 可講：規格體系（spec/ai-rules/roadmap/log/journal）如何讓 AI 自主推進但不離題
- ✅ 可講：Vercel rollback < 1 分鐘的演練體驗
- ⚠️ 不可講：所有 env vars 值、admin 帳密、CRON_SECRET、token

**素材鉤子（選填）**：
- 「一個個人專案花一晚從零到 6 個 Phase 100% — 規格體系作為自動化框架的 PoC」
- 「Vercel rollback 演練 < 1 分鐘 — production 安全感的真實成本」
- 「CryptoPanic / CryptoCompare 雙雙改付費／加 key — 免費新聞 API 末路與 RSS 復活」
- 「主線 100% 但有 follow-up — 為什麼這不是失敗、而是設計」（容錯與外部依賴的責任分離）
