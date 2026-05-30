import { NextResponse } from "next/server";
import { writeNineAmSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/snapshot — F-04 手動觸發（與正式 cron F-21 共用此邏輯）。
 *
 * Phase 1.C.1 驗收：手動觸發後 price_snapshot 表有當日 09:00 筆。
 *
 * Auth：要求 Authorization: Bearer ${CRON_SECRET}。
 */
export async function POST(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await writeNineAmSnapshot();
    return NextResponse.json({ status: "ok", ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
