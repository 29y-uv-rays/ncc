import { getSupabaseAdmin } from "@/lib/db";
import { safeJson, jsonError } from "@/lib/route-utils";
import type { Cadet } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("cadets")
    .select("id, name, platoon, total_points")
    .order("total_points", { ascending: false })
    .order("name", { ascending: true });
  if (error) return jsonError("Failed to load leaderboard.", 500);
  const cadets: Cadet[] = ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: row.id as number,
    name: row.name as string,
    platoon: row.platoon as Cadet["platoon"],
    total_points: row.total_points as number,
  }));
  return safeJson({ cadets });
}
