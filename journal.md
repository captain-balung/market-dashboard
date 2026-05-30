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
