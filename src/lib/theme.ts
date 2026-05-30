/**
 * 主題切換 helper — F-12 / Phase 3.4。
 *
 * 預設深色，存 cookie 跨 session 記憶。
 * server 端從 cookies() 讀，inject 到 <html class="dark|light"> 避免閃白。
 */

export type Theme = "dark" | "light";
export const THEME_COOKIE = "theme";
export const DEFAULT_THEME: Theme = "dark";

export function isValidTheme(v: string | undefined | null): v is Theme {
  return v === "dark" || v === "light";
}
