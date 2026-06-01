import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { withAdmin, jsonError, readJson } from "@/lib/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getHandler() {
  const { data, error } = await getSupabaseAdmin()
    .from("rewards")
    .select("id, name, points_required, active, sort_order")
    .order("sort_order", { ascending: true })
    .order("points_required", { ascending: true });
  if (error) {
    console.error("[admin rewards] list error", error);
    return jsonError("Failed to load rewards.", 500);
  }
  return NextResponse.json({ rewards: data ?? [] });
}

async function postHandler(request: Request) {
  const body = await readJson<{
    name?: unknown;
    points_required?: unknown;
    active?: unknown;
    sort_order?: unknown;
  }>(request);
  const name = String(body.name ?? "").trim();
  const pointsRequired = Number(body.points_required);
  const active = body.active !== false;
  const sortOrder = Number(body.sort_order ?? 0);

  if (!name) return jsonError("Name is required.", 400);
  if (name.length > 100) return jsonError("Name is too long.", 400);
  if (!Number.isInteger(pointsRequired) || pointsRequired < 0) {
    return jsonError("points_required must be a non-negative integer.", 400);
  }

  const { error } = await getSupabaseAdmin()
    .from("rewards")
    .insert({
      name,
      points_required: pointsRequired,
      active,
      sort_order: sortOrder,
    });
  if (error) {
    console.error("[admin rewards] insert error", error);
    return jsonError("Failed to create reward.", 500);
  }
  return NextResponse.json({ ok: true });
}

async function patchHandler(request: Request) {
  const body = await readJson<{
    id?: unknown;
    name?: unknown;
    points_required?: unknown;
    active?: unknown;
    sort_order?: unknown;
  }>(request);
  const id = Number(body.id);
  const name = String(body.name ?? "").trim();
  const pointsRequired = Number(body.points_required);
  const active = body.active !== false;
  const sortOrder = Number(body.sort_order ?? 0);

  if (!Number.isInteger(id) || id <= 0) return jsonError("Invalid id.", 400);
  if (!name) return jsonError("Name is required.", 400);
  if (!Number.isInteger(pointsRequired) || pointsRequired < 0) {
    return jsonError("points_required must be a non-negative integer.", 400);
  }

  const { error } = await getSupabaseAdmin()
    .from("rewards")
    .update({
      name,
      points_required: pointsRequired,
      active,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    console.error("[admin rewards] update error", error);
    return jsonError("Failed to update reward.", 500);
  }
  return NextResponse.json({ ok: true });
}

export const GET = withAdmin(getHandler);
export const POST = withAdmin(postHandler);
export const PATCH = withAdmin(patchHandler);
