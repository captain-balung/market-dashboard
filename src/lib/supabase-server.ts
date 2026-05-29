import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * 只在 server (API route / server component / cron) 使用。
 * 用 SERVICE_ROLE_KEY 繞過 RLS — 全站對訪客唯讀，寫入由 admin 認證守門。
 *
 * 不要在 client component 引入這個模組。
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
