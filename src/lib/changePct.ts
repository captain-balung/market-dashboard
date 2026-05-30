/**
 * 9:00 定格漲跌計算 — F-05。
 *
 * spec.md 反例規格：價格牆漲跌% 不應在白天隨現價跳動 — 它是 9:00 定格值，
 * 一天只在 09:00 更新一次。
 *
 * 美股無昨日交易快照（休市日 / 週末）時回 "closed" 而非數字。
 */

export type ChangeValue =
  | { kind: "pct"; value: number } // 例如 0.0234 表示 +2.34%
  | { kind: "closed" }
  | { kind: "unavailable" };

export function calcChangePct(
  todaySnapshot: number | null | undefined,
  prevSnapshot: number | null | undefined,
  isStockMarketClosed: boolean,
): ChangeValue {
  if (isStockMarketClosed && (prevSnapshot == null || todaySnapshot == null)) {
    return { kind: "closed" };
  }
  if (
    todaySnapshot == null ||
    prevSnapshot == null ||
    prevSnapshot === 0 ||
    !Number.isFinite(todaySnapshot) ||
    !Number.isFinite(prevSnapshot)
  ) {
    return { kind: "unavailable" };
  }
  return { kind: "pct", value: (todaySnapshot - prevSnapshot) / prevSnapshot };
}
