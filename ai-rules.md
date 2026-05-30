# ai-rules.md（＝ CLAUDE.md）

> 本檔每 session 開始必載，是 Claude Code 的工作入口。
> 開工前必讀本檔與 `spec.md`；駕駛艙看 `roadmap.md`；所有自主變更與踩雷寫 `log.md`。
> 修改者：人類拍板，AI 不可自行修改本檔（唯一例外：依晉升規則追加「硬性教訓清單」）。

---

## 預設許可清單（正面清單，未列出視為需確認）

AI 預設可直接做：

- 讀任何專案內檔案
- 寫／改 `src/`、`tests/` 內的程式碼
- 跑測試、跑 lint/format
- 查官方文件、查 API 文件
- 改本地檔案（非機密設定）
- `git add` / `git commit`（本地，不含 push）
- 起本機 dev server、build、查本機 log
- 用 Playwright MCP 開瀏覽器查看前端成果、截圖比對

---

## 機器優先原則

可自動化且**可逆**的操作，AI **應優先**用 CLI/MCP 自行完成並驗證，不丟回人類手工：

- git 本地操作、build、起 dev server、查 log
- Supabase 本地/開發 migration 用 `supabase` CLI
- Vercel 部署狀態查詢用 `vercel` CLI
- GitHub 操作用 `gh`
- **視覺／前端成果**：用 Playwright MCP 自行開瀏覽器、截圖，與設計目標比對後再迭代，不丟回人類肉眼檢視
- 驗收能自動驗的葉節點（測試跑 CLI、視覺跑 Playwright 截圖），AI 自己驗完再勾 roadmap

**升級條件（須可機器判斷）**：同一自動化操作**連續失敗 2 次**才升級給人類。

**邊界**：不可逆操作即使有 CLI 仍須即時確認（讓位於下一欄）。把可自動化的可逆工作丟回人類，視為違反 `spec.md` 總體規範第 4 條，須記入 `log.md`。

---

## 需確認才能做的事（高風險／不可逆，每次都要當下確認）

- 刪檔（含 `rm -rf`）
- `git push`、`git push --force`、推 main branch
- 執行**正式環境** Supabase migration（改 schema、刪表）
- 安裝新依賴（npm install 新套件）
- 呼叫**付費** API（含 Anthropic API 的實跑生成，開發測試用小量請先確認）
- 部署到 Vercel production
- 改任何外部資源（Supabase 專案設定、Vercel 環境變數、DNS）
- 發送任何對外通訊

**不接受「整個 session 一次授權」，每次都要當下確認。**

---

## 絕對不能做的事（紅線）

- 把 API key、admin 密碼、`CRON_SECRET`、Supabase service role key 寫死於程式碼或前端
- 把任何機密貼進對話或 commit 進 git
- 在前端 bundle 暴露任何 server-only key
- 繞過 admin 認證直接寫入 watchlist
- 跳過測試直接合併
- 改 `log.md` 既有條目（只能 append）
- 未經確認執行不可逆操作
- 把任何機密餵給執行階段的 Claude Sonnet 摘要呼叫（它只收公開新聞文字）

---

## 不確定時的行為

- 不確定某操作屬於哪一級時：**採低估值（當作較安全可做）並記錄到 `log.md`**（觸發來源標「AI 自主判斷」）。事後可追究，當下不阻擋流程。
- 但若不確定的操作**靠近「絕對不能做」或「不可逆」**：**停下並問人類**，不自行判斷。

---

## 回報義務（強制，5 個觸發點，不可選擇性回報）

AI 必須主動回報，不是人類問才答：

1. 完成任務時
2. 卡住超過合理時間時
3. 做了 AI 自主判斷的決定時
4. 發現紅線可能被觸及時
5. 偵測到機密資料（key/密碼意外出現在不該出現的地方）時

---

## 收工協議（人類說「準備收工」時，依序執行）

1. 更新 `roadmap.md`：本 session 完成的葉節點打勾、狀態聚合、更新「當前焦點」
2. 同步被動到的文件：`spec.md` 若被改要記、`design.md` 若選型/視覺有變要更新
3. 寫技術紀錄入 `log.md`
4. 攢對外進度入 `journal.md`（條列原料 + 可講/不可講標記，非成品貼文）
5. 回報一段收工摘要

**某步若無變更，須明講「無變更」，不可跳過。**

---

## 硬性教訓清單（開工前必看）

> 由 `log.md` 踩過的雷晉升而來的一行式硬規則。格式：`- 不要在 X 情境用 Y（踩過，見 log YYYY-MM-DD）`。
> 控制數量 ≤ 12 條，超過時刪最舊/不復發者（原始紀錄仍留在 log.md）。

- 不要在 Windows PowerShell 5.1 用 `| vercel env add` 餵 secret value（會塞 UTF-8 BOM，Supabase 端拋 ByteString error）；改用 bash `printf '%s' "$val" | vercel env add KEY production`，或 Vercel dashboard 手動貼。**踩過，見 log 2026-05-30 CHANGE-004**。
- 不要用 `vercel projects add NAME` 建專案再 link（framework 預設 Other，整站 routing 404）；改用 `vercel link --yes` 觸發自動偵測，或必裝 `vercel.json` 寫 `"framework": "nextjs"`。**踩過，見 log 2026-05-30 CHANGE-002**。
- 不要對 Vercel 線上部署用 Next.js 16（`@vercel/next` adapter 對 16 prerender manifest 不兼容、build 假成功但 routing 404）；用 Next.js 15 LTS。**踩過，見 log 2026-05-30 CHANGE-001**。
- 不要忘記新 Vercel project 預設開「Standard Protection / Require Log In」連 production 都 401；dashboard → Deployment Protection → 關 toggle。**踩過，見 log 2026-05-30 CHANGE-003**。

---

## 附：錯誤教訓的留痕與晉升

1. **記錄**：踩雷時把「錯在哪、正確做法」寫入 `log.md`（類型「修正」或「變更」）
2. **晉升**為上方「硬性教訓清單」的條件（任一）：
   - 同類錯誤在 `log.md` 出現 ≥ 2 次
   - 該錯誤風險等級為高或不可逆
   - 人類明確指示「這條要記住」

晉升是 AI 唯一可自行追加本檔的情況（只能加「硬性教訓清單」，不可改其他欄位）。
