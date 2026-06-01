import { NextResponse } from "next/server";
import { createAdminToken, setAdminSessionCookie } from "@/lib/auth";
import { getAdminPasswordHash, verifyPassword } from "@/lib/password";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(request: Request) {
  const clientKey = `admin_login:${getClientKey(request)}`;
  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { password?: unknown };
    const password = body?.password;
    if (typeof password !== "string" || password.length === 0) {
      return NextResponse.json(
        { error: "Password required." },
        { status: 400 }
      );
    }
    if (password.length > 256) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const hash = await getAdminPasswordHash();
    if (!hash) {
      return NextResponse.json(
        { error: "Admin not configured." },
        { status: 500 }
      );
    }

    if (!verifyPassword(password, hash)) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    clearRateLimit(clientKey);
    const token = await createAdminToken();
    await setAdminSessionCookie(token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin login]", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
