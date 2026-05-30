import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * /weekly — Phase 3.3 週報入口。
 *
 * 顯示最新一份 weekly_digest 的 markdown 原文。
 * Phase 4 視覺拍板後再換正式 markdown renderer；現在 minimum：pre-wrap 顯原文。
 */
export default async function WeeklyPage() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("weekly_digest")
    .select("week_of, content, created_at")
    .order("week_of", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">本週重點</h1>
          {data?.week_of ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">週起 {data.week_of}</p>
          ) : null}
        </div>
        <Link href="/" className="text-xs text-[var(--color-muted)] hover:underline">
          ← 返回首頁
        </Link>
      </header>

      {error ? (
        <div className="rounded border border-red-900 bg-red-950/30 p-4 text-sm text-red-200">
          讀取週報失敗：{error.message}
        </div>
      ) : !data ? (
        <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted)]">
          本週週報尚未生成（每週一 09:00 自動更新）。
        </div>
      ) : (
        <article className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
            {data.content}
          </pre>
        </article>
      )}
    </main>
  );
}
