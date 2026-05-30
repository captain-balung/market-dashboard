import { NextResponse } from "next/server";
import {
  fetchCryptoFearGreed,
  fetchVixGauge,
  fetchCnnFearGreed,
  fetchMacroFred,
  type GaugeValue,
  type MacroPoint,
} from "@/lib/sentiment";

export const dynamic = "force-dynamic";

/**
 * GET /api/sentiment — F-15/16/17/18。
 *
 * 四個源平行抓，個別失效標 null（不拖垮其他）。
 */
export async function GET() {
  const warnings: Record<string, string> = {};

  const [cryptoFG, vix, cnnFG, macro] = await Promise.all([
    fetchCryptoFearGreed().catch((e) => {
      warnings.alternative = e instanceof Error ? e.message : "unknown";
      return null as GaugeValue | null;
    }),
    fetchVixGauge().catch((e) => {
      warnings.vix = e instanceof Error ? e.message : "unknown";
      return null as GaugeValue | null;
    }),
    fetchCnnFearGreed().catch((e) => {
      warnings.cnn = e instanceof Error ? e.message : "unknown";
      return null as GaugeValue | null;
    }),
    fetchMacroFred().catch((e) => {
      warnings.fred = e instanceof Error ? e.message : "unknown";
      return [] as MacroPoint[];
    }),
  ]);

  return NextResponse.json({
    status: Object.keys(warnings).length ? "partial" : "ok",
    cryptoFG,
    vix,
    cnnFG,
    macro,
    ...(Object.keys(warnings).length ? { warnings } : {}),
  });
}
