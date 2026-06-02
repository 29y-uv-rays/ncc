import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { withAdmin, jsonError, readJson } from "@/lib/route-utils";

const VALID_CATEGORIES = new Set(["drills", "pt", "ifc", "misc"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
  const body = await readJson<{
    cadet_id?: unknown;
    points?: unknown;
    category?: unknown;
    reason?: unknown;
    awarded_by?: unknown;
  }>(request);

  const cadetId = Number(body.cadet_id);
  const points = Number(body.points);
  const category = String(body.category ?? "");
  const reason = String(body.reason ?? "").trim();
  const awardedBy = String(body.awarded_by ?? "").trim();

  if (!Number.isFinite(cadetId) || !Number.isFinite(points)) {
    return jsonError("Invalid cadet or points.", 400);
  }
  if (!Number.isInteger(points) || points === 0) {
    return jsonError("Points must be a non-zero integer.", 400);
  }
if (Math.abs(points) > 300000) {
  return jsonError("Points value out of range.", 400);
}
  if (!VALID_CATEGORIES.has(category)) {
    return jsonError("Invalid category.", 400);
  }
  if (!reason) return jsonError("Reason is required.", 400);
  if (!awardedBy) return jsonError("awarded_by is required.", 400);

  const { data, error } = await getSupabaseAdmin().rpc("award_points", {
    p_cadet_id: cadetId,
    p_points: points,
    p_category: category,
    p_reason: reason,
    p_awarded_by: awardedBy,
  });

  if (error) {
    if (error.code === "P0002") {
      return jsonError("Cadet not found.", 404);
    }
    console.error("[admin points] rpc error", error);
    return jsonError("Failed to update points.", 500);
  }

  return NextResponse.json({ ok: true, total_points: data });
}

export const POST = withAdmin(handler);
