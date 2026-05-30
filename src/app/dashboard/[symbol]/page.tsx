import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import {
  fetchCryptoFearGreed,
  fetchVixGauge,
  fetchCnnFearGreed,
  fetchMacroFred,
  type GaugeValue,
  type MacroPoint,
} from "@/lib/sentiment";
import { DashboardSidebar, type SidebarItem } from "@/components/DashboardSidebar";
import { Gauge } from "@/components/Gauge";
import { MacroPanel } from "@/components/MacroPanel";
import { TradingViewWidget, NoChartFallback } from "@/components/TradingViewWidget";

export const dynamic = "force-dynamic";

type Params = { symbol: string };

export default async function DashboardSymbolPage({ params }: { params: Promise<Params> }) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  const supabase = getSupabaseServerClient();
  const { data: rows } = await supabase
    .from("watchlist")
    .select("symbol, category, tv_symbol, has_chart")
    .eq("active", true);

  const items = (rows ?? []) as (SidebarItem & { tv_symbol: string | null })[];
  const current = items.find((i) => i.symbol === symbol);
  if (!current) notFound();

  const warnings: string[] = [];

  const [cryptoFG, vix, cnnFG, macro] = await Promise.all([
    fetchCryptoFearGreed().catch((e) => {
      warnings.push(`alternative.me: ${e instanceof Error ? e.message : "unknown"}`);
      return null as GaugeValue | null;
    }),
    fetchVixGauge().catch((e) => {
      warnings.push(`Finnhub VIX: ${e instanceof Error ? e.message : "unknown"}`);
      return null as GaugeValue | null;
    }),
    fetchCnnFearGreed().catch((e) => {
      warnings.push(`CNN: ${e instanceof Error ? e.message : "unknown"}`);
      return null as GaugeValue | null;
    }),
    fetchMacroFred().catch((e) => {
      warnings.push(`FRED: ${e instanceof Error ? e.message : "unknown"}`);
      return [] as MacroPoint[];
    }),
  ]);

  const tv = current.tv_symbol;

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar items={items} selected={symbol} />

      <main className="flex-1 px-4 py-3">
        <header className="mb-3 flex items-baseline justify-between">
          <div>
            <h1 className="text-base font-semibold">
              {symbol}
              <span className="ml-2 text-[10px] uppercase text-[var(--color-muted)]">
                {current.category}
              </span>
            </h1>
          </div>
          <Link href="/" className="text-xs text-[var(--color-muted)] hover:underline">
            ← 首頁
          </Link>
        </header>

        {/* K 線區 */}
        <section className="mb-4 space-y-2">
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            {tv && current.has_chart ? (
              <TradingViewWidget symbol={tv} interval="D" studies="main" height={420} />
            ) : (
              <div className="h-[420px]">
                <NoChartFallback symbol={symbol} />
              </div>
            )}
          </div>
          {tv && current.has_chart ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {(["240", "60", "15"] as const).map((iv) => (
                <div
                  key={iv}
                  className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
                >
                  <div className="px-2 py-0.5 text-[10px] uppercase text-[var(--color-muted)]">
                    {iv === "240" ? "4h" : iv === "60" ? "1h" : "15m"}
                  </div>
                  <TradingViewWidget symbol={tv} interval={iv} studies="sub" height={200} />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* 情緒 + 總經 */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Gauge title="加密恐懼貪婪" data={cryptoFG} />
          <Gauge title="VIX" data={vix} max={50} unit="" />
          <Gauge title="CNN 美股恐懼貪婪" data={cnnFG} />
          <MacroPanel items={macro} />
        </section>

        {warnings.length ? (
          <ul className="mt-3 space-y-0.5 text-[10px] text-amber-500">
            {warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
