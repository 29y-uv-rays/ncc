import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { withAdmin, jsonError, readJson } from "@/lib/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_PLATOONS = new Set(["P1", "P2", "P3", "SPEC"]);

async function getHandler() {
  const { data, error } = await getSupabaseAdmin()
    .from("platoon_stats")
    .select(
      "platoon, drills_percent, pt_percent, ifc_percent, roadmap_percent, volunteer_count"
    )
    .order("platoon", { ascending: true });
  if (error) {
    console.error("[admin platoon-stats] read error", error);
    return jsonError("Failed to load platoon stats.", 500);
  }
  return NextResponse.json({ stats: data ?? [] });
}

async function putHandler(request: Request) {
  const body = await readJson<{
    platoon?: unknown;
    drills_percent?: unknown;
    pt_percent?: unknown;
    ifc_percent?: unknown;
    roadmap_percent?: unknown;
    volunteer_count?: unknown;
  }>(request);
  const platoon = String(body.platoon ?? "");
  const drills = Number(body.drills_percent);
  const pt = Number(body.pt_percent);
  const ifc = Number(body.ifc_percent);
  const roadmap = Number(body.roadmap_percent);
  const volunteerCount = Number(body.volunteer_count);

  if (!VALID_PLATOONS.has(platoon)) {
    return jsonError("Invalid platoon.", 400);
  }
  const checkPercent = (n: number) =>
    Number.isFinite(n) && n >= 0 && n <= 100;
  if (!checkPercent(drills)) return jsonError("drills_percent out of range.", 400);
  if (!checkPercent(pt)) return jsonError("pt_percent out of range.", 400);
  if (!checkPercent(ifc)) return jsonError("ifc_percent out of range.", 400);
  if (!checkPercent(roadmap)) return jsonError("roadmap_percent out of range.", 400);
  if (!Number.isInteger(volunteerCount) || volunteerCount < 0) {
    return jsonError("volunteer_count must be a non-negative integer.", 400);
  }

  const { error } = await getSupabaseAdmin()
    .from("platoon_stats")
    .update({
      drills_percent: drills,
      pt_percent: pt,
      ifc_percent: ifc,
      roadmap_percent: roadmap,
      volunteer_count: volunteerCount,
      updated_at: new Date().toISOString(),
    })
    .eq("platoon", platoon);
  if (error) {
    console.error("[admin platoon-stats] update error", error);
    return jsonError("Failed to update platoon stats.", 500);
  }
  return NextResponse.json({ ok: true });
}

export const GET = withAdmin(getHandler);
export const PUT = withAdmin(putHandler);
