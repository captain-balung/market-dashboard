import type { GaugeValue } from "@/lib/sentiment";

const COLOR_AT = (v: number): string => {
  // 0-25 紅, 25-50 橙, 50-75 黃, 75-100 綠
  if (v < 25) return "#ef4444";
  if (v < 50) return "#f97316";
  if (v < 75) return "#facc15";
  return "#10b981";
};

/**
 * 半圓指針儀表 — F-15/16/17。
 *
 * 0-100 範圍。VIX 也用此但範圍 0-50 視為 100% 滿。
 * 失效時傳 null → 顯「暫無資料」（spec 工程紅線 4）。
 */
export function Gauge({
  title,
  data,
  max = 100,
  unit,
}: {
  title: string;
  data: GaugeValue | null;
  max?: number;
  unit?: string;
}) {
  if (!data) {
    return (
      <div className="flex flex-col items-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
          {title}
        </div>
        <div className="mt-4 mb-3 text-xs text-[var(--color-muted)]">暫無資料</div>
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(max, data.value));
  const pct = clamped / max;
  // 半圓：-90deg 到 +90deg，指針角度 = pct * 180 - 90
  const angle = pct * 180 - 90;
  const color = COLOR_AT(pct * 100);

  return (
    <div className="flex flex-col items-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{title}</div>
      <div className="relative mt-2 h-14 w-28 overflow-hidden">
        <svg viewBox="0 0 100 50" className="h-full w-full">
          {/* 背景半圓四段顏色 */}
          <path d="M 5 50 A 45 45 0 0 1 28.5 11" fill="none" stroke="#ef4444" strokeWidth="6" />
          <path d="M 28.5 11 A 45 45 0 0 1 50 5" fill="none" stroke="#f97316" strokeWidth="6" />
          <path d="M 50 5 A 45 45 0 0 1 71.5 11" fill="none" stroke="#facc15" strokeWidth="6" />
          <path d="M 71.5 11 A 45 45 0 0 1 95 50" fill="none" stroke="#10b981" strokeWidth="6" />
          {/* 指針 */}
          <g transform={`rotate(${angle} 50 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="14"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="3" fill={color} />
          </g>
        </svg>
      </div>
      <div className="mt-1 font-mono text-lg tabular-nums" style={{ color }}>
        {clamped.toFixed(unit === "%" ? 2 : 0)}
        {unit ? <span className="ml-1 text-[10px] text-[var(--color-muted)]">{unit}</span> : null}
      </div>
      {data.label ? (
        <div className="text-[10px] text-[var(--color-muted)]">{data.label}</div>
      ) : null}
    </div>
  );
}
