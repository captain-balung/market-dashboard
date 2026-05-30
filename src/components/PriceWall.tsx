import type { ChangeValue } from "@/lib/changePct";

export type PriceCard = {
  symbol: string;
  category: string;
  price: number | null;
  change: ChangeValue;
  marketClosed: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  crypto: "加密",
  metal: "貴金屬",
  stock: "美股",
};

const TONE_CLASS: Record<"up" | "down" | "flat" | "muted", string> = {
  up: "text-emerald-500 dark:text-emerald-400",
  down: "text-rose-500 dark:text-rose-400",
  flat: "text-zinc-500 dark:text-zinc-400",
  muted: "text-zinc-400 dark:text-zinc-500",
};

function formatPrice(price: number | null): string {
  if (price == null) return "—";
  const digits = price < 1 ? 4 : 2;
  return `$${price.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
}

function formatChange(c: ChangeValue): { text: string; tone: "up" | "down" | "flat" | "muted" } {
  if (c.kind === "closed") return { text: "休市", tone: "muted" };
  if (c.kind === "unavailable") return { text: "—", tone: "muted" };
  const pct = c.value * 100;
  const sign = pct > 0 ? "+" : "";
  const tone = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  return { text: `${sign}${pct.toFixed(2)}%`, tone };
}

function groupByCategory(cards: PriceCard[]): Record<string, PriceCard[]> {
  const groups: Record<string, PriceCard[]> = { crypto: [], metal: [], stock: [] };
  for (const c of cards) {
    if (groups[c.category]) groups[c.category].push(c);
  }
  return groups;
}

export function PriceWall({ cards }: { cards: PriceCard[] }) {
  const groups = groupByCategory(cards);
  const groupOrder = ["crypto", "metal", "stock"] as const;

  return (
    <section className="space-y-4">
      {groupOrder.map((cat) => {
        const items = groups[cat];
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="mb-2 text-[11px] uppercase tracking-wider text-[var(--color-muted)]">
              {CATEGORY_LABEL[cat]}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((c) => {
                const ch = formatChange(c.change);
                return (
                  <div
                    key={c.symbol}
                    className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5"
                  >
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-medium">{c.symbol}</div>
                      <div className={`text-[10px] tabular-nums ${TONE_CLASS[ch.tone]}`}>
                        {ch.text}
                      </div>
                    </div>
                    <div className="mt-1.5 font-mono text-base tabular-nums">
                      {formatPrice(c.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
