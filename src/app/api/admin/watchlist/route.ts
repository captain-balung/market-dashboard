import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token).valid;
}

const VALID_CATEGORIES = new Set(["crypto", "metal", "stock"]);

/**
 * POST /api/admin/watchlist — F-20 新增標的
 * body: { symbol, category, tv_symbol?, has_chart? }
 */
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ status: "error", message: "invalid json" }, { status: 400 });
  }
  const symbol = typeof body.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const tv_symbol = typeof body.tv_symbol === "string" ? body.tv_symbol : null;
  const has_chart = typeof body.has_chart === "boolean" ? body.has_chart : true;

  if (!symbol || !VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ status: "error", message: "invalid symbol or category" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("watchlist").upsert(
    { symbol, category, tv_symbol, has_chart, active: true },
    { onConflict: "symbol" },
  );
  if (error) return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  return NextResponse.json({ status: "ok" });
}

/**
 * PATCH /api/admin/watchlist — F-20 停用/啟用標的
 * body: { symbol, active: boolean }
 */
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ status: "error", message: "invalid json" }, { status: 400 });
  }
  const symbol = typeof body.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
  const active = typeof body.active === "boolean" ? body.active : null;
  if (!symbol || active === null) {
    return NextResponse.json({ status: "error", message: "symbol + active required" }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("watchlist").update({ active }).eq("symbol", symbol);
  if (error) return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  return NextResponse.json({ status: "ok" });
}
