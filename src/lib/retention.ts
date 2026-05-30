/**
 * 資料保留清理 — F-23 (Phase 2.C.4)。
 *
 * - daily_digest：> 90 天刪
 * - price_snapshot：> 90 天刪
 * - weekly_digest：> 3 年刪（合 spec：使用者可回看一年週報、保險 3 年）
 */

import { getSupabaseServerClient } from "./supabase-server.ts";

export type RetentionResult = {
  dailyDeleted: number | null;
  weeklyDeleted: number | null;
  snapshotDeleted: number | null;
};

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function isoDateDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function runRetentionCleanup(): Promise<RetentionResult> {
  const supabase = getSupabaseServerClient();

  const daily = await supabase
    .from("daily_digest")
    .delete({ count: "exact" })
    .lt("date", isoDateDaysAgo(90));

  const weekly = await supabase
    .from("weekly_digest")
    .delete({ count: "exact" })
    .lt("week_of", isoDateDaysAgo(365 * 3));

  const snapshot = await supabase
    .from("price_snapshot")
    .delete({ count: "exact" })
    .lt("snapshot_at", isoDaysAgo(90));

  return {
    dailyDeleted: daily.count ?? null,
    weeklyDeleted: weekly.count ?? null,
    snapshotDeleted: snapshot.count ?? null,
  };
}
