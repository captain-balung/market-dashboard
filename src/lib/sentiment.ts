/**
 * 情緒 + 總經 helper (server-only) — F-15 / F-16 / F-17 / F-18。
 *
 * 每個源獨立 try/catch，個別失效不影響其他（spec 工程紅線 4）。
 */

export type GaugeValue = {
  value: number;
  label: string;
  asOf?: string;
};

export type MacroPoint = {
  series: string;
  label: string;
  value: number | null;
  asOf: string | null;
  unit?: string;
};

// -------- F-15: 加密恐懼貪婪（Alternative.me）--------

export type AlternativeMeResponse = {
  data?: { value?: string | number; value_classification?: string; timestamp?: string }[];
};

export function parseAlternativeMe(json: AlternativeMeResponse): GaugeValue | null {
  const first = json.data?.[0];
  if (!first) return null;
  const value = Number(first.value);
  if (!Number.isFinite(value)) return null;
  return {
    value,
    label: first.value_classification ?? "",
    asOf: first.timestamp ? new Date(Number(first.timestamp) * 1000).toISOString() : undefined,
  };
}

export async function fetchCryptoFearGreed(): Promise<GaugeValue | null> {
  const res = await fetch("https://api.alternative.me/fng/?limit=1", {
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`Alternative.me ${res.status}`);
  return parseAlternativeMe((await res.json()) as AlternativeMeResponse);
}

// -------- F-16: VIX (FRED VIXCLS — Finnhub free tier 對 ^VIX 拒絕，改 FRED 政府源) --------

export async function fetchVixGauge(): Promise<GaugeValue | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error("FRED_API_KEY missing");
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${key}&file_type=json&sort_order=desc&limit=1`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`FRED VIXCLS ${res.status}`);
  const json = (await res.json()) as FredObservationResponse;
  const last = (json.observations ?? []).filter((o) => o.value && o.value !== ".").slice(-1)[0];
  if (!last) return null;
  const value = Number(last.value);
  if (!Number.isFinite(value)) return null;
  return {
    value,
    label: classifyVix(value),
    asOf: last.date ?? undefined,
  };
}

function classifyVix(v: number): string {
  if (v < 15) return "低波動";
  if (v < 20) return "正常";
  if (v < 30) return "緊張";
  return "恐慌";
}

// -------- F-17: CNN 美股恐懼貪婪（非官方）--------

export type CnnResponse = {
  fear_and_greed?: { score?: number; rating?: string; timestamp?: string };
};

export function parseCnnFng(json: CnnResponse): GaugeValue | null {
  const fg = json.fear_and_greed;
  if (!fg || typeof fg.score !== "number") return null;
  return {
    value: Math.round(fg.score),
    label: fg.rating ?? "",
    asOf: fg.timestamp,
  };
}

export async function fetchCnnFearGreed(): Promise<GaugeValue | null> {
  const res = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 market-dashboard",
      accept: "application/json",
    },
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`CNN ${res.status}`);
  return parseCnnFng((await res.json()) as CnnResponse);
}

// -------- F-18: FRED 總經 5 項 --------

export type FredObservationResponse = {
  observations?: { date?: string; value?: string }[];
};

const FRED_SERIES: { series: string; label: string; unit?: string }[] = [
  { series: "CPIAUCSL", label: "CPI", unit: "Index 1982-84=100" },
  { series: "DFF", label: "Fed Funds Rate", unit: "%" },
  { series: "DTWEXBGS", label: "DXY (寬基美元指數)", unit: "Index" },
  { series: "DGS10", label: "10Y 國債殖利率", unit: "%" },
  { series: "UNRATE", label: "失業率", unit: "%" },
];

export function parseFredLatest(
  series: string,
  label: string,
  unit: string | undefined,
  json: FredObservationResponse,
): MacroPoint {
  const last = (json.observations ?? []).filter((o) => o.value !== "." && o.value).slice(-1)[0];
  if (!last) return { series, label, value: null, asOf: null, unit };
  const value = Number(last.value);
  if (!Number.isFinite(value)) return { series, label, value: null, asOf: null, unit };
  return { series, label, value, asOf: last.date ?? null, unit };
}

async function fetchFredOne(
  series: string,
  label: string,
  unit: string | undefined,
): Promise<MacroPoint> {
  const key = process.env.FRED_API_KEY;
  if (!key) throw new Error("FRED_API_KEY missing");
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${key}&file_type=json&sort_order=desc&limit=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FRED ${series} ${res.status}`);
  return parseFredLatest(series, label, unit, (await res.json()) as FredObservationResponse);
}

export async function fetchMacroFred(): Promise<MacroPoint[]> {
  const out: MacroPoint[] = [];
  await Promise.all(
    FRED_SERIES.map(async ({ series, label, unit }) => {
      try {
        out.push(await fetchFredOne(series, label, unit));
      } catch {
        out.push({ series, label, value: null, asOf: null, unit });
      }
    }),
  );
  // 保 spec 順序
  return FRED_SERIES.map(
    ({ series }) =>
      out.find((o) => o.series === series) ?? { series, label: series, value: null, asOf: null },
  );
}
