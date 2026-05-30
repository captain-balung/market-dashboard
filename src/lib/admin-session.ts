/**
 * admin session HMAC — F-19 (Phase 5.1)。
 *
 * 簽名：HMAC-SHA256 over `username.expiresAt`，secret 沿用 CRON_SECRET。
 * Cookie：`admin_session=<username>.<expiresAt>.<sig>`，httpOnly + secure + sameSite=lax，7 天到期。
 * 沿用 CRON_SECRET 是因為單一 admin 場景無需第二把 key；文件記入 log。
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "admin_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const s = process.env.CRON_SECRET;
  if (!s) throw new Error("CRON_SECRET missing (reused as admin session HMAC key)");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(username: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${username}.${expiresAt}`;
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

export function verifySessionToken(token: string | undefined): {
  username: string;
  valid: boolean;
} {
  if (!token) return { username: "", valid: false };
  const parts = token.split(".");
  if (parts.length !== 3) return { username: "", valid: false };
  const [u, exp, sig] = parts;
  const expected = sign(`${u}.${exp}`);
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return { username: "", valid: false };
    }
  } catch {
    return { username: "", valid: false };
  }
  if (Date.now() > Number(exp)) return { username: "", valid: false };
  return { username: u, valid: true };
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return false;
  if (username.length !== expectedUser.length || password.length !== expectedPass.length) {
    return false;
  }
  return (
    timingSafeEqual(Buffer.from(username), Buffer.from(expectedUser)) &&
    timingSafeEqual(Buffer.from(password), Buffer.from(expectedPass))
  );
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_TTL_MS = TTL_MS;
