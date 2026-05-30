import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { THEME_COOKIE, DEFAULT_THEME, isValidTheme } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Market Dashboard",
  description: "個人用加密／貴金屬／美股每日新聞與盯盤看板",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isValidTheme(raw) ? raw : DEFAULT_THEME;
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} ${theme} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
