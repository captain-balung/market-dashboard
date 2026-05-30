import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ status: "ok" });
  res.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
