import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/watchlist (F-01)
 *
 * 回啟用中的 watchlist。Phase 1.A.1 驗收：回 16 筆。
 */
export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("watchlist")
    .select("symbol, category, tv_symbol, has_chart")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("symbol", { ascending: true });

  if (error) {
    return NextResponse.json(
      { status: "error", message: error.message, items: [] },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: "ok", count: data?.length ?? 0, items: data ?? [] });
}
