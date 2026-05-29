# Market Dashboard

> 個人用的加密貨幣／貴金屬／美股每日新聞與盯盤儀表網站。

## 一句話描述

每天早上自動彙整三大市場新聞、附 AI 繁中解讀，並提供 TradingView 盯盤儀表的個人看板。

## 安裝方式

**環境需求**

- Node.js ≥ 20
- npm ≥ 10
- Supabase 專案（免費方案即可）
- Vercel 帳號（部署用）
- 各資料源 API key（見下方 `.env` 範例）

**安裝指令**

```bash
git clone <repo-url>
cd market-dashboard
npm install
cp .env.example .env.local   # 填入下方各項 key
npm run dev                  # 本機開發伺服器 http://localhost:3000
```

**環境變數（`.env.local`）**

```bash
# 資料庫
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# 價格與新聞資料源
COINGECKO_API_KEY=
FINNHUB_API_KEY=
CRYPTOPANIC_API_KEY=
MARKETAUX_API_KEY=
FRED_API_KEY=

# AI 摘要生成
ANTHROPIC_API_KEY=

# admin 管理介面（單一帳號，寫死於環境變數）
ADMIN_USERNAME=
ADMIN_PASSWORD=

# 排程保護（Vercel Cron 觸發驗證）
CRON_SECRET=
```

## 使用範例

```bash
# 本機啟動後，瀏覽器開：
#   http://localhost:3000        → 首頁（每日新聞看板）
#   http://localhost:3000/dashboard → 儀表頁（盯盤終端）
#   http://localhost:3000/admin  → 管理介面（需登入，增減自選標的）

# 手動觸發每日摘要生成（本機測試排程邏輯）：
curl -X POST http://localhost:3000/api/cron/daily \
  -H "Authorization: Bearer $CRON_SECRET"
```

## 主要功能

- **首頁／每日新聞看板**：五類新聞（加密／貴金屬／美股／國際形勢／總體經濟）AI 繁中摘要，每類約 3 則，附原文連結；價格牆（現價 15 分更新＋漲跌% 9:00 定格）
- **儀表頁／盯盤終端**：商品列表側欄、TradingView K 線圖區（日線主圖＋4h/1h/15m 小圖）、三個恐懼貪婪儀表、總經數據儀表
- **每日／每週排程**：台灣時間每日 09:00 生成當日摘要，每週一生成週報
- **admin 管理**：單一帳號登入後增減自選標的

功能細節與驗收條件見 [`spec.md`](./spec.md)。

## 授權與聯絡

- 私人專案，未公開授權。
- 問題回報：專案 issue 或直接聯絡作者本人。
