import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "rincc_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
const DEV_FALLBACK_SECRET =
  "rincc-dev-fallback-secret-do-not-use-in-production-32chars";

function getSecret(): string {
  const secret = SESSION_SECRET ?? DEV_FALLBACK_SECRET;
  if (process.env.NODE_ENV === "production" && secret === DEV_FALLBACK_SECRET) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to a 32+ char random string in production"
    );
  }
  if (secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters long");
  }
  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + padding, "base64").toString("utf-8");
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf-8");
  const bBuf = Buffer.from(b, "utf-8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

async function hmac(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = getSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keyData),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export interface SessionPayload {
  role: "admin";
  iat: number;
  exp: number;
}

export async function createAdminToken(): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    role: "admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = await hmac(payload);
  if (!constantTimeEqual(signature, expected)) return null;
  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as SessionPayload;
    if (decoded?.role !== "admin") return null;
    if (typeof decoded.exp !== "number") return null;
    if (Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getAdminSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminSessionToken();
  return (await verifyAdminToken(token)) !== null;
}

export async function requireAdmin(): Promise<boolean> {
  return isAdminAuthenticated();
}
