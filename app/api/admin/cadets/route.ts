import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { withAdmin, jsonError, readJson } from "@/lib/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PLATOONS = new Set(["P1", "P2", "P3", "SPEC"]);

async function getHandler(request: Request) {
  const url = new URL(request.url);
  const platoon = url.searchParams.get("platoon");
  if (platoon && !VALID_PLATOONS.has(platoon)) {
    return jsonError("Invalid platoon.", 400);
  }
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("cadets")
    .select("id, name, platoon, total_points")
    .order("platoon", { ascending: true })
    .order("name", { ascending: true });
  if (platoon) query = query.eq("platoon", platoon);
  const { data, error } = await query;
  if (error) {
    console.error("[admin cadets] list error", error);
    return jsonError("Failed to load cadets.", 500);
  }
  return NextResponse.json({ cadets: data ?? [] });
}

async function postHandler(request: Request) {
  const body = await readJson<{ name?: unknown; platoon?: unknown }>(request);
  const name = String(body.name ?? "").trim();
  const platoon = String(body.platoon ?? "");

  if (!name) return jsonError("Name is required.", 400);
  if (name.length > 100) return jsonError("Name is too long.", 400);
  if (!VALID_PLATOONS.has(platoon)) {
    return jsonError("Invalid platoon.", 400);
  }

  const { error } = await getSupabaseAdmin()
    .from("cadets")
    .insert({ name, platoon, total_points: 0 });
  if (error) {
    console.error("[admin cadets] insert error", error);
    return jsonError("Failed to create cadet.", 500);
  }
  return NextResponse.json({ ok: true });
}

async function putHandler(request: Request) {
  const body = await readJson<{ id?: unknown; name?: unknown }>(request);
  const id = Number(body.id);
  const name = String(body.name ?? "").trim();

  if (!id) return jsonError("Cadet ID is required.", 400);
  if (!name) return jsonError("Name is required.", 400);
  if (name.length > 100) return jsonError("Name is too long.", 400);

  const { error } = await getSupabaseAdmin()
    .from("cadets")
    .update({ name })
    .eq("id", id);
  if (error) {
    console.error("[admin cadets] update error", error);
    return jsonError("Failed to update cadet.", 500);
  }
  return NextResponse.json({ ok: true });
}

async function deleteHandler(request: Request) {
  const body = await readJson<{ id?: unknown }>(request);
  const id = Number(body.id);

  if (!id) return jsonError("Cadet ID is required.", 400);

  const { error } = await getSupabaseAdmin()
    .from("cadets")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[admin cadets] delete error", error);
    return jsonError("Failed to delete cadet.", 500);
  }
  return NextResponse.json({ ok: true });
}

export const GET = withAdmin(getHandler);
export const POST = withAdmin(postHandler);
export const PUT = withAdmin(putHandler);
export const DELETE = withAdmin(deleteHandler);
