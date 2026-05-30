"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 首頁 15 分輪詢 — F-06 / Phase 1.C.3。
 * 觸發 server component re-render，重新抓現價。
 * 純客端、不持有資料，避免破壞 server 端的 9:00 定格邏輯。
 */
export function AutoRefresh({ intervalMs = 15 * 60 * 1000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
