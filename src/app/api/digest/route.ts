import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * GET /api/digest?type=daily|weekly
 *
 * 讀最新一份摘要快取（spec 反例：摘要不該每次開頁即時呼叫 Claude）。
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "daily";
  if (type !== "daily" && type !== "weekly") {
    return NextResponse.json({ status: "error", message: "invalid type" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (type === "daily") {
    const { data, error } = await supabase
      .from("daily_digest")
      .select("date, payload, created_at")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ status: "ok", digest: data });
  }

  const { data, error } = await supabase
    .from("weekly_digest")
    .select("week_of, content, created_at")
    .order("week_of", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
  return NextResponse.json({ status: "ok", digest: data });
}
