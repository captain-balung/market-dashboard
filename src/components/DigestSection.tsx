import type { DigestItem } from "@/lib/digest";
import type { NewsCategory } from "@/lib/news/types";

const CATEGORY_LABEL: Record<NewsCategory, string> = {
  crypto: "加密貨幣",
  metal: "貴金屬",
  stock: "美股",
  geo: "國際形勢",
  macro: "總體經濟",
};

const ORDER: NewsCategory[] = ["crypto", "metal", "stock", "macro", "geo"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("zh-TW", { month: "short", day: "numeric" });
}

export function DigestSection({
  digestDate,
  categories,
}: {
  digestDate: string | null;
  categories: Partial<Record<NewsCategory, DigestItem[]>>;
}) {
  if (!digestDate) {
    return (
      <section className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted)]">
        本日摘要尚未生成（每日 09:00 自動更新）。
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 flex items-baseline gap-2">
        <span className="text-sm font-semibold">本日摘要</span>
        <span className="text-xs text-[var(--color-muted)]">{digestDate}</span>
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {ORDER.map((cat) => {
          const items = categories[cat] ?? [];
          return (
            <div
              key={cat}
              className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            >
              <h3 className="mb-2 text-[11px] uppercase tracking-wider text-[var(--color-muted)]">
                {CATEGORY_LABEL[cat]}
              </h3>
              {items.length === 0 ? (
                <p className="text-xs text-[var(--color-muted)]">—</p>
              ) : (
                <ul className="space-y-2.5">
                  {items.map((item, i) => (
                    <li key={`${cat}-${i}`} className="border-l-2 border-zinc-700 pl-2.5">
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs font-medium hover:text-emerald-500 hover:underline"
                      >
                        {item.title}
                      </a>
                      <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-muted)]">
                        {item.summary}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--color-muted)]">
                        <span>{item.source}</span>
                        <span>·</span>
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
