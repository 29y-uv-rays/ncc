import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return NextResponse.json(
      { ok: false },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
  return NextResponse.json(
    { ok: true },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
