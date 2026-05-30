import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin-session";
import { AdminWatchlistEditor } from "./AdminWatchlistEditor";

export const dynamic = "force-dynamic";

type WatchlistRow = {
  symbol: string;
  category: string;
  tv_symbol: string | null;
  has_chart: boolean;
  active: boolean;
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session.valid) redirect("/admin/login");

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("watchlist")
    .select("symbol, category, tv_symbol, has_chart, active")
    .order("active", { ascending: false })
    .order("category")
    .order("symbol");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">標的管理</h1>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="text-xs text-[var(--color-muted)] hover:underline"
            formAction="/api/admin/logout"
          >
            登出
          </button>
        </form>
      </header>

      {error ? (
        <div className="rounded border border-red-900 bg-red-950/30 p-4 text-sm text-red-200">
          讀取失敗：{error.message}
        </div>
      ) : (
        <AdminWatchlistEditor rows={(data ?? []) as WatchlistRow[]} />
      )}
    </main>
  );
}
