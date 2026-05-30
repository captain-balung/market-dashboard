import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { summarizeWeekly, persistWeeklyDigest, getTaipeiDateString } from "@/lib/digest";
import type { DigestItem } from "@/lib/digest";
import type { NewsCategory } from "@/lib/news/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/cron/weekly — F-22。
 *
 * 讀過去 7 份 daily_digest，丟 Claude 濃縮成週報 markdown，寫 weekly_digest。
 * weekOf 取本週一（台北）。
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const today = new Date();
  const dayOfWeek = (today.getUTCDay() + 8) % 7; // 把 sunday(0) 變成 6，monday(1) 變成 0
  const mondayUtc = new Date(today);
  mondayUtc.setUTCDate(today.getUTCDate() - dayOfWeek);
  const weekOf = getTaipeiDateString(mondayUtc);

  const sevenAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fromDate = getTaipeiDateString(sevenAgo);
  const toDate = getTaipeiDateString(today);

  const { data: rows, error: dbError } = await supabase
    .from("daily_digest")
    .select("date, payload")
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: true });

  if (dbError) {
    return NextResponse.json(
      { status: "error", source: "supabase", message: dbError.message },
      { status: 500 },
    );
  }

  const digests = (rows ?? []).map((r) => ({
    date: r.date as string,
    payload: r.payload as Record<NewsCategory, DigestItem[]>,
  }));

  try {
    const content = await summarizeWeekly(digests);
    await persistWeeklyDigest(weekOf, content);
    return NextResponse.json({
      status: "ok",
      weekOf,
      sourceDays: digests.length,
      contentChars: content.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
