import type { MacroPoint } from "@/lib/sentiment";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatValue(p: MacroPoint): string {
  if (p.value == null) return "—";
  if (p.unit === "%") return `${p.value.toFixed(2)}%`;
  return p.value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function MacroPanel({ items }: { items: MacroPoint[] }) {
  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <h3 className="mb-2 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
        總體經濟（FRED）
      </h3>
      <ul className="divide-y divide-[var(--color-border)]">
        {items.map((p) => (
          <li key={p.series} className="flex items-baseline justify-between gap-2 py-1.5">
            <div className="flex flex-col">
              <span className="text-xs">{p.label}</span>
              <span className="text-[10px] text-[var(--color-muted)]">{formatDate(p.asOf)}</span>
            </div>
            <span className="font-mono text-sm tabular-nums">
              {p.value == null ? (
                <span className="text-[var(--color-muted)]">暫無資料</span>
              ) : (
                formatValue(p)
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
