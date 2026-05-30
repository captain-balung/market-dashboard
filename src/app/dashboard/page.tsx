import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * /dashboard — 預設導到第一個有 chart 的標的（通常 BTC）。
 */
export default async function DashboardIndex() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("watchlist")
    .select("symbol, has_chart, category")
    .eq("active", true)
    .eq("has_chart", true)
    .order("category")
    .order("symbol")
    .limit(1);

  const first = data?.[0]?.symbol ?? "BTC";
  redirect(`/dashboard/${first}`);
}
