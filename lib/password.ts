import crypto from "crypto";
import { getSupabaseAdmin } from "./db";

const SCRYPT_KEYLEN = 64;

function parseParams(params: string): { N: number; r: number; p: number } | null {
  const out: Record<string, number> = {};
  for (const segment of params.split(",")) {
    const [key, value] = segment.split("=");
    if (!key || !value) return null;
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    out[key.toLowerCase()] = num;
  }
  if (!out.n || !out.r || !out.p) return null;
  return { N: out.n, r: out.r, p: out.p };
}

function scryptHash(
  password: string,
  salt: string,
  params: { N: number; r: number; p: number }
): string {
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, params);
  return derived.toString("hex");
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !password) return false;
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  if (parts[0] !== "scrypt") return false;
  const params = parseParams(parts[1]);
  if (!params) return false;
  const salt = parts[2];
  const expectedHash = parts[3];
  const candidate = scryptHash(password, salt, params);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const params = { N: 16384, r: 8, p: 1 };
  const hash = scryptHash(password, salt, params);
  return `scrypt$n=${params.N},r=${params.r},p=${params.p}$${salt}$${hash}`;
}

export async function getAdminPasswordHash(): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("admin_auth")
    .select("password_hash")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data?.password_hash ?? null;
}
