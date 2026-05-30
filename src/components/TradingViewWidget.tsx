"use client";

import { useEffect, useRef } from "react";

/**
 * TradingView 嵌入式 widget — F-13。
 *
 * 用官方 tv.js + new TradingView.widget()。
 * Phase 4 主圖（日線）掛 MA20/60/120 + MACD + RSI + 布林 + 量。
 * 小圖（4h/1h/15m）只掛 MA20。
 */

type Interval = "D" | "240" | "60" | "15";

const STUDIES_MAIN = [
  "MASimple@tv-basicstudies",
  "MACD@tv-basicstudies",
  "RSI@tv-basicstudies",
  "BB@tv-basicstudies",
  "Volume@tv-basicstudies",
];

const STUDIES_SUB = ["MASimple@tv-basicstudies"];

declare global {
  interface Window {
    TradingView?: {
      widget: new (options: Record<string, unknown>) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTvScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.TradingView) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/tv.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("tv.js load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function TradingViewWidget({
  symbol,
  interval,
  studies = "main",
  height = 400,
}: {
  symbol: string;
  interval: Interval;
  studies?: "main" | "sub";
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `tv-${symbol.replace(/[:.]/g, "-")}-${interval}`;

  useEffect(() => {
    let cancelled = false;
    loadTvScript()
      .then(() => {
        if (cancelled || !window.TradingView || !ref.current) return;
        ref.current.innerHTML = "";
        const target = document.createElement("div");
        target.id = id;
        ref.current.appendChild(target);
        new window.TradingView.widget({
          container_id: id,
          symbol,
          interval,
          theme: "dark",
          style: "1",
          locale: "zh_TW",
          timezone: "Asia/Taipei",
          toolbar_bg: "#0a0a0a",
          enable_publishing: false,
          hide_top_toolbar: studies === "sub",
          hide_side_toolbar: studies === "sub",
          allow_symbol_change: false,
          studies: studies === "main" ? STUDIES_MAIN : STUDIES_SUB,
          autosize: true,
        });
      })
      .catch((e) => {
        if (ref.current) {
          ref.current.innerHTML =
            '<div class="flex h-full items-center justify-center text-xs text-zinc-500">TradingView 載入失敗</div>';
        }
        console.error("TradingView load failed:", e);
      });
    return () => {
      cancelled = true;
    };
  }, [id, symbol, interval, studies]);

  return <div ref={ref} style={{ height }} className="w-full" />;
}

export function NoChartFallback({ symbol }: { symbol: string }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-muted)]">
      {symbol}：無圖表（標的不支援 TradingView 嵌入）
    </div>
  );
}
