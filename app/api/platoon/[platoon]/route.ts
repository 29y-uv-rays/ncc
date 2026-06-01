import { getSupabaseAdmin } from "@/lib/db";
import { safeJson, jsonError } from "@/lib/route-utils";

const VALID_PLATOONS = new Set(["P1", "P2", "P3", "SPEC"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platoon: string }> }
) {
  const { platoon: platoonParam } = await params;
  const platoon = platoonParam.toUpperCase();
  if (!VALID_PLATOONS.has(platoon)) {
    return jsonError("Invalid platoon.", 400);
  }

  const supabase = getSupabaseAdmin();
  const [cadetsRes, logsRes] = await Promise.all([
    supabase
      .from("cadets")
      .select("id, name, platoon, total_points")
      .eq("platoon", platoon)
      .order("total_points", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("points_logs")
      .select("points, category, cadets!inner(platoon)")
      .eq("cadets.platoon", platoon),
  ]);

  if (cadetsRes.error) return jsonError("Failed to load platoon data.", 500);
  if (logsRes.error) return jsonError("Failed to load platoon data.", 500);

  const leaderboard = (cadetsRes.data ?? []) as Array<{
    id: number;
    name: string;
    platoon: string;
    total_points: number;
  }>;
  const total_points = leaderboard.reduce(
    (sum: number, c: { total_points: number }) =>
      sum + Number(c.total_points ?? 0),
    0
  );
  const cadet_count = leaderboard.length;

  const categories: Record<string, number> = {};
  for (const row of (logsRes.data ?? []) as Array<{ category: string; points: number }>) {
    categories[row.category] = (categories[row.category] ?? 0) + Number(row.points ?? 0);
  }

  return safeJson({
    totals: { total_points, cadet_count },
    leaderboard,
    categories,
  });
}
