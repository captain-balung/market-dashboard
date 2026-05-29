import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Phase 0.2.2 連線測試：從 watchlist 表 select 一筆驗證 Supabase 通。
 * 之後可以擴成完整健康檢查（DB、外部 API 等）。
 */
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("watchlist")
      .select("symbol, category, tv_symbol")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", source: "supabase", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "ok",
      supabase: { rows: data?.length ?? 0, sample: data?.[0] ?? null },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ status: "error", source: "server", message }, { status: 500 });
  }
}
