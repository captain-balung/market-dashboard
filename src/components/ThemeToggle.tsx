"use client";

import { useState, useTransition } from "react";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

export function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const [, startTransition] = useTransition();

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    startTransition(() => {
      document.documentElement.classList.toggle("dark", next === "dark");
      document.documentElement.classList.toggle("light", next === "light");
      // 一年到期、SameSite=Lax
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      aria-label={`切換到${theme === "dark" ? "淺色" : "深色"}主題`}
    >
      {theme === "dark" ? "☀ 淺色" : "☾ 深色"}
    </button>
  );
}
