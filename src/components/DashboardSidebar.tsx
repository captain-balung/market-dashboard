import Link from "next/link";

export type SidebarItem = {
  symbol: string;
  category: string;
  has_chart: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  crypto: "加密",
  metal: "貴金屬",
  stock: "美股",
};

const ORDER = ["crypto", "metal", "stock"];

export function DashboardSidebar({ items, selected }: { items: SidebarItem[]; selected: string }) {
  const groups = ORDER.map((cat) => ({
    cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="w-44 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] py-2">
      {groups.map((g) => (
        <div key={g.cat} className="mb-3">
          <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
            {CATEGORY_LABEL[g.cat] ?? g.cat}
          </div>
          <ul>
            {g.items.map((i) => {
              const active = i.symbol === selected;
              return (
                <li key={i.symbol}>
                  <Link
                    href={`/dashboard/${i.symbol}`}
                    className={`flex items-baseline justify-between px-3 py-1 text-xs ${
                      active
                        ? "bg-emerald-600/20 font-medium text-emerald-400"
                        : "hover:bg-[var(--color-border)]/40"
                    }`}
                  >
                    <span>{i.symbol}</span>
                    {!i.has_chart ? (
                      <span className="text-[9px] text-[var(--color-muted)]">無圖</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
