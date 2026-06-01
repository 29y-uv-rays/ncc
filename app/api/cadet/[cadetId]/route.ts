import { getSupabaseAdmin } from "@/lib/db";
import { safeJson, jsonError } from "@/lib/route-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cadetId: string }> }
) {
  const { cadetId: cadetIdParam } = await params;
  const cadetId = Number(cadetIdParam);
  if (!Number.isInteger(cadetId) || cadetId <= 0) {
    return jsonError("Invalid cadet.", 400);
  }

  const supabase = getSupabaseAdmin();
  const [cadetRes, breakdownRes, historyRes] = await Promise.all([
    supabase
      .from("cadets")
      .select("id, name, platoon, total_points")
      .eq("id", cadetId)
      .maybeSingle(),
    supabase
      .from("points_logs")
      .select("category, points")
      .eq("cadet_id", cadetId),
    supabase
      .from("points_logs")
      .select("points, category, reason, awarded_by, created_at")
      .eq("cadet_id", cadetId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (cadetRes.error) return jsonError("Failed to load cadet.", 500);
  if (breakdownRes.error) return jsonError("Failed to load cadet.", 500);
  if (historyRes.error) return jsonError("Failed to load cadet.", 500);

  if (!cadetRes.data) return jsonError("Cadet not found.", 404);

  const breakdown: Record<string, number> = {};
  for (const row of (breakdownRes.data ?? []) as Array<{ category: string; points: number }>) {
    breakdown[row.category] = (breakdown[row.category] ?? 0) + Number(row.points ?? 0);
  }

  return safeJson({
    cadet: cadetRes.data,
    breakdown,
    history: historyRes.data ?? [],
  });
}
