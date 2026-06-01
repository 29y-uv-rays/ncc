import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { withAdmin, jsonError, readJson } from "@/lib/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getHandler() {
  const { data, error } = await getSupabaseAdmin()
    .from("content")
    .select("data")
    .eq("type", "notes")
    .maybeSingle();
  if (error) {
    console.error("[admin notes] read error", error);
    return jsonError("Failed to load notes.", 500);
  }
  return NextResponse.json({ data: data?.data ?? null });
}

async function putHandler(request: Request) {
  const body = await readJson<unknown>(request);
  if (body === null || typeof body !== "object") {
    return jsonError("Body must be a JSON object.", 400);
  }
  const { error } = await getSupabaseAdmin()
    .from("content")
    .update({ data: body, updated_at: new Date().toISOString() })
    .eq("type", "notes");
  if (error) {
    console.error("[admin notes] update error", error);
    return jsonError("Failed to update notes.", 500);
  }
  return NextResponse.json({ ok: true });
}

export const GET = withAdmin(getHandler);
export const PUT = withAdmin(putHandler);
